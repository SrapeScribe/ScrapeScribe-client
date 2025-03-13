import {authApiClient as apiClient} from "$lib/api/client"
import type {Endpoint, Project} from "$lib/interfaces"

class EndpointStore {
    currentProjectId: string | null = $state(null)
    endpoints: Endpoint[] = $state([])
    currentEndpoint: Endpoint | null = $state(null)
    isLoading: boolean = $state(false)
    error: string | null = $state(null)

    constructor() {}

    /**
     * Set active project and load its endpoints
     */
    async setActiveProject(projectId: string | null) {
        // Always clear endpoints immediately before any loading happens
        this.endpoints = []

        if (!projectId) return

        this.currentProjectId = projectId
        await this.loadEndpoints(projectId)
    }

    /**     * Load all endpoints for a specific project
     */
    async loadEndpoints(projectId: string) {
        if (!projectId) return

        this.isLoading = true

        try {
            const endpoints = await apiClient.endpointApi.getByProjectId(projectId)
            this.endpoints = endpoints
            this.error = null
        } catch (error: any) {
            this.error = error.message || "An unknown error occurred"
            console.error("[EndpointStore]", error)
        } finally {
            this.isLoading = false
        }
    }

    /**
     * Load a specific endpoint by ID
     */
    async loadEndpoint(endpointId: string) {
        if (!endpointId) return

        this.isLoading = true

        try {
            const endpoint = await apiClient.endpointApi.getById(endpointId)
            this.currentEndpoint = endpoint
            this.error = null
        } catch (error: any) {
            this.error = error.message || "An unknown error occurred"
            console.error("[EndpointStore]", error)
        } finally {
            this.isLoading = false
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
            throw new Error("Project ID is required")
        }

        this.isLoading = true

        try {
            const endpoint = await apiClient.endpointApi.create(projectId, method, path, description)
            this.endpoints = [...this.endpoints, endpoint]
            this.error = null
            return endpoint
        } catch (error: any) {
            this.error = error.message || "An unknown error occurred"
            console.error("[EndpointStore]", error)
            throw error
        } finally {
            this.isLoading = false
        }
    }

    /**
     * Update an existing endpoint
     */
    async updateEndpoint({endpoint}: { endpoint: Partial<Endpoint> }) {
        const {id: endpointId, method, path, description, is_active} = endpoint
        if (!endpointId) {
            throw new Error("Endpoint ID is required")
        }

        this.isLoading = true

        try {
            const updatedEndpoint = await apiClient.endpointApi.update(endpointId, method, path, description, is_active)
            this.endpoints = this.endpoints.map(e =>
                e.id === endpointId ? {...e, ...updatedEndpoint} : e
            )
            if (this.currentEndpoint?.id === endpointId) {
                this.currentEndpoint = updatedEndpoint
            }
            this.error = null
            return updatedEndpoint
        } catch (error: any) {
            this.error = error.message || "An unknown error occurred"
            console.error("[EndpointStore]", error)
            throw error
        } finally {
            this.isLoading = false
        }
    }

    /**
     * Toggle the status of an endpoint
     */
    async toggleEndpointStatus(endpointId: string, is_active: boolean) {
        if (!endpointId) {
            throw new Error("Endpoint ID is required")
        }

        this.isLoading = true

        try {
            const updatedEndpoint = await apiClient.endpointApi.toggleStatus(endpointId, is_active)
            this.endpoints = this.endpoints.map(e =>
                e.id === endpointId ? {...e, ...updatedEndpoint} : e
            )
            if (this.currentEndpoint?.id === endpointId) {
                this.currentEndpoint = updatedEndpoint
            }
            this.error = null
            return updatedEndpoint
        } catch (error: any) {
            this.error = error.message || "An unknown error occurred"
            console.error("[EndpointStore]", error)
            throw error
        } finally {
            this.isLoading = false
        }
    }

    /**
     * Delete an endpoint
     */
    async deleteEndpoint(endpointId: string) {
        if (!endpointId) {
            throw new Error("Endpoint ID is required")
        }

        this.isLoading = true

        try {
            await apiClient.endpointApi.delete(endpointId)
            this.endpoints = this.endpoints.filter(e => e.id !== endpointId)
            if (this.currentEndpoint?.id === endpointId) {
                this.currentEndpoint = null
            }
            this.error = null
        } catch (error: any) {
            this.error = error.message || "An unknown error occurred"
            console.error("[EndpointStore]", error)
            throw error
        } finally {
            this.isLoading = false
        }
    }

    /**
     * Reset the store state
     */
    reset() {
        this.currentProjectId = null
        this.endpoints = []
        this.currentEndpoint = null
        this.error = null
        this.isLoading = false
    }
}

export const endpointStore = new EndpointStore()
