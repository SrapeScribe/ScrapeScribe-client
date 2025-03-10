<script lang="ts">

    import type {StringScheme} from "$lib/interfaces"

    const { scheme = $bindable() }: { scheme: StringScheme } = $props()

    function selectString() {
        // shows popup and the user selects something
        scheme.path = 'div > p'
    }


    // TODO: figure out a way to convey that a view is "WIP", for example a string needs to have a path, but it starts off with an empty path, this is not ideal, better to have a `finalized` field or some state transitions

    let content = $derived(`${scheme.path} CONTENT`)

    $effect(() => {
        const h = content
        console.log('we triggered', h)
    })

</script>

{#if !scheme.path}
    <button onclick={selectString}>select string</button>
{:else}
    <span>{content}</span>
{/if}
