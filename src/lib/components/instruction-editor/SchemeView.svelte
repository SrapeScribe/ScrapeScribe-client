<script lang="ts">
    import { SchemeType, type Scheme } from "./lib/interfaces";
    import ListSchemeView from "./ListSchemeView.svelte";
    import ListView from "./ListSchemeView.svelte";
    import ObjectSchemeView from "./ObjectSchemeView.svelte";
    import StringSchemeView from "./StringSchemeView.svelte";

    let { scheme = $bindable(), endpointId }: { scheme: Scheme, endpointId: string } = $props()
</script>

{#if scheme.type === SchemeType.String}
    <StringSchemeView bind:scheme={scheme} endpointId={endpointId}/>
{:else if scheme.type === SchemeType.Object}
    <ObjectSchemeView bind:scheme={scheme} endpointId={endpointId}/>
{:else if scheme.type === SchemeType.List}
    <ListSchemeView bind:scheme={scheme} endpointId={endpointId}/>
{/if}
