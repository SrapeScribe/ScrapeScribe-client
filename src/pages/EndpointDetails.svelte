<script lang="ts">
  import { onMount } from 'svelte';
  import { getEndpoint, updateEndpoint, type Endpoint } from '../fakeDb';

  export let projectId: string  // maybe display what project this endpoint belongs to
  export let endpointId: string

  let endpoint: Endpoint | null = null
  let instructions = ''
  let refresh_period = ''
  let error = ''


  onMount(async () => {
    endpoint = await getEndpoint(endpointId)
    if (endpoint) {
      instructions = endpoint.instructions
      refresh_period = endpoint.refresh_period
    }
  })

  async function handleSave() {
    try {
      await updateEndpoint(endpointId, { instructions, refresh_period });
      alert('Endpoint updated successfully');
    } catch (e: any) {
      error = e.message;
    }
  }
</script>

{#if endpoint}
  <h1>{endpoint.name}</h1>
  {#if error}
    <p style="color: red;">{error}</p>
  {/if}
  <form on:submit|preventDefault={handleSave}>
    <div>
      <label for="instructions">Instructions:</label>
      <textarea id="instructions" bind:value={instructions} required></textarea>
    </div>
    <div>
      <label for="refresh_period">Refresh Period:</label>
      <input id="refresh_period" bind:value={refresh_period} required />
    </div>
    <button type="submit">Save</button>
  </form>
{:else}
  <p>No endpoint found</p>
{/if}