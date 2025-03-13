import { json } from '@sveltejs/kit'
import type { RequestEvent } from '@sveltejs/kit'
import { PUBLIC_API_GATEWAY_URL } from '$env/static/public'

// Define the lambda request structure
interface LambdaRequest {
    type: 'function' | 'procedure'
    schema: string
    operation: string
    parameters: any[]
}

/**
 * Handles POST, PUT, DELETE requests
 */
export async function POST(event: RequestEvent) {
    return handleRequest(event)
}

export async function PUT(event: RequestEvent) {
    return handleRequest(event)
}

export async function DELETE(event: RequestEvent) {
    return handleRequest(event)
}

/**
 * Common handler for all database requests
 */
async function handleRequest(event: RequestEvent) {
    try {
        // Get request body
        const body = await event.request.json() as LambdaRequest
        const authHeader = event.request.headers.get('Authorization')

        // Validate auth header
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Authorization header missing' }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        // Forward request to Lambda
        const response = await fetch(PUBLIC_API_GATEWAY_URL + '/db', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(body)
        })

        // Parse lambda response
        const lambdaResponse = await response.json()

        // Return with appropriate status code
        return json(lambdaResponse, {
            status: lambdaResponse.statusCode || 200
        })
    } catch (error) {
        console.error('API proxy error:', error)

        return json({
                statusCode: 500,
                body: JSON.stringify({
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                }),
            }
        )
    }
}
