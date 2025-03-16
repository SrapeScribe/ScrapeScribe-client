import {fetchAuthSession} from "aws-amplify/auth"
import type {Endpoint, InstructionSet, Project, ProjectWithEndpointCount} from "$lib/interfaces"
import {HTTPMethod} from "$lib/constants"

class AuthApiClient {
    private fetch: typeof fetch = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch

    constructor(customFetch?: typeof fetch) {
        if (customFetch) {
            this.fetch = customFetch
        }
        console.log("🌐 API Client: Initialized")
    }

    private async getAuthHeaders(): Promise<Headers> {
        console.log("🌐 API Client: Getting auth headers")
        try {
            const {tokens} = await fetchAuthSession()
            const headers = new Headers()
            headers.append("Content-Type", "application/json")

            if (tokens?.idToken) {
                headers.append("Authorization", tokens.idToken.toString())
                console.log("🌐 API Client: Auth token obtained successfully")
            } else {
                console.warn("🌐 API Client: No ID token available in session")
            }

            return headers
        } catch (error) {
            console.error("🌐 API Client: Error getting auth token", error)
            throw new Error("Failed to get authentication token. Please sign in again.")
        }
    }

    /**
     * Convert any response to an array format
     * Handles three cases:
     * - null → []
     * - single object → [object]
     * - array → array (unchanged)
     */
    private toArray<T>(response: T | T[] | null): T[] {
        if (response === null) {
            return []
        }
        if (Array.isArray(response)) {
            return response
        }
        return [response]
    }

    /**
     * Execute authenticated request to API with improved error handling
     */
    private async executeRequest<T>(
        type: 'function' | 'procedure',
        schema: string,
        operation: string,
        parameters: any[],
        method: HTTPMethod
    ): Promise<T> {
        console.log(`🌐 API Client: Executing ${method} request to ${schema}.${operation}`, parameters)

        try {
            // Get auth headers
            const headers = await this.getAuthHeaders()

            // For GET requests, use POST instead
            const actualMethod = (method === HTTPMethod.GET || method === HTTPMethod.HEAD)
                ? HTTPMethod.POST
                : method

            const requestBody = JSON.stringify({
                type,
                schema,
                operation,
                parameters,
            })

            console.log(`🌐 API Client: Sending ${actualMethod} request to /api/db`)

            const requestOptions = {
                method: actualMethod,
                headers,
                body: requestBody,
                redirect: "follow" as RequestRedirect,
            }

            // Execute the request
            let response: Response
            try {
                response = await this.fetch("/api/db", requestOptions)
            } catch (networkError) {
                console.error("🌐 API Client: Network error", networkError)
                throw {
                    status: 0,
                    message: "Network connection failed. Please check your internet connection.",
                    operation,
                    parameters
                }
            }

            // Check if response is ok
            if (!response.ok) {
                const statusCode = response.status
                let errorMessage = response.statusText || 'Unknown error occurred'

                // Try to get more detailed error message from response
                try {
                    const errorBody = await response.text()
                    let parsedError

                    try {
                        parsedError = JSON.parse(errorBody)
                        if (parsedError.error || parsedError.message) {
                            errorMessage = parsedError.error || parsedError.message
                        } else if (typeof parsedError === 'string') {
                            errorMessage = parsedError
                        }
                    } catch (e) {
                        // If not JSON, use the raw text if it exists
                        if (errorBody && errorBody.trim()) {
                            errorMessage = errorBody
                        }
                    }
                } catch (e) {
                    // Couldn't read error body, stick with status text
                }

                console.error(`🌐 API Client: Request failed with status ${statusCode}`, errorMessage)

                // Format user-friendly error messages for common status codes
                if (statusCode === 401) {
                    errorMessage = "You are not authorized. Please sign in again."
                } else if (statusCode === 403) {
                    errorMessage = "You don't have permission to perform this action."
                } else if (statusCode === 404) {
                    errorMessage = "The requested resource was not found."
                } else if (statusCode === 409) {
                    errorMessage = "This operation caused a conflict, possibly a duplicate resource."
                } else if (statusCode === 422) {
                    errorMessage = "The request data is invalid. Please check your inputs."
                } else if (statusCode >= 500) {
                    errorMessage = "Server error occurred. Please try again later."
                }

                throw {
                    status: statusCode,
                    message: errorMessage,
                    operation,
                    parameters
                }
            }

            // Get the response text
            let responseText
            try {
                responseText = await response.text()
            } catch (error) {
                console.error("🌐 API Client: Error reading response text", error)
                throw {
                    status: response.status,
                    message: "Failed to read response data",
                    operation,
                    parameters
                }
            }

            // Handle empty response
            if (!responseText || !responseText.trim()) {
                console.log("🌐 API Client: Empty response received")
                return null as unknown as T
            }

            // Parse JSON response
            let parsed
            try {
                parsed = JSON.parse(responseText)
                console.log(`🌐 API Client: Request to ${schema}.${operation} completed successfully`)
            } catch (error) {
                console.error("🌐 API Client: Error parsing JSON response", error, responseText)
                throw {
                    status: response.status,
                    message: "Invalid response format from server",
                    operation,
                    parameters
                }
            }

            // For non-GET operations with entity responses, extract the entity
            if (type === 'procedure' && Array.isArray(parsed) && parsed.length > 0) {
                const result = parsed[0]

                // Check for known response formats and return direct entity
                for (const key of ['project', 'endpoint', 'instruction_set']) {
                    if (result[key]) {
                        return result[key] as T
                    }
                }
            }

            return parsed as T
        } catch (error: any) {
            // Ensure we have a properly formatted error
            if (!error.status) {
                error = {
                    status: 0,
                    message: error.message || 'Unknown error occurred',
                    operation,
                    parameters,
                    timestamp: new Date().toISOString()
                }
            }

            // Log and rethrow the error
            console.error(`🌐 API Client: Error in ${schema}.${operation}`, error)
            throw error
        }
    }

