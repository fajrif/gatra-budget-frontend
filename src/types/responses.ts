/**
 * Single-resource envelopes. The Go handlers key these by resource name
 * (`fiber.Map{"country": country}`), not by a generic `data` field.
 */

import type { Address, Area, City, Country, Province } from './location';
import type { User } from './user';

export type CountryResponse = { country: Country };
export type ProvinceResponse = { province: Province };
export type CityResponse = { city: City };
export type AreaResponse = { area: Area };
export type AddressResponse = { address: Address };
export type UserResponse = { user: User };