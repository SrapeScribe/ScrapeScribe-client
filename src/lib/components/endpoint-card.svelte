<script lang="ts">
    import * as Accordion from '$lib/components/ui/accordion'
    import {slide} from 'svelte/transition'
    import {METHOD_STYLES} from '../../constants'
    import type {Endpoint} from "../../interfaces"
    import Editor from "$lib/components/instruction-editor/Editor.svelte"
    import {setContext} from "svelte"
    import ApiClient from "$lib/api/client"
    import {projectStore} from "$lib/stores"

    let project_id: string

    projectStore.subscribe((project) => {
        project_id = project.id
    })
    let {endpoint = $bindable(), class: className = ''} = $props()
    setContext('endpoint', endpoint)

    let activeAccordionItems = $state<string[]>([])
    let isEditingUrl = $state(false)
    let editedUrl = $state(endpoint.url)
    let urlError = $state<string | null>(null)
    let isSaving = $state(false)

    const validateUrl = (url: string): string | null => {
        if (!url.trim()) return "URL cannot be empty"
        if (url === endpoint.url) return "URL must be different from current"
        if (!/^[a-zA-Z0-9-_/]+$/.test(url)) return "Invalid URL format"
        return null
    }

    const startEditing = () => {
        isEditingUrl = true
        editedUrl = endpoint.url
        urlError = null
    }

    const cancelEditing = () => {
        isEditingUrl = false
        editedUrl = endpoint.url
        urlError = null
    }

    const saveChanges = async () => {
        const validationError = validateUrl(editedUrl)
        if (validationError) {
            urlError = validationError
            return
        }

        isSaving = true
        try {
            await ApiClient.updateProjectUrl(project_id, { url: editedUrl.trim() })
            endpoint.url = editedUrl.trim()
            isEditingUrl = false
            urlError = null
        } catch (error) {
            urlError = error instanceof Error
                ? error.message
                : 'Failed to update URL. Please try again.'
        } finally {
            isSaving = false
        }
    }

    const editButtonLabel = isEditingUrl
        ? "Save changes"
        : "Edit endpoint URL"
    const cancelButtonLabel = "Cancel editing"
</script>

<div class={`endpoint-container flex gap-2 rounded-lg ${className}`}>
    {#if isEditingUrl}
        <div class="url-editor flex flex-col gap-2 w-full ">
            <div class="flex items-center gap-2 bg-slate-100 rounded-lg p-3 h-14">
                <span class={`method-badge px-2 py-1 rounded  text-sm font-mono ${METHOD_STYLES[endpoint.method]}`}>
                    {endpoint.method}
                </span>

                <input
                        type="text"
                        class="url-input py-1 pl-2 rounded-sm bg-white outline-none"
                        bind:value={editedUrl}
                        size={editedUrl.length > 0 ? editedUrl.length : 10}
                        aria-label="Endpoint URL"
                        aria-invalid={!!urlError}
                        onkeydown={(e) => e.key === 'Enter' && saveChanges()}
                        disabled={isSaving}
                />
                /
                {#if isSaving}
                    <span class="text-gray-500 animate-pulse">Saving...</span>
                {/if}
            </div>

            {#if urlError}
                <p class="error-message text-red-500 text-sm pl-2 transition-opacity">
                    ⚠️ {urlError}
                </p>
            {/if}
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
                        <span class={`px-2 py-1 rounded text-sm font-mono ${METHOD_STYLES[endpoint.method]}`}>
                            {endpoint.method}
                        </span>
                        <span class="url-display text-md text-gray-700 truncate">
                            {endpoint.url}/
                        </span>
                    </div>
                </Accordion.Trigger>

                <Accordion.Content class="pt-4" forceMount={true}>
                    {#snippet child({props: contentProps, open, close})}
                        {#if open}
                            <div {...contentProps} transition:slide={{ duration: 200 }}>
                                <Editor/>
                            </div>
                        {/if}
                    {/snippet}
                </Accordion.Content>
            </Accordion.Item>
        </Accordion.Root>
    {/if}

    <div class="action-buttons flex gap-2">
        {#if isEditingUrl}
            <button
                    onclick={saveChanges}
                    class="save-button p-4 rounded-lg bg-green-100 hover:bg-green-200 w-14 h-14"
                    aria-label={editButtonLabel}
                    disabled={isSaving}
            >
                {isSaving ? '⏳' : '✅'}
            </button>
            <button
                    onclick={cancelEditing}
                    class="cancel-button p-4 rounded-lg bg-red-100 hover:bg-red-200 w-14 h-14"
                    aria-label={cancelButtonLabel}
            >
                ❌
            </button>
        {:else}
            <button
                    onclick={startEditing}
                    class="edit-button p-4 rounded-lg bg-slate-100 hover:bg-slate-200 w-14 h-14"
                    aria-label={editButtonLabel}
            >
                ✏️
            </button>
        {/if}
    </div>
</div>

<style>
    .url-input {
        transition: all 0.2s ease;
    }

    .url-display {
        max-width: 400px;
    }

    .error-message {
        opacity: 1;
        transition: opacity 0.3s ease;
    }
</style>
