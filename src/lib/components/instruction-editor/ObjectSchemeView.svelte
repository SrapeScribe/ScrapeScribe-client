<script lang="ts">
    import Dropdown from "./Dropdown.svelte";
    import {emptyScheme, type ObjectScheme, type SchemeType} from "./lib/interfaces";
    import KeyNameView from "./KeyNameView.svelte";
    import SchemeView from "./SchemeView.svelte";

    let { scheme = $bindable(), endpointId }: { scheme: ObjectScheme, endpointId: string } = $props()

    function addField() {
        scheme = {
            ...scheme,
            fields: [...scheme.fields, {key: "", value: undefined}]
        }
        window.dispatchEvent(new CustomEvent("refresh", { detail: { endpointId }}))
    }

    function removeField(index: number) {
        scheme = {
            ...scheme,
            fields: scheme.fields.filter((_, i) => i !== index)
        }
    }

    function changeType(index: number) {
        scheme = {
            ...scheme,
            fields: scheme.fields.map((field, i) =>
                i === index
                    ? {key: field.key, value: undefined}
                    : field
            )
        }
    }

    function onSelect(kind: SchemeType, index: number) {
        scheme = {
            ...scheme,
            fields: scheme.fields.map((field, i) =>
                i === index
                    ? {...field, value: emptyScheme(kind)}
                    : field
            )
        }
    }

    function updateKeyName(index: number, newKeyName: string) {
        scheme = {
            ...scheme,
            fields: scheme.fields.map((field, i) =>
                i === index
                    ? {...field, key: newKeyName}
                    : field
            )
        }
    }
</script>


{"{"}
<div class="pl-1">
    {#each scheme.fields as kv, index}
        <KeyNameView keyName={kv.key} onSave={(newKeyName: string) => updateKeyName(index, newKeyName)}/>
        :
        {#if kv.value}
            <SchemeView bind:scheme={kv.value} endpointId={endpointId}/>
        {:else}
            <Dropdown onSelect={(value: SchemeType) => onSelect(value, index)}/>
        {/if}
        <button onclick="{() => removeField(index)}" class="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">X</button>
        {#if kv.value}
            <button onclick="{() => changeType(index)}" class="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Change Type</button>
        {/if}
        <br>
    {/each}
</div>
<div class="pl-1">
    <button onclick="{addField}" class="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">add field</button>
</div>
{"}"}

<style>
    .pl-1 {
        padding-left: 1rem;
    }
</style>
