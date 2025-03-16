<script lang="ts">
    import { slide } from 'svelte/transition'
    import type { Endpoint, Project } from "$lib/interfaces"
    import { setContext } from "svelte"
    import { endpointStore } from "$lib/states/endpoint.svelte.js"
    import { goto } from "$app/navigation"
    import { CircleAlert } from 'lucide-svelte'

    // Shadcn/svelte
    import * as Card from '$lib/components/ui/card'
    import * as Accordion from '$lib/components/ui/accordion'
    import * as Alert from '$lib/components/ui/alert/index.js'

    import {getMethodStyle} from "$lib/utils"

    let props = $props<{
        currentProject: Project,
        endpoint: Endpoint;
        class?: string;
    }>()

    let { currentProject, endpoint, class: className = '' } = props

    // Make endpoint available to children via context
    setContext('endpoint', endpoint)

    // Component state
    let activeAccordionItems = $state<string[]>([])
    let isEditingPath = $state(false)
    let editedPath = $state(endpoint.path)
    let pathError = $state<string | null>(null)
    let isSaving = $state(false)
    let isDeleting = $state(false)
    let isTogglingStatus = $state(false)
    let statusError = $state<string | null>(null)

    // This derived value ensures the editedPath is updated if the endpoint changes
    $effect(() => {
        editedPath = endpoint.path
    })

    const validatePath = (path: string): string | null => {
        if (!path.trim()) return "Path cannot be empty"
        if (path === endpoint.path) return null // Same path is fine, no error
        if (!/^[a-zA-Z0-9-_/]*$/.test(path)) return "Path must contain only letters, numbers, hyphens, slashes, and underscores"
        return null
    }

    const startEditing = () => {
        console.log(`Endpoint card: Starting to edit path for endpoint ${endpoint.id}`)
        isEditingPath = true
        editedPath = endpoint.path
        pathError = null
    }

    const cancelEditing = () => {
        console.log(`Endpoint card: Cancelling path edit for endpoint ${endpoint.id}`)
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

        // If path didn't change, just cancel edit mode
        if (editedPath === endpoint.path) {
            isEditingPath = false
            return
        }

        console.log(`Endpoint card: Saving path change from "${endpoint.path}" to "${editedPath}" for endpoint ${endpoint.id}`)
        isSaving = true
        pathError = null

        try {
            await endpointStore.updateEndpoint({
                endpoint: {
                    id: endpoint.id,
                    path: editedPath.trim()
                }
            })

            console.log(`Endpoint card: Path updated successfully for endpoint ${endpoint.id}`)
            isEditingPath = false
        } catch (error) {
            console.error(`Endpoint card: Failed to update path for endpoint ${endpoint.id}`, error)
            pathError = error instanceof Error
                ? error.message
                : 'Failed to update path. Please try again.'
        } finally {
            isSaving = false
        }
    }

    async function toggleEndpointStatus() {
        console.log(`Endpoint card: Toggling status for endpoint ${endpoint.id} from ${endpoint.is_active ? 'active' : 'inactive'} to ${!endpoint.is_active ? 'active' : 'inactive'}`)
        isTogglingStatus = true
        statusError = null

        try {
            await endpointStore.toggleEndpointStatus(
                endpoint.id,
                !endpoint.is_active
            )
            console.log(`Endpoint card: Status toggled successfully for endpoint ${endpoint.id}`)
        } catch (error) {
            console.error(`Endpoint card: Failed to toggle status for endpoint ${endpoint.id}`, error)

            // Store error message in state instead of showing alert
            statusError = error instanceof Error
                ? error.message
                : "Failed to update endpoint status. Please try again.";
        } finally {
            isTogglingStatus = false
        }
    }

    async function deleteEndpoint() {
        if (!confirm(`Are you sure you want to delete the endpoint "${endpoint.path}"? This action cannot be undone.`)) {
            return
        }

        console.log(`Endpoint card: Deleting endpoint ${endpoint.id}`)
        isDeleting = true

        try {
            await endpointStore.deleteEndpoint(endpoint.id)
            console.log(`Endpoint card: Endpoint ${endpoint.id} deleted successfully`)
        } catch (error) {
            console.error(`Endpoint card: Failed to delete endpoint ${endpoint.id}`, error)
            alert("Failed to delete endpoint. Please try again.")
        } finally {
            isDeleting = false
        }
    }

    function navigateToEndpointDetail() {
        console.log(`Endpoint card: Navigating to details for endpoint ${endpoint.id} in project ${currentProject.slug}`)
        goto(`/projects/${currentProject.slug}/${endpoint.path}`)
    }
