<!-- src/pages/Projects.svelte -->
<script lang="ts">
    import { onMount } from 'svelte'
    import { getProjects, type Project } from '../fakeDb'
    import { Link } from 'svelte-routing'
  
    let projects: Project[] = []
  
    onMount(async () => {
      projects = await getProjects()
    })
  </script>
  
  <h1>All Projects</h1>
  <ul>
    {#each projects as project}
      <li>
        <p>project named {project.name}</p>
        <Link to={`/projects/${project.id}`}>{project.name}</Link>
      </li>
    {/each}
  </ul>