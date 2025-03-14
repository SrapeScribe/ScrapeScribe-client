<script lang="ts">
	// =============================================================================
	// Imports
	// =============================================================================

	// Shadcn/svelte
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Select from '$lib/components/ui/select';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	import { toast, Toaster } from 'svelte-sonner';

	// Lucide icons
	import { Braces, CircleMinus, TableProperties, CircleAlert, Copy } from 'lucide-svelte';

	// Svelte actions
	import { derived } from 'svelte/store';

	// Interfaces
	import type { DocumentField, FieldType } from '../../interfaces';

	// Utils
	import { cleanJsonString } from '$lib/utils';

	// =============================================================================
	// Props & Constants
	// =============================================================================

	let {
		content = '',
		titleText = 'Document Editor',
		closeEditor = () => {
		}
	}: {
		content?: string,
		titleText?: string,
		closeEditor?: () => void;
	} = $props();

	const fieldTypeOptions = [
		{ value: 'static', label: 'Static string' },
		{ value: 'scraped-string', label: 'Scraped string' },
		{ value: 'scraped-list', label: 'Scraped list' }
	] as const;

	// =============================================================================
	// State Management
	// =============================================================================

	// Editor refs
	let editorElement = $state<HTMLTextAreaElement | null>(null);
	let overlayElement = $state<HTMLDivElement | null>(null);
	let indentationElement = $state<HTMLDivElement | null>(null);

	// Editor state
	let isFieldView = $state(true);
	let entries = $state<DocumentField[]>([]);
	let jsonError = $state<string | null>(null);
	let highlightedContent = $state('');
	let isValidJson = $state(true);

	// Modal state
	let isModalOpen = $state(false);

	// Derived state
	const lines = $derived(content.split('\n'));
	const numLines = $derived(Math.max(lines.length, 1));

	// =============================================================================
	// Utility Functions
	// =============================================================================

	function hasDuplicateKeys(fields: DocumentField[]): { hasDuplicates: boolean; duplicateKeys: string[] } {
		const keys = fields.map(field => field.key);
		const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
		const uniqueDuplicates = Array.from(new Set(duplicates));
		return {
			hasDuplicates: uniqueDuplicates.length > 0,
			duplicateKeys: uniqueDuplicates
		};
	}

	// =============================================================================
	// Indentation Functions
	// =============================================================================

	function generateIndentationBullets(line: string): string {
		const indentMatch = line.match(/^\s*/);
		const indentLength = indentMatch ? indentMatch[0].length : 0;

		return Array(indentLength)
			.fill('•')
			.map((bullet, index) =>
				`<span class="text-gray-600 opacity-30">${bullet}</span>`
			)
			.join('');
	}

	function generateIndentationGuides(text: string): string {
		return text
			.split('\n')
			.map(line => generateIndentationBullets(line))
			.join('\n');
	}

	// =============================================================================
	// JSON Processing Functions
	// =============================================================================

	function highlightJson(code: string): string {
		if (!code.trim()) {
			return '';
		}

		try {
			const cleanContent = cleanJsonString(code);
			JSON.parse(cleanContent);
			isValidJson = true;

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
				.replace(/,/g, (match) => `<span class="text-gray-400">${match}</span>`);
		} catch (e) {
			isValidJson = false;
			return code
				.replace(
					/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g,
					(match) => `<span class="text-white">${match}</span>`
				)
				.replace(/([{}\[\],])/g, (match) => `<span class="text-gray-400">${match}</span>`);
		}
	}

	// =============================================================================
	// Field Management Functions
	// =============================================================================

	function parseContent() {
		try {
			const cleanContent = content.replace(/,(\s*[}\]])/g, '$1');
			const parsed = JSON.parse(cleanContent || '{}');

			if (typeof parsed !== 'object' || Array.isArray(parsed)) {
				throw new Error('Content must be a valid JSON object');
			}

			const newEntries = Object.entries(parsed).map(([key, value]) => ({
				key,
				value,
				type: 'static' as FieldType
			}));

			const { hasDuplicates, duplicateKeys } = hasDuplicateKeys(newEntries);
			if (hasDuplicates) {
				throw new Error(`Duplicate keys found: ${duplicateKeys.join(', ')}`);
			}

			entries = newEntries;
			jsonError = null;
			highlightedContent = highlightJson(content);
			return true;
		} catch (e) {
			jsonError = e instanceof Error ? e.message : 'Invalid JSON format';
			highlightedContent = highlightJson(content);
			return false;
		}
	}

	function updateContent() {
		try {
			const { hasDuplicates, duplicateKeys } = hasDuplicateKeys(entries);
			if (hasDuplicates) {
				jsonError = `Duplicate keys found: ${duplicateKeys.join(', ')}`;
				return;
			}

			const obj = Object.fromEntries(
				entries.map(field => [field.key, field.value])
			);
			content = JSON.stringify(obj, null, 2);
			jsonError = null;
			highlightedContent = highlightJson(content);
		} catch (e) {
			jsonError = e instanceof Error ? e.message : 'Failed to update JSON';
			highlightedContent = highlightJson(content);
		}
	}

	// =============================================================================
	// Field Operations
	// =============================================================================

	function updateValue(key: string, newValue: string) {
		entries = entries.map(field =>
			field.key === key
				? { ...field, value: newValue }
				: field
		);
		updateContent();
	}

	function updateKey(oldKey: string, newKey: string) {
		const keyExists = entries.some(field => field.key === newKey && field.key !== oldKey);

		if (keyExists) {
			entries = entries.map(field =>
				field.key === oldKey
					? { ...field, error: `Key "${newKey}" already exists` }
					: field
			);
			return false;
		}

		entries = entries.map(field =>
			field.key === oldKey
				? { ...field, key: newKey, error: undefined }
				: field
		);

		updateContent();
		return true;
	}

	function updateFieldType(key: string, type: FieldType) {
		entries = entries.map(field =>
			field.key === key
				? { ...field, type }
				: field
		);
	}

	function deleteField(keyToDelete: string) {
		entries = entries.filter(field => field.key !== keyToDelete);
		updateContent();
	}

	function addField() {
		let index = entries.length + 1;
		let newKey = `field_${index}`;

		while (entries.some(field => field.key === newKey)) {
			index++;
			newKey = `field_${index}`;
		}

		entries = [...entries, {
			key: newKey,
			value: '',
			type: 'static'
		}];
		updateContent();
	}

	// =============================================================================
	// Event Handlers
	// =============================================================================

	function handleClose() {
		closeEditor();
	}

	function handleScroll(e: Event) {
		if (overlayElement && indentationElement && editorElement && e.target === editorElement) {
			overlayElement.scrollTop = editorElement.scrollTop;
			overlayElement.scrollLeft = editorElement.scrollLeft;
			indentationElement.scrollTop = editorElement.scrollTop;
		}
	}

	function findFieldBoundaries(text: string, position: number): { start: number; end: number } | null {
		const lines = text.split('\n');
		let currentPos = 0;
		let currentLine = 0;

		while (currentLine < lines.length && currentPos + lines[currentLine].length + 1 <= position) {
			currentPos += lines[currentLine].length + 1;
			currentLine++;
		}

		if (currentLine >= lines.length) return null;

		const line = lines[currentLine];
		const posInLine = position - currentPos;

		const specialCharPos = line.slice(Math.max(0, posInLine - 1), posInLine + 1);
		if (specialCharPos.match(/[{}\[\],:]/)) {
			return null;
		}

		const keyValuePattern = /"([^"]*)":\s*("[^"]*"|[\d.]+|true|false|null|\{|\[)/g;
		let match;

		while ((match = keyValuePattern.exec(line)) !== null) {
			const fullMatch = match[0];
			const startInLine = match.index;
			const endInLine = startInLine + fullMatch.length;

			if (match[1] && posInLine > match.index + 1 && posInLine < match.index + match[1].length + 1) {
				return {
					start: currentPos + startInLine + 1,
					end: currentPos + startInLine + match[1].length + 1
				};
			}

			const valueStart = line.indexOf(match[2], startInLine + match[1].length + 2);
			if (valueStart >= 0) {
				const valueContent = match[2].replace(/^"|"$/g, '');
				const contentStart = valueStart + (match[2].startsWith('"') ? 1 : 0);

				if (posInLine > contentStart && posInLine < contentStart + valueContent.length) {
					return {
						start: currentPos + contentStart,
						end: currentPos + contentStart + valueContent.length
					};
				}
			}
		}

		return null;
	}

	function handleClick(e: MouseEvent) {
		if (!editorElement) return;

		const cursorPosition = editorElement.selectionStart;
		const boundaries = findFieldBoundaries(content, cursorPosition);

		if (boundaries) {
			editorElement.setSelectionRange(boundaries.start, boundaries.end);
			e.preventDefault();
		}
	}

	function handleInputClick(e: MouseEvent) {
		if (!(e.target instanceof HTMLInputElement)) return;

		const input = e.target;
		const rect = input.getBoundingClientRect();
		const clickX = e.clientX - rect.left;

		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context) return;

		const computedStyle = window.getComputedStyle(input);
		context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
		const textWidth = context.measureText(input.value).width;

		const textAreaWithPadding = textWidth + 32;

		if (clickX > textAreaWithPadding) {
			input.select();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!(e.target instanceof HTMLTextAreaElement)) return;

		const target = e.target;
		const cursorPosition = target.selectionStart;
		const selectionEnd = target.selectionEnd;

		if (e.key === 'Tab') {
			e.preventDefault();

			if (cursorPosition !== selectionEnd) {
				const selectedText = content.slice(cursorPosition, selectionEnd);
				if (selectedText.includes('\n')) {
					const lines = content.split('\n');
					let startLine = content.slice(0, cursorPosition).split('\n').length - 1;
					let endLine = content.slice(0, selectionEnd).split('\n').length - 1;

					if (!e.shiftKey) {
						lines.splice(startLine, endLine - startLine + 1,
							...lines.slice(startLine, endLine + 1).map(line => '  ' + line)
						);
					} else {
						lines.splice(startLine, endLine - startLine + 1,
							...lines.slice(startLine, endLine + 1).map(line =>
								line.startsWith('  ') ? line.slice(2) : line
							)
						);
					}

					const newContent = lines.join('\n');
					const newCursorPosition = cursorPosition + 2;
					content = newContent;

					requestAnimationFrame(() => {
						target.selectionStart = cursorPosition;
						target.selectionEnd = selectionEnd + (newContent.length - content.length);
					});
				} else {
					const newContent =
						content.slice(0, cursorPosition) +
						'  ' +
						content.slice(selectionEnd);

					content = newContent;

					requestAnimationFrame(() => {
						target.selectionStart = target.selectionEnd = cursorPosition + 2;
					});
				}
			} else {
				const newContent =
					content.slice(0, cursorPosition) +
					'  ' +
					content.slice(cursorPosition);

				content = newContent;

				requestAnimationFrame(() => {
					target.selectionStart = target.selectionEnd = cursorPosition + 2;
				});
			}

			parseContent();
			return;
		}

		if (e.key === 'Enter') {
			const beforeCursor = content.slice(0, cursorPosition);
			const afterCursor = content.slice(cursorPosition);
			const lines = beforeCursor.split('\n');
			let lastNonEmptyLine = '';

			for (let i = lines.length - 1; i >= 0; i--) {
				if (lines[i].trim()) {
					lastNonEmptyLine = lines[i];
					break;
				}
			}

			const baseIndent = lastNonEmptyLine.match(/^\s*/)?.at(0) ?? '';
			if (lastNonEmptyLine.trim() === '{' && afterCursor.trim().startsWith('}')) {
				e.preventDefault();
				const newContent =
					beforeCursor +
					'\n' + baseIndent + '  ' +
					'\n' + baseIndent + afterCursor;

				content = newContent;

				const newCursorPosition = beforeCursor.length + baseIndent.length + 3;
				requestAnimationFrame(() => {
					target.selectionStart = target.selectionEnd = newCursorPosition;
				});
			} else {
				e.preventDefault();
				const newContent = beforeCursor + '\n' + baseIndent;
				content = newContent + afterCursor;

				const newCursorPosition = beforeCursor.length + baseIndent.length + 1;
				requestAnimationFrame(() => {
					target.selectionStart = target.selectionEnd = newCursorPosition;
				});
			}
		}

		parseContent();
	}

	// =============================================================================
	// Effects
	// =============================================================================

	$effect(() => {
		if (content) {
			parseContent();
		}
	});

