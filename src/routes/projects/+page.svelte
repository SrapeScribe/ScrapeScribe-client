<script lang="ts">
    import {onMount} from 'svelte'
    import {goto} from '$app/navigation'
    import {projectStore} from "$lib/states/project.svelte"
    import {endpointStore} from "$lib/states/endpoint.svelte.js"
    import * as Alert from '$lib/components/ui/alert/index.js'
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js"
    import {Button, buttonVariants} from "$lib/components/ui/button/index.js"
    import {CircleAlert, Trash2} from 'lucide-svelte'
    import {toast} from "svelte-sonner"
    import ProjectSorter from "$lib/components/project-sorter.svelte"

    let newProjectName = $state('')
    let isCreating = $state(false)
    let createError = $state<string | null>(null)
    let sortField = $state<string>("updated_at") // Default sort by updated_at
    let sortDirection = $state<"asc" | "desc">("desc") // Default direction descending

    // delete confirmation dialog
    let projectToDelete = $state<{id: string, name: string} | null>(null)
    let isDeleting = $state(false)
    let dialogOpen = $state(false)

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

    function openDeleteDialog(projectId: string, projectName: string) {
        projectToDelete = { id: projectId, name: projectName };
        dialogOpen = true;
    }

    function closeDeleteDialog() {
        projectToDelete = null;
        dialogOpen = false;
    }

    async function confirmDeleteProject() {
        if (!projectToDelete) return;

        isDeleting = true;
        const { id, name } = projectToDelete;

        try {
            await projectStore.removeProject(id);

            setTimeout(() => {
                toast.info(`Project: ${name}`, {
                    duration: 3000,
                    description: `Was deleted successfully`,
                })
            }, 200);

            closeDeleteDialog();
        } catch (err) {
            setTimeout(() => {
                toast.error(`Failed to delete project. Please try again.`, {
                    duration: 3000,
                })
            }, 200);
        } finally {
            isDeleting = false;
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
                                            onclick={() => openDeleteDialog(project.id, project.name)}
                                            class="text-red-500 hover:text-red-700"
                                            aria-label="Delete project"
                                    >
                                        <Trash2 size={16} />
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

    <!-- Delete confirmation dialog -->
    <AlertDialog.Root bind:open={dialogOpen}>
        <AlertDialog.Content>
            <AlertDialog.Header>
                <AlertDialog.Title>Delete Project</AlertDialog.Title>
                <AlertDialog.Description>
                    {#if projectToDelete}
                        Are you sure you want to delete <strong class="font-semibold">{projectToDelete.name}</strong>? This action cannot be undone and will permanently delete the project and all associated endpoints.
                    {:else}
                        Are you sure you want to delete this project? This action cannot be undone.
                    {/if}
                </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
                <AlertDialog.Cancel onclick={closeDeleteDialog} disabled={isDeleting}>
                    Cancel
                </AlertDialog.Cancel>
                <AlertDialog.Action
                        onclick={confirmDeleteProject}
                        disabled={isDeleting}
                        class={buttonVariants({ variant: "destructive" })}
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialog.Action>
            </AlertDialog.Footer>
        </AlertDialog.Content>
    </AlertDialog.Root>
</div>
