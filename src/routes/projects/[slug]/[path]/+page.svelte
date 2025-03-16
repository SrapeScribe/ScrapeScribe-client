<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { endpointStore } from "$lib/states/endpoint.svelte.js";
    import { projectStore } from "$lib/states/project.svelte";
    import * as Alert from '$lib/components/ui/alert/index.js';
    import { CircleAlert } from 'lucide-svelte';
    import { METHOD_STYLES } from '$lib/constants';
    import type { PageProps } from "./$types";

    // Props from the page
    const { data }: PageProps = $props();

    // Project and endpoint params from URL
    const projectSlug = $derived(data.params.slug);
    const endpointPath = $derived(data.params.path);

    // State
    let isLoading = $state(true);
    let error = $state<string | null>(null);
    let loadedEndpoint = $state<any | null>(null);

    // Derived state from stores
    const projectData = $derived(projectStore.currentProject);
    const projectLoading = $derived(projectStore.isLoading);
    const projectError = $derived(projectStore.error);

    const endpointsData = $derived(endpointStore.endpoints);
    const endpointLoading = $derived(endpointStore.isLoading);
    const endpointError = $derived(endpointStore.error);

    onMount(async () => {
        console.log(`Endpoint detail: Component mounted for ${projectSlug}/${endpointPath}`);
        await loadData();
    });

    onDestroy(() => {
        console.log("Endpoint detail: Component destroyed");
    });

    async function loadData() {
        isLoading = true;
        error = null;

        try {
            console.log(`Endpoint detail: Loading project ${projectSlug}`);
            await projectStore.loadProject(projectSlug);

            if (!projectData) {
                throw new Error(`Project "${projectSlug}" not found`);
            }

            console.log(`Endpoint detail: Project loaded, setting active project ${projectData.id}`);
            await endpointStore.setActiveProject(projectData.id);

            // Find endpoint with this path in the loaded endpoints
            const foundEndpoint = endpointsData.find(e => e.path === endpointPath);

            if (!foundEndpoint) {
                console.error(`Endpoint detail: Endpoint with path ${endpointPath} not found in project`);
                error = `Endpoint with path "${endpointPath}" not found`;
            } else {
                console.log(`Endpoint detail: Found endpoint:`, foundEndpoint);
                loadedEndpoint = foundEndpoint;

                // Load full endpoint details
                console.log(`Endpoint detail: Loading full endpoint details for ID ${foundEndpoint.id}`);
                await endpointStore.loadEndpoint(foundEndpoint.id);
            }
        } catch (err) {
            console.error("Endpoint detail: Error loading data:", err);
            error = err instanceof Error ? err.message : "An error occurred loading the endpoint";
        } finally {
            isLoading = false;
            console.log("Endpoint detail: Finished loading data");
        }
    }
</script>

<svelte:head>
    <title>
        {loadedEndpoint ? `${loadedEndpoint.method} ${loadedEndpoint.path}` : 'Endpoint'} | Dashboard
    </title>
</svelte:head>

<div class="max-w-5xl px-4 mx-auto">
    {#if isLoading || projectLoading || endpointLoading}
        <div class="py-4">Loading endpoint details...</div>
    {:else if error || projectError || endpointError}
        <Alert.Root variant="destructive" class="mb-4">
            <CircleAlert class="size-4" />
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error || projectError || endpointError}</Alert.Description>
        </Alert.Root>
    {:else if loadedEndpoint}
        <!-- Endpoint Details -->
        <div class="mb-6">
            <div class="flex items-center gap-4 mb-2">
                <a href={`/projects/${projectSlug}`} class="text-blue-500 hover:underline">
                    &larr; Back to Project
                </a>
            </div>

            <div class="flex items-center gap-4 mb-2">
                <span class={`px-3 py-1 rounded text-sm font-mono ${METHOD_STYLES[loadedEndpoint.method]}`}>
                    {loadedEndpoint.method}
                </span>
                <h1 class="text-2xl font-bold">{loadedEndpoint.path}</h1>
                <span class={loadedEndpoint.is_active ? 'text-green-600' : 'text-gray-400'}>
                    {loadedEndpoint.is_active ? 'Active' : 'Inactive'}
                </span>
            </div>

            {#if loadedEndpoint.description}
                <p class="text-lg text-gray-600 mb-4">{loadedEndpoint.description}</p>
            {:else}
                <p class="text-lg text-gray-400 italic mb-4">No description</p>
            {/if}

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <h3 class="text-sm font-semibold text-gray-500">Endpoint ID</h3>
                    <p class="font-mono text-sm">{loadedEndpoint.id}</p>
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-gray-500">Project</h3>
                    <p>{projectData?.name}</p>
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-gray-500">Created</h3>
                    <p>{new Date(loadedEndpoint.created_at).toLocaleString()}</p>
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-gray-500">Last Updated</h3>
                    <p>{new Date(loadedEndpoint.updated_at).toLocaleString()}</p>
                </div>
            </div>
        </div>

        <!-- Endpoint Configuration Section -->
        <div class="mt-8 p-4 border rounded-lg bg-gray-50">
            <h2 class="text-xl font-semibold mb-4">Endpoint Configuration</h2>
            <p class="text-gray-500">This is where the endpoint configuration editor would go.</p>

            <!-- Placeholder for instruction editor -->
            <div class="bg-white p-6 border rounded-lg mt-4">
                <p class="text-center text-gray-400">Endpoint configuration editor would be implemented here</p>
            </div>
        </div>
    {:else}
        <div class="py-8 text-center">
            <h2 class="text-xl font-semibold">Endpoint not found</h2>
            <p class="text-gray-500 mt-2">The endpoint you're looking for doesn't exist or you don't have access to it.</p>
            <a href={`/projects/${projectSlug}`} class="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Return to Project
            </a>
        </div>
    {/if}
</div>
