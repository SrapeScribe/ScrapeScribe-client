<!-- src/pages/ProjectDetails.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { getProject, getEndpoints, type Endpoint, type Project, createEndpoint } from '../fakeDb';
  import { Link } from 'svelte-routing';
  import { navigate } from 'svelte-routing';

  export let projectId: string

  let project: Project | null = null
  let endpoints: Endpoint[] = []

  onMount(async () => {
    project = await getProject(projectId)
    endpoints = await getEndpoints(projectId)
  });

  let name = ''
  let error = ''

  async function handleSubmit() {
    try {
      const newEndpoint = await createEndpoint(projectId, name, '', '');
      console.log('createeeddd')
      navigate(`/projects/${projectId}/${newEndpoint.id}`);
    } catch (e: any) {
      error = e.message;
    }
  }
</script>


{#if project}
  <h1>Project named: {project.name}</h1>
  <h2>Endpoints</h2>
  <ul>
    {#each endpoints as endpoint}
      <li>
        <Link to={`/projects/${project.id}/${endpoint.id}`}>{endpoint.name}</Link>
      </li>
    {/each}
  </ul>

  <h2>Create New Endpoint</h2>
  {#if error}
    <p style="color: red;">{error}</p>
  {/if}
  <form on:submit|preventDefault={handleSubmit}>
    <div>
      <label for="name">Endpoint Name:</label>
      <input id="name" bind:value={name} required />
    </div>
    <button type="submit">Create Endpoint</button>
  </form>
{:else}
  <p>No project found</p>
{/if}