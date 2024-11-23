<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { derived } from 'svelte/store';
	import { Braces, CircleMinus, TableProperties, CircleAlert } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';

	let { content = '', titleText = 'Document Editor' }: { content?: string, titleText?: string } = $props();

	// Ensure we have at least one line for the editor
	const lines = $derived(content.split('\n'));
	const numLines = $derived(Math.max(lines.length, 1));

	let isFieldView = $state(true);
	let entries = $state<[string, any][]>([]);

	function parseContent() {
		try {
			const parsed = JSON.parse(content || '{}');
			entries = Object.entries(parsed);
			return true;
		} catch (e) {
			console.error('Invalid JSON');
			return false;
		}
	}

	function updateValue(key: string, newValue: string) {
		entries = entries.map(([k, v]) =>
			k === key ? [k, newValue] : [k, v]
		);
		updateContent();
	}

	function updateKey(oldKey: string, newKey: string) {
		entries = entries.map(([k, v]) =>
			k === oldKey ? [newKey, v] : [k, v]
		);
		updateContent();
	}


	function deleteField(keyToDelete: string) {
		entries = entries.filter(([k]) => k !== keyToDelete);
		updateContent();
	}

	function addField() {
		const newKey = `field_${entries.length + 1}`;
		entries = [...entries, [newKey, '']];
		updateContent();
	}

	function updateContent() {
		// Parse the entries back to JSON
		content = JSON.stringify(Object.fromEntries(entries), null, 2);
	}

	// initial parse
	$effect(() => {
		if (content) {
			parseContent();
		}
	});
</script>

<Card.Root class="w-full">
	<Card.Header class="flex flex-row justify-between items-center">
		<Card.Title>{titleText}</Card.Title>
		<div class="flex items-center gap-3">
			<span class="text-sm">VIEW</span>
			<Button
				variant="outline"
				size="icon"
				onclick={() => isFieldView = !isFieldView}
			>
				{#if !isFieldView}
					<Braces />
				{:else}
					<TableProperties />
				{/if}
			</Button>
		</div>
	</Card.Header>
	<Card.Content>
		{#if !isFieldView}
			<!-- JSON View -->
			<div class="relative bg-gray-800 text-white rounded-lg p-4 font-mono">
				<div class="absolute left-0 top-0 p-4 text-gray-500 select-none">
					{#each Array(numLines) as _, lineNum}
						<div>{lineNum + 1}</div>
					{/each}
				</div>
				<div class="ml-8">
          <textarea
						class="w-full bg-transparent outline-none resize-none"
						rows={numLines}
						bind:value={content}
						placeholder="Enter JSON content here..."
						onchange={parseContent}
					></textarea>
				</div>
			</div>
		{:else}
			<!-- Fields View -->
			<div class="space-y-4">
				<div class="grid gap-4">
					{#each entries as [key, value]}
						<div class="flex items-center gap-2">
							<Input
								type="text"
								value={key}
								class="flex-1"
								onchange={(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updateKey(key, target.value);
                }}
							/>
							<Input
								type="text"
								value={value}
								class="flex-1"
								onchange={(e: Event) => {
                  const target = e.target as HTMLInputElement;
                  updateValue(key, target.value);
                }}
							/>
							<Button
								variant="ghost"
								size="icon"
								onclick={() => deleteField(key)}
								class="text-red-500 hover:text-red-700"
							>
								<CircleMinus />
							</Button>
						</div>
					{/each}
				</div>
				<!-- Add New Field Button -->
				<Button
					variant="outline"
					onclick={addField}
				>
					Add Field
				</Button>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

<!-- Save Button -->
<div class="flex justify-end mt-4">
	<Button onclick={() => {
    console.log('Saving:', content);
  }}>
		Save
	</Button>
</div>
