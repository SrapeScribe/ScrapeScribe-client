<script lang="ts">
    import {emptyScheme, type ListScheme, type SchemeType} from "$lib/interfaces";
    import SchemeView from "./SchemeView.svelte";
    import Dropdown from "./Dropdown.svelte";

    let {scheme = $bindable()}: { scheme: ListScheme } = $props()


    let isOpenEditor = $state(false)

    function editList() {
        isOpenEditor = !isOpenEditor
    }
    function onSelect(kind: SchemeType) {
        scheme = {
            ...scheme,
            element_scheme:  emptyScheme(kind)
        }
    }
</script>

<div class="pl-4">
    <button onclick={editList}>{isOpenEditor ? "save list" : scheme.element_scheme === undefined ? "create list" : "edit list"}</button>

    <br/>

    {#if isOpenEditor}
        {#if scheme.element_scheme}
            <SchemeView scheme={scheme.element_scheme}/>
        {:else}
            <Dropdown onSelect={(value: SchemeType) => onSelect(value)} />
        {/if}
        <br/>
        <span>Note: you are working with the first element of the list</span>
    {/if}

</div>
