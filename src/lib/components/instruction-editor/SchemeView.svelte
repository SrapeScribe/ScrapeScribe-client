<script lang="ts">
    import { SchemeType, type Scheme } from "./lib/interfaces";
    import ListSchemeView from "./ListSchemeView.svelte";
    import ObjectSchemeView from "./ObjectSchemeView.svelte";
    import StringSchemeView from "./StringSchemeView.svelte";

    let {
        scheme = $bindable(),
        endpointId,
        modalOpen = $bindable()
    }: {
        scheme: Scheme,
        endpointId: string,
        modalOpen?: boolean
    } = $props();
</script>

{#if scheme.type === SchemeType.String}
    <StringSchemeView bind:scheme={scheme} endpointId={endpointId} bind:modalOpen />
{:else if scheme.type === SchemeType.Object}
    <ObjectSchemeView bind:scheme={scheme} endpointId={endpointId} bind:modalOpen />
{:else if scheme.type === SchemeType.List}
    <ListSchemeView bind:scheme={scheme} endpointId={endpointId} bind:modalOpen />
{/if}
