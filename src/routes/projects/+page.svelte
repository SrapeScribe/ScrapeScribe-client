<script lang="ts">
    import {onMount} from 'svelte'
    import {goto} from '$app/navigation'
    import {projectStore} from "$lib/states/project.svelte"
    import {endpointStore} from "$lib/states/endpoints.svelte"
    import {auth, handleSignIn, handleSignOut} from "$lib/states/auth.svelte"

    let newProjectName = $state('')
    let isCreating = $state(false)

    // Derived values from stores
    let projectsData = $derived(projectStore.projects)
    let isLoading = $derived(projectStore.isLoading)

    onMount(async () => {
        await projectStore.loadProjects()
    })

    async function createProject() {
        if (!newProjectName.trim()) return

        isCreating = true
        try {
            await projectStore.addProject(newProjectName.trim())
            newProjectName = ''
        } catch (err) {
            console.error('Failed to create project:', err)
        } finally {
            isCreating = false
        }
    }

    async function deleteProject(projectId: string) {
        if (!confirm('Are you sure you want to delete this project?')) return

        try {
            await projectStore.removeProject(projectId)
        } catch (err) {
            console.error('Failed to delete project:', err)
        }
    }

    function openProject(slug: string) {
        // Clear endpoints before navigation
        endpointStore.endpoints = []
        goto(`/projects/${slug}`)
    }
</script>

<svelte:head>
    <title>Projects</title>
</svelte:head>

<div class="container mx-auto p-4">

    <h1 class="text-2xl font-bold mb-6">Your Projects</h1>

    {#if projectStore.error}
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{projectStore.error}</p>
        </div>
    {/if}

    <!-- Create new project form -->
    <div class="bg-white p-4 rounded shadow-md mb-6">
        <h2 class="text-xl font-semibold mb-3">Create new project</h2>
        <form onsubmit={createProject} class="flex flex-col sm:flex-row gap-3">
            <input
                    type="text"
                    bind:value={newProjectName}
                    placeholder="Project name"
                    class="flex-grow border rounded px-3 py-2"
                    disabled={isCreating || isLoading}
            />
            <button
                    type="submit"
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                    disabled={isCreating || isLoading || !newProjectName.trim()}
            >
                {isCreating ? 'Creating...' : 'Create Project'}
            </button>
        </form>
    </div>

    {#if isLoading}
        <div class="text-center py-8">Loading projects...</div>
    {:else if projectsData.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each projectsData as project (project.id)}
                <div class="bg-white p-4 rounded shadow-md hover:shadow-lg transition">
                    <div class=" mb-3">
                        <div class="flex justify-between items-start">
                            <h3 class="text-lg font-semibold">{project.name}</h3>
                            <button
                                    onclick={() => deleteProject(project.id)}
                                    class="text-red-500 hover:text-red-700"
                                    aria-label="Delete project"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                </svg>
                            </button>
                        </div>
                        <span class="text-gray-400 text-sm">Slug: {project.slug}</span>
                    </div>


                    <div class="mb-4">
                        <p class="text-sm text-gray-600">
                            <span class="font-medium">Endpoints:</span> { project.endpoint_count }
                        </p>
                        <p class="text-sm text-gray-600">
                            <span class="font-medium">Status:</span>
                            <span class={project.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                                {project.status}
                            </span>
                        </p>
                    </div>

                    <button
                            onclick={() => openProject(project.slug)}
                            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition"
                    >
                        Open Project
                    </button>
                </div>
            {/each}
        </div>
    {:else}
        <div class="bg-gray-100 p-8 text-center rounded-lg">
            <p class="text-lg text-gray-600">You don't have any projects yet.</p>
            <p class="text-sm text-gray-500 mt-2">Create your first project using the form above.</p>
        </div>
    {/if}
</div>
