<script lang="ts">
    import { onMount } from 'svelte';
    import { useSidebar } from "$lib/components/ui/sidebar/index.js";
    import { savedState, saveState } from '$lib/states/sidebar.svelte';

    const sidebar = useSidebar();

    // Track state changes to persist them
    $effect(() => {
        const currentState = {
            isOpen: sidebar.open,
            isCollapsed: sidebar.state === 'collapsed'
        };

        saveState(currentState);
    });

    // Apply saved state on mount
    onMount(() => {
        // Don't override mobile state to avoid UI issues
        if (!sidebar.isMobile) {
            if (savedState.isCollapsed) {
                // Only change state if it doesn't match
                if (sidebar.state !== 'collapsed') {
                    sidebar.toggle();
                }
            } else if (sidebar.state === 'collapsed') {
                sidebar.toggle();
            }

            // Set open state
            sidebar.setOpen(savedState.isOpen);
        }
    });
</script>
