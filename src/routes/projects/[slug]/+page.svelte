<script lang="ts">
    import {onDestroy, onMount} from 'svelte'
    import {projectStore} from "$lib/states/project.svelte"
    import {endpointStore} from "$lib/states/endpoint.svelte.js"
    import Endpoints from "$lib/components/endpoints.svelte"
    import type {PageProps} from "./$types"

    const {data}: PageProps = $props()

    let projectData = $derived(projectStore.currentProject)
    let isLoading = $derived(projectStore.isLoading)

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
            console.log("Project loaded, setting active project:", projectData.id)
            endpointStore.setActiveProject(projectData.id)
        }
    })

    onMount(async () => {
        console.log("Component mounted, loading project:", data.params.slug)
        // Always reload the project when the page mounts
        await projectStore.loadProject(data.params.slug)
    })

    onDestroy(() => {
        console.log("Component destroyed, clearing active project")
        endpointStore.reset()
    })

    async function handleUpdateName(e: Event) {
        e.preventDefault()

        if (!projectData) return

        const projectId = projectData.id
        const name = newName.trim()

        if (!name || name === projectData.name) {
            isEditingName = false
            updateError = "Project name cannot be empty or unchanged"
            return
        }

        try {
            await projectStore.updateProject({
                project: {
                    id: projectId,
                    name: name
                }
            })
            isEditingName = false
            updateError = null
        } catch (err) {
            updateError = err instanceof Error
                ? err.message
                : 'Failed to update project name'
        }
    }

    function cancelEdit() {
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
        {#if isLoading}
            <div class="py-4">Loading project details...</div>
        {:else if projectStore.error}
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
                <p>{projectStore.error}</p>
            </div>
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
                            placeholder="Project context path..."
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
