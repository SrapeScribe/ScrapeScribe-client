<script lang="ts">
    import {onMount} from 'svelte'
    import {projectStore} from "$lib/states/project.svelte"
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

    onMount(() => {
        if (!projectData || projectData.slug !== data.params.slug) {
            projectStore.loadProject(data.params.slug)
        }
    })

    async function handleUpdateName(e: Event) {
        if (!projectData) return;

        const projectId = projectData.id;
        const name = newName.trim();

        if (!name || name === projectData.name) {
            isEditingName = false;
            updateError = "Project name cannot be empty or unchanged";
            return;
        }

        try {
            await projectStore.updateProject({
                project: {
                    id: projectId,
                    name: name
                }
            });
            isEditingName = false;
            updateError = null;
        } catch (err) {
            updateError = err instanceof Error
                ? err.message
                : 'Failed to update project name';
        }
    }

    function cancelEdit() {
            if (projectData) {
                newName = projectData.name;
            }
            isEditingName = false;
            updateError = null;
    }

    async function createEndpoint() {
        //     if (!$currentProjectStore.data) return;
        //
        //     try {
        //         await endpointActions.createEndpoint(
        //             $currentProjectStore.data.id,
        //             'GET',
        //             '/api/new-endpoint',
        //             'New endpoint'
        //         );
        //     } catch (err) {
        //         updateError = err instanceof Error
        //             ? err.message
        //             : 'Failed to create endpoint';
        //     }
    }
</script>

<svelte:head>
    <title>
        {projectData ? projectData.name : 'Project'} | Dashboard
    </title>
</svelte:head>

<div class="max-w-5xl px-4 mx-auto divide-y">
    <!-- Project Header -->
    <div class="mb-6">
        <!-- Loading/Error State -->
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

            <!-- Project ID -->
            <div class="mt-1 text-xs text-gray-500">
                ID: {projectData.id}
            </div>
        {/if}

        <!-- Error Message -->
        {#if updateError}
            <p class="text-red-500 mt-2">{updateError}</p>
        {/if}
        <!-- Context Path Editor -->

    </div>
    <!--{:else}-->

    <!--    &lt;!&ndash; Endpoints Section &ndash;&gt;-->
    <!--    <div class="pt-6">-->
    <!--        <div class="flex justify-between items-center mb-4">-->
    <!--            <h3 class="text-xl font-semibold">Endpoints</h3>-->
    <!--            <button-->
    <!--                    onclick={createEndpoint}-->
    <!--                    disabled={$endpointsStore.loading || !$currentProjectStore.data}-->
    <!--                    class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-blue-300"-->
    <!--            >-->
    <!--                + Add Endpoint-->
    <!--            </button>-->
    <!--        </div>-->

    <!--        &lt;!&ndash; Endpoints List &ndash;&gt;-->
    <!--        {#if $endpointsStore.loading}-->
    <!--            <div class="py-4">Loading endpoints...</div>-->
    <!--        {:else if $endpointsStore.error}-->
    <!--            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">-->
    <!--                <p>{$endpointsStore.error}</p>-->
    <!--            </div>-->
    <!--        {:else if $endpointsStore.data.length === 0}-->
    <!--            <div class="bg-gray-100 p-6 text-center rounded-lg">-->
    <!--                <p class="text-gray-600">This project doesn't have any endpoints yet.</p>-->
    <!--                <p class="text-sm text-gray-500 mt-2">Click the "Add Endpoint" button to create one.</p>-->
    <!--            </div>-->
    <!--        {:else}-->
    <!--            <div class="bg-white rounded-lg shadow-sm">-->
    <!--                {#each $endpointsStore.data as endpoint (endpoint.id)}-->
    <!--                    <div class="p-4 border-b last:border-b-0">-->
    <!--                        <div class="flex justify-between items-start">-->
    <!--                            <div>-->
    <!--                                <div class="flex items-center gap-2">-->
    <!--                  <span class="font-mono text-sm px-2 py-1 bg-gray-100 text-gray-800 rounded">-->
    <!--                    {endpoint.method}-->
    <!--                  </span>-->
    <!--                                    <span class="font-mono">{endpoint.path}</span>-->
    <!--                                </div>-->
    <!--                                {#if endpoint.description}-->
    <!--                                    <p class="text-sm text-gray-600 mt-1">{endpoint.description}</p>-->
    <!--                                {/if}-->
    <!--                            </div>-->
    <!--                            <div class="flex gap-2">-->
    <!--                                <button-->
    <!--                                        onclick={() => endpointActions.toggleEndpointStatus(endpoint.id, !endpoint.is_active)}-->
    <!--                                        class={endpoint.is_active ? 'text-green-600' : 'text-gray-400'}-->
    <!--                                        title={endpoint.is_active ? 'Active' : 'Inactive'}-->
    <!--                                >-->
    <!--                                    {endpoint.is_active ? '✓' : '○'}-->
    <!--                                </button>-->
    <!--                                <button-->
    <!--                                        onclick={() => endpointActions.deleteEndpoint(endpoint.id)}-->
    <!--                                        class="text-red-500 hover:text-red-700"-->
    <!--                                        title="Delete endpoint"-->
    <!--                                >-->
    <!--                                    ×-->
    <!--                                </button>-->
    <!--                            </div>-->
    <!--                        </div>-->
    <!--                    </div>-->
    <!--                {/each}-->
    <!--            </div>-->
    <!--        {/if}-->
    <!--    </div>-->
</div>
