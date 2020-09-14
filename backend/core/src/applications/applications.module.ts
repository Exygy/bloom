import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Application } from "../entity/application.entity"
import { ApplicationsService } from "./applications.service"
import { ApplicationsController } from "./applications.controller"
import { AuthModule } from "../auth/auth.module"
import { EmailService } from "../shared/email.service"
import { ListingsService } from "../listings/listings.service"

@Module({
  imports: [TypeOrmModule.forFeature([Application]), AuthModule],
  providers: [ApplicationsService, EmailService, ListingsService],
  exports: [ApplicationsService],
  controllers: [ApplicationsController],
})
export class ApplicationsModule {}
