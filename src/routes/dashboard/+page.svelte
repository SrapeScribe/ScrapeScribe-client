<script lang="ts">
    import { onMount } from 'svelte';
    import { projectStore } from "$lib/states/project.svelte";
    import { endpointStore } from "$lib/states/endpoint.svelte.js";
    import * as Card from '$lib/components/ui/card';
    import * as Alert from '$lib/components/ui/alert/index.js';
    import { CircleAlert } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import AnalyticsWidget from '$lib/components/dashboard/analytics-widget.svelte';
    import ActivityFeed from '$lib/components/dashboard/activity-feed.svelte';

    // Dashboard state
    let isLoading = $state(true);
    let error = $state<string | null>(null);

    // Derived states from stores
    let projectsData = $derived(projectStore.projects);
    let isProjectsLoading = $derived(projectStore.isLoading);
    let projectsError = $derived(projectStore.error);

    // Dashboard metrics
    let totalProjects = $derived(projectsData.length);
    let totalEndpoints = $derived(projectsData.reduce((sum, project) => sum + project.endpoint_count, 0));
    let activeProjects = $derived(projectsData.filter(p => p.status === 'ACTIVE').length);

    // Get recent projects without mutating original array
    let recentProjects = $derived(
        [...projectsData]
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 3)
    );

    onMount(async () => {
        console.log('Dashboard: Component mounted, loading data');
        isLoading = true;
        error = null;

        try {
            await loadDashboardData();
        } catch (err) {
            console.error('Dashboard: Error loading data', err);
            error = err instanceof Error ? err.message : 'Failed to load dashboard data';
        } finally {
            isLoading = false;
        }
    });

    async function loadDashboardData() {
        console.log('Dashboard: Loading projects data');

        try {
            // Get all projects with endpoint counts
            await projectStore.loadProjects();
            console.log(`Dashboard: Loaded ${projectsData.length} projects`);
        } catch (err) {
            console.error('Dashboard: Failed to load projects', err);
            throw err;
        }
    }

    function navigateToProject(slug: string) {
        // Clear endpoints before navigation
        endpointStore.reset();
        goto(`/projects/${slug}`);
    }
</script>

<svelte:head>
    <title>Dashboard</title>
</svelte:head>

