<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button } from '$lib/components/ui/button';
	import { derived } from 'svelte/store';
	import { Braces, CircleMinus, TableProperties, CircleAlert } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';

	let {
		content = '', titleText = 'Document Editor', closeEditor = () => {
		}
	}: { content?: string, titleText?: string, closeEditor?: () => void; } = $props();

	// Ensure we have at least one line for the editor
	const lines = $derived(content.split('\n'));
	const numLines = $derived(Math.max(lines.length, 1));

	let jsonError = $state<string | null>(null);

	let isFieldView = $state(true);
	let entries = $state<[string, any][]>([]);

	function handleClose() {
		closeEditor();
	}


	function parseContent() {
		try {
			// First validate JSON structure
			const parsed = JSON.parse(content || '{}');

			// Additional validation check if it's an object
			if (typeof parsed !== 'object' || Array.isArray(parsed)) {
				throw new Error('Content must be a valid JSON object');
			}

			entries = Object.entries(parsed);
			jsonError = null;
			return true;
		} catch (e) {
			jsonError = e instanceof Error ? e.message : 'Invalid JSON format';
			entries = [];
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
		try {
			content = JSON.stringify(Object.fromEntries(entries), null, 2);
			jsonError = null;
		} catch (e) {
			jsonError = e instanceof Error ? e.message : 'Failed to update JSON';
		}
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
					<TableProperties />
				{:else}
					<Braces />
				{/if}
			</Button>
		</div>
	</Card.Header>
	<Card.Content>
		{#if !isFieldView}
			<!-- JSON View -->
			<div class="space-y-4">
				<div class="relative bg-gray-800 text-white rounded-lg p-4 font-mono">
					<div class="absolute left-0 top-0 p-4 text-gray-500 select-none">
						{#each Array(numLines) as _, lineNum}
							<div>{lineNum + 1}</div>
						{/each}
					</div>
					<div class="ml-8">
            <textarea
							class="w-full text-sm bg-transparent outline-none resize-none"
							rows={numLines}
							bind:value={content}
							placeholder="Enter JSON content here..."
							onchange={parseContent}
						></textarea>
					</div>
				</div>

				{#if jsonError}
					<Alert.Root variant="destructive">
						<CircleAlert class="size-4" />
						<Alert.Title>Invalid JSON</Alert.Title>
						<Alert.Description>{jsonError}</Alert.Description>
					</Alert.Root>
				{:else}
					<!-- Add New Field Button -->
					<Button
						variant="outline"
						onclick={addField}
					>
						Add Field
					</Button>

				{/if}
			</div>
		{:else}
			{#if !jsonError}
				<!-- Fields View - Only show if no JSON errors -->
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
			{:else}
				<Alert.Root variant="destructive">
					<CircleAlert class="size-4" />
					<Alert.Title>Unable to parse the fields</Alert.Title>
					<Alert.Description>Please ensure the file doesn't have any syntax errors</Alert.Description>
				</Alert.Root>
			{/if}
		{/if}
		<!-- Save Button -->
		<div class="flex space-x-1.5 justify-end mt-4">
			<Button
				variant="secondary"
				onclick={handleClose}
			>
				Cancel
			</Button>
			<Button onclick={() => {
    console.log('Saving:', content);
  }}>
				Save
			</Button>
		</div>
	</Card.Content>

</Card.Root>


