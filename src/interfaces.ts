import { HTTPMethod } from './constants';

interface Endpoint {
	method: HTTPMethod;
	url: string;
	body: any;
}
type FieldType = 'static' | 'scraped-string' | 'scraped-list' | 'scraped-object';
interface DocumentField {
	key: string;
	value: any;
	type: FieldType;
	error?: string;
}


export type { Endpoint, FieldType, DocumentField };
