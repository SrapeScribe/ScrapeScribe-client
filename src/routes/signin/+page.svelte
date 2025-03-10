<script lang="ts">
    import '$lib/aws-amplify'
    import {auth, handleSignIn, handleSignOut} from "$lib/states/auth.svelte"

    let username = $state("");
    let password = $state("");
</script>

<svelte:head>
    <title>ScrapeScribe - SignIn</title>
</svelte:head>

{#if auth.user}
    <p>Welcome, {auth.user?.signInDetails?.loginId ?? auth.user?.username}!</p>
    <p>User id: {auth.user.userId}</p>
    <button onclick={handleSignOut}>Sign Out</button>
{:else}
    <form onsubmit={() => handleSignIn(username, password)}>
        <input type="text" bind:value={username} placeholder="Username" />
        <input type="password" bind:value={password} placeholder="Password" />
        <button type="submit">Sign In</button>
    </form>
{/if}
