<script lang="ts">
    import { onMount } from 'svelte';
    import * as Card from '$lib/components/ui/card';
    import { projectStore } from "$lib/states/project.svelte";
    import type { ProjectWithEndpointCount } from '$lib/interfaces';

    // Component props
    let { title = 'Project Activity' } = $props<{
        title?: string;
    }>();

    // Reactive state
    let chartData = $state<{ name: string; count: number }[]>([]);
    let isLoading = $state(true);

    // Derived from store data
    const projectsData = $derived(projectStore.projects);

    onMount(() => {
        if (projectsData.length > 0) {
            prepareChartData(projectsData);
        }
        isLoading = false;
    });

    // Prepare data for visualization
    function prepareChartData(projects: ProjectWithEndpointCount[]) {
        if (projects.length === 0) {
            chartData = [];
            return;
        }

        // Sort projects by endpoint count - create a new array to avoid mutation
        const sortedProjects = [...projects]
            .sort((a, b) => b.endpoint_count - a.endpoint_count)
            .slice(0, 5); // Take top 5

        // Format for chart display
        chartData = sortedProjects.map(project => ({
            name: project.name,
            count: project.endpoint_count
        }));
    }

    // Watch for changes in project data
    $effect(() => {
        if (projectsData.length > 0) {
            prepareChartData(projectsData);
        }
    });
</script>

<Card.Root class="h-full">
    <Card.Header>
        <Card.Title>{title}</Card.Title>
    </Card.Header>
    <Card.Content>
        {#if isLoading}
            <div class="flex justify-center items-center h-40">
                <div class="text-gray-500">Loading data...</div>
            </div>
        {:else if chartData.length === 0}
            <div class="text-center text-gray-500 py-10">
                No project data available
            </div>
        {:else}
            <div class="space-y-4">
                {#each chartData as item}
                    <div>
                        <div class="flex justify-between text-sm">
                            <span class="truncate max-w-[180px]" title={item.name}>{item.name}</span>
                            <span class="font-medium">{item.count} endpoint{item.count !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="mt-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <!-- Calculate width percentage based on the max count in the data -->
                            <div
                                    class="h-full bg-blue-500 rounded-full"
                                    style="width: {(item.count / Math.max(...chartData.map(d => d.count)) * 100)}%"
                            ></div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </Card.Content>
</Card.Root>
