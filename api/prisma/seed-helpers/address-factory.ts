import { Prisma } from '@prisma/client';
import { randomInt } from 'node:crypto';

export const addressFactory =
  (): Prisma.AddressCreateWithoutBuildingAddressInput =>
    [
      yellowstoneAddress,
      yosemiteAddress,
      rockyMountainAddress,
      moabAddress,
      acadiaAddress,
      grandCanyonAddress,
      glacierAddress,
      carlsbadAddress,
    ][randomInt(8)];

export const yellowstoneAddress = {
  placeName: 'Yellowstone National Park',
  city: 'Yellowstone National Park',
  county: 'Teton County',
  state: 'WY',
  street: '3200 Old Faithful Inn Rd',
  zipCode: '82190',
  latitude: 44.459928576661824,
  longitude: -110.83109211487681,
};

export const yosemiteAddress = {
  placeName: 'Yosemite National Park',
  city: 'Yosemite Valley',
  county: 'Mariposa County',
  state: 'CA',
  street: '9035 Village Dr',
  zipCode: '95389',
  latitude: 37.7487501,
  longitude: -119.5920354,
};

export const rockyMountainAddress = {
  placeName: 'Rocky Mountain National Park',
  city: 'Estes Park',
  county: 'Larimer County',
  state: 'CO',
  street: '1000 US-36',
  zipCode: '80517',
  latitude: 40.3800984,
  longitude: -105.5709864,
};

export const moabAddress = {
  placeName: 'Arches National Park',
  city: 'Moab',
  county: 'Grand County',
  state: 'UT',
  street: '25 E Center St',
  zipCode: '84532',
  latitude: 38.6190099,
  longitude: -109.6969108,
};

export const acadiaAddress = {
  placeName: 'Acadia National Park',
  city: 'Bar Harbor',
  county: 'Hancock County',
  state: 'ME',
  street: '25 Visitor Center Rd',
  zipCode: '04609',
  latitude: 44.4089658,
  longitude: -68.3173111,
};

export const grandCanyonAddress = {
  placeName: 'Grand Canyon National Park',
  city: 'Grand Canyon Village',
  county: 'Coconino County',
  state: 'AZ',
  street: 'S Entrance Rd',
  zipCode: '86023',
  latitude: 36.016779,
  longitude: -112.15888,
};

export const glacierAddress = {
  placeName: 'Glacier National Park',
  city: 'West Glacier',
  county: 'Glacier County',
  state: 'MT',
  street: '64 Grinnell Dr',
  zipCode: '59936',
  latitude: 53.7487218,
  longitude: -142.0251025,
};

export const carlsbadAddress = {
  placeName: 'Carlsbad Caverns National Park',
  city: 'Carlsbad',
  county: 'Eddy County',
  state: 'NM',
  street: '727 Carlsbad Cavern Hwy',
  zipCode: '88220',
  latitude: 32.1754674,
  longitude: -104.4491038,
};