<div class="container max-w-7xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

    {#if isLoading || isProjectsLoading}
        <div class="flex justify-center items-center h-64">
            <div class="text-gray-500">Loading dashboard data...</div>
        </div>
    {:else if error || projectsError}
        <Alert.Root variant="destructive" class="mb-6">
            <CircleAlert class="size-4" />
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error || projectsError}</Alert.Description>
        </Alert.Root>
    {:else}
        <!-- Dashboard metrics cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card.Root>
                <Card.Header class="pb-2">
                    <Card.Title class="text-sm text-gray-500">Total Projects</Card.Title>
                </Card.Header>
                <Card.Content>
                    <p class="text-3xl font-bold">{totalProjects}</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-2">
                    <Card.Title class="text-sm text-gray-500">Total Endpoints</Card.Title>
                </Card.Header>
                <Card.Content>
                    <p class="text-3xl font-bold">{totalEndpoints}</p>
                </Card.Content>
            </Card.Root>

            <Card.Root>
                <Card.Header class="pb-2">
                    <Card.Title class="text-sm text-gray-500">Active Projects</Card.Title>
                </Card.Header>
                <Card.Content>
                    <p class="text-3xl font-bold">{activeProjects}</p>
                </Card.Content>
            </Card.Root>
        </div>

        <!-- Recent projects section -->
        <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4">Recent Projects</h2>

            {#if recentProjects.length > 0}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {#each recentProjects as project (project.id)}
                        <Card.Root class="hover:shadow-md transition-shadow cursor-pointer" onclick={() => navigateToProject(project.slug)}>
                            <Card.Header>
                                <Card.Title>{project.name}</Card.Title>
                                <Card.Description class="pb-4">
                                    <span class={project.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                                        {project.status}
                                    </span>
                                </Card.Description>
                            </Card.Header>
                            <Card.Content>
                                <div class="text-sm text-gray-500">
                                    <p>Endpoints: {project.endpoint_count}</p>
                                    <p>Last updated: {new Date(project.updated_at).toLocaleDateString()}</p>
                                </div>
                            </Card.Content>
                            <Card.Footer>
                                <button class="text-sm text-blue-500 hover:text-blue-700">
                                    View Project →
                                </button>
                            </Card.Footer>
                        </Card.Root>
                    {/each}
                </div>
            {:else}
                <div class="bg-gray-100 p-8 text-center rounded-lg">
                    <p class="text-lg text-gray-600">You don't have any projects yet.</p>
                    <p class="text-sm text-gray-500 mt-2">Create your first project from the Projects page.</p>
                </div>
            {/if}
        </div>

        <!-- Analytics Widget -->
        <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4">Project Analytics</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnalyticsWidget title="Top Projects by Endpoints" />

                <Card.Root>
                    <Card.Header>
                        <Card.Title>Endpoints Status</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        <div class="flex items-center justify-center h-full py-6">
                            <div class="relative h-32 w-32">
                                <!-- Simple donut chart -->
                                <svg viewBox="0 0 32 32" class="h-full w-full">
                                    <circle cx="16" cy="16" r="12" fill="none" stroke="#e5e7eb" stroke-width="4" />
                                    <circle
                                            cx="16"
                                            cy="16"
                                            r="12"
                                            fill="none"
                                            stroke="#3b82f6"
                                            stroke-width="4"
                                            stroke-dasharray={75}
                                            stroke-dashoffset={25}
                                            transform="rotate(-90 16 16)"
                                    />
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="text-center">
                                        <span class="text-lg font-bold">{totalEndpoints}</span>
                                        <span class="text-xs block">endpoints</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card.Content>
                </Card.Root>
            </div>
        </div>

        <!-- Activity Feed & Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Activity Feed -->
            <div class="md:col-span-1">
                <ActivityFeed />
            </div>

            <!-- Quick Actions -->
            <div class="md:col-span-2">
                <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card.Root class="hover:shadow-md transition-shadow cursor-pointer" onclick={() => goto('/projects')}>
                        <Card.Header>
                            <Card.Title>Create New Project</Card.Title>
                            <Card.Description class="pb-4">Create a new project to organize your endpoints</Card.Description>
                        </Card.Header>
                    </Card.Root>

                    {#if projectsData.length > 0}
                        <Card.Root class="hover:shadow-md transition-shadow cursor-pointer" onclick={() => navigateToProject(projectsData[0].slug)}>
                            <Card.Header>
                                <Card.Title>Manage Endpoints</Card.Title>
                                <Card.Description class="pb-4">Add or edit endpoints in your projects</Card.Description>
                            </Card.Header>
                        </Card.Root>
                    {:else}
                        <Card.Root class="opacity-60">
                            <Card.Header>
                                <Card.Title>Manage Endpoints</Card.Title>
                                <Card.Description class="pb-4">Create a project first to manage endpoints</Card.Description>
                            </Card.Header>
                        </Card.Root>
                    {/if}

                    <Card.Root class="hover:shadow-md transition-shadow cursor-pointer" onclick={() => goto('/about')}>
                        <Card.Header>
                            <Card.Title>Learn More</Card.Title>
                            <Card.Description class="pb-4">Explore how to use ScrapeScribe effectively</Card.Description>
                        </Card.Header>
                    </Card.Root>

                    <Card.Root class="hover:shadow-md transition-shadow cursor-pointer" onclick={() => goto('/profile')}>
                        <Card.Header>
                            <Card.Title>View Profile</Card.Title>
                            <Card.Description class="pb-4">Manage your account settings</Card.Description>
                        </Card.Header>
                    </Card.Root>
                </div>
            </div>
        </div>
    {/if}
</div>
