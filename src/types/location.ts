import type { ISODateString, UUID } from './common';
import type { User } from './user';

/**
 * The four location resources form a strict parent chain:
 * Country -> Province -> City -> Area. Each child carries its parent's UUID
 * plus a preloaded parent object, so the two are kept in sync by the backend.
 *
 * The `*_id` fields are always present; the nested parent objects are only
 * populated when the handler passes GORM `Preload`, which is why they're optional.
 */

export interface Country {
  id: UUID;
  name: string;
  code: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Province {
  id: UUID;
  name: string;
  country_id: UUID;
  country?: Country;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface City {
  id: UUID;
  name: string;
  province_id: UUID;
  province?: Province;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface Area {
  id: UUID;
  name: string;
  city_id: UUID;
  city?: City;
  created_at: ISODateString;
  updated_at: ISODateString;
}

/** Mirrors `models.Address`. */
export interface Address {
  id: UUID;
  user_id: UUID;
  name: string;
  address: string;
  country_id: UUID;
  province_id: UUID;
  city_id: UUID;
  /** Go declares this as `*uuid.UUID` + `omitempty`, so it may be absent. */
  area_id?: UUID | null;
  zipcode: string;
  user?: User;
  country?: Country;
  province?: Province;
  city?: City;
  area?: Area | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}