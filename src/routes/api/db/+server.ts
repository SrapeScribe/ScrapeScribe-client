import {json} from '@sveltejs/kit'
import type {RequestEvent} from '@sveltejs/kit'
import {PUBLIC_API_GATEWAY_URL} from '$env/static/public'

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
                JSON.stringify({error: 'Authorization header missing'}),
                {
                    status: 401,
                    headers: {'Content-Type': 'application/json'}
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

        // Check if response is OK
        if (!response.ok) {
            const errorText = await response.text()
            let errorJson

            try {
                errorJson = JSON.parse(errorText)
            } catch (e) {
                errorJson = {error: errorText || 'Unknown API error'}
            }

            return json(errorJson, {status: response.status})
        }

        // Get raw text from response first
        const responseText = await response.text()

        // Handle empty responses
        if (!responseText || responseText.trim() === '') {
            return json(null, {status: 200})
        }

        // Parse JSON response (or return null if parsing fails)
        let lambdaResponse
        try {
            lambdaResponse = JSON.parse(responseText)
        } catch (e) {
            console.warn('Failed to parse Lambda response as JSON:', responseText)
            return json({data: responseText}, {status: 200})
        }

        // Safety check: if lambdaResponse is null but the response was OK
        if (lambdaResponse === null) {
            return json(null, {status: 200})
        }

        // Return with appropriate status code (default to 200 if statusCode is missing)
        const statusCode = lambdaResponse?.statusCode || 200

        return json(lambdaResponse, {status: statusCode})
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
