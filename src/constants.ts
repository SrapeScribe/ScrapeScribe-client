export enum HTTPMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE'
}

export const METHOD_STYLES = {
	[HTTPMethod.GET]: 'bg-blue-500 text-white',
	[HTTPMethod.POST]: 'bg-green-500 text-white',
	[HTTPMethod.PUT]: 'bg-yellow-500 text-white',
	[HTTPMethod.DELETE]: 'bg-red-500 text-white'
} as const;


