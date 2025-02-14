import React from "react"
import { fireEvent } from "@testing-library/react"
import { rest } from "msw"
import { setupServer } from "msw/node"
import { listing } from "@bloom-housing/shared-helpers/__tests__/testHelpers"
import Lottery from "../../../src/pages/listings/[id]/lottery"
import { mockNextRouter, render } from "../../testUtils"
import {
  ListingMultiselectQuestion,
  ListingsStatusEnum,
  LotteryStatusEnum,
} from "@bloom-housing/shared-helpers/src/types/backend-swagger"

const server = setupServer()
const closedListing = {
  ...listing,
  status: ListingsStatusEnum.closed,
}

beforeAll(() => {
  process.env.lotteryDaysTillExpiry = "45"
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  window.sessionStorage.clear()
})

afterAll(() => {
  server.close()
})

describe("lottery", () => {
  it("should render error text when listing is undefined", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(ctx.json({ id: "user1", userRoles: { isAdmin: true } }))
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { findByText } = render(<Lottery listing={undefined} />)

    const error = await findByText("An error has occurred.")
    expect(error).toBeInTheDocument()
  })

  it("should render page if user is an admin", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(ctx.json({ id: "user1", userRoles: { isAdmin: true } }))
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { getAllByText, findByText } = render(<Lottery listing={closedListing} />)

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(getAllByText(closedListing.name).length).toBeGreaterThan(0)
  })

  it("should render page if user is a jurisdictional admin", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(ctx.json({ id: "user1", userRoles: { isJurisdictionalAdmin: true } }))
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { getAllByText, findByText } = render(<Lottery listing={closedListing} />)

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(getAllByText(closedListing.name).length).toBeGreaterThan(0)
  })

  it("should render page if user is a partner with access to this listing", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isPartner: true },
            listings: [{ id: "Uvbk5qurpB2WI9V6WnNdH" }],
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { getAllByText, findByText } = render(<Lottery listing={closedListing} />)

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(getAllByText(closedListing.name).length).toBeGreaterThan(0)
  })

  it("should not render page if user is a partner without access to this listing", () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isPartner: true },
            listings: [{ id: "not-this-listings-id" }],
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { queryAllByText, queryByText } = render(<Lottery listing={closedListing} />)

    const header = queryByText("Lottery")
    expect(header).not.toBeInTheDocument()
    expect(queryAllByText(closedListing.name).length).toBe(0)
  })

  it("should show no lottery run state if user is an admin and lottery has not been run", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { getByText, findByText } = render(<Lottery listing={closedListing} />)

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(getByText("No lottery data")).toBeInTheDocument()
    expect(
      getByText("It looks like you haven't run a lottery for this listing yet.")
    ).toBeInTheDocument()
    expect(getByText("History")).toBeInTheDocument()
    expect(getByText("Run lottery")).toBeInTheDocument()
  })

  it("should show export state if user is an admin and lottery has been run", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { getByText, findByText } = render(
      <Lottery
        listing={{
          ...closedListing,
          lotteryLastRunAt: new Date(),
          lotteryStatus: LotteryStatusEnum.ran,
          listingMultiselectQuestions: [],
        }}
      />
    )

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(getByText("Export lottery data")).toBeInTheDocument()
    expect(
      getByText("This file includes the lottery raw rank for all applications.")
    ).toBeInTheDocument()
    expect(getByText("Re-run lottery")).toBeInTheDocument()
    expect(getByText("Release lottery")).toBeInTheDocument()
  })

  it("should show re-run modal if user clicks on re-run", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { getByText, findByText } = render(
      <Lottery
        listing={{
          ...closedListing,
          lotteryLastRunAt: new Date(),
          lotteryStatus: LotteryStatusEnum.ran,
        }}
      />
    )

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    fireEvent.click(getByText("Re-run lottery"))
    expect(await findByText("Are you sure?")).toBeInTheDocument()
    expect(getByText("I understand, re-run lottery")).toBeInTheDocument()
  })

  it("should show release modal if user clicks on release", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { getByText, findByText } = render(
      <Lottery
        listing={{
          ...closedListing,
          lotteryLastRunAt: new Date(),
          lotteryStatus: LotteryStatusEnum.ran,
        }}
      />
    )

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    fireEvent.click(getByText("Release lottery"))
    expect(await findByText("Are you sure?")).toBeInTheDocument()
    expect(
      getByText(
        "Releasing the lottery will give Partner users access to the lottery data, including the ability to publish results to applicants."
      )
    ).toBeInTheDocument()
  })

  it("should show new paper apps modals if user clicks on release if application updates have been made since last lottery run", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const lotteryLastRan = new Date()
    lotteryLastRan.setDate(lotteryLastRan.getDate() - 1)
    const { getByText, findByText } = render(
      <Lottery
        listing={{
          ...listing,
          lotteryLastRunAt: lotteryLastRan,
          lotteryStatus: LotteryStatusEnum.ran,
          lastApplicationUpdateAt: new Date(),
        }}
      />
    )

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    fireEvent.click(getByText("Release lottery"))
    expect(await findByText("Action required")).toBeInTheDocument()
    expect(
      getByText("You have added or updated applications without re-running the lottery.")
    ).toBeInTheDocument()
    expect(
      getByText("You must re-run the lottery before releasing the lottery data.")
    ).toBeInTheDocument()
  })

  it("should show retract modal if user clicks on retract", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { getByText, findByText } = render(
      <Lottery
        listing={{
          ...listing,
          lotteryLastRunAt: new Date(),
          lotteryStatus: LotteryStatusEnum.releasedToPartners,
        }}
      />
    )

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    fireEvent.click(getByText("Retract lottery"))
    expect(await findByText("Are you sure?")).toBeInTheDocument()
    expect(
      getByText(
        "Retracting the lottery will revoke Partner users’ access to the lottery data, including their ability to publish results to applicants."
      )
    ).toBeInTheDocument()
  })

  it("should show confirm modal if user clicks on run lottery with no unresolved duplicates", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 0 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { getByText, findByText } = render(<Lottery listing={closedListing} />)

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    fireEvent.click(getByText("Run lottery"))
    expect(await findByText("Confirmation needed")).toBeInTheDocument()
    expect(
      getByText("Make sure to add all paper applications before running the lottery.")
    ).toBeInTheDocument()
  })

  it("should show confirm with duplicates modal if user clicks on run lottery and listing does have unresolved duplicates", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 5, totalPendingCount: 5 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const { getByText, findByText } = render(<Lottery listing={closedListing} />)

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    fireEvent.click(getByText("Run lottery"))
    expect(await findByText("Confirmation needed")).toBeInTheDocument()
    expect(getByText("5 unresolved duplicate sets.")).toBeInTheDocument()
    expect(getByText("Run lottery without resolving duplicates")).toBeInTheDocument()
  })

  it("should show export modal if lottery has been run with no preference text", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 5, totalPendingCount: 5 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const updatedListing = {
      ...closedListing,
      lotteryLastRunAt: new Date("September 6, 2025 8:15:00"),
      listingMultiselectQuestions: [],
    }
    const { getByText, findByText, findAllByText, getAllByText } = render(
      <Lottery listing={updatedListing} />
    )

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(
      getByText("This file includes the lottery raw rank for all applications.")
    ).toBeInTheDocument()

    fireEvent.click(getByText("Export"))
    expect(await findAllByText("Export lottery data")).toHaveLength(2)

    expect(
      getByText("This data was generated from the lottery that was run on 09/06/2025 at 8:15 am.", {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(getAllByText("Export")).toHaveLength(2)
  })

  it("should show export modal if lottery has been run with preference text", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 5, totalPendingCount: 5 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const updatedListing = {
      ...closedListing,
      lotteryLastRunAt: new Date("September 6, 2025 8:15:00"),
      listingMultiselectQuestions: [{ multiselectQuestions: {} } as ListingMultiselectQuestion],
    }
    const { getByText, findByText, findAllByText, getAllByText } = render(
      <Lottery listing={updatedListing} />
    )

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(
      getByText(
        "This file includes the lottery raw rank and preferences data for all applications."
      )
    ).toBeInTheDocument()

    fireEvent.click(getByText("Export"))
    expect(await findAllByText("Export lottery data")).toHaveLength(2)

    expect(
      getByText("This data was generated from the lottery that was run on 09/06/2025 at 8:15 am.", {
        exact: false,
      })
    ).toBeInTheDocument()
    expect(getAllByText("Export")).toHaveLength(2)
  })

  it("should show export with terms modal if user is a partner", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: false, isPartner: true },
            listings: [{ id: "Uvbk5qurpB2WI9V6WnNdH" }],
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 5, totalPendingCount: 5 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const updatedListing = {
      ...listing,
      lotteryLastRunAt: new Date("September 6, 2025 8:15:00"),
      lotteryStatus: LotteryStatusEnum.publishedToPublic,
    }
    const { getByText, findByText, findAllByText, getAllByText } = render(
      <Lottery listing={updatedListing} />
    )

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    fireEvent.click(getByText("Export"))
    expect(await findAllByText("Export lottery data")).toHaveLength(2)

    expect(
      getByText("This data was generated from the lottery that was run on 09/06/2025 at 8:15 am.", {
        exact: false,
      })
    ).toBeInTheDocument()

    expect(getAllByText("Export")).toHaveLength(2)
  })

  it("should show no lottery released state as a partner", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: false, isJurisdictionalAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 5, totalPendingCount: 5 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const updatedListing = {
      ...closedListing,
      lotteryStatus: LotteryStatusEnum.ran,
    }

    const { getByText, findByText, queryByText } = render(<Lottery listing={updatedListing} />)

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(getByText("No lottery data")).toBeInTheDocument()
    expect(queryByText("Publish")).not.toBeInTheDocument()
    expect(queryByText("Run lottery")).not.toBeInTheDocument()
    expect(queryByText("Release lottery")).not.toBeInTheDocument()
  })

  it("should show publish modal if in released to partners state as a parter", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: false, isJurisdictionalAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 5, totalPendingCount: 5 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const updatedListing = {
      ...closedListing,
      lotteryStatus: LotteryStatusEnum.releasedToPartners,
    }

    const { getByText, findByText } = render(<Lottery listing={updatedListing} />)

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(getByText("Publish lottery data")).toBeInTheDocument()
    fireEvent.click(getByText("Publish"))
    expect(await findByText("Confirmation needed")).toBeInTheDocument()
    expect(
      getByText(
        "Publishing the lottery for this listing will email a notification to applicants that results are available in their account."
      )
    ).toBeInTheDocument()
    expect(getByText("Publish lottery")).toBeInTheDocument()
  })

  it("should show export if in published to public state as a parter", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: false, isJurisdictionalAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 5, totalPendingCount: 5 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const updatedListing = {
      ...closedListing,
      lotteryStatus: LotteryStatusEnum.publishedToPublic,
    }

    const { getByText, findByText } = render(<Lottery listing={updatedListing} />)

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(getByText("Export lottery data")).toBeInTheDocument()
    expect(getByText("Export")).toBeInTheDocument()
  })

  it("should show lottery expired state as a partner", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: false, isJurisdictionalAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 5, totalPendingCount: 5 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(ctx.json([]))
        }
      )
    )

    const updatedListing = {
      ...closedListing,
      lotteryStatus: LotteryStatusEnum.expired,
    }

    const { getByText, findByText, queryByText } = render(<Lottery listing={updatedListing} />)

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(getByText("No lottery data")).toBeInTheDocument()
    expect(
      getByText("Lottery data has expired for this listing and is no longer available for export.")
    ).toBeInTheDocument()
    expect(queryByText("Publish")).not.toBeInTheDocument()
    expect(queryByText("Run lottery")).not.toBeInTheDocument()
    expect(queryByText("Release lottery")).not.toBeInTheDocument()
  })

  it("should show history log", async () => {
    mockNextRouter({ id: "Uvbk5qurpB2WI9V6WnNdH" })
    document.cookie = "access-token-available=True"
    server.use(
      rest.get("http://localhost/api/adapter/user", (_req, res, ctx) => {
        return res(
          ctx.json({
            id: "user1",
            userRoles: { isAdmin: true },
          })
        )
      }),
      rest.post("http://localhost:3100/auth/token", (_req, res, ctx) => {
        return res(ctx.json(""))
      }),
      rest.get("http://localhost:3100/applicationFlaggedSets/meta", (_req, res, ctx) => {
        return res(ctx.json({ totalCount: 5, totalPendingCount: 5 }))
      }),
      rest.get(
        "http://localhost:3100/lottery/lotteryActivityLog/Uvbk5qurpB2WI9V6WnNdH",
        (_req, res, ctx) => {
          return res(
            ctx.json([
              { status: "closed", name: null, logDate: new Date("September 6, 2025 8:15:00") },
              { status: "ran", name: "Admin One", logDate: new Date("September 6, 2025 9:00:00") },
              {
                status: "rerun",
                name: "Admin Two",
                logDate: new Date("September 6, 2025 9:30:00"),
              },
              {
                status: "releasedToPartners",
                name: "Admin Three",
                logDate: new Date("September 7, 2025 13:00:00"),
              },
              {
                status: "retracted",
                name: "Admin Four",
                logDate: new Date("September 7, 2025 14:00:00"),
              },
              {
                status: "releasedToPartners",
                name: "Admin Five",
                logDate: new Date("September 7, 2025 15:00:00"),
              },
              {
                status: "publishedToPublic",
                name: "Partner One",
                logDate: new Date("September 8, 2025 9:00:00"),
              },
            ])
          )
        }
      )
    )

    const updatedListing = {
      ...closedListing,
      lotteryStatus: LotteryStatusEnum.ran,
    }

    const { getByText, findByText, getAllByText } = render(<Lottery listing={updatedListing} />)

    const header = await findByText("Lottery")
    expect(header).toBeInTheDocument()

    expect(getByText("Listing closed")).toBeInTheDocument()
    expect(getByText("by Property")).toBeInTheDocument()
    expect(getByText("September 6th, 2025 at 8:15 am")).toBeInTheDocument()
    expect(getByText("Lottery was run")).toBeInTheDocument()
    expect(getByText("by Admin One")).toBeInTheDocument()
    expect(getByText("September 6th, 2025 at 9:00 am")).toBeInTheDocument()
    expect(getByText("Lottery was re-run")).toBeInTheDocument()
    expect(getByText("by Admin Two")).toBeInTheDocument()
    expect(getByText("September 6th, 2025 at 9:30 am")).toBeInTheDocument()
    expect(getAllByText("Lottery results released")).toHaveLength(2)
    expect(getByText("by Admin Three")).toBeInTheDocument()
    expect(getByText("September 7th, 2025 at 1:00 pm")).toBeInTheDocument()
    expect(getByText("Lottery retracted")).toBeInTheDocument()
    expect(getByText("by Admin Four")).toBeInTheDocument()
    expect(getByText("September 7th, 2025 at 2:00 pm")).toBeInTheDocument()
    expect(getByText("by Admin Five")).toBeInTheDocument()
    expect(getByText("September 7th, 2025 at 3:00 pm")).toBeInTheDocument()
    expect(getByText("Lottery results published to public")).toBeInTheDocument()
    expect(getByText("by Partner One")).toBeInTheDocument()
    expect(getByText("September 8th, 2025 at 9:00 am")).toBeInTheDocument()
  })
})
