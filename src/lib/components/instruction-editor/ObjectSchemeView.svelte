<script lang="ts">
    import Dropdown from "./Dropdown.svelte";
    import {emptyScheme, type ObjectScheme, type SchemeType} from "./lib/interfaces";
    import KeyNameView from "./KeyNameView.svelte";
    import SchemeView from "./SchemeView.svelte";

    let {
        scheme = $bindable(),
        endpointId,
        modalOpen = $bindable()
    }: {
        scheme: ObjectScheme,
        endpointId: string,
        modalOpen?: boolean
    } = $props();

    function addField() {
        scheme = {
            ...scheme,
            fields: [...scheme.fields, {key: "", value: undefined}]
        };
    }

    function removeField(index: number) {
        scheme = {
            ...scheme,
            fields: scheme.fields.filter((_, i) => i !== index)
        };
        // Trigger refresh
        window.dispatchEvent(new CustomEvent("refresh", { detail: { endpointId }}));
    }

    function changeType(index: number) {
        scheme = {
            ...scheme,
            fields: scheme.fields.map((field, i) =>
                i === index
                    ? {key: field.key, value: undefined}
                    : field
            )
        };
    }

    function onSelect(kind: SchemeType, index: number) {
        scheme = {
            ...scheme,
            fields: scheme.fields.map((field, i) =>
                i === index
                    ? {...field, value: emptyScheme(kind)}
                    : field
            )
        };
    }

    function updateKeyName(index: number, newKeyName: string) {
        scheme = {
            ...scheme,
            fields: scheme.fields.map((field, i) =>
                i === index
                    ? {...field, key: newKeyName}
                    : field
            )
        };
        window.dispatchEvent(new CustomEvent("refresh", { detail: { endpointId }}));
    }
</script>

{"{"}
<div class="pl-1">
    {#each scheme.fields as kv, index}
        <div class="my-2">
            <div class="flex items-center gap-2 mb-1">
                <KeyNameView keyName={kv.key} onSave={(newKeyName: string) => updateKeyName(index, newKeyName)}/>
                <span class="text-gray-500">:</span>
                <div class="flex-grow">
                    {#if kv.value}
                        <SchemeView bind:scheme={kv.value} endpointId={endpointId} bind:modalOpen />
                    {:else}
                        <Dropdown onSelect={(value: SchemeType) => onSelect(value, index)}/>
                    {/if}
                </div>
                <div class="flex items-center gap-1">

                    {#if kv.value}
                        <button onclick="{() => changeType(index)}" class="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                            Change Type
                        </button>
                    {/if}
                    <button onclick="{() => removeField(index)}" class="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    {/each}
</div>
<div class="pl-1 mt-2">
    <button onclick="{addField}" class="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
        Add Field
    </button>
</div>
{"}"}

<style>
    .pl-1 {
        padding-left: 1rem;
    }
</style>
