export type User = {
	// Cognito required attributes
	sub: string                  // Unique identifier (replacing cognito_id)
	email: string                // User's email

	// Standard Cognito attributes
	name?: string                // Full name
	family_name?: string         // Last name
	given_name?: string          // First name
	middle_name?: string         // Middle name
	nickname?: string            // Nickname
	preferred_username?: string  // Username (replacing username)
	profile?: string             // Profile URL
	picture?: string             // Profile picture URL
	website?: string             // Website URL
	gender?: string              // Gender
	birthdate?: string           // Birth date
	zoneinfo?: string            // Time zone
	locale?: string              // Locale
	updated_at?: string          // Last updated timestamp
	address?: string             // Address
	phone_number?: string        // Phone number

	// Custom attributes
	role?: string                // User role (admin, user, etc.)
	created_at?: string          // Account creation date
	last_login?: string          // Last login timestamp
}

export type ProjectWithEndpointCount = Project & {
	endpoint_count: number
}

export type Project = {
	id: string
	user_id?: string            // User ID from Cognito (sub)
	name: string
	slug: string
	status: string
	created_at: string
	updated_at: string
}

export type Endpoint = {
	id: string
	project_id: string
	method: string
	path: string
	description: string | null
	is_active: boolean
	created_at: string
	updated_at: string
}

export type InstructionSet = {
	id: string
	endpoint_id: string
	schema: Record<string, any>
	url: string,
	created_at: string
	updated_at: string
	is_active: boolean
}

export interface Instructions {
	url: string,
	scheme: Scheme
}

export interface BaseScheme {
	type: SchemeType
	url?: string    // URL can now be specified at any level
	name?: string
}

export type Scheme = ObjectScheme | StringScheme | ListScheme

export interface ObjectScheme extends BaseScheme {
	type: SchemeType.Object
	fields: InsKVPair[]
}

export interface ListScheme extends BaseScheme {
	type: SchemeType.List
	element_scheme?: Scheme
	path?: string
}

export interface StringScheme extends BaseScheme {
	type: SchemeType.String
	path?: string
	mode: 'INNER_HTML' | 'SRC'
}

export enum SchemeType {
	String = 'STRING',
	Object = 'OBJECT',
	List = 'LIST',
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

export function emptyScheme(kind: SchemeType): Scheme {
	if (kind === SchemeType.String) {
		return {
			type: SchemeType.String,
			path: undefined,
			mode: 'INNER_HTML',
		};
	} else if (kind === SchemeType.Object) {
		return {
			type: SchemeType.Object,
			fields: [],
		};
	} else if (kind === SchemeType.List) {
		return {
			type: SchemeType.List,
			element_scheme: undefined,
			path: undefined,
		}
	}

	throw new Error('empty scheme not implemented')
}

export interface InsKVPair {
	key: string
	value?: Scheme
}
