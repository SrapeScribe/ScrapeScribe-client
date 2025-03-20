<script lang="ts">
    import { getElementPath } from "./lib/pathinator";
    import type { StringScheme } from "./lib/interfaces";
    import { selectionMode, startSelection } from "./lib/selectionMode.svelte";
    import * as Dialog from '$lib/components/ui/dialog';
    import { Button } from "$lib/components/ui/button";

    let { scheme = $bindable(), endpointId, modalOpen = $bindable() }: {
        scheme: StringScheme,
        endpointId: string,
        modalOpen?: boolean
    } = $props();

    // Content folding state
    let isExpanded = $state(false);
    const MAX_DISPLAY_LENGTH = 100; // Characters to display before folding

    // Check if content needs truncation
    function needsTruncation() {
        return (scheme.content || '').length > MAX_DISPLAY_LENGTH;
    }

    // Get the display content (truncated or full)
    function getDisplayContent() {
        const content = scheme.content || '';
        if (needsTruncation() && !isExpanded) {
            return content.substring(0, MAX_DISPLAY_LENGTH) + '...';
        }
        return content;
    }

    // Get full display text with content and path
    function getFullDisplay() {
        const contentPart = getDisplayContent();
        const pathPart = scheme.path ? ` (${scheme.path})` : '';
        return contentPart + pathPart;
    }

    function toggleExpand() {
        isExpanded = !isExpanded;
    }

    function startStringSelection() {
        startSelection('STRING', (element: HTMLElement) => {
            const path = getElementPath(element);
            scheme.path = path;
            window.dispatchEvent(new CustomEvent("refresh", { detail: { endpointId }}));
        });
        modalOpen = true;
    }

    function getButtonText() {
        return selectionMode.isActive
            ? "click an element in the webpage below"
            : "select string";
    }
</script>

{#if !scheme.path}
    <Dialog.Trigger>
        <Button
                class="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                variant="secondary"
                onclick={startStringSelection}
                disabled={selectionMode.isActive}
        >
            {getButtonText()}
        </Button>
    </Dialog.Trigger>
{:else}
    <div class="flex flex-col">
        <div class="flex items-start gap-2">
            <div class="text-wrap break-words max-w-full">
                <span>{getFullDisplay()}</span>
            </div>
            <div class="flex flex-shrink-0 gap-1">
                {#if needsTruncation()}
                    <button
                            class="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                            onclick={toggleExpand}
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                {/if}
                <Dialog.Trigger>
                    <Button
                            class="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            variant="ghost"
                            size="sm"
                            onclick={() => {
                                startStringSelection();
                                scheme.path = undefined;
                            }}
                    >
                        ✏️ Change
                    </Button>
                </Dialog.Trigger>
            </div>
        </div>
    </div>
{/if}
