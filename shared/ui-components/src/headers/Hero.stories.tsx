import * as React from "react"

import { Hero } from "./Hero"
import Archer from "@bloom-housing/listings-service/listings/archer.json"
import Triton from "@bloom-housing/listings-service/listings/triton-test.json"
import { ListingDto } from "@bloom-housing/core"

export default {
  title: "Headers/Hero",
}

const archer = Object.assign({}, Archer) as any
const triton = Object.assign({}, Triton) as any
const listings = [archer, triton] as ListingDto[]

export const withListings = () => (
  <Hero
    title={<>Say Hello to Your Hero</>}
    buttonTitle="I am a Button"
    buttonLink="/listings"
    listings={listings}
  />
)

export const withNoListings = () => (
  <Hero
    title={<>Say Hello to Your Hero</>}
    buttonTitle="I am a Button"
    buttonLink="/listings"
    listings={[]}
  />
)

export const withBackground = () => (
  <Hero
    title={<>Say Hello to Your Hero</>}
    buttonTitle="Rental Listings"
    buttonLink="/listings"
    listings={[]}
    backgroundImage="/images/banner.png"
  />
)
