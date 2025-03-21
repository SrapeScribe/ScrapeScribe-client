<script lang="ts">
    import { onMount } from 'svelte';
    import * as Card from '$lib/components/ui/card';
    import { projectStore } from "$lib/states/project.svelte";
    import { getTimeAgo } from '$lib/utils';
    import type { ProjectWithEndpointCount } from '$lib/interfaces';

    // Activity item interface
    interface ActivityItem {
        id: string;
        type: 'project_update' | 'endpoint_update';
        projectName: string;
        projectSlug: string;
        timestamp: Date;
        description: string;
    }

    // Component state
    let activityItems = $state<ActivityItem[]>([]);
    let isLoading = $state(true);

    // Derived data from store
    const projectsData = $derived(projectStore.projects);

    // Generate dummy activity data based on real projects
    function generateActivityData(projects: ProjectWithEndpointCount[]): ActivityItem[] {
        if (!projects.length) return [];

        // Sort projects by updated date, newest first (create new array to avoid mutation)
        const sortedProjects = [...projects].sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        // Generate activity items based on real projects
        return sortedProjects.slice(0, 5).map((project, index) => {
            const isEndpointUpdate = index % 2 === 0 && project.endpoint_count > 0;

            return {
                id: `activity-${project.id}-${index}`,
                type: isEndpointUpdate ? 'endpoint_update' : 'project_update',
                projectName: project.name,
                projectSlug: project.slug,
                timestamp: new Date(project.updated_at),
                description: isEndpointUpdate
                    ? `Endpoint updated in project "${project.name}"`
                    : `Project "${project.name}" was updated`
            };
        });
    }

    onMount(() => {
        if (projectsData.length > 0) {
            activityItems = generateActivityData(projectsData);
        }
        isLoading = false;
    });

    // Update when project data changes
    $effect(() => {
        if (projectsData.length > 0) {
            activityItems = generateActivityData(projectsData);
        }
    });

    // Reactive time ago display
    function getTimeAgoDisplay(date: Date): string {
        return getTimeAgo(date);
    }
</script>

<Card.Root class="h-full">
    <Card.Header>
        <Card.Title>Recent Activity</Card.Title>
    </Card.Header>
    <Card.Content>
        {#if isLoading}
            <div class="flex justify-center items-center h-40">
                <div class="text-gray-500">Loading activity...</div>
            </div>
        {:else if activityItems.length === 0}
            <div class="text-center text-gray-500 py-10">
                No recent activity
            </div>
        {:else}
            <div class="space-y-4">
                {#each activityItems as item}
                    <div class="flex gap-3">
                        <div class="flex-shrink-0 w-2">
                            <div class={`h-2 w-2 rounded-full mt-2 ${item.type === 'project_update' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        </div>
                        <div class="flex-grow">
                            <p class="text-sm">{item.description}</p>
                            <p class="text-xs text-gray-500">{getTimeAgoDisplay(item.timestamp)}</p>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </Card.Content>
</Card.Root>
