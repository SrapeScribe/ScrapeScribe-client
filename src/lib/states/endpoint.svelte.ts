import {authApiClient as apiClient} from "$lib/api/client"
import {authStore} from "$lib/states/auth.svelte"
import type {Endpoint} from "$lib/interfaces"

class EndpointStore {
    currentProjectId: string | null = $state(null)
    endpoints: Endpoint[] = $state([])
    currentEndpoint: Endpoint | null = $state(null)
    isLoading: boolean = $state(false)
    error: string | null = $state(null)
    operationInProgress: string | null = $state(null)

    constructor() {
        console.log("🔌 EndpointStore: Initialized")
    }

    /**
     * Check if user is authenticated before executing an operation
     * @returns true if authenticated, false otherwise (and sets error)
     */
    private checkAuthentication(): boolean {
        if (!authStore.authState.isAuthenticated) {
            console.error("🔌 EndpointStore: User not authenticated")
            this.error = "You must be signed in to perform this action"
            return false
        }
        return true
    }

    /**
     * Set active project and load its endpoints
     */
    async setActiveProject(projectId: string | null) {
        // Always clear endpoints immediately before any loading happens
        console.log(`🔌 EndpointStore: Setting active project to ${projectId || 'none'}`)
        this.endpoints = []

        if (!projectId) {
            console.log("🔌 EndpointStore: No project ID provided, skipping endpoint loading")
            this.currentProjectId = null
            return
        }

        if (!this.checkAuthentication()) return

        this.currentProjectId = projectId
        await this.loadEndpoints(projectId)
    }

    /**
     * Load all endpoints for a specific project
     */
    async loadEndpoints(projectId: string) {
        if (!projectId) {
            console.error("🔌 EndpointStore: Cannot load endpoints - missing project ID")
            throw new Error("Project ID is required")
        }

        if (!this.checkAuthentication()) return

        console.log(`🔌 EndpointStore: Loading endpoints for project ${projectId}`)

        this.isLoading = true
        this.operationInProgress = `loading-endpoints-${projectId}`
        this.error = null

        try {
            console.log(`🔌 EndpointStore: Fetching endpoints from API for project ${projectId}`)
            const endpoints = await apiClient.endpointApi.getByProjectId(projectId)
            console.log(`🔌 EndpointStore: Loaded ${endpoints.length} endpoints successfully`)

            this.endpoints = endpoints
            this.error = null
            return endpoints
        } catch (error: any) {
            const errorMessage = error.message || "Failed to load endpoints"
            console.error(`🔌 EndpointStore: Error loading endpoints for project ${projectId}:`, error)
            this.error = errorMessage
            throw error
        } finally {
            this.isLoading = false
            this.operationInProgress = null
            console.log(`🔌 EndpointStore: Finished loading endpoints operation for project ${projectId}`)
        }
    }

    /**
     * Load a specific endpoint by ID
     */
    async loadEndpoint(endpointId: string) {
        if (!endpointId) {
            console.error("🔌 EndpointStore: Cannot load endpoint - missing ID")
            throw new Error("Endpoint ID is required")
        }

        if (!this.checkAuthentication()) return

        console.log(`🔌 EndpointStore: Loading endpoint details for ID: ${endpointId}`)

        this.isLoading = true
        this.operationInProgress = `loading-endpoint-${endpointId}`
        this.error = null

        try {
            console.log(`🔌 EndpointStore: Fetching endpoint from API: ${endpointId}`)
            const endpoint = await apiClient.endpointApi.getById(endpointId)
            console.log(`🔌 EndpointStore: Endpoint loaded successfully:`, endpoint)

            this.currentEndpoint = endpoint
            this.error = null
            return endpoint
        } catch (error: any) {
            const errorMessage = error.message || `Failed to load endpoint details`
            console.error(`🔌 EndpointStore: Error loading endpoint ${endpointId}:`, error)
            this.error = errorMessage
            throw error
        } finally {
            this.isLoading = false
            this.operationInProgress = null
            console.log(`🔌 EndpointStore: Finished loading endpoint operation for ${endpointId}`)
        }
    }

