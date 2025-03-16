<script lang="ts">
    import { onDestroy, onMount } from 'svelte'
    import { projectStore } from "$lib/states/project.svelte"
    import { endpointStore } from "$lib/states/endpoint.svelte.js"
    import Endpoints from "$lib/components/endpoints.svelte"
    import * as Alert from '$lib/components/ui/alert/index.js'
    import { CircleAlert } from 'lucide-svelte'
    import type { PageProps } from "./$types"

    const { data }: PageProps = $props()

    const projectSlug = $derived(data.params.slug)

    // Derived state from store
    let projectData = $derived(projectStore.currentProject)
    let isProjectLoading = $derived(projectStore.isLoading)
    let projectError = $derived(projectStore.error)

    // Form state
    let isEditingName = $state(false)
    let newName = $state('')
    let updateError: string | null = $state(null)

    $effect(() => {
        if (projectData) {
            newName = projectData.name
        }
    })

    // Wait until project is fully loaded before setting the active project
    $effect(() => {
        if (projectData?.id && !projectStore.isLoading) {
            console.log(`Project detail: Setting active project: ${projectData.id}`)
            endpointStore.setActiveProject(projectData.id)
        }
    })

    onMount(async () => {
        console.log(`Project detail: Component mounted, loading project: ${projectSlug}`)
        await loadProject()
    })

    onDestroy(() => {
        console.log("Project detail: Component destroyed, clearing endpoint state")
        endpointStore.reset()
    })

    async function loadProject() {
        try {
            await projectStore.loadProject(projectSlug)
            console.log("Project detail: Project loaded successfully", projectData)
        } catch (error) {
            console.error("Project detail: Failed to load project", error)
        }
    }

    async function handleUpdateName(e: Event) {
        e.preventDefault()

        if (!projectData) {
            console.error("Project detail: Cannot update name - no project data")
            return
        }

        const projectId = projectData.id
        const name = newName.trim()

        if (!name) {
            updateError = "Project name cannot be empty"
            return
        }

        if (name === projectData.name) {
            isEditingName = false
            updateError = null
            return
        }

        console.log(`Project detail: Updating project name from "${projectData.name}" to "${name}"`)

        try {
            await projectStore.updateProject({
                project: {
                    id: projectId,
                    name: name
                }
            })

            console.log("Project detail: Project name updated successfully")
            isEditingName = false
            updateError = null
        } catch (err) {
            console.error("Project detail: Failed to update project name", err)
            updateError = err instanceof Error
                ? err.message
                : 'Failed to update project name'
        }
    }

    function cancelEdit() {
        console.log("Project detail: Edit name cancelled")
        if (projectData) {
            newName = projectData.name
        }
        isEditingName = false
        updateError = null
    }
</script>

<svelte:head>
    <title>
        {projectData ? projectData.name : 'Project'} | Dashboard
    </title>
</svelte:head>

<div class="max-w-5xl px-4 mx-auto divide-y">
    <div class="mb-6">
        <div class="flex items-center gap-4 mb-2">
            <a href={`/projects/`} class="text-blue-500 hover:underline">
                &larr; Back to Project List
            </a>
        </div>
        {#if isProjectLoading}
            <div class="py-4">Loading project details...</div>
        {:else if projectError}
            <Alert.Root variant="destructive" class="mb-4">
                <CircleAlert class="size-4" />
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{projectError}</Alert.Description>
            </Alert.Root>
        {:else if projectData}
            {#if isEditingName}
                <form
                        onsubmit={handleUpdateName}
                        class="flex items-center gap-2 flex-grow mr-4"
                >
                    <input
                            type="text"
                            bind:value={newName}
                            class="border p-2 flex-grow"
                            placeholder="Project name..."
                    />
                    <div class="flex gap-2">
                        <button
                                type="submit"
                                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Save
                        </button>
                        <button
                                type="button"
                                class="border px-4 py-2 rounded hover:bg-gray-100"
                                onclick={cancelEdit}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            {:else}
                <div class="flex items-center gap-4">
                    <h2 class="text-3xl">{projectData.name}</h2>
                    <button
                            onclick={() => {
                            isEditingName = true;
                            updateError = null;
                        }}
                            class="text-gray-500 hover:text-gray-700"
                    >
                        ✏️
                    </button>
                </div>
            {/if}

            <div class="mt-2 text-sm">
                <span class="font-medium">Status:</span>
                <span class={String(projectData.status).toLowerCase() === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                    {projectData.status}
                </span>
            </div>

            <div class="mt-1 text-xs text-gray-500">
                ID: {projectData.id}
            </div>
        {/if}

        <!-- Error Message -->
        {#if updateError}
            <p class="text-red-500 mt-2">{updateError}</p>
        {/if}
    </div>

    <Endpoints/>
</div>