</script>

<Card.Root class="w-full">
	<Card.Header class={`flex flex-row justify-between items-center ${entries.length ? "mb-4" : ""}`}>
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
				<div class="relative bg-gray-800 text-white rounded-lg p-3 font-mono">
					<div class="absolute left-0 top-0 p-3 text-gray-500 select-none">
						{#each Array(numLines) as _, lineNum}
							<div>{lineNum + 1}</div>
						{/each}
					</div>
					<!-- In the template, adjust the padding values -->
					<div class="relative ml-8">
						<!-- Indentation Bullets -->
						<div
							bind:this={indentationElement}
							class="absolute top-0 left-0 w-full h-full pointer-events-none whitespace-pre pl-3"
						>{@html generateIndentationGuides(content)}</div>
						<!-- Syntax Highlighted Overlay -->
						<div
							bind:this={overlayElement}
							class="absolute top-0 left-0 w-full h-full pointer-events-none whitespace-pre pl-3"
						>{@html highlightedContent}</div>
						<!-- Actual Editor -->
						<textarea
							bind:this={editorElement}
							bind:value={content}
							onscroll={handleScroll}
							oninput={parseContent}
							onkeydown={handleKeyDown}
							onclick={handleClick}
							class="w-full text-sm bg-transparent outline-none resize-none relative min-h-[100px] pl-3"
							class:text-transparent={isValidJson}
							class:text-white={!isValidJson}
							rows={numLines}
							placeholder="Enter JSON content here..."
							style="caret-color: white;"
							spellcheck="false"
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
				<!-- Fields View -->
				<!-- Show only if there are no JSON parsing errors-->
				<div class="space-y-4">
					<div class={entries.length ? `grid gap-4 pb-4 border-b border-gray-200 md:px-4` : ""}>
						{#each entries as field}
							<div class="flex items-center gap-2">
								<div class="basis-1/2">
									<Label class="text-gray-600" for={field.key + "_field"}>Key</Label>
									<Input
										type="text"
										value={field.key}
										id={field.key + "_field"}
										class=""
										onclick={handleInputClick}
										onchange={(e: Event) => {
          const target = e.target as HTMLInputElement;
          updateKey(field.key, target.value);
        }}
									/>
								</div>
								<!--Static string-->
								{#if field.type === 'static'}
									<div class="basis-1/4 flex flex-col">
										<Label class="text-gray-600 mb-1" for={field.key + "_static_value"}>Value</Label>
										<Input
											type="text"
											value={field.value}
											id={field.key + "_static_value"}
											class=""
											onclick={handleInputClick}
											onchange={(e: Event) => {
              const target = e.target as HTMLInputElement;
              updateValue(field.key, target.value);
            }}
										/>
									</div>
									<!--Modal window with sraping content selection -->
								{:else}
									<div class="basis-1/4 flex flex-col">
										<Label class="text-gray-600 mb-1" for={field.key + "_value"}>
											Value
										</Label>
										<Dialog.Root>
											<Dialog.Trigger id={field.key + "_value"}>
												<Button class="h-[40px] w-full font-bold" variant="outline">Select
												</Button>
											</Dialog.Trigger>
											<Dialog.Content class="max-w-3xl">
												<Dialog.Header>
													<Dialog.Title>Select content to scrape</Dialog.Title>
													<Dialog.Description>
														Use box selection for scraping content
													</Dialog.Description>
												</Dialog.Header>
												<span class="py-72 text-center">Content</span>
												<Dialog.Footer>
                                                    <Button onclick={() => {
															setTimeout(() => {
																isModalOpen = false
																setTimeout(() => {
																	toast.success("Successfully scraped");
																}, 300);
															}, 100);

														}}>
                                                        Save
                                                    </Button>
												</Dialog.Footer>
											</Dialog.Content>
										</Dialog.Root>
									</div>
								{/if}
								<div class="basis-1/4 flex flex-col">
									<Label class="text-gray-600 mb-1" for={field.key + "_type"}>
										Type
									</Label>
									<Select.Root
										type="single"
										id={field.key + "_type"}
										value={field.type}
										required
										onValueChange={(value: FieldType) => updateFieldType(field.key, value)}
									>
										<Select.Trigger class="h-[40px] w-full" id={field.key + "_type"}>
											{fieldTypeOptions.find(option => option.value === field.type)?.label ?? 'Select Type'}
										</Select.Trigger>
										<Select.Content>
											{#each fieldTypeOptions as option}
												<Select.Item value={option.value}>{option.label}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</div>

								<Button
									variant="ghost"
									size="icon"
									onclick={() => deleteField(field.key)}
									class="text-red-500 hover:text-red-700 mt-5"
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
				setTimeout(() => {
					handleClose();
					setTimeout(() => {
						toast.success("Successfully saved the document");
					}, 300);
				}, 100);

			}}>
				Save
			</Button>
		</div>
	</Card.Content>
</Card.Root>