    /**
     * Create a new endpoint
     */
    async addEndpoint(
        projectId: string,
        method: string,
        path: string,
        description?: string,
    ) {
        if (!projectId) {
            console.error("🔌 EndpointStore: Cannot create endpoint - missing project ID")
            throw new Error("Project ID is required")
        }

        if (!method) {
            console.error("🔌 EndpointStore: Cannot create endpoint - missing method")
            throw new Error("HTTP method is required")
        }

        if (!path) {
            console.error("🔌 EndpointStore: Cannot create endpoint - missing path")
            throw new Error("Endpoint path is required")
        }

        if (!this.checkAuthentication()) return

        // Check for duplicate active endpoints with the same method and path
        const existingEndpoint = this.endpoints.find(e =>
            e.is_active && e.method === method && e.path === path
        );

        if (existingEndpoint) {
            const error = `An active endpoint with method ${method} and path "${path}" already exists.`
            console.error(`🔌 EndpointStore: ${error}`)
            // Don't update the global store error for client-side validation
            throw new Error(error)
        }

        console.log(`🔌 EndpointStore: Creating new endpoint ${method} ${path} for project ${projectId}`)

        this.isLoading = true
        this.operationInProgress = 'creating-endpoint'
        this.error = null

        try {
            console.log(`🔌 EndpointStore: Sending create endpoint request to API`)
            console.log(`🔌 EndpointStore: Parameters - projectId: ${projectId}, method: ${method}, path: ${path}, description: ${description || 'none'}`)

            const endpoint = await apiClient.endpointApi.create(projectId, method, path, description)
            console.log("🔌 EndpointStore: Endpoint created successfully:", endpoint)

            // Update local state
            this.endpoints = [...this.endpoints, endpoint]
            return endpoint
        } catch (error: any) {
            // Enhance error message with more details
            let errorMessage = "Failed to create endpoint"
            let isConstraintError = false

            // Handle common error scenarios
            if (error.status === 409 || (error.message && error.message.includes("already exists"))) {
                errorMessage = `An endpoint with method ${method} and path "${path}" already exists`
                isConstraintError = true
            } else if (error.status === 422 || (error.message && error.message.includes("invalid"))) {
                errorMessage = `Invalid endpoint information: ${error.message}`
            } else if (error.status === 401 || error.status === 403) {
                errorMessage = "You don't have permission to create this endpoint"
            }

            console.error(`🔌 EndpointStore: Error creating endpoint:`, error)

            // Only update the global store error for non-constraint errors
            if (!isConstraintError) {
                this.error = errorMessage
            }

            throw new Error(errorMessage)
        } finally {
            this.isLoading = false
            this.operationInProgress = null
            console.log("🔌 EndpointStore: Finished endpoint creation operation")
        }
    }

    /**
     * Update an existing endpoint
     */
    async updateEndpoint({endpoint}: { endpoint: Partial<Endpoint> }) {
        const {id: endpointId, method, path, description, is_active} = endpoint

        if (!endpointId) {
            console.error("🔌 EndpointStore: Cannot update endpoint - missing ID")
            throw new Error("Endpoint ID is required")
        }

        if (!this.checkAuthentication()) return

        console.log(`🔌 EndpointStore: Updating endpoint ${endpointId}`)
        console.log(`🔌 EndpointStore: Update fields - method: ${method || '(unchanged)'}, path: ${path || '(unchanged)'}, description: ${description || '(unchanged)'}, active: ${is_active !== undefined ? is_active : '(unchanged)'}`)

        this.isLoading = true
        this.operationInProgress = `updating-endpoint-${endpointId}`
        this.error = null

        try {
            console.log(`🔌 EndpointStore: Sending update request to API for endpoint ${endpointId}`)
            const updatedEndpoint = await apiClient.endpointApi.update(endpointId, method, path, description, is_active)
            console.log(`🔌 EndpointStore: Endpoint updated successfully:`, updatedEndpoint)

            // Update endpoints array
            this.endpoints = this.endpoints.map(e =>
                e.id === endpointId ? {...e, ...updatedEndpoint} : e
            )

            // Update current endpoint if it's the one being edited
            if (this.currentEndpoint?.id === endpointId) {
                this.currentEndpoint = updatedEndpoint
            }

            return updatedEndpoint
        } catch (error: any) {
            const errorMessage = error.message || `Failed to update endpoint`
            console.error(`🔌 EndpointStore: Error updating endpoint ${endpointId}:`, error)
            this.error = errorMessage
            throw error
        } finally {
            this.isLoading = false
            this.operationInProgress = null
            console.log(`🔌 EndpointStore: Finished endpoint update operation for ${endpointId}`)
        }
    }

