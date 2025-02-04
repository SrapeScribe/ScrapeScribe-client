<script lang="ts">
    import type {Endpoint} from '../../../interfaces'
    import {createEmptyEndpoint} from '$lib/fakeDb'
    import Endpoints from '$lib/components/endpoints.svelte'
    import {projectStore} from "$lib/stores"
    import ApiClient from "$lib/api/client.js"

    let {data} = $props()

    projectStore.set(data.project)

    let isEditingName = $state(false)
    let newProjectName = $state(data.project.name)

    let isEditingUrl = $state(false)
    let newProjectUrl = $state(data.project.url)

    let renameError = $state<string | null>(null)

    async function handleRenameProject(e: Event) {
        e.preventDefault()

        if (!newProjectName.trim() || newProjectName === data.project.name) {
            isEditingName = false
            renameError = "Name cannot be empty";
            return
        }

        try {
            await ApiClient.updateProjectName(data.project.id, {name: newProjectName.trim()})
            data.project.name = newProjectName.trim()
            projectStore.set(data.project)
            isEditingName = false
            renameError = null
        } catch (err) {
            renameError = err instanceof Error
                ? err.message
                : 'Failed to rename project'
        }
    }

    async function handleChangeUrl(e: Event) {
        e.preventDefault()

        if (!newProjectUrl.trim() || newProjectUrl === data.project.url) {
            isEditingUrl = false
            renameError = "URL cannot be empty";
            return
        }

        try {
            await ApiClient.updateProjectUrl(data.project.id, {url: newProjectUrl.trim()})
            data.project.url = newProjectUrl.trim()
            projectStore.set(data.project)
            isEditingUrl = false
            renameError = null
        } catch (err) {
            renameError = err instanceof Error
                ? err.message
                : 'Failed to update project url'
        }
    }
</script>

<div class="max-w-5xl px-4 mx-auto divide-y">

    <div class=" mb-6">
        {#if isEditingName}
            <form
                    onsubmit={handleRenameProject}
                    class="flex items-center gap-2 flex-grow mr-4"
            >
                <input
                        type="text"
                        bind:value={newProjectName}
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
                            onclick={() => {
                            isEditingName = false;
                            newProjectName = data.project.name;
                            renameError = null;
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        {:else}
            <div class="flex items-center gap-4">
                <h2 class="text-3xl">{data.project.name}</h2>
                <button
                        onclick={() => {
                            isEditingName = true
                            renameError = null
                        }}
                        class="text-gray-500 hover:text-gray-700"
                >
                    ✏️
                </button>
            </div>
        {/if}

        {#if isEditingUrl}
            <form
                    onsubmit={handleChangeUrl}
                    class="flex items-center gap-2 flex-grow mr-4"
            >
                <span class="flex-grow">
                     https://
                <input
                        type="text"
                        bind:value={newProjectUrl}
                        class="border p-2"
                        placeholder="Project url..."
                        size={newProjectUrl.length > 0 ? newProjectUrl.length : 10}
                />
                .{data.project.base_url}
                </span>

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
                            onclick={() => {
                            isEditingUrl = false;
                            newProjectUrl = data.project.url;
                            renameError = null;
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        {:else}
            <div class="flex items-center gap-4">
                <span class="text-md text-gray-700">https://{data.project.url}.{data.project.base_url}</span>
                <button
                        onclick={() => {
                            isEditingUrl = true
                            renameError = null
                        }}
                        class="text-gray-500 hover:text-gray-700"
                >
                    ✏️
                </button>
            </div>
        {/if}
    </div>

    {#if renameError}
        <p class="text-red-500 mt-2 mb-4">{renameError}</p>
    {/if}


    <Endpoints
            class="pt-8"
    />
</div>