    /**
     * Execute a database function (READ operation)
     */
    async get<T>(schema: string, operation: string, parameters: any[]): Promise<T> {
        return this.executeRequest<T>('function', schema, operation, parameters, HTTPMethod.GET)
    }

    /**
     * Execute a database function that always returns an array
     * Handles normalization of different response types
     */
    async getArray<T>(schema: string, operation: string, parameters: any[]): Promise<T[]> {
        const response = await this.executeRequest<T | T[] | null>('function', schema, operation, parameters, HTTPMethod.GET)
        return this.toArray(response)
    }

    /**
     * Execute a database procedure (CREATE operation)
     */
    async post<T>(schema: string, operation: string, parameters: any[]): Promise<T> {
        return this.executeRequest<T>('procedure', schema, operation, parameters, HTTPMethod.POST)
    }

    /**
     * Execute a database procedure (UPDATE operation)
     */
    async put<T>(schema: string, operation: string, parameters: any[]): Promise<T> {
        return this.executeRequest<T>('procedure', schema, operation, parameters, HTTPMethod.PUT)
    }

    /**
     * Execute a database procedure (DELETE operation)
     */
    async delete<T>(schema: string, operation: string, parameters: any[]): Promise<T> {
        return this.executeRequest<T>('procedure', schema, operation, parameters, HTTPMethod.DELETE)
    }

    /**
     * Project-related API operations
     */
    projectApi = {
        getById: (projectId: string) =>
            this.get<Project>(
                'app_private',
                'get_project_by_id',
                [projectId]
            ),

        getBySlug: (projectSlug: string) =>
            this.get<Project>(
                'app_private',
                'get_project_by_slug',
                [projectSlug]
            ),

        getMyProjects: () =>
            this.getArray<Project>(
                'app_private',
                'get_projects',
                []
            ),

        getWithEndpointCounts: () =>
            this.getArray<ProjectWithEndpointCount>(
                'app_private',
                'get_projects_with_endpoint_counts',
                []
            ),

        create: (name: string, slug: string) =>
            this.post<Project>(
                'app_private',
                'create_project',
                [name, slug]
            ),

        update: (projectId: string, name: string | null = null, slug: string | null = null, status: string | null = null) =>
            this.put<Project>(
                'app_private',
                'update_project',
                [projectId, name, slug, status]
            ),

        delete: (projectId: string) =>
            this.delete<Project>(
                'app_private',
                'delete_project',
                [projectId]
            ),

        countEndpoints: (projectId: string) =>
            this.get<number>(
                'app_private',
                'count_endpoints_by_project',
                [projectId]
            )
    }

