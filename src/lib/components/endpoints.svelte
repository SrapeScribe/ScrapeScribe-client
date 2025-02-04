<script lang="ts">
    import {type Endpoint, type Instructions, SchemeType} from '../../interfaces'
    import {cn} from '$lib/utils.js'
    import EndpointCard from './endpoint-card.svelte'
    import {projectStore} from "$lib/stores"
    import {HTTPMethod} from "../../constants"
    import ApiClient from "$lib/api/client"

    let props = $props<{
        class?: string;
    }>()

    let {class: className, ...restProps} = props


    let endpoints: Endpoint[] = $state([])
    let newEndpointName = $state('')
    let isCreating = $state(false)
    let createError = $state<string | null>(null)

    projectStore.subscribe((project) => {
        endpoints = project.endpoints
    })

    async function handleCreateEndpoint(e: Event) {
        e.preventDefault()

        if (!newEndpointName.trim() || isCreating) return

        isCreating = true
        createError = null

        try {
            const newEndpoint: Endpoint = {
                id: String(Date.now()),
                name: newEndpointName.trim(),
                project_id: '', //substitute with current project id
                url: '',
                method: HTTPMethod.GET,
                instructions: {
                    url: '',
                    scheme: {
                        type: SchemeType.String,
                        path: '',
                        mode: 'INNER_HTML'
                    }
                } as Instructions,
                refresh_period: 'daily'
            }

            await ApiClient.createEndpoint(newEndpoint)

            projectStore.update(project => ({
                ...project,
                endpoints: [...project.endpoints, newEndpoint]
            }))

            newEndpointName = ''
        } catch (err) {
            createError = err instanceof Error
                ? err.message
                : 'Failed to create endpoint'
        } finally {
            isCreating = false
        }
    }
</script>

<div class={cn('mx-auto space-y-4 p-4', className)} {...restProps}>
    {#each endpoints as _, i}
        <EndpointCard bind:endpoint={endpoints[i]}/>
    {/each}

    <div class="pt-8">
        <form
                onsubmit={handleCreateEndpoint}
                class="flex gap-2 items-center"
        >
            <input
                    type="text"
                    bind:value={newEndpointName}
                    placeholder="Name your endpoint..."
                    class="border rounded p-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isCreating}
            />
            <button
                    type="submit"
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                    disabled={isCreating || !newEndpointName.trim()}
            >
                {isCreating ? 'Creating...' : 'Create Endpoint'}
            </button>
        </form>

        {#if createError}
            <p class="text-red-500 mt-2">{createError}</p>
        {/if}
    </div>
</div>