    /**
     * Toggle the status of an endpoint
     */
    async toggleEndpointStatus(endpointId: string, is_active: boolean) {
        if (!endpointId) {
            console.error("🔌 EndpointStore: Cannot toggle status - missing endpoint ID")
            throw new Error("Endpoint ID is required")
        }

        if (!this.checkAuthentication()) return

        console.log(`🔌 EndpointStore: Toggling status for endpoint ${endpointId} to ${is_active ? 'active' : 'inactive'}`)

        // If we're trying to activate an endpoint, check if there's already an active one with the same method and path
        if (is_active) {
            const targetEndpoint = this.endpoints.find(e => e.id === endpointId)

            if (targetEndpoint) {
                const conflictingEndpoint = this.endpoints.find(e =>
                    e.id !== endpointId &&
                    e.is_active &&
                    e.method === targetEndpoint.method &&
                    e.path === targetEndpoint.path
                )

                if (conflictingEndpoint) {
                    const error = `Cannot activate this endpoint: An active endpoint with method ${targetEndpoint.method} and path "${targetEndpoint.path}" already exists.`
                    console.error(`🔌 EndpointStore: ${error}`)
                    // Don't update store state for this client-side validation error
                    throw new Error(error)
                }
            }
        }

        this.isLoading = true
        this.operationInProgress = `toggling-status-${endpointId}`
        this.error = null

        try {
            console.log(`🔌 EndpointStore: Sending toggle status request to API for endpoint ${endpointId}`)
            const updatedEndpoint = await apiClient.endpointApi.toggleStatus(endpointId, is_active)
            console.log(`🔌 EndpointStore: Status toggled successfully for endpoint ${endpointId}`)

            this.endpoints = this.endpoints.map(e =>
                e.id === endpointId ? {...e, ...updatedEndpoint} : e
            )

            if (this.currentEndpoint?.id === endpointId) {
                this.currentEndpoint = updatedEndpoint
            }

            return updatedEndpoint
        } catch (error: any) {
            // Check for specific server error about duplicate active endpoints
            let errorMessage = error.message || `Failed to toggle endpoint status`

            if (error.message && (
                error.message.includes("active endpoint with this method and path already exists") ||
                error.message.includes("duplicate") ||
                error.message.includes("already active")
            )) {
                errorMessage = `Cannot activate this endpoint: An active endpoint with the same method and path already exists.`
            }

            console.error(`🔌 EndpointStore: Error toggling status for endpoint ${endpointId}:`, error)

            // For constraint violations, don't update the global store error
            // This allows the individual component to handle it without affecting the list view
            if (!errorMessage.includes("Cannot activate this endpoint")) {
                this.error = errorMessage
            }

            throw new Error(errorMessage)
        } finally {
            this.isLoading = false
            this.operationInProgress = null
            console.log(`🔌 EndpointStore: Finished status toggle operation for endpoint ${endpointId}`)
        }
    }

    /**
     * Delete an endpoint
     */
    async deleteEndpoint(endpointId: string) {
        if (!endpointId) {
            console.error("🔌 EndpointStore: Cannot delete endpoint - missing ID")
            throw new Error("Endpoint ID is required")
        }

        if (!this.checkAuthentication()) return

        console.log(`🔌 EndpointStore: Deleting endpoint ${endpointId}`)

        this.isLoading = true
        this.operationInProgress = `deleting-endpoint-${endpointId}`
        this.error = null

        try {
            console.log(`🔌 EndpointStore: Sending delete request to API for endpoint ${endpointId}`)
            await apiClient.endpointApi.delete(endpointId)
            console.log(`🔌 EndpointStore: Endpoint deleted successfully`)

            // Update local state by removing the deleted endpoint
            this.endpoints = this.endpoints.filter(e => e.id !== endpointId)

            // If the deleted endpoint was the current endpoint, clear it
            if (this.currentEndpoint?.id === endpointId) {
                this.currentEndpoint = null
            }
        } catch (error: any) {
            const errorMessage = error.message || `Failed to delete endpoint`
            console.error(`🔌 EndpointStore: Error deleting endpoint ${endpointId}:`, error)
            this.error = errorMessage
            throw error
        } finally {
            this.isLoading = false
            this.operationInProgress = null
            console.log(`🔌 EndpointStore: Finished endpoint deletion operation for ${endpointId}`)
        }
    }

    /**
     * Reset store state
     */
    reset() {
        console.log("🔌 EndpointStore: Resetting state")
        this.currentProjectId = null
        this.endpoints = []
        this.currentEndpoint = null
        this.error = null
        this.isLoading = false
        this.operationInProgress = null
    }
}

export const endpointStore = new EndpointStore()