    /**
     * Endpoint-related API operations
     */
    endpointApi = {
        getById: (endpointId: string) =>
            this.get<Endpoint>(
                'app_private',
                'get_endpoint_by_id',
                [endpointId]
            ), 

        getByProjectId: (projectId: string) =>
            this.getArray<Endpoint>(
                'app_private',
                'get_endpoints_by_project',
                [projectId]
            ),

        getByPath: (projectId: string, method: string, path: string) =>
            this.get<Endpoint>(
                'app_private',
                'get_endpoint_by_path',
                [projectId, method, path]
            ),

        getActive: (projectId: string) =>
            this.getArray<Endpoint>(
                'app_private',
                'get_active_endpoints',
                [projectId]
            ),

        create: (
            projectId: string,
            method: string,
            path: string,
            description: string | null = null,
            isActive: boolean = true
        ) =>
            this.post<Endpoint>(
                'app_private',
                'create_endpoint',
                [projectId, method, path, description, isActive]
            ),

        update: (
            endpointId: string,
            method: string | null = null,
            path: string | null = null,
            description: string | null = null,
            isActive: boolean | null = null
        ) =>
            this.put<Endpoint>(
                'app_private',
                'update_endpoint',
                [endpointId, method, path, description, isActive]
            ),

        delete: (endpointId: string) =>
            this.delete<Endpoint>(
                'app_private',
                'delete_endpoint',
                [endpointId]
            ),

        toggleStatus: (endpointId: string, isActive: boolean) =>
            this.put<Endpoint>(
                'app_private',
                'toggle_endpoint_status',
                [endpointId, isActive]
            ),

        move: (endpointId: string, targetProjectId: string) =>
            this.put<Endpoint>(
                'app_private',
                'move_endpoint',
                [endpointId, targetProjectId]
            )
    }

    /**
     * InstructionSet-related API operations
     */
    instructionSetApi = {
        getById: (instructionSetId: string) =>
            this.get<InstructionSet>(
                'app_private',
                'get_instruction_set_by_id',
                [instructionSetId]
            ),

        getByEndpointId: (endpointId: string) =>
            this.get<InstructionSet>(
                'app_private',
                'get_instruction_sets_by_endpoint',
                [endpointId]
            ),

        create: (endpointId: string, schema: Record<string, any>, url: string | null = null, isActive: boolean = true) =>
            this.post<InstructionSet>(
                'app_private',
                'create_instruction_set',
                [endpointId, schema, url, isActive]
            ),

        update: (instructionSetId: string, schema: Record<string, any> | null = null, url: string | null = null, isActive: boolean | null = null) =>
            this.put<InstructionSet>(
                'app_private',
                'update_instruction_set',
                [instructionSetId, schema, url, isActive]
            ),

        delete: (instructionSetId: string) =>
            this.delete<InstructionSet>(
                'app_private',
                'delete_instruction_set',
                [instructionSetId]
            ),

        toggleStatus: (instructionSetId: string, isActive: boolean) =>
            this.put<InstructionSet>(
                'app_private',
                'toggle_instruction_set_status',
                [instructionSetId, isActive]
            ),

        move: (instructionSetId: string, targetEndpointId: string) =>
            this.put<InstructionSet>(
                'app_private',
                'move_instruction_set',
                [instructionSetId, targetEndpointId]
            )
    }
}

// Create an API client instance that can be customized with SvelteKit's fetch
export function createAuthApiClient(customFetch?: typeof fetch) {
    return new AuthApiClient(customFetch)
}

export const authApiClient = createAuthApiClient()
