import { authApiClient as apiClient } from "$lib/api/client"
import type { InstructionSet } from "$lib/interfaces"

class InstructionSetStore {
    currentEndpointId: string | null = $state(null)
    instructionSet: InstructionSet | null = $state(null)
    isLoading: boolean = $state(false)
    error: string | null = $state(null)

    constructor() {}

    /**
     * Set active endpoint and load its instruction set
     */
    async setActiveEndpoint(endpointId: string | null) {
        // Always clear instruction set before loading
        this.instructionSet = null

        if (!endpointId) return

        this.currentEndpointId = endpointId
        await this.loadInstructionSet(endpointId)
    }

    /**
     * Load instruction set for a specific endpoint
     */
    async loadInstructionSet(endpointId: string) {
        if (!endpointId) return

        this.isLoading = true

        try {
            const instructionSet = await apiClient.instructionSetApi.getByEndpointId(endpointId)
            this.instructionSet = instructionSet
            this.error = null
        } catch (error: any) {
            this.error = error.message || "An unknown error occurred"
            console.error("[InstructionSetStore]", error)
        } finally {
            this.isLoading = false
        }
    }

    /**
     * Create a new instruction set for an endpoint
     */
    async createInstructionSet(
        endpointId: string,
        schema: Record<string, any>,
        isActive: boolean = true
    ) {
        if (!endpointId) {
            throw new Error("Endpoint ID is required")
        }

        this.isLoading = true

        try {
            const instructionSet = await apiClient.instructionSetApi.create(
                endpointId,
                schema,
                isActive
            )
            this.instructionSet = instructionSet
            this.error = null
            return instructionSet
        } catch (error: any) {
            this.error = error.message || "An unknown error occurred"
            console.error("[InstructionSetStore]", error)
            throw error
        } finally {
            this.isLoading = false
        }
    }

    /**
     * Update an existing instruction set
     */
    async updateInstructionSet({
                                   instructionSet
                               }: {
        instructionSet: Partial<InstructionSet>
    }) {
        const { id: instructionSetId, schema, is_active } = instructionSet

        if (!instructionSetId) {
            throw new Error("Instruction Set ID is required")
        }

        this.isLoading = true

        try {
            const updatedInstructionSet = await apiClient.instructionSetApi.update(
                instructionSetId,
                schema || null,
                is_active !== undefined ? is_active : null
            )

            this.instructionSet = {
                ...this.instructionSet,
                ...updatedInstructionSet
            } as InstructionSet

            this.error = null
            return updatedInstructionSet
        } catch (error: any) {
            this.error = error.message || "An unknown error occurred"
            console.error("[InstructionSetStore]", error)
            throw error
        } finally {
            this.isLoading = false
        }
    }

    /**
     * Toggle the status of an instruction set
     */
    async toggleInstructionSetStatus(instructionSetId: string, isActive: boolean) {
        if (!instructionSetId) {
            throw new Error("Instruction Set ID is required")
        }

        this.isLoading = true

        try {
            const updatedInstructionSet = await apiClient.instructionSetApi.toggleStatus(
                instructionSetId,
                isActive
            )

            this.instructionSet = {
                ...this.instructionSet,
                ...updatedInstructionSet
            } as InstructionSet

            this.error = null
            return updatedInstructionSet
        } catch (error: any) {
            this.error = error.message || "An unknown error occurred"
            console.error("[InstructionSetStore]", error)
            throw error
        } finally {
            this.isLoading = false
        }
    }

    /**
     * Delete an instruction set
     */
    async deleteInstructionSet(instructionSetId: string) {
        if (!instructionSetId) {
            throw new Error("Instruction Set ID is required")
        }

        this.isLoading = true

        try {
            await apiClient.instructionSetApi.delete(instructionSetId)
            this.instructionSet = null
            this.error = null
        } catch (error: any) {
            this.error = error.message || "An unknown error occurred"
            console.error("[InstructionSetStore]", error)
            throw error
        } finally {
            this.isLoading = false
        }
    }

    /**
     * Check if an instruction set exists for the current endpoint
     */
    hasInstructionSet(): boolean {
        return this.instructionSet !== null
    }

    /**
     * Reset the store state
     */
    reset() {
        this.currentEndpointId = null
        this.instructionSet = null
        this.error = null
        this.isLoading = false
    }
}

export const instructionSetStore = new InstructionSetStore()
