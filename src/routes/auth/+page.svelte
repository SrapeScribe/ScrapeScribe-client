<!--redirect from an incorrect route -->

<script lang="ts">
    import {onMount} from "svelte"
    import {goto} from "$app/navigation"

    onMount(() => {
        goto('/sign-in')
    });
</script>
