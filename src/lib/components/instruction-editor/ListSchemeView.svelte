<script lang="ts">
    import { emptyScheme, type ListScheme, type SchemeType } from "./lib/interfaces";
    import SchemeView from "./SchemeView.svelte";
    import Dropdown from "./Dropdown.svelte";
    import { getElementPath } from "./lib/pathinator";
    import { selectionMode, startSelection } from "./lib/selectionMode.svelte";
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from "$lib/components/ui/button";

    let {
        scheme = $bindable(),
        endpointId,
        modalOpen = $bindable()
    }: {
        scheme: ListScheme,
        endpointId: string,
        modalOpen?: boolean
    } = $props();

    let isOpenEditor = $state(false);

    // Initialize edit mode for empty lists or when element scheme is undefined
    $effect(() => {
        if (scheme.path && (!scheme.content || scheme.content.length === 0 || !scheme.element_scheme)) {
            isOpenEditor = true;
        }
    });

    function toggleEditor() {
        isOpenEditor = !isOpenEditor;

        if (!isOpenEditor) {
            // Trigger refresh
            window.dispatchEvent(new CustomEvent("refresh", { detail: { endpointId }}));
        }
    }

    function createElementScheme(kind: SchemeType) {
        scheme = {
            ...scheme,
            element_scheme: emptyScheme(kind)
        };
        window.dispatchEvent(new CustomEvent("refresh", { detail: { endpointId }}));
    }

    function removeElementScheme() {
        scheme = {
            ...scheme,
            element_scheme: undefined
        };
        window.dispatchEvent(new CustomEvent("refresh", { detail: { endpointId }}));
    }

    function selectListElement() {
        startSelection('LIST', (element: HTMLElement) => {
            scheme = {
                ...scheme,
                path: getElementPath(element)
            };
            window.dispatchEvent(new CustomEvent("refresh", { detail: { endpointId }}));
        });
        modalOpen = true;
    }
</script>

{#if !scheme.path}
    <Dialog.Trigger>
        <Button
                class="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                variant="secondary"
                onclick={selectListElement}
                disabled={selectionMode.isActive}
        >
            {selectionMode.isActive ? "Click an element in the webpage below" : "Select list container"}
        </Button>
    </Dialog.Trigger>
{:else}
    {"["}
    <div class="pl-1">
        {#if !isOpenEditor}
            <!-- Display view mode -->
            <div class="flex justify-between items-center mb-2">
                <Button
                        onclick={() => isOpenEditor = true}
                        variant="secondary"
                        size="sm"
                >
                    Edit list
                </Button>

                <Dialog.Trigger>
                    <Button
                            class="text-xs"
                            variant="outline"
                            size="sm"
                            onclick={selectListElement}
                    >
                        Change container
                    </Button>
                </Dialog.Trigger>
            </div>

            {#if scheme.content && scheme.content.length > 0}
                <div class="mt-2">
                    {#each scheme.content.slice(0, 3) as content, i}
                        <div class="my-1 p-2 bg-gray-50 rounded text-sm">
                            <span class="block font-mono overflow-hidden text-ellipsis">{JSON.stringify(content)}</span>
                        </div>
                        {#if i === 2 && scheme.content.length > 3}
                            <div class="text-xs text-gray-500 mt-1">...and {scheme.content.length - 3} more items</div>
                        {/if}
                    {/each}
                </div>
            {:else}
                <div class="text-xs text-gray-500 mt-2">No items in list</div>
            {/if}
        {:else}
            <!-- Edit mode -->
            <div class="flex justify-between items-center mb-3">
                <Button
                        onclick={toggleEditor}
                        variant="secondary"
                        size="sm"
                >
                    Save list
                </Button>

                <Dialog.Trigger>
                    <Button
                            class="text-xs"
                            variant="outline"
                            size="sm"
                            onclick={selectListElement}
                    >
                        Change container
                    </Button>
                </Dialog.Trigger>
            </div>

            <div class="border rounded-md p-3 bg-gray-50 mb-3">
                <div class="text-sm font-medium mb-2">First element structure:</div>

                {#if scheme.element_scheme}
                    <div class="mb-2">
                        <SchemeView bind:scheme={scheme.element_scheme} endpointId={endpointId} bind:modalOpen />
                    </div>
                    <Button
                            onclick={removeElementScheme}
                            variant="outline"
                            size="sm"
                            class="mt-1"
                    >
                        Change Type
                    </Button>
                {:else}
                    <div class="mb-2">
                        <span class="text-sm text-gray-700 block mb-1">Select element type:</span>
                        <Dropdown onSelect={(value: SchemeType) => createElementScheme(value)} />
                    </div>
                {/if}
            </div>

            <div class="text-xs text-gray-500 bg-blue-50 p-2 rounded-md">
                <p>📝 <strong>Note:</strong> You are configuring the first element of the list. The scraper will automatically find all similar elements.</p>
            </div>
        {/if}
    </div>
    {"]"}
{/if}

