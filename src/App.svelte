<script lang="ts">
    import { Link, Route, Router } from "svelte-routing";
    import Home from "./pages/Home.svelte";
    import About from "./pages/About.svelte";
    import Projects from "./pages/Projects.svelte";
    import ProjectDetails from "./pages/ProjectDetails.svelte";
    import EndpointDetails from "./pages/EndpointDetails.svelte";
    import CreateProject from "./pages/CreateProject.svelte";

</script>

<Router>
  <nav>
    <Link to="/">Home</Link>
    <Link to="/about">About</Link>
    <Link to="/projects">Projects</Link>
    <Link to="/projects/create">Create Project</Link>
  </nav>

  <main>
    <Route path="/" component={Home} />
    <Route path="about" component={About} />
    <Route path="projects" component={Projects} />
    <Route path="projects/create" component={CreateProject} />
    <Route path="projects/:projectId" let:params>
      <ProjectDetails projectId={params.projectId} />
    </Route>
    <Route path="projects/:projectId/:endpointId" let:params>
      <EndpointDetails projectId={params.projectId} endpointId={params.endpointId} />
    </Route>
  </main>

  <footer>
    <p>Footer content here</p>
  </footer>
</Router>
