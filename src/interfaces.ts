import { HTTPMethod } from './constants';

interface Endpoint {
	method: HTTPMethod;
	url: string;
	body: any;
}


export type { Endpoint };
