<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { authStore } from '$lib/states/auth.svelte';
	import LogoutButton from '$lib/components/auth/logout-button.svelte';

    const authState = $derived(authStore.authState);

    let email = $derived(authState.userAttributes?.email || authState.user?.username || '');
    let userId = $derived(authState.user?.userId || '');


    onMount(async () => {
        console.log("👤 Profile component mounted");
        await initializeProfile();
    });

    async function initializeProfile() {
        // TODO: Possibly unnecessary, inspect and remove if not needed
        // Initialize auth if needed
        if (!authStore.initState.isInitialized) {
            console.log("🧩 Auth not initialized, initializing");
            await authStore.initialize();
        }

        // Fetch attributes if authenticated but no attributes yet
        if (authState.isAuthenticated && !authState.userAttributes) {
            console.log("🧩 Authenticated but no attributes, fetching");
            await authStore.fetchAttributes();
        }
    }

</script>

<svelte:head>
    <title>Profile</title>
</svelte:head>

<div class="container">
    <h1>Your Profile</h1>

    {#if authState.isLoading}
        <div class="loading">Loading your profile...</div>
    {:else if !authState.isAuthenticated}
        <div class="loading">Redirecting to sign in...</div>
    {:else}
        {#if authState.error}
            <div class="error">
                <p>{authState.error}</p>
            </div>
        {/if}

        <div>
            <h2>Account Information</h2>

            <div>
                <span>Email:</span>
                <span>{email}</span>
            </div>

            <div>
                <span>User ID:</span>
                <span>{userId}</span>
            </div>

            <!-- Additional user data -->
            {#if authState.userAttributes}
                <h3>Additional Information</h3>
                {#each Object.entries(authState.userAttributes) as [key, value]}
                    {#if !['email', 'sub'].includes(key)}
                        <div>
                            <span>{key}:</span>
                            <span>{value}</span>
                        </div>
                    {/if}
                {/each}
            {/if}
        </div>

        <LogoutButton />
    {/if}
</div>
