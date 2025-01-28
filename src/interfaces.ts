import { HTTPMethod } from './constants';

export interface Project {
	id: string;
	user: User;
	name: string;
}

export interface Endpoint {
	id: string;
	name: string;
	project: Project;
	url: string;
	method: HTTPMethod;
	instructions: Instructions;
	refresh_period: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
}

export type FieldType = 'static' | 'scraped-string' | 'scraped-list' | 'scraped-object';
export interface DocumentField {
	key: string;
	value: any;
	type: FieldType;
	error?: string;
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
