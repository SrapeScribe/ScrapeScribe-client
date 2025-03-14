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
<div>
  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
      <form onsubmit={() => handleSignIn(username, password)} class="mb-0 space-y-6">
        <div>
          <label for="Username" class="block text-m font-medium text-gray-700">
            Username
          </label>
        </div>
        <div class="mt-1">
        <input 
            type="text" bind:value={username} placeholder="Username" 
            class="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm
            focus:outline-none focus:border-black focus:ring-1 focus:ring-black"/>
        </div>
        <label for="Password" class="block text-m font-medium text-gray-700">
          Password
        </label>
        <div class="mt-1">
          <input type="password" bind:value={password} placeholder="Password" 
          class="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm
          focus:outline-none focus:border-black focus:ring-1 focus:ring-black"/>
        </div>
        <div>
          <button type="submit" class="w-full flex justify-center py-2 px-4
          border border-transparent rounded-md shadow-sm bg-gray-700 text-white focus:outline-none">
          Sign In
        </button>
        </div>
      </form>
    </div>
  </div>
</div>
{/if}