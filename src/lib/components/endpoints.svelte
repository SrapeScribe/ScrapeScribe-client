<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';
	import DocumentEditor from '$lib/components/document-editor.svelte';
	import { slide } from 'svelte/transition';
	import { METHOD_STYLES } from '../../constants';
	import type { Endpoint } from '../../interfaces';
	import { cn } from '$lib/utils.js';

	let {
		endpoints = [],
		class: className = '',
		...restProps
	}: {
		endpoints: Endpoint[],
		class?: string
	} = $props();

	let contents = endpoints.map(endpoint => JSON.stringify(endpoint.body, null, 2));
	console.log('contents', contents);
	let accordionValues = $state<string[]>([]);

	function handleEditorClose(index: number) {
		accordionValues = accordionValues.filter(v => v !== `item-${index}`);
	}
</script>

<div class={cn("mx-auto space-y-4 p-4", className)} {...restProps}>
	{#each endpoints as endpoint, i}
		<Accordion.Root
			type="multiple"
			value={accordionValues}
			onValueChange={(value) => {
        accordionValues = value;
      }}
		>
			<Accordion.Item class="border-0" value="item-{i}">
				<Accordion.Trigger class="group w-full bg-slate-100 hover:bg-slate-200 p-4 rounded-lg hover:no-underline">
          <span class="flex items-center gap-2">
            <span class={`px-2 py-1 rounded text-sm font-mono ${METHOD_STYLES[endpoint.method]}`}>
              {endpoint.method}
            </span>
            <span class="group-hover:underline">{endpoint.url}</span>
          </span>
				</Accordion.Trigger>
				<!--Force Mount to enable transitions-->
				<Accordion.Content class="pt-4" forceMount={true}>
					{#snippet child({ props, open, close })}
					{#if open}
						<div {...props} transition:slide={{ duration: 200 }}>
							<DocumentEditor
								content={contents[i]}
								closeEditor={() => handleEditorClose(i)}
							/>
						</div>
					{/if}
					{/snippet}
				</Accordion.Content>
			</Accordion.Item>

		</Accordion.Root>
	{/each}
</div>
