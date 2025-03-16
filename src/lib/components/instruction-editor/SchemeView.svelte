<script lang="ts">
    import { SchemeType, type Scheme } from "./lib/interfaces";
    import ListSchemeView from "./ListSchemeView.svelte";
    import ListView from "./ListSchemeView.svelte";
    import ObjectSchemeView from "./ObjectSchemeView.svelte";
    import StringSchemeView from "./StringSchemeView.svelte";

    let { scheme = $bindable() }: { scheme: Scheme } = $props()
</script>

{#if scheme.type === SchemeType.String}
    <StringSchemeView bind:scheme={scheme} />
{:else if scheme.type === SchemeType.Object}
    <ObjectSchemeView bind:scheme={scheme} />
{:else if scheme.type === SchemeType.List}
    <ListSchemeView bind:scheme={scheme} />
{/if}
