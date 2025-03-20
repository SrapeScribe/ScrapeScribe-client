<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Button } from "$lib/components/ui/button";
    import { MousePointer, Hand } from 'lucide-svelte';

    let {
        currentTool = $bindable<'select' | 'click'>('select')
    } = $props();

    const dispatch = createEventDispatcher<{
        toolChange: { tool: 'select' | 'click' }
    }>();

    function selectTool(tool: 'select' | 'click') {
        currentTool = tool;
        dispatch('toolChange', { tool });
    }
</script>

<div class="flex gap-2 mb-4 p-2 bg-slate-100 rounded-md">
    <Button
            variant={currentTool === 'select' ? "default" : "outline"}
            size="sm"
            onclick={() => selectTool('select')}
            title="Select elements for scraping"
            class="flex items-center gap-2"
    >
        <MousePointer class="size-4" />
        <span>Select</span>
    </Button>

    <Button
            variant={currentTool === 'click' ? "default" : "outline"}
            size="sm"
            onclick={() => selectTool('click')}
            title="Interact with the page (close banners, navigate)"
            class="flex items-center gap-2"
    >
        <Hand class="size-4" />
        <span>Interact</span>
    </Button>
</div>
