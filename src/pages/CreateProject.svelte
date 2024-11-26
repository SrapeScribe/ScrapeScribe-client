<script lang="ts">
  import { createProject } from '../fakeDb';
  import { navigate } from 'svelte-routing';

  let user_id = 'u1'
  let name = ''
  let error = ''

  async function handleSubmit() {
    try {
      await createProject(user_id, name)
      navigate('/projects')
    } catch (e: any) {
      error = e.message
    }
  }
</script>

<h1>Create Project</h1>

{#if error}
  <p style="color: red;">{error}</p>
{/if}

<form on:submit|preventDefault={handleSubmit}>
  <!-- <div>
    <label for="user_id">User ID:</label>
    <input id="user_id" bind:value={user_id} required />
  </div> -->
  <div>
    <label for="name">Project Name:</label>
    <input id="name" bind:value={name} required />
  </div>
  <button type="submit">Create Project</button>
</form>