import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { DeepPartial, FindConditions, Repository } from "typeorm"
import { paginate, Pagination, PaginationTypeEnum } from "nestjs-typeorm-paginate"
import { decode, encode } from "jwt-simple"
import dayjs from "dayjs"
import crypto from "crypto"
import { User } from "../entities/user.entity"
import { ConfirmDto } from "../dto/confirm.dto"
import { USER_ERRORS } from "../user-errors"
import { UpdatePasswordDto } from "../dto/update-password.dto"
import { AuthService } from "./auth.service"
import { AuthzService } from "./authz.service"
import { ForgotPasswordDto } from "../dto/forgot-password.dto"

import { AuthContext } from "../types/auth-context"
import { PasswordService } from "./password.service"
import { JurisdictionResolverService } from "../../jurisdictions/services/jurisdiction-resolver.service"
import { EmailDto } from "../dto/email.dto"
import { UserCreateDto } from "../dto/user-create.dto"
import { UserUpdateDto } from "../dto/user-update.dto"
import { UserListQueryParams } from "../dto/user-list-query-params"
import { UserInviteDto } from "../dto/user-invite.dto"
import { ConfigService } from "@nestjs/config"
import { authzActions } from "../enum/authz-actions.enum"
import { userFilterTypeToFieldMap } from "../dto/user-filter-type-to-field-map"
import { Application } from "../../applications/entities/application.entity"
import { Listing } from "../../listings/entities/listing.entity"
import { UserRoles } from "../entities/user-roles.entity"
import { UserPreferences } from "../../../src/user-preferences/entities/user-preferences.entity"
import { Jurisdiction } from "../../jurisdictions/entities/jurisdiction.entity"
import { assignDefined } from "../../shared/utils/assign-defined"
import { EmailService } from "../../email/email.service"
import { addFilters } from "../../shared/query-filter"
import { UserFilterParams } from "../dto/user-filter-params"

import advancedFormat from "dayjs/plugin/advancedFormat"
import { JurisdictionsService } from "../../jurisdictions/services/jurisdictions.service"

dayjs.extend(advancedFormat)

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Application) private readonly applicationsRepository: Repository<Application>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly authzService: AuthzService,
    private readonly passwordService: PasswordService,
    private readonly jurisdictionResolverService: JurisdictionResolverService,
    private readonly jurisdictionService: JurisdictionsService
  ) {}

  public async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ["leasingAgentInListings"],
    })
  }

  public async find(options: FindConditions<User>) {
    return await this.userRepository.findOne({
      where: options,
      relations: ["leasingAgentInListings"],
    })
  }

  public static isPasswordOutdated(user: User) {
    return (
      new Date(user.passwordUpdatedAt.getTime() + user.passwordValidForDays * 24 * 60 * 60 * 1000) <
        new Date() &&
      user.roles &&
      (user.roles.isAdmin || user.roles.isPartner)
    )
  }

  public async findOneOrFail(options: FindConditions<User>) {
    const user = await this.find(options)
    if (!user) {
      throw new NotFoundException()
    }
    return user
  }

  public async list(
    params: UserListQueryParams,
    authContext: AuthContext
  ): Promise<Pagination<User>> {
    const options = {
      limit: params.limit === "all" ? undefined : params.limit,
      page: params.page || 10,
      PaginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    }
    // https://www.npmjs.com/package/nestjs-typeorm-paginate
    const distinctIDQB = this._getQb(false)
    distinctIDQB.addSelect("user.id")
    distinctIDQB.groupBy("user.id")
    const qb = this._getQb()

    if (params.filter) {
      addFilters<Array<UserFilterParams>, typeof userFilterTypeToFieldMap>(
        params.filter,
        userFilterTypeToFieldMap,
        distinctIDQB
      )
      addFilters<Array<UserFilterParams>, typeof userFilterTypeToFieldMap>(
        params.filter,
        userFilterTypeToFieldMap,
        qb
      )
    }
    const distinctIDResult = await paginate<User>(distinctIDQB, options)

    qb.andWhere("user.id IN (:...distinctIDs)", {
      distinctIDs: distinctIDResult.items.map((elem) => elem.id),
    })
    const result = await qb.getMany()
    /**
     * admin are the only ones that can access all users
     * so this will throw on the first user that isn't their own (non admin users can access themselves)
     */
    await Promise.all(
      result.map(async (user) => {
        await this.authzService.canOrThrow(authContext.user, "user", authzActions.read, user)
      })
    )

    return {
      ...distinctIDResult,
      items: result,
    }
  }

  public async listAllUsers(): Promise<User[]> {
    return await this.userRepository.find()
  }

  async update(dto: UserUpdateDto, authContext: AuthContext) {
    const user = await this.find({
      id: dto.id,
    })
    if (!user) {
      throw new NotFoundException()
    }
    let passwordHash
    let passwordUpdatedAt
    if (dto.password) {
      if (!dto.currentPassword) {
        // Validation is handled at DTO definition level
        throw new BadRequestException()
      }
      if (!(await this.passwordService.isPasswordValid(user, dto.currentPassword))) {
        throw new UnauthorizedException("invalidPassword")
      }

      passwordHash = await this.passwordService.passwordToHash(dto.password)
      passwordUpdatedAt = new Date()
      delete dto.password
    }

    /**
     * only admin users can update roles
     */
    if (!authContext.user?.roles?.isAdmin) {
      delete dto.roles
    }

    /**
     * jurisdictions should be filtered based off of what the authContext user has
     */
    if (authContext.user.jurisdictions) {
      if (dto.jurisdictions) {
        dto.jurisdictions = dto.jurisdictions.filter(
          (jurisdiction) =>
            authContext.user.jurisdictions.findIndex((val) => val.id === jurisdiction.id) > -1
        )
      }
    } else {
      delete dto.jurisdictions
    }

    if (dto.newEmail && dto.appUrl) {
      user.confirmationToken = UserService.createConfirmationToken(user.id, dto.newEmail)
      const confirmationUrl = UserService.getPublicConfirmationUrl(dto.appUrl, user)
      await this.emailService.changeEmail(user, dto.appUrl, confirmationUrl, dto.newEmail)
    }

    delete dto.newEmail
    delete dto.appUrl

    assignDefined(user, {
      ...dto,
      passwordHash,
      passwordUpdatedAt,
    })

    return await this.userRepository.save(user)
  }

  public async confirm(dto: ConfirmDto) {
    let token: Record<string, string> = {}
    try {
      token = decode(dto.token, process.env.APP_SECRET)
    } catch (e) {
      throw new HttpException(USER_ERRORS.TOKEN_EXPIRED.message, USER_ERRORS.TOKEN_EXPIRED.status)
    }

    const user = await this.find({ id: token.id })
    if (!user) {
      console.error(`Trying to confirm non-existing user ${token.id}.`)
      throw new HttpException(USER_ERRORS.NOT_FOUND.message, USER_ERRORS.NOT_FOUND.status)
    }

    if (user.confirmationToken !== dto.token) {
      console.error(`Confirmation token mismatch for user ${token.id}.`)
      throw new HttpException(USER_ERRORS.TOKEN_MISSING.message, USER_ERRORS.TOKEN_MISSING.status)
    }

    user.confirmedAt = new Date()
    user.confirmationToken = null

    if (dto.password) {
      user.passwordHash = await this.passwordService.passwordToHash(dto.password)
      user.passwordUpdatedAt = new Date()
    }

    try {
      await this.userRepository.save({
        ...user,
        ...(token.email && { email: token.email }),
      })
      return this.authService.generateAccessToken(user)
    } catch (err) {
      throw new HttpException(USER_ERRORS.ERROR_SAVING.message, USER_ERRORS.ERROR_SAVING.status)
    }
  }

  private static createConfirmationToken(userId: string, email: string) {
    const payload = {
      id: userId,
      email,
      exp: Number.parseInt(dayjs().add(24, "hours").format("X")),
    }
    return encode(payload, process.env.APP_SECRET)
  }

  public async resendPublicConfirmation(dto: EmailDto) {
    const user = await this.findByEmail(dto.email)
    if (!user) {
      throw new HttpException(USER_ERRORS.NOT_FOUND.message, USER_ERRORS.NOT_FOUND.status)
    }
    if (user.confirmedAt) {
      throw new HttpException(
        USER_ERRORS.ACCOUNT_CONFIRMED.message,
        USER_ERRORS.ACCOUNT_CONFIRMED.status
      )
    } else {
      user.confirmationToken = UserService.createConfirmationToken(user.id, user.email)
      try {
        await this.userRepository.save(user)
        const confirmationUrl = UserService.getPublicConfirmationUrl(dto.appUrl, user)
        await this.emailService.welcome(user, dto.appUrl, confirmationUrl)
        return user
      } catch (err) {
        throw new HttpException(USER_ERRORS.ERROR_SAVING.message, USER_ERRORS.ERROR_SAVING.status)
      }
    }
  }

  public async resendPartnerConfirmation(dto: EmailDto) {
    const user = await this.findByEmail(dto.email)
    if (!user) {
      throw new HttpException(USER_ERRORS.NOT_FOUND.message, USER_ERRORS.NOT_FOUND.status)
    }
    if (user.confirmedAt) {
      // if the user is already confirmed, we do nothing
      // this is so on the front end people can't cheat to find out who has an email in the system
      return {}
    } else {
      user.confirmationToken = UserService.createConfirmationToken(user.id, user.email)
      try {
        await this.userRepository.save(user)
        const confirmationUrl = UserService.getPartnersConfirmationUrl(dto.appUrl, user)
        await this.emailService.invite(user, dto.appUrl, confirmationUrl)
        return user
      } catch (err) {
        throw new HttpException(USER_ERRORS.ERROR_SAVING.message, USER_ERRORS.ERROR_SAVING.status)
      }
    }
  }

  public async isUserConfirmationTokenValid(dto: ConfirmDto) {
    try {
      decode(dto.token, process.env.APP_SECRET)
      return true
    } catch (e) {
      return false
    }
  }

  private static getPublicConfirmationUrl(appUrl: string, user: User) {
    return `${appUrl}?token=${user.confirmationToken}`
  }

  private static getPartnersConfirmationUrl(appUrl: string, user: User) {
    return `${appUrl}/users/confirm?token=${user.confirmationToken}`
  }

  public async connectUserWithExistingApplications(user: User) {
    const applications = await this.applicationsRepository
      .createQueryBuilder("applications")
      .leftJoinAndSelect("applications.applicant", "applicant")
      .where("applications.user IS NULL")
      .andWhere("applicant.emailAddress = :email", { email: user.email })
      .getMany()

    for (const application of applications) {
      application.user = user
    }

    await this.applicationsRepository.save(applications)
  }

  public async _createUser(dto: DeepPartial<User>, authContext: AuthContext) {
    if (dto.confirmedAt) {
      await this.authzService.canOrThrow(authContext.user, "user", authzActions.confirm, {
        ...dto,
      })
    }
    const existingUser = await this.findByEmail(dto.email)
    if (existingUser) {
      throw new HttpException(USER_ERRORS.EMAIL_IN_USE.message, USER_ERRORS.EMAIL_IN_USE.status)
    }

    try {
      let newUser = await this.userRepository.save(dto)

      newUser.confirmationToken = UserService.createConfirmationToken(newUser.id, newUser.email)
      newUser = await this.userRepository.save(newUser)

      return newUser
    } catch (err) {
      console.error(err)
      throw new HttpException(USER_ERRORS.ERROR_SAVING.message, USER_ERRORS.ERROR_SAVING.status)
    }
  }

  public async createPublicUser(
    dto: UserCreateDto,
    authContext: AuthContext,
    sendWelcomeEmail = false
  ) {
    const newUser = await this._createUser(
      {
        ...dto,
        passwordHash: await this.passwordService.passwordToHash(dto.password),
        jurisdictions: dto.jurisdictions
          ? (dto.jurisdictions as Jurisdiction[])
          : [await this.jurisdictionResolverService.getJurisdiction()],
        preferences: (dto.preferences as unknown) as UserPreferences,
      },
      authContext
    )
    if (sendWelcomeEmail) {
      const confirmationUrl = UserService.getPublicConfirmationUrl(dto.appUrl, newUser)
      await this.emailService.welcome(newUser, dto.appUrl, confirmationUrl)
    }
    await this.connectUserWithExistingApplications(newUser)
    return newUser
  }

  public async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.findByEmail(dto.email)
    if (!user) {
      throw new HttpException(USER_ERRORS.NOT_FOUND.message, USER_ERRORS.NOT_FOUND.status)
    }

    // Token expires in 1 hour
    const payload = { id: user.id, exp: Number.parseInt(dayjs().add(1, "hour").format("X")) }
    user.resetToken = encode(payload, process.env.APP_SECRET)
    await this.userRepository.save(user)
    await this.emailService.forgotPassword(user, dto.appUrl)
    return user
  }

  public async updatePassword(dto: UpdatePasswordDto) {
    const user = await this.find({ resetToken: dto.token })
    if (!user) {
      throw new HttpException(USER_ERRORS.TOKEN_MISSING.message, USER_ERRORS.TOKEN_MISSING.status)
    }

    const token = decode(user.resetToken, process.env.APP_SECRET)
    if (token.id !== user.id) {
      throw new HttpException(USER_ERRORS.TOKEN_MISSING.message, USER_ERRORS.TOKEN_MISSING.status)
    }

    user.passwordHash = await this.passwordService.passwordToHash(dto.password)
    user.passwordUpdatedAt = new Date()
    user.resetToken = null
    await this.userRepository.save(user)
    return this.authService.generateAccessToken(user)
  }

  private _getQb(withSelect = true) {
    const qb = this.userRepository.createQueryBuilder("user")
    if (withSelect) {
      qb.leftJoinAndSelect("user.leasingAgentInListings", "listings")
      qb.leftJoinAndSelect("user.roles", "user_roles")
    } else {
      qb.leftJoin("user.leasingAgentInListings", "listings")
      qb.leftJoin("user.roles", "user_roles")
    }

    return qb
  }

  async invitePartnersPortalUser(dto: UserInviteDto, authContext: AuthContext) {
    const password = crypto.randomBytes(8).toString("hex")
    const user = await this._createUser(
      {
        ...dto,
        passwordHash: await this.passwordService.passwordToHash(password),
        leasingAgentInListings: dto.leasingAgentInListings as Listing[],
        roles: dto.roles as UserRoles,
        jurisdictions: dto.jurisdictions
          ? (dto.jurisdictions as Jurisdiction[])
          : [await this.jurisdictionService.findOne({ where: { name: "Detroit" } })],
        preferences: (dto.preferences as unknown) as UserPreferences,
      },
      authContext
    )

    await this.emailService.invite(
      user,
      this.configService.get("PARTNERS_PORTAL_URL"),
      UserService.getPartnersConfirmationUrl(this.configService.get("PARTNERS_PORTAL_URL"), user)
    )
    return user
  }

  async delete(userId: string) {
    const user = await this.userRepository.findOne({ id: userId })
    if (!user) {
      throw new NotFoundException()
    }
    await this.userRepository.remove(user)
  }
}
