<script lang="ts">
    import { cn } from '$lib/utils.js'
    import EndpointCard from './endpoint-card.svelte'
    import { endpointStore } from "$lib/states/endpoint.svelte.js"
    import { projectStore } from "$lib/states/project.svelte"
    import * as Alert from '$lib/components/ui/alert/index.js'
    import { CircleAlert } from 'lucide-svelte'

    let props = $props<{
        class?: string;
    }>()

    let { class: className, ...restProps } = props

    // State from the endpoint store
    let endpointsData = $derived(endpointStore.endpoints)
    let isLoading = $derived(endpointStore.isLoading)
    let error = $derived(endpointStore.error)
    let projectData = $derived(projectStore.currentProject)

    // Form state
    let showEndpointForm = $state(false)
    let newEndpoint = $state({
        method: 'GET',
        path: '',
        description: ''
    })
    let formError: string | null = $state(null)
    let isCreating = $state(false)

    async function createEndpoint(e: Event) {
        e.preventDefault()

        if (!projectData) {
            console.error("Endpoints: Cannot create endpoint - no active project")
            formError = "No active project"
            return
        }

        const { method, path, description } = newEndpoint

        if (!path.trim()) {
            formError = "Endpoint path is required"
            return
        }

        console.log(`Endpoints: Creating new endpoint ${method} ${path} for project ${projectData.id}`)
        formError = null
        isCreating = true

        try {
            await endpointStore.addEndpoint(
                projectData.id,
                method,
                path.trim(),
                description.trim() || undefined
            )

            console.log("Endpoints: Endpoint created successfully")

            // Reset form
            newEndpoint = {
                method: 'GET',
                path: '',
                description: ''
            }
            showEndpointForm = false
        } catch (err) {
            console.error("Endpoints: Failed to create endpoint", err)
            formError = err instanceof Error
                ? err.message
                : 'Failed to create endpoint'
        } finally {
            isCreating = false
        }
    }

    function toggleEndpointForm() {
        console.log(`Endpoints: ${showEndpointForm ? 'Hiding' : 'Showing'} endpoint form`)
        showEndpointForm = !showEndpointForm

        if (!showEndpointForm) {
            // Reset form when hiding
            newEndpoint = {
                method: 'GET',
                path: '',
                description: ''
            }
            formError = null
        }
    }
</script>

<div class={cn('mx-auto space-y-4 p-4', className)} {...restProps}>
    {#if isLoading}
        <div class="py-4">Loading endpoints...</div>
    {:else if error}
        <Alert.Root variant="destructive" class="mb-4">
            <CircleAlert class="size-4" />
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
    {:else}
        <div class="pt-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">Endpoints</h3>
                <button
                        onclick={toggleEndpointForm}
                        disabled={isLoading || !projectData}
                        class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {showEndpointForm ? '➖ Cancel' : '➕ Add Endpoint'}
                </button>
            </div>

            <!-- New Endpoint Form -->
            {#if showEndpointForm}
                <form onsubmit={createEndpoint} class="bg-gray-50 p-4 rounded-lg mb-6 border">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="method" class="block text-sm font-medium text-gray-700 mb-1">
                                Method
                            </label>
                            <select
                                    name="method"
                                    bind:value={newEndpoint.method}
                                    class="w-full p-2 border rounded bg-white"
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                                <option value="PATCH">PATCH</option>
                            </select>
                        </div>
                        <div>
                            <label for="path" class="block text-sm font-medium text-gray-700 mb-1">
                                Path
                            </label>
                            <input
                                    name="path"
                                    type="text"
                                    bind:value={newEndpoint.path}
                                    class="w-full p-2 border rounded"
                                    placeholder="/api/resource"
                            />
                        </div>
                        <div class="md:col-span-2">
                            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                                Description (optional)
                            </label>
                            <textarea
                                    name="description"
                                    bind:value={newEndpoint.description}
                                    class="w-full p-2 border rounded"
                                    placeholder="Description of what this endpoint does"
                                    rows="2"
                            ></textarea>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button
                                type="submit"
                                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                                disabled={isCreating}
                        >
                            {isCreating ? 'Creating...' : 'Create Endpoint'}
                        </button>
                    </div>
                </form>
            {/if}

            {#if formError}
                <Alert.Root variant="destructive" class="mb-4">
                    <CircleAlert class="size-4" />
                    <Alert.Title>Error</Alert.Title>
                    <Alert.Description>{formError}</Alert.Description>
                </Alert.Root>
            {/if}
        </div>

        <!-- Endpoints list -->
        {#if projectData && endpointsData.length > 0}
            {#each endpointsData as endpoint (endpoint.id)}
                <EndpointCard
                        endpoint={endpoint}
                        currentProject={projectData}
                />
            {/each}
        {:else if projectData}
            <div class="bg-gray-100 p-6 text-center rounded-lg">
                <p class="text-gray-600">This project doesn't have any endpoints yet.</p>
                <p class="text-sm text-gray-500 mt-2">Add an endpoint above to get started.</p>
            </div>
        {/if}
    {/if}
</div>
