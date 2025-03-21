<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Dialog from "$lib/components/ui/dialog";
    import WebpageEmbed from "./WebpageEmbed.svelte";
    import Toolbar from "../toolbar.svelte";
    import { selectionMode, startSelection, endSelection } from "./lib/selectionMode.svelte";

    let { pageContent, url, onElementSelected } = $props<{
        pageContent: string;
        url: string;
        onElementSelected: (element: HTMLElement) => void;
    }>();

    let open = $state(false);
    let currentTool = $state<'select' | 'click'>('select');

    // close when selection is complete
    $effect(() => {
        if (!selectionMode.isActive && open) {
            open = false;
        }
    });

    function handleSelectionStart(type: 'STRING' | 'LIST') {
        open = true;
        currentTool = 'select'; // Ensure we're in select mode
        startSelection(type, (element) => {
            onElementSelected(element);
        });
    }

    function handleToolChange(event: CustomEvent<{tool: 'select' | 'click'}>) {
        currentTool = event.detail.tool;
    }
</script>

<Dialog.Root bind:open>
    <Dialog.Trigger>
        <Button class="h-[40px] w-full font-bold" variant="outline" onclick={() => handleSelectionStart('STRING')}>
            Select content
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="max-w-5xl max-h-[90vh]">
        <Dialog.Header>
            <Dialog.Title>Select {selectionMode.type} element</Dialog.Title>
            <Dialog.Description>
                {selectionMode.message}
                {#if url}
                    <span class="block mt-2 text-sm text-gray-500 truncate">From: {url}</span>
                {/if}
            </Dialog.Description>
        </Dialog.Header>

        <div class="mt-2 mb-4">
            <Toolbar bind:currentTool on:toolChange={handleToolChange} />
        </div>

        <div class="overflow-auto max-h-[60vh]">
            {#if pageContent}
                <WebpageEmbed {pageContent} bind:currentTool />
            {:else}
                <div class="py-20 text-center text-gray-400">No content loaded</div>
            {/if}
        </div>

        <Dialog.Footer>
            <Button variant="outline" onclick={() => {
                endSelection();
                open = false;
            }}>Cancel</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
