<script lang="ts">
    import {cn} from '$lib/utils.js'
    import EndpointCard from './endpoint-card.svelte'
    import {endpointStore} from "$lib/states/endpoints.svelte"
    import {projectStore} from "$lib/states/project.svelte"

    let props = $props<{
        class?: string;
    }>()

    let {class: className, ...restProps} = props

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

    async function createEndpoint(e: Event) {
        e.preventDefault()

        if (!projectData) return

        const {method, path, description} = newEndpoint

        if (!path.trim()) {
            formError = "Endpoint path is required"
            return
        }

        try {
            await endpointStore.addEndpoint(
                projectData.id,
                method,
                path.trim(),
                description.trim() || undefined
            )
            // Reset form
            newEndpoint = {
                method: 'GET',
                path: '',
                description: ''
            }
            showEndpointForm = false
            formError = null
        } catch (err) {
            formError = err instanceof Error
                ? err.message
                : 'Failed to create endpoint'
        }
    }
</script>

<div class={cn('mx-auto space-y-4 p-4', className)} {...restProps}>
    {#if isLoading}
        <div class="py-4">Loading endpoints...</div>
    {:else if error}
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
            <p>{error}</p>
        </div>
    {:else}
        <div class="pt-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">Endpoints</h3>
                    <button
                            onclick={() => showEndpointForm = !showEndpointForm}
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
                                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Create Endpoint
                        </button>
                    </div>
                </form>
            {/if}

            {#if formError}
                <p class="text-red-500 mt-2">{formError}</p>
            {/if}
        </div>

        <!-- Endpoints list -->
        {#if endpointsData.length > 0}
            {#each endpointsData as _, i (endpointsData[i].id)}
                <EndpointCard
                        endpoint={endpointsData[i]}
                />
            {/each}
        {:else}
            <div class="bg-gray-100 p-6 text-center rounded-lg">
                <p class="text-gray-600">This project doesn't have any endpoints yet.</p>
                <p class="text-sm text-gray-500 mt-2">Add an endpoint below to get started.</p>
            </div>
        {/if}
    {/if}
</div>
