<script lang="ts">
    import { getElementPath } from "./lib/pathinator";
    import { selectedElement } from "./lib/selectedElemStore.svelte";
    import type { StringScheme } from "./lib/interfaces";

    let { scheme = $bindable(), endpointId }: { scheme: StringScheme, endpointId: string } = $props()

    function selectString() {
        // shows popup and the user selects something
        // TODO: fix this possibly being nullable
        const path = getElementPath(selectedElement.elem!)
        console.log('IN STRING SCHEME', path)
        scheme.path = path

        window.dispatchEvent(new CustomEvent("refresh", { detail: { endpointId }}));
    }


    // OPTIONAL TODO: figure out a way to convey that a view is "WIP", for example a string needs to have a path, but it starts off with an empty path, this is not ideal, better to have a `finalized` field or some state transitions

    let content = $derived(`${scheme.content} (${scheme.path})`)

    $effect(() => {
        const h = content
        console.log('we triggered', h)
    })

</script>

{#if !scheme.path}
    <button onclick={selectString} class="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">select string</button>
{:else}
    <span>{content}</span>
{/if}
