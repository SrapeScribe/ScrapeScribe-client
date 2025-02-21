import { API_URL } from "$env/static/private"
import {HTTPMethod} from "../constants"


export type ApiResponse = {
    statusCode: number
    body: string
}

//HTTP method helpers

export const GET = async <T = any>(schema: string, operation: string, params: any[] = []): Promise<T> => {
    return callDatabase<T>(schema, operation, params, HTTPMethod.GET)
}

export const POST = async <T = any>(schema: string, operation: string, params: any[] = []): Promise<T> => {
    return callDatabase<T>(schema, operation, params, HTTPMethod.POST)
}

export const PUT = async <T = any>(schema: string, operation: string, params: any[] = []): Promise<T> => {
    return callDatabase<T>(schema, operation, params, HTTPMethod.PUT)
}

export const DELETE = async <T = any>(schema: string, operation: string, params: any[] = []): Promise<T> => {
    return callDatabase<T>(schema, operation, params, HTTPMethod.DELETE)
}

async function callDatabase<T = any>(
    schema: string,
    operation: string,
    parameters: any[] = [],
    httpMethod: HTTPMethod = HTTPMethod.POST
): Promise<T> {
    try {
        const type = (httpMethod === "GET") ? "function" : "procedure"

        const response = await fetch(API_URL, {
            method: httpMethod,
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${get(authToken)}`
            },
            body: JSON.stringify({
                type,
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
                operation
            }
        }

        return typeof apiResponse.body === 'string'
            ? JSON.parse(apiResponse.body)
            : apiResponse.body
    } catch (error: any) {
        if (!error.status) {
            throw {
                status: 0,
                message: error.message || 'Network connection failed'
            }
        }
        throw error
    }
}


export const clientApi = {
    // User API
    createUser: (cognitoId: string, email: string, username: string, name: string, role: string) =>
        POST('app_private', 'create_user', [cognitoId, email, username, name, role]),

    getUserById: (cognitoId: string) =>
        GET('app_private', 'get_user_by_id', [cognitoId]),

    getUserByEmail: (email: string) =>
        GET('app_private', 'get_user_by_email', [email]),

    getUserByUsername: (name: string) =>
        GET('app_private', 'get_user_by_username', [name]),

    // TODO: Delete user by cognitoId

    // Project API
    createProject: (userId: string, contextPath: string) =>
        POST('app_private', 'create_project', [userId, contextPath]),

    getProjectById: (projectId: string) =>
        GET('app_private', 'get_project_by_id', [projectId]),

    getProjectsByUserId: (userId: string) =>
        GET('app_private', 'get_projects_by_user_id', [userId]),

    getProjectByContextPath: (userId: string, contextPath: string) =>
        GET('app_private', 'get_project_by_context_path', [userId, contextPath]),

    getProjectIdsByUserId: (userId: string) =>
        GET('app_private', 'get_project_ids_by_user_id', [userId]),

    updateProject: (projectId: string, userId: string | null, contextPath: string | null, status: string | null) =>
        PUT('app_private', 'update_project', [projectId, userId, contextPath, status]),

    deleteProject: (projectId: string) =>
        DELETE('app_private', 'delete_project', [projectId]),

    // Endpoint API
    createEndpoint: (projectId: string, method: string, path: string, description: string | null) =>
        POST('app_private', 'create_endpoint', [projectId, method, path, description]),

    getProjectEndpoints: (projectId: string) =>
        GET('app_private', 'get_project_endpoints', [projectId]),

    getEndpointById: (endpointId: string) =>
        GET('app_private', 'get_endpoint_by_id', [endpointId]),

    getEndpointByPath: (projectId: string, method: string, path: string) =>
        GET('app_private', 'get_endpoint_by_path', [projectId, method, path]),

    getActiveEndpoints: (projectId: string) =>
        GET('app_private', 'get_active_endpoints', [projectId]),

    updateEndpoint: (endpointId: string, method: string | null, path: string | null, description: string | null, isActive: boolean | null) =>
        PUT('app_private', 'update_endpoint', [endpointId, method, path, description, isActive]),

    deleteEndpoint: (endpointId: string) =>
        DELETE('app_private', 'delete_endpoint', [endpointId]),

    // InstructionSet API

    // TODO: Add InstructionSet API
}
