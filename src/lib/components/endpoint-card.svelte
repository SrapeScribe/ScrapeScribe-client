<script lang="ts">
    import {slide} from 'svelte/transition'
    import type {Endpoint, Project} from "$lib/interfaces"
    import {setContext} from "svelte"
    import {endpointStore} from "$lib/states/endpoint.svelte.js"
    import {goto} from "$app/navigation"
    import {CircleAlert, Copy} from 'lucide-svelte'
    import {getMethodStyle, validatePath} from "$lib/utils"
    import Editor from './instruction-editor/Editor.svelte'
    import {authApiClient} from '$lib/api/client'
    import {Button} from "$lib/components/ui/button"

    // Shadcn/svelte
    import * as Card from '$lib/components/ui/card'
    import * as Accordion from '$lib/components/ui/accordion'
    import * as Alert from '$lib/components/ui/alert/index.js'

    import {toast} from "svelte-sonner"
    import {Input} from '$lib/components/ui/input'
    import { Label } from '$lib/components/ui/label';


    import {PUBLIC_API_GATEWAY_URL} from "$env/static/public"

    let props = $props<{
        currentProject: Project,
        endpoint: Endpoint;
        class?: string;
    }>()

    let {currentProject, endpoint, class: className = ''} = props

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

    let deployMessage = $state<string>("")
    let endpointUrl = $derived(PUBLIC_API_GATEWAY_URL + `/${currentProject.slug}/${endpoint.path}`)

    // This derived value ensures the editedPath is updated if the endpoint changes
    $effect(() => {
        editedPath = endpoint.path
    })

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

            console.log(`Endpoint card: Path updated successfully`)
            setTimeout(() => {
                toast.success(`Path updated successfully`, {
                    duration: 3000,
                    description: `for endpoint ${endpoint.id}`,
                })
            }, 200)

            isEditingPath = false
        } catch (error) {
            setTimeout(() => {
                toast.error(`Failed to update path for endpoint. Please try again.`, {
                    duration: 3000,
                })
            }, 200)
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
            setTimeout(() => {
                toast.info(`Toggling status for endpoint ${endpoint.id} `, {
                    duration: 3000,
                    description: `from ${endpoint.is_active ? 'active' : 'inactive'} to ${!endpoint.is_active ? 'active' : 'inactive'}`,
                })
            }, 200)
        } catch (error) {
            setTimeout(() => {
                toast.error(`Failed to toggle status for endpoint. Please try again.`, {
                    duration: 3000,
                })
            }, 200)
            // Store error message in state instead of showing alert
            statusError = error instanceof Error
                ? error.message
                : "Failed to update endpoint status. Please try again."
        } finally {
            isTogglingStatus = false
        }
    }

    async function deleteEndpoint() {
        // TODO: Replace with a fancy dialog
        if (!confirm(`Are you sure you want to delete the endpoint "${endpoint.path}"? This action cannot be undone.`)) {
            return
        }

        isDeleting = true

        try {
            await endpointStore.deleteEndpoint(endpoint.id)
            setTimeout(() => {
                toast.info(`Endpoint: ${endpoint.path}`, {
                    duration: 3000,
                    description: `Was deleted successfully `,
                })
            }, 200)
        } catch (error) {
            setTimeout(() => {
                toast.error(`Failed to delete endpoint. Please try again.`, {
                    duration: 3000,
                })
            }, 200)
        } finally {
            isDeleting = false
        }
    }

    function navigateToEndpointDetail() {
        console.log(`Endpoint card: Navigating to details for endpoint ${endpoint.id} in project ${currentProject.slug}`)
        goto(`/projects/${currentProject.slug}/${endpoint.path}`)
    }


    async function scheduleScrape() {

        const endpointName = endpoint.path
        // could be passed in, isntead of fetched
        if (!currentProject) {
            throw new Error('No active project')
        }

        if (!endpoint) {
            throw new Error('No endpoint found')
        }

        try {
            const instructionSet = await authApiClient.instructionSetApi.getByEndpointId(endpoint.id)
            if (!instructionSet) {
                throw new Error('No instruction set found for this endpoint')
            }

            const res = await authApiClient.schedulingApi.schedule(currentProject.name, endpointName, instructionSet.url, instructionSet.schema, 'rate(2 minutes)')
            console.log(res)
            deployMessage = res.message

            // API is too slow, so no delay
            toast.success(`Endpoint was successfully deployed`, {
                duration: 3000,
                description: "Copy the endpoint URL",
                action: {
                    label: 'Copy',
                    onClick: () => {
                        navigator.clipboard.writeText(res.url)
                    }
                }
            })
        } catch (e) {
            console.log(e)
        }
    }
</script>

<div class={` ${className}`}>
    {#if pathError}
        <Alert.Root variant="destructive" class="mb-4">
            <CircleAlert class="size-4"/>
            <Alert.Description>{pathError}</Alert.Description>
        </Alert.Root>
    {/if}
    <div class="flex gap-2 rounded-lg">


        {#if isEditingPath}
            <div class="path-editor flex flex-col gap-2 w-full ">
                <div class="flex items-center gap-2 bg-slate-100 rounded-lg p-3 h-14">
                <span class={`method-badge px-2 py-1 rounded text-sm font-mono ${getMethodStyle(endpoint.method)}`}>
                    {endpoint.method}
                </span>
                    <span class="max-w-[300px] text-gray-700 truncate">
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
                </span>

                    {#if isSaving}
                        <span class="text-gray-500 animate-pulse">Saving...</span>
                    {/if}
                </div>


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
                           {endpoint.path}
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
                                                    <CircleAlert class="size-4"/>
                                                    <Alert.Title>Error</Alert.Title>
                                                    <Alert.Description>{statusError}</Alert.Description>
                                                </Alert.Root>
                                            {/if}
                                        </Card.Header>

                                        <Card.Content>
                                            <Editor endpointId={endpoint.id}/>

                                            <div class="flex flex-col gap-4 mt-6">
                                                <h3 class="text-lg font-medium">Deployment</h3>

                                                <div class="flex flex-wrap gap-3 items-end">
                                                    <Button onclick={scheduleScrape} class="flex-shrink-0">
                                                        DEPLOY
                                                    </Button>

                                                    <div class="relative flex-grow max-w-md">
                                                        <Label for="deployment-link" class="text-secondary-foreground">Endpoint link</Label>
                                                        <Input
                                                                type="text"
                                                                name="deployment-link"
                                                                id="deployment-link"
                                                                value={endpointUrl}
                                                                disabled
                                                                class="pr-20"
                                                                placeholder="Deploy to generate URL"
                                                        />
                                                        <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                class="absolute right-1 top-2/3 -translate-y-1/2"
                                                                onclick={() => {
                        if (!endpointUrl) return;
                        navigator.clipboard.writeText(endpointUrl);
                        toast.success("URL copied to clipboard");
                    }}
                                                                disabled={!endpointUrl}
                                                        >
                                                            <Copy class="h-4 w-4"/>
                                                        </Button>
                                                    </div>

                                                    {#if deployMessage}
                                                        <div class="text-sm text-green-600 max-w-xs">
                                                            {deployMessage}
                                                        </div>
                                                    {/if}
                                                </div>
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
</div>
