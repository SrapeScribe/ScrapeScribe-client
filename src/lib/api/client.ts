// import { authToken } from './stores/auth'
import { API_URL } from '$env/static/private'
import {HTTPMethod} from "../../constants"
import type {Endpoint, InstructionSet, Project, ProjectWithEndpointCount, User} from "../../interfaces"

export type CreateUserResponse = {
    cognito_id: string
}

export type ApiResponse = {
    statusCode: number
    body: string
}

// HTTP method helpers
export const GET = async <T>(schema: string, operation: string, params: any[]): Promise<T> => {
    return callDatabase<T>("function", schema, operation, params, HTTPMethod.GET)
}

export const POST = async <T>(schema: string, operation: string, params: any[]): Promise<T> => {
    return callDatabase<T>("procedure", schema, operation, params, HTTPMethod.POST)
}

export const PUT = async <T>(schema: string, operation: string, params: any[]): Promise<T> => {
    return callDatabase<T>("procedure", schema, operation, params, HTTPMethod.PUT)
}

export const DELETE = async <T>(schema: string, operation: string, params: any[]): Promise<T> => {
    return callDatabase<T>("procedure", schema, operation, params, HTTPMethod.DELETE)
}

async function callDatabase<T>(
    dbCallType: string,
    schema: string,
    operation: string,
    parameters: any[],
    httpMethod: HTTPMethod = HTTPMethod.POST
): Promise<T> {
    try {
        console.debug(`${httpMethod} ${schema}.${operation}`, parameters)

        const response = await fetch(API_URL, {
            method: httpMethod,
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${get(authToken)}`
            },
            body: JSON.stringify({
                type: dbCallType,
                schema,
                operation,
                parameters
            })
        })

        const apiResponse = await response.json() as ApiResponse

        if (!response.ok) {
            throw {
                status: apiResponse.statusCode,
                message: apiResponse.body || 'Unknown error occurred',
                operation,
                parameters
            }
        }

        try {
            return JSON.parse(apiResponse.body) as T
        } catch (err) {
            return apiResponse.body as unknown as T
        }
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

export const userApi = {
    getById: (cognitoId: string) =>
        GET<User>(
            'app_private',
            'get_user_by_id',
            [cognitoId]
        ),

    getByEmail: (email: string) =>
        GET<User>(
            'app_private',
            'get_user_by_email',
            [email]
        ),

    getByUsername: (username: string) =>
        GET<User>(
            'app_private',
            'get_user_by_username',
            [username]
        ),

    create: (cognitoId: string, email: string, username: string, name: string, role: string) =>
        POST<CreateUserResponse>(
            'app_private',
            'create_user',
            [cognitoId, email, username, name, role]
        ),

    update: (cognitoId: string, email: string | null = null, username: string | null = null, name: string | null = null, role: string | null = null) =>
        PUT<void>(
            'app_private',
            'update_user',
            [cognitoId, email, username, name, role]
        ),

    updateLastLogin: (cognitoId: string) =>
        PUT<void>(
            'app_private',
            'update_user_last_login_to_now',
            [cognitoId]
        ),

    delete: (cognitoId: string) =>
        DELETE<void>(
            'app_private',
            'delete_user',
            [cognitoId]
        )
}

// Project-related API calls
export const projectApi = {
    getById: (projectId: string) =>
        GET<Project>(
            'app_private',
            'get_project_by_id',
            [projectId]
        ),

    getByUserId: (userId: string) =>
        GET<Project[]>(
            'app_private',
            'get_projects_by_user_id',
            [userId]
        ),

    getIdsByUserId: (userId: string) =>
        GET<{id: string}[]>(
            'app_private',
            'get_project_ids_by_user_id',
            [userId]
        ),

    getByContextPath: (userId: string, contextPath: string) =>
        GET<Project>(
            'app_private',
            'get_project_by_context_path',
            [userId, contextPath]
        ),

    getWithEndpointCounts: (userId: string) =>
        GET<ProjectWithEndpointCount[]>(
            'app_private',
            'get_projects_with_endpoint_counts',
            [userId]
        ),

    create: (userId: string, contextPath: string) =>
        POST<Project>(
            'app_private',
            'create_project',
            [userId, contextPath]
        ),

    update: (projectId: string, userId: string | null, contextPath: string | null, status: string | null) =>
        PUT<void>(
            'app_private',
            'update_project',
            [projectId, userId, contextPath, status]
        ),

    delete: (projectId: string) =>
        DELETE<void>(
            'app_private',
            'delete_project',
            [projectId]
        ),

    countEndpoints: (projectId: string) =>
        GET<number>(
            'app_private',
            'count_endpoints_by_project',
            [projectId]
        )
}

// Endpoint-related API calls
export const endpointApi = {
    getById: (endpointId: string) =>
        GET<Endpoint>(
            'app_private',
            'get_endpoint_by_id',
            [endpointId]
        ),

    getByProjectId: (projectId: string) =>
        GET<Endpoint[]>(
            'app_private',
            'get_project_endpoints',
            [projectId]
        ),

    getByPath: (projectId: string, method: string, path: string) =>
        GET<Endpoint>(
            'app_private',
            'get_endpoint_by_path',
            [projectId, method, path]
        ),

    getActive: (projectId: string) =>
        GET<Endpoint[]>(
            'app_private',
            'get_active_endpoints',
            [projectId]
        ),

    create: (projectId: string, method: string, path: string, description: string | null = null, isActive: boolean = true) =>
        POST<Endpoint>(
            'app_private',
            'create_endpoint',
            [projectId, method, path, description, isActive]
        ),

    update: (endpointId: string, method: string | null = null, path: string | null = null, description: string | null = null, isActive: boolean | null = null) =>
        PUT<void>(
            'app_private',
            'update_endpoint',
            [endpointId, method, path, description, isActive]
        ),

    delete: (endpointId: string) =>
        DELETE<void>(
            'app_private',
            'delete_endpoint',
            [endpointId]
        ),

    toggleStatus: (endpointId: string, isActive: boolean) =>
        PUT<void>(
            'app_private',
            'toggle_endpoint_status',
            [endpointId, isActive]
        ),

    move: (endpointId: string, targetProjectId: string) =>
        PUT<void>(
            'app_private',
            'move_endpoint',
            [endpointId, targetProjectId]
        )
}

// InstructionSet-related API calls
export const instructionSetApi = {
    getById: (instructionSetId: string) =>
        GET<InstructionSet>(
            'app_private',
            'get_instruction_set_by_id',
            [instructionSetId]
        ),

    getByEndpointId: (endpointId: string) =>
        GET<InstructionSet[]>(
            'app_private',
            'get_instruction_sets_by_endpoint',
            [endpointId]
        ),

    create: (endpointId: string, schema: Record<string, any>, isActive: boolean = true) =>
        POST<InstructionSet>(
            'app_private',
            'create_instruction_set',
            [endpointId, schema, isActive]
        ),

    update: (instructionSetId: string, schema: Record<string, any> | null = null, isActive: boolean | null = null) =>
        PUT<void>(
            'app_private',
            'update_instruction_set',
            [instructionSetId, schema, isActive]
        ),

    delete: (instructionSetId: string) =>
        DELETE<void>(
            'app_private',
            'delete_instruction_set',
            [instructionSetId]
        ),

    toggleStatus: (instructionSetId: string, isActive: boolean) =>
        PUT<void>(
            'app_private',
            'toggle_instruction_set_status',
            [instructionSetId, isActive]
        ),

    move: (instructionSetId: string, targetEndpointId: string) =>
        PUT<void>(
            'app_private',
            'move_instruction_set',
            [instructionSetId, targetEndpointId]
        )
}