</script>

<div class={`endpoint-container flex gap-2 rounded-lg ${className}`}>
    {#if isEditingPath}
        <div class="path-editor flex flex-col gap-2 w-full ">
            <div class="flex items-center gap-2 bg-slate-100 rounded-lg p-3 h-14">
                <span class={`method-badge px-2 py-1 rounded text-sm font-mono ${getMethodStyle(endpoint.method)}`}>
                    {endpoint.method}
                </span>
                <span class="max-w-[300px] text-gray-700 truncate">
                            <!--Mock Path-->
                    {currentProject.slug}.scrapescribe.oi/
                        </span>
                <!--Mock Path-->
                <input
                        type="text"
                        class="py-1 pl-2 rounded-sm bg-white outline-none flex-grow"
                        bind:value={editedPath}
                        placeholder="Enter endpoint path"
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
                <Alert.Root variant="destructive">
                    <CircleAlert class="size-4" />
                    <Alert.Description>{pathError}</Alert.Description>
                </Alert.Root>
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
                        <span class={`px-2 py-1 rounded text-sm font-mono ${getMethodStyle(endpoint.method)}`}>
                            {endpoint.method}
                        </span>
                        <span class="max-w-[300px] text-md text-gray-700 truncate">
                            <!--Mock Path-->
                            {currentProject.slug}.scrapescribe.oi/{endpoint.path}
                        </span>
                        <span class={endpoint.is_active ? 'text-green-600 ml-auto' : 'text-gray-400 ml-auto'}>
                            {isTogglingStatus ? '⏳' : endpoint.is_active ? '✓' : '○'}
                        </span>
                    </div>
                </Accordion.Trigger>

                <Accordion.Content class="pt-4" forceMount={true}>
                    {#snippet child({props: contentProps, open, close})}
                        {#if open}
                            <div {...contentProps} transition:slide={{ duration: 200 }}>

                                <!--Card for all content inside the accordion-->
                                <Card.Root class="w-full">

                                    <Card.Header>
                                <div class="flex justify-between items-center mb-4">
                                    <h4 class="text-lg font-medium">{endpoint.description || 'No description'}</h4>
                                    <div class="flex gap-2">
                                        <button
                                                onclick={toggleEndpointStatus}
                                                disabled={isTogglingStatus || isDeleting}
                                                class="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                        >
                                            {isTogglingStatus ? 'Updating...' : endpoint.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                                onclick={deleteEndpoint}
                                                disabled={isDeleting || isTogglingStatus}
                                                class="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50"
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>

                                {#if statusError}
                                    <Alert.Root variant="destructive" class="mb-4">
                                        <CircleAlert class="size-4" />
                                        <Alert.Title>Error</Alert.Title>
                                        <Alert.Description>{statusError}</Alert.Description>
                                    </Alert.Root>
                                {/if}
                                    </Card.Header>

                                    <Card.Content>
                                        <!-- Placeholder for instruction editor -->
                                        <p class="text-gray-500">This is where the endpoint configuration editor would go.</p>
                                        <div class="bg-white p-6 border rounded-lg mt-4">
                                            <p class="text-center text-gray-400">Endpoint configuration editor would be implemented here</p>
                                        </div>

                                    </Card.Content>
                                </Card.Root>

                            </div>
                        {/if}
                    {/snippet}
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    {/if}

    <div class="action-buttons flex gap-2">
        <button
                class="p-4 rounded-lg bg-slate-100 hover:bg-slate-200 w-14 h-14"
                onclick={navigateToEndpointDetail}
                aria-label="View endpoint details"
        >
            📂
        </button>
        {#if isEditingPath}
            <button
                    onclick={saveChanges}
                    class="p-4 rounded-lg bg-green-100 hover:bg-green-200 w-14 h-14 disabled:opacity-50"
                    aria-label="Save path changes"
                    disabled={isSaving}
            >
                {isSaving ? '⏳' : '✅'}
            </button>
            <button
                    onclick={cancelEditing}
                    class="p-4 rounded-lg bg-red-100 hover:bg-red-200 w-14 h-14"
                    aria-label="Cancel editing"
            >
                ❌
            </button>
        {:else}
            <button
                    onclick={startEditing}
                    class="p-4 rounded-lg bg-slate-100 hover:bg-slate-200 w-14 h-14"
                    aria-label="Edit endpoint path"
            >
                ✏️
            </button>
        {/if}
    </div>
</div>
