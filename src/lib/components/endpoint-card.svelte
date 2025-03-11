<script lang="ts">
    import * as Accordion from '$lib/components/ui/accordion'
    import {slide} from 'svelte/transition'
    import {METHOD_STYLES} from '$lib/constants'
    import type {Endpoint} from "$lib/interfaces"
    import {setContext} from "svelte"
    import {projectStore} from "$lib/states/project.svelte"
    import {endpointStore} from "$lib/states/endpoints.svelte"
    import {CircleMinus} from "lucide-svelte"

    let projectData = $derived(projectStore.currentProject)

    let props = $props<{
        endpoint: Endpoint;
        class?: string;
    }>()

    let {endpoint, class: className = ''}: {endpoint: Endpoint, class: string} = props
    setContext('endpoint', endpoint)

    let activeAccordionItems = $state<string[]>([])
    let isEditingPath = $state(false)
    let editedPath = $state(endpoint.path)
    let pathError = $state<string | null>(null)
    let isSaving = $state(false)

    const validatePath = (path: string): string | null => {
        if (!path.trim()) return "Path cannot be empty"
        if (path === endpoint.path) return "Path must be different from current"
        if (!/^\/[a-zA-Z0-9-_/]*$/.test(path)) return "Path must start with / and contain only letters, numbers, hyphens, and underscores"
        return null
    }

    const startEditing = () => {
        isEditingPath = true
        editedPath = endpoint.path
        pathError = null
    }

    const cancelEditing = () => {
        isEditingPath = false
        editedPath = endpoint.path
        pathError = null
    }

    const saveChanges = async () => {
        const validationError = validatePath(editedPath)
        if (validationError) {
            pathError = validationError
            return
        }

        isSaving = true
        try {
            await endpointStore.updateEndpoint({
                endpoint: {
                    id: endpoint.id,
                    path: editedPath.trim()
                }
            })
            isEditingPath = false
            pathError = null
        } catch (error) {
            pathError = error instanceof Error
                ? error.message
                : 'Failed to update path. Please try again.'
        } finally {
            isSaving = false
        }
    }

    async function toggleEndpointStatus() {
        try {
            await endpointStore.updateEndpoint({
                endpoint: {
                    id: endpoint.id,
                    is_active: !endpoint.is_active
                }
            })
        } catch (error) {
            console.error("Failed to toggle status:", error)
        }
    }

    async function deleteEndpoint() {
        if (confirm('Are you sure you want to delete this endpoint?')) {
            await endpointStore.deleteEndpoint(endpoint.id)
        }
    }

    const editButtonLabel = isEditingPath
        ? "Save changes"
        : "Edit endpoint path"
    const cancelButtonLabel = "Cancel editing"
</script>

<div class={`endpoint-container flex gap-2 rounded-lg ${className}`}>
    {#if isEditingPath}
        <div class="path-editor flex flex-col gap-2 w-full ">
            <div class="flex items-center gap-2 bg-slate-100 rounded-lg p-3 h-14">
                <span class={`method-badge px-2 py-1 rounded text-sm font-mono ${METHOD_STYLES[endpoint.method]}`}>
                    {endpoint.method}
                </span>

                <input
                        type="text"
                        class="py-1 pl-2 rounded-sm bg-white outline-none"
                        bind:value={editedPath}
                        size={editedPath.length > 0 ? editedPath.length : 10}
                        aria-label="Endpoint path"
                        aria-invalid={!!pathError}
                        onkeydown={(e) => e.key === 'Enter' && saveChanges()}
                        disabled={isSaving}
                />

                {#if isSaving}
                    <span class="text-gray-500 animate-pulse">Saving...</span>
                {/if}
            </div>

            {#if pathError}
                <p class="error-message text-red-500 text-sm pl-2 transition-opacity">
                    ⚠️ {pathError}
                </p>
            {/if}
        </div>
    {:else}
        <Accordion.Root
                type="multiple"
                bind:value={activeAccordionItems}
                class="flex-grow"
                aria-label="Endpoint details"
        >
            <Accordion.Item
                    class="border-0"
                    value={`endpoint-${endpoint.id}`}
            >
                <Accordion.Trigger
                        class="w-full rounded-lg bg-slate-100 hover:bg-slate-200 p-3 h-14 transition-colors hover:no-underline"
                >
                    <div class="flex items-center gap-2">
                        <span class={`px-2 py-1 rounded text-sm font-mono ${METHOD_STYLES[endpoint.method]}`}>
                            {endpoint.method}
                        </span>
                        <span class="max-w-[200px] text-md text-gray-700 truncate">
                            {endpoint.path}
                        </span>
                        <span class={endpoint.is_active ? 'text-green-600 ml-auto' : 'text-gray-400 ml-auto'}>
                            {endpoint.is_active ? '✓' : '○'}
                        </span>
                    </div>
                </Accordion.Trigger>

                <Accordion.Content class="pt-4" forceMount={true}>
                    {#snippet child({props: contentProps, open, close})}
                        {#if open}
                            <div {...contentProps} transition:slide={{ duration: 200 }}>
                                <div class="flex justify-between items-center mb-4">
                                    <h4 class="text-lg font-medium">{endpoint.description || 'No description'}</h4>
                                    <div class="flex gap-2">
                                        <button
                                                onclick={toggleEndpointStatus}
                                                class="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                                        >
                                            {endpoint.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                                onclick={deleteEndpoint}
                                                class="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <!--                                <Editor/>-->
                            </div>
                        {/if}
                    {/snippet}
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    {/if}

    <div class="action-buttons flex gap-2">

        {#if isEditingPath}
            <button
                    onclick={saveChanges}
                    class="save-button p-4 rounded-lg bg-green-100 hover:bg-green-200 w-14 h-14"
                    aria-label={editButtonLabel}
                    disabled={isSaving}
            >
                {isSaving ? '⏳' : '✅'}
            </button>
            <button
                    onclick={cancelEditing}
                    class="cancel-button p-4 rounded-lg bg-red-100 hover:bg-red-200 w-14 h-14"
                    aria-label={cancelButtonLabel}
            >
                ❌
            </button>
        {:else}
            <button
                    onclick={startEditing}
                    class="edit-button p-4 rounded-lg bg-slate-100 hover:bg-slate-200 w-14 h-14"
                    aria-label={editButtonLabel}
            >
                ✏️
            </button>
        {/if}
    </div>
</div>

<style>
    .error-message {
        opacity: 1;
        transition: opacity 0.3s ease;
    }
</style>
