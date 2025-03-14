<script lang="ts">
    import {onMount, type Snippet} from 'svelte'
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/states/auth.svelte';

    let { children, redirectTo = '/sign-in' } = $props<{
        childred: Snippet, redirectTo?: string
    }>();


    // auth state
    const authState = $derived(authStore.authState);
    const initState = $derived(authStore.initState);

    let initialized = $state(false);

    onMount(async () => {
        console.log("🛡️ AuthGuard mounted");

        if (!initState.isInitialized) {
            console.log("🛡️ Auth not initialized, initializing");
            await authStore.initialize();
        }

        initialized = true;
        console.log("🛡️ AuthGuard initialized");

        // Check authentication right away
        if (!authState.isAuthenticated) {
            console.log("🛡️ Not authenticated, redirecting immediately");
            await goto(redirectTo);
        }
    });

    $effect(() => {
        // Only check after initialization
        if (!initialized || !initState.isInitialized) return;

        if (!authState.isAuthenticated && !authState.isLoading) {
            console.log("🛡️ Not authenticated after state change, redirecting");
            goto(redirectTo);
        }
    });
</script>

{#if !initialized || initState.isLoading || authState.isLoading}
    <div class="auth-guard-loading">
        <p>Checking authentication...</p>
    </div>
{:else if authState.isAuthenticated}
    {@render children?.()}
{:else}
    <div class="auth-guard-unauthorized">
        <p>You must be logged in to view this page.</p>
        <p>Redirecting to login page...</p>
    </div>
{/if}
