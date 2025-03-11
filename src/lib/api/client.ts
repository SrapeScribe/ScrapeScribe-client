import '$lib/aws-amplify'
import {fetchAuthSession} from "aws-amplify/auth"
import type {Endpoint, InstructionSet, Project, ProjectWithEndpointCount, User} from "$lib/interfaces"
import {HTTPMethod} from "$lib/constants"

class AuthApiClient {
    private fetch: typeof fetch = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch

    constructor(customFetch?: typeof fetch) {
        if (customFetch) {
            this.fetch = customFetch
        }
    }

    private async getAuthHeaders(): Promise<Headers> {
        const {tokens} = await fetchAuthSession()
        const headers = new Headers()
        headers.append("Content-Type", "application/json")
        headers.append(
            "Authorization",
            tokens?.idToken?.toString() ?? ""
        )
        return headers
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
     * Execute authenticated request to API
     */
    private async executeRequest<T>(
        type: 'function' | 'procedure',
        schema: string,
        operation: string,
        parameters: any[],
        method: HTTPMethod
    ): Promise<T> {
        try {
            console.debug(`${method} ${schema}.${operation}`, parameters)

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

            const requestOptions = {
                method: actualMethod,
                headers,
                body: requestBody,
                redirect: "follow" as RequestRedirect,
            }

            const response = await this.fetch("/api/db", requestOptions)

            // Check if response is ok
            if (!response.ok) {
                throw {
                    status: response.status,
                    message: response.statusText || 'Unknown error occurred',
                    operation,
                    parameters
                }
            }

            const text = await response.text()

            // Handle empty response
            if (!text.trim()) {
                return null as unknown as T
            }

            // Parse JSON response
            const parsed = JSON.parse(text)

            // For non-GET operations with entity responses, extract the entity
            if (type === 'procedure' && Array.isArray(parsed) && parsed.length > 0) {
                const result = parsed[0]

                // Check for known response formats and return direct entity
                for (const key of ['project', 'endpoint', 'instruction_set', 'user_data']) {
                    if (result[key]) {
                        return result[key] as T
                    }
                }
            }

            return parsed as T
        } catch (error: any) {
            if (!error.status) {
                throw {
                    status: 0,
                    message: error.message || 'Network connection failed',
                    timestamp: new Date().toISOString()
                }
            }
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
     * User-related API operations
     */
    userApi = {
        getCurrentUser: () =>
            this.get<User>(
                'app_private',
                'get_current_user',
                []
            ),

        getByEmail: (email: string) =>
            this.get<User>(
                'app_private',
                'get_user_by_email',
                [email]
            ),

        getByUsername: (username: string) =>
            this.get<User>(
                'app_private',
                'get_user_by_username',
                [username]
            ),

        create: (email: string, username: string, name: string, role: string) =>
            this.post<User>(
                'app_private',
                'create_user',
                [email, username, name, role]
            ),

        update: (email: string | null = null, username: string | null = null, name: string | null = null, role: string | null = null) =>
            this.put<User>(
                'app_private',
                'update_user',
                [email, username, name, role]
            ),

        updateLastLogin: () =>
            this.put<User>(
                'app_private',
                'update_user_last_login_to_now',
                []
            ),

        delete: () =>
            this.delete<User>(
                'app_private',
                'delete_user',
                []
            )
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
                'get_projects_by_user_id',
                []
            ),

        getAll: () =>
            this.getArray<Project>(
                'app_private',
                'get_projects_by_user_id',
                []
            ),

        getMyProjectIds: () =>
            this.getArray<{ id: string }>(
                'app_private',
                'get_project_ids_by_user_id',
                []
            ),

        getByContextPath: (contextPath: string) =>
            this.get<Project>(
                'app_private',
                'get_project_by_context_path',
                [contextPath]
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
                'get_project_endpoints',
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
            this.getArray<InstructionSet>(
                'app_private',
                'get_instruction_sets_by_endpoint',
                [endpointId]
            ),

        create: (endpointId: string, schema: Record<string, any>, isActive: boolean = true) =>
            this.post<InstructionSet>(
                'app_private',
                'create_instruction_set',
                [endpointId, schema, isActive]
            ),

        update: (instructionSetId: string, schema: Record<string, any> | null = null, isActive: boolean | null = null) =>
            this.put<InstructionSet>(
                'app_private',
                'update_instruction_set',
                [instructionSetId, schema, isActive]
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
