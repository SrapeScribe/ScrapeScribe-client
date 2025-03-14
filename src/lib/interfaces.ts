export type User = {
	cognito_id: string
	email: string
	username: string
	name: string | null
	role: string
	created_at: string
	last_login: string | null
}

export type Project = {
	id: string
	user_id?: string
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
	created_at: string
	updated_at: string
	is_active: boolean
}

export type ProjectWithEndpointCount = {
	id: string
	context_path: string
	status: string
	created_at: string
	updated_at: string
	endpoint_count: number
}

export type ProjectRecord = Project | ProjectWithEndpointCount | (Project & Partial<ProjectWithEndpointCount>);

export type UserProfile = {
	user: User
	projects: Project[]
}

export enum SchemeType {
	String = 'STRING',
	Object = 'OBJECT',
	List = 'LIST',
}

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

export interface ObjectScheme {
	type: SchemeType.Object
	fields: InsKVPair[]
}

export interface ListScheme {
	type: SchemeType.List
	element_scheme?: Scheme,
	path?: string
}

export interface StringScheme {
	type: SchemeType.String
	path?: string,
	mode: 'INNER_HTML' | 'SRC'
}

export type Scheme = ObjectScheme | StringScheme | ListScheme

export interface Instructions {
	url: string,
	scheme: Scheme
}
