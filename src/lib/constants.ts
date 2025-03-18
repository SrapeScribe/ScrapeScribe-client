export enum HTTPMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	HEAD = 'HEAD',
}

export const METHOD_STYLES: Record<HTTPMethod, string> = {
	GET: "bg-blue-500 text-white",
	POST: "bg-green-500 text-white",
	PUT: "bg-yellow-500 text-white",
	DELETE: "bg-red-500 text-white",
	HEAD: "bg-gray-500 text-white"
} as const;

