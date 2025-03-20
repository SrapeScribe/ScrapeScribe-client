<script lang="ts">
    import {onMount} from 'svelte'
    import {goto} from '$app/navigation'
    import {projectStore} from "$lib/states/project.svelte"
    import {endpointStore} from "$lib/states/endpoint.svelte.js"
    import * as Alert from '$lib/components/ui/alert/index.js'
    import {CircleAlert} from 'lucide-svelte'
    import {toast} from "svelte-sonner"
    import ProjectSorter from "$lib/components/project-sorter.svelte"

    let newProjectName = $state('')
    let isCreating = $state(false)
    let createError = $state<string | null>(null)
    let sortField = $state<string>("updated_at") // Default sort by updated_at
    let sortDirection = $state<"asc" | "desc">("desc") // Default direction descending

    // Derived values from store
    let projectsData = $derived(projectStore.projects)
    let isLoading = $derived(projectStore.isLoading)
    let storeError = $derived(projectStore.error)

    onMount(async () => {
        console.log('Projects page: Component mounted, loading projects')
        await loadProjects()
    })

    async function loadProjects() {
        console.log('Projects page: Fetching all projects')
        try {
            await projectStore.loadProjects()
            console.log(`Projects page: Loaded ${projectsData.length} projects`)
        } catch (error) {
            console.error('Projects page: Failed to load projects', error)
        }
    }

    async function createProject() {
        const name = newProjectName.trim()

        if (!name) {
            createError = 'Project name cannot be empty'
            return
        }

        createError = null
        isCreating = true

        try {
            await projectStore.addProject(name)

            setTimeout(() => {
                toast.success(`Project: ${name}`, {
                    duration: 3000,
                    description: `Was created successfully `,
                })
            }, 200)

            newProjectName = ''
        } catch (err) {
            console.error('Projects page: Failed to create project:', err)
            setTimeout(() => {
                toast.info(`Failed to create project. Please try again.`, {
                    duration: 3000,
                })
            }, 200)
            createError = err instanceof Error ? err.message : 'Failed to create project'
        } finally {
            isCreating = false
        }
    }

    async function deleteProject(projectId: string, projectName: string) {
        // TODO: Replace with a fancy dialog
        if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) return

        try {
            await projectStore.removeProject(projectId)

            setTimeout(() => {
                toast.info(`Project: ${projectName}`, {
                    duration: 3000,
                    description: `Was deleted successfully `,
                })
            }, 200)

        } catch (err) {
            setTimeout(() => {
                toast.error(`Failed to delete project. Please try again.`, {
                    duration: 3000,
                })
            }, 200)
        }
    }

    function navigateToProject(slug: string, projectName: string) {
        console.log(`Projects page: Navigating to project ${slug} (${projectName})`)
        // Clear endpoints before navigation
        endpointStore.reset()
        goto(`/projects/${slug}`)
    }
</script>

<svelte:head>
    <title>Projects</title>
</svelte:head>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Your Projects</h1>

    {#if storeError}
        <Alert.Root variant="destructive" class="mb-4">
            <CircleAlert class="size-4"/>
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{storeError}</Alert.Description>
        </Alert.Root>
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
        {#if createError}
            <p class="text-red-500 mt-2">{createError}</p>
        {/if}
    </div>

    {#if isLoading}
        <div class="text-center py-8">Loading projects...</div>
    {:else if projectsData.length > 0}
        <ProjectSorter
                bind:projects={projectStore.projects}
                bind:sortField
                bind:sortDirection
        >
            {#snippet children({sortedProjects})}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {#each sortedProjects as project (project.id)}
                        <div class="bg-white p-4 rounded shadow-md hover:shadow-lg transition">
                            <div class="mb-3">
                                <div class="flex justify-between items-start">
                                    <h3 class="text-lg font-semibold">{project.name}</h3>
                                    <button
                                            onclick={() => deleteProject(project.id, project.name)}
                                            class="text-red-500 hover:text-red-700"
                                            aria-label="Delete project"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                             viewBox="0 0 24 24"
                                             fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                                <span class="text-gray-400 text-sm">Slug: {project.slug}</span>
                            </div>

                            <div class="mb-4">
                                <p class="text-sm text-gray-600">
                                    <span class="font-medium">Endpoints:</span> {project.endpoint_count}
                                </p>
                                <p class="text-sm text-gray-600">
                                    <span class="font-medium">Status:</span>
                                    <span class={project.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                                        {project.status}
                                    </span>
                                </p>
                                <p class="text-sm text-gray-600">
                                    <span class="font-medium">Created:</span> {new Date(project.created_at).toLocaleString()}
                                </p>
                                <p class="text-sm text-gray-600">
                                    <span class="font-medium">Updated:</span> {new Date(project.updated_at).toLocaleString()}
                                </p>
                            </div>

                            <button
                                    onclick={() => navigateToProject(project.slug, project.name)}
                                    class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded transition"
                            >
                                Open Project
                            </button>
                        </div>
                    {/each}
                </div>
            {/snippet}
        </ProjectSorter>
    {:else}
        <div class="bg-gray-100 p-8 text-center rounded-lg">
            <p class="text-lg text-gray-600">You don't have any projects yet.</p>
            <p class="text-sm text-gray-500 mt-2">Create your first project using the form above.</p>
        </div>
    {/if}
</div>
