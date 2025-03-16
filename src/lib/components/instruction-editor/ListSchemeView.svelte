<script lang="ts">
    import {emptyScheme, type ListScheme, type SchemeType} from "./lib/interfaces";
    import SchemeView from "./SchemeView.svelte";
    import Dropdown from "./Dropdown.svelte";
    import { getElementPath } from "./lib/pathinator";
    import { selectedElement } from "./lib/selectedElemStore.svelte";

    let { scheme = $bindable(), endpointId }: { scheme: ListScheme, endpointId: string } = $props()


    let isOpenEditor = $state(false)

    function toggleEditor() {
        isOpenEditor = !isOpenEditor

        if (!isOpenEditor) {
            window.dispatchEvent(new CustomEvent("refresh", { detail: { endpointId }}))
        }
    }

    function createElementScheme(kind: SchemeType) {
        scheme = {
            ...scheme,
            element_scheme: emptyScheme(kind)
        }
    }

    function removeElementScheme() {
        scheme = {
            ...scheme,
            element_scheme: undefined
        }
    }

    function selectListElement() {
        // shows popup and the user selects the list
        scheme = {
            ...scheme,
            path: getElementPath(selectedElement.elem!)
        }
    }
</script>

{#if !scheme.path}
    <button onclick={selectListElement}>select list</button>
{:else}
    {#if isOpenEditor}
        <button onclick={selectListElement}>select list</button>
    {/if}
    {"["}
    <div class="pl-1">
        <button onclick={toggleEditor}>{isOpenEditor ? "save list" : "edit list"}</button>

        <br/>

        {#if isOpenEditor}
            {#if scheme.element_scheme}
                <SchemeView bind:scheme={scheme.element_scheme} endpointId={endpointId}/>
                <button onclick={removeElementScheme}>Change Type</button>
            {:else}
                <Dropdown onSelect={(value: SchemeType) => createElementScheme(value)} />
            {/if}
            <br/>
            <span>Note: you are working with the first element of the list</span>
        {:else}
            {#each scheme.content || [] as content} <!-- TODO: fix this being nullable -->
                <span>{JSON.stringify(content)}</span><br>  <!-- TODO: display up to 5 or so items, maybe fewer, rather than all -->
            {/each}
        {/if}
    </div>
    {"]"}
{/if}



<style>
    .pl-1 {
        padding-left: 1rem;
    }
</style>
