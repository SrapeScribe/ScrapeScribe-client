<script lang="ts">
    import { goto } from '$app/navigation';
    import '$lib/aws-amplify';
    import { auth, handleSignIn, handleSignOut } from "$lib/states/auth.svelte";
    
    let username = $state("");
    let password = $state("");
    
    const switchToSignUp = () => {
      goto('/signup');
    };
  
    const handleSubmit = (event: Event) => {
      event.preventDefault();
      handleSignIn(username, password);
    };
  </script>
  
  <svelte:head>
    <title>ScrapeScribe - SignIn</title>
  </svelte:head>
  
  <style>
    @import '../../styles/basicstyles.css';
  </style>
  
  <div class="auth-container">
    {#if auth.user}
      <p>Welcome, {auth.user?.signInDetails?.loginId ?? auth.user?.username}!</p>
      <p>User id: {auth.user.userId}</p>
      <button onclick={handleSignOut}>Sign Out</button>
    {:else}
      <h2>Sign In</h2>
      <form onsubmit={handleSubmit}>
        <input type="text" bind:value={username} placeholder="Username" required />
        <input type="password" bind:value={password} placeholder="Password" required />
        <button type="submit">Sign In</button>
      </form>
      <div class="switch">
        <p>Don't have an account?</p>
        <a href="javascript:void(0)" onclick={switchToSignUp}>Sign Up</a>
      </div>
    {/if}
  </div>
  