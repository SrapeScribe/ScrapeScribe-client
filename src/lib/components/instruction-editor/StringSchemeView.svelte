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

    function startStringSelection() {
        startSelection('STRING', (element: HTMLElement) => {
            const path = getElementPath(element);
            scheme.path = path;
            window.dispatchEvent(new CustomEvent("refresh", { detail: { endpointId }}));
        });
        modalOpen = true;
    }

    let buttonText = $derived(
        selectionMode.isActive
            ? "click an element in the webpage below"
            : "select string"
    );

    let content = $derived(`${scheme.content || ''} (${scheme.path || ''})`);
</script>

{#if !scheme.path}
    <Dialog.Trigger>
        <Button
                class="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                variant="secondary"
                onclick={startStringSelection}
                disabled={selectionMode.isActive}
        >
            {buttonText}
        </Button>
    </Dialog.Trigger>
{:else}
    <div class="flex items-center gap-2">
        <span>{content}</span>
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
{/if}
