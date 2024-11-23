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

	// Editor refs
	let editorElement: HTMLTextAreaElement;
	let overlayElement: HTMLDivElement;

	let isFieldView = $state(true);
	let entries = $state<[string, any][]>([]);
	let jsonError = $state<string | null>(null);
	let highlightedContent = $state('');
	let isValidJson = $state(true);

	function handleClose() {
		closeEditor();
	}

	// Handle scroll sync between editor and overlay
	function handleScroll(e: Event) {
		if (overlayElement && e.target === editorElement) {
			overlayElement.scrollTop = editorElement.scrollTop;
			overlayElement.scrollLeft = editorElement.scrollLeft;
		}
	}

	// Syntax highlighting function
	function highlightJson(code: string): string {
		if (!code.trim()) {
			return '';
		}

		try {
			// Try to parse with cleaned JSON
			const cleanContent = code.replace(/,(\s*[}\]])/g, '$1');
			JSON.parse(cleanContent);
			isValidJson = true;

			// Always highlight the original code, not the cleaned version
			return code
				.replace(
					/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
					(match) => {
						let cls = 'text-blue-400'; // numbers
						if (/^"/.test(match)) {
							if (/:$/.test(match)) {
								cls = 'text-purple-400'; // key
							} else {
								cls = 'text-green-400'; // string
							}
						} else if (/true|false/.test(match)) {
							cls = 'text-yellow-400'; // boolean
						} else if (/null/.test(match)) {
							cls = 'text-red-400'; // null
						}
						return `<span class="${cls}">${match}</span>`;
					}
				)
				.replace(/[{}\[\]]/g, (match) => `<span class="text-gray-400">${match}</span>`)
				.replace(/,/g, (match) => `<span class="text-gray-400">${match}</span>`); // Highlight all commas
		} catch (e) {
			isValidJson = false;
			// Process invalid JSON to still show some basic highlighting
			return code
				.replace(
					/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g,
					(match) => `<span class="text-white">${match}</span>`
				)
				.replace(/([{}\[\],])/g, (match) => `<span class="text-gray-400">${match}</span>`); // Always highlight structural characters
		}
	}

	function cleanJsonString(str: string): string {
		// Remove trailing commas
		return str.replace(/,(\s*[}\]])/g, '$1');
	}

	function parseContent() {
		try {
			const cleanContent = content.replace(/,(\s*[}\]])/g, '$1');
			const parsed = JSON.parse(cleanContent || '{}');

			if (typeof parsed !== 'object' || Array.isArray(parsed)) {
				throw new Error('Content must be a valid JSON object');
			}

			entries = Object.entries(parsed);
			jsonError = null;
			highlightedContent = highlightJson(content); // Use original content for highlighting
			return true;
		} catch (e) {
			jsonError = e instanceof Error ? e.message : 'Invalid JSON format';
			entries = [];
			highlightedContent = highlightJson(content);
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
			highlightedContent = highlightJson(content);
		} catch (e) {
			jsonError = e instanceof Error ? e.message : 'Failed to update JSON';
			highlightedContent = highlightJson(content);
		}
	}


	// initial parse
	$effect(() => {
		if (content) {
			parseContent();
		}
	});

	// Ensure we have at least one line for the editor
	const lines = $derived(content.split('\n'));
	const numLines = $derived(Math.max(lines.length, 1));
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
					<div class="relative ml-8">
						<!-- Syntax Highlighted Overlay -->
						<div
							bind:this={overlayElement}
							class="absolute top-0 left-0 w-full h-full pointer-events-none whitespace-pre"
						>{@html highlightedContent}</div
						>
						<!-- Actual Editor -->
						<textarea
							bind:this={editorElement}
							bind:value={content}
							on:scroll={handleScroll}
							on:input={parseContent}
							class="w-full text-sm bg-transparent outline-none resize-none relative min-h-[200px]"
							class:text-transparent={isValidJson}
							class:text-white={!isValidJson}
							rows={numLines}
							placeholder="Enter JSON content here..."
							style="caret-color: white;"></textarea>
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


