<script lang="ts">
    import { onMount } from 'svelte';
    import { endpointStore } from "$lib/states/endpoint.svelte.js";
    import { projectStore } from "$lib/states/project.svelte";
    import { goto } from "$app/navigation";
    import * as Alert from '$lib/components/ui/alert/index.js';
    import { CircleAlert } from 'lucide-svelte';
    import { getMethodStyle } from '$lib/utils';
    import type { Endpoint, Project } from '$lib/interfaces';

    // Loading states
    let isLoading = $state(true);
    let error = $state<string | null>(null);

    // Data structure for endpoints grouped by project
    type ProjectEndpointMap = Map<string, {
        project: Project;
        endpoints: Endpoint[];
    }>;

    let projectEndpoints = $state<ProjectEndpointMap>(new Map());

    onMount(async () => {
        console.log("Endpoints page: Component mounted");
        await loadEndpointsData();
    });

    async function loadEndpointsData() {
        isLoading = true;
        error = null;

        try {
            // 1. Load all projects first
            console.log("Endpoints page: Loading projects");
            await projectStore.loadProjects();
            const projects = projectStore.projects;

            if (!projects.length) {
                console.log("Endpoints page: No projects found");
                isLoading = false;
                return;
            }

            // 2. Initialize the project-endpoint map
            const tempProjectEndpoints = new Map<string, {
                project: Project;
                endpoints: Endpoint[];
            }>();

            // 3. Load endpoints for each project
            console.log(`Endpoints page: Loading endpoints for ${projects.length} projects`);
            for (const project of projects) {
                await endpointStore.setActiveProject(project.id);
                tempProjectEndpoints.set(project.id, {
                    project,
                    endpoints: [...endpointStore.endpoints] // Make a copy
                });
            }

            // 4. Update state with all data
            projectEndpoints = tempProjectEndpoints;

        } catch (err) {
            console.error("Endpoints page: Error loading data", err);
            error = err instanceof Error ? err.message : "Failed to load endpoints";
        } finally {
            isLoading = false;
        }
    }

    function navigateToEndpoint(projectSlug: string, endpointPath: string) {
        console.log(`Endpoints page: Navigating to endpoint ${projectSlug}/${endpointPath}`);
        goto(`/projects/${projectSlug}/${endpointPath}`);
    }
</script>

<svelte:head>
    <title>Endpoints | ScrapeScribe</title>
</svelte:head>

<div class="container max-w-5xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">All Endpoints</h1>

    {#if isLoading}
        <div class="py-8 text-center bg-gray-50 rounded-lg">
            <p class="text-gray-600">Loading endpoints...</p>
        </div>
    {:else if error}
        <Alert.Root variant="destructive" class="mb-4">
            <CircleAlert class="size-4" />
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
    {:else if projectEndpoints.size === 0}
        <div class="py-12 text-center bg-gray-50 rounded-lg">
            <p class="text-lg text-gray-600">No endpoints found.</p>
            <p class="text-sm text-gray-500 mt-2">Create endpoints in your projects to see them here.</p>
            <a href="/projects" class="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Go to Projects
            </a>
        </div>
    {:else}
        <!-- Endpoints List -->
        <div class="space-y-6">
            {#each [...projectEndpoints.values()] as { project, endpoints }, idx}
                {#if endpoints.length > 0}
                    <div class="space-y-3">
                        {#each endpoints as endpoint (endpoint.id)}
                            <div
                                    class="p-4 bg-white shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                                    onclick={() => navigateToEndpoint(project.slug, endpoint.path)}
                            >
                                <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <!-- Endpoint Method & Path -->
                                    <div class="flex-grow">
                                        <div class="flex items-center gap-2">
                                            <span class={`px-2 py-1 rounded text-sm font-mono ${getMethodStyle(endpoint.method)}`}>
                                                {endpoint.method}
                                            </span>
                                            <span class="font-medium">{endpoint.path}</span>
                                            <span class={endpoint.is_active ? 'text-green-600 ml-auto sm:ml-2' : 'text-gray-400 ml-auto sm:ml-2'}>
                                                {endpoint.is_active ? '✓ Active' : '○ Inactive'}
                                            </span>
                                        </div>
                                        <div class="mt-1">
                                            <span class="text-sm text-gray-500">
                                                Project: <span class="font-medium">{project.name}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <!-- View Button (Mobile Only) -->
                                    <div class="sm:hidden mt-2">
                                        <button class="text-sm text-blue-500 hover:text-blue-700">
                                            View Details →
                                        </button>
                                    </div>

                                    <!-- Info & Actions -->
                                    <div class="hidden sm:flex items-center gap-4">
                                        <button class="text-sm text-blue-500 hover:text-blue-700">
                                            View Details →
                                        </button>
                                    </div>
                                </div>

                                <!-- Description -->
                                {#if endpoint.description}
                                    <p class="mt-2 text-sm text-gray-600">
                                        {endpoint.description}
                                    </p>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
</div>
