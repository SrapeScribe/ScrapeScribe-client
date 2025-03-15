<script lang="ts">
    import {authStore} from "$lib/states/auth.svelte"
    import LogOut from "lucide-svelte/icons/log-out"
    import {goto} from "$app/navigation"

    let isSigningOut = $state(false)
    const authState = $derived(authStore.authState)

    async function handleSignOut() {
        console.log("❌ Sign out requested")
        isSigningOut = true

        try {
            const success = await authStore.handleSignOut()
            console.log("❌ Sign out result:", success)

            if (success) {
                console.log("❌ Signed out successfully, redirecting to sign in")
                await goto('/sign-in')
            }
        } finally {
            isSigningOut = false
        }
    }

</script>

<button
        class="inline-flex items-center gap-2"
        onclick={handleSignOut}
        disabled={isSigningOut || authState.isLoading}
>
    <LogOut/>

    {#if isSigningOut}
        Signing Out...
    {:else}
        Sign Out
    {/if}
</button>
