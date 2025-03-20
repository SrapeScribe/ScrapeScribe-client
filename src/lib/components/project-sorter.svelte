<script lang="ts">
    import type {ProjectWithEndpointCount} from "$lib/interfaces"
    import * as Select from "$lib/components/ui/select"
    import {ArrowDownUp} from "lucide-svelte"

    type SortDirection = "asc" | "desc";
    type SortOption = {
        value: string;
        label: string;
        sortFn: (a: ProjectWithEndpointCount, b: ProjectWithEndpointCount, direction: SortDirection) => number;
    };

    let {
        projects = $bindable<ProjectWithEndpointCount[]>([]),
        sortField = $bindable<string>("updated_at"),
        sortDirection = $bindable<SortDirection>("desc"),
        children
    } = $props()

    // Define sort functions for each field
    const sortOptions: SortOption[] = [
        {
            value: "name",
            label: "Name",
            sortFn: (a, b, direction) => {
                const modifier = direction === "asc" ? 1 : -1
                return modifier * a.name.localeCompare(b.name)
            }
        },
        {
            value: "updated_at",
            label: "Last Updated",
            sortFn: (a, b, direction) => {
                const modifier = direction === "asc" ? 1 : -1
                return modifier * (new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            }
        },
        {
            value: "created_at",
            label: "Creation Date",
            sortFn: (a, b, direction) => {
                const modifier = direction === "asc" ? 1 : -1
                return modifier * (new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            }
        },
        {
            value: "endpoint_count",
            label: "Endpoint Count",
            sortFn: (a, b, direction) => {
                const modifier = direction === "asc" ? 1 : -1
                return modifier * (b.endpoint_count - a.endpoint_count)
            }
        },
        {
            value: "status",
            label: "Status",
            sortFn: (a, b, direction) => {
                const modifier = direction === "asc" ? 1 : -1
                return modifier * a.status.localeCompare(b.status)
            }
        }
    ]

    // Get the current sort option
    function getCurrentSortOption(): SortOption {
        return sortOptions.find(option => option.value === sortField) || sortOptions[0]
    }

    // Toggle sort direction
    function toggleSortDirection() {
        sortDirection = sortDirection === "asc" ? "desc" : "asc"
    }

    // Apply sorting to projects
    function applySorting() {
        const sortOption = getCurrentSortOption()
        //@ts-ignore shut up ts - I know what I'm doing
        return [...projects].sort((a, b) => sortOption.sortFn(a, b, sortDirection))
    }

    // Computed property for sorted projects
    const sortedProjects = $derived(applySorting())
</script>

<div class="flex items-center gap-3 mb-4">
    <span class="text-sm text-gray-500">Sort by:</span>

    <Select.Root
            type="single"
            value={sortField}
            onValueChange={(value) => sortField = value}
    >
        <Select.Trigger class="h-9 gap-1 w-[180px]">
            <span>{getCurrentSortOption().label}</span>
        </Select.Trigger>
        <Select.Content>
            {#each sortOptions as option}
                <Select.Item value={option.value}>{option.label}</Select.Item>
            {/each}
        </Select.Content>
    </Select.Root>

    <button
            class="flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            title={sortDirection === "asc" ? "Switch to descending" : "Switch to ascending"}
            onclick={toggleSortDirection}
    >
        <ArrowDownUp class={`h-4 w-4 ${sortDirection === "desc" ? "transform rotate-180" : ""}`}/>
        <span class="sr-only">Toggle sort direction</span>
    </button>
</div>

{@render children?.({sortedProjects})}
