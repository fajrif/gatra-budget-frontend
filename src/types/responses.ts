/**
 * Single-resource envelopes. The Go handlers key these by resource name
 * (`fiber.Map{"country": country}`), not by a generic `data` field.
 */

import type { Address, Area, City, Country, Province } from './location';
import type { User } from './user';
import type { BudgetItem, Client, ContractType, CostType, Project, Transaction } from './budget';

export type CountryResponse = { country: Country };
export type ProvinceResponse = { province: Province };
export type CityResponse = { city: City };
export type AreaResponse = { area: Area };
export type AddressResponse = { address: Address };
export type UserResponse = { user: User };
export type ClientResponse = { client: Client };
export type ContractTypeResponse = { contract_type: ContractType };
export type CostTypeResponse = { cost_type: CostType };
export type ProjectResponse = { project: Project };
export type BudgetItemResponse = { budget_item: BudgetItem };
export type TransactionResponse = { transaction: Transaction };