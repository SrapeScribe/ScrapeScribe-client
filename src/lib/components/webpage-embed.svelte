<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';

	export let pageContent: string;
	export let stylesheets: Array<{ url: string, content: string }>;

	const dispatch = createEventDispatcher();
	let iframe: HTMLIFrameElement;
	let selectedElements: Set<HTMLElement> = new Set();
	let hoveredElement: HTMLElement | null = null;
	let iframeDoc: Document | null = null;

	onMount(() => {
		if (iframe) {
			iframeDoc = iframe.contentDocument;
			if (iframeDoc) {
				iframeDoc.open();
				iframeDoc.write(pageContent);
				iframeDoc.close();

				// Apply stylesheets
				stylesheets.forEach(stylesheet => {
					const style = iframeDoc!.createElement('style');
					style.textContent = stylesheet.content;
					iframeDoc!.head.appendChild(style);
				});

				// Add selection style
				const selectionStyle = iframeDoc.createElement('style');
				selectionStyle.textContent = `
          .web-scraper-selected {
            outline: red dashed 2px !important;
          }
          .web-scraper-hovered {
						outline: blue solid 2px !important;
					}
        `;
				iframeDoc.head.appendChild(selectionStyle);

				// Add event listeners
				iframeDoc.addEventListener('mouseover', handleMouseOver, true);
				iframeDoc.addEventListener('mouseout', handleMouseOut, true);
				iframeDoc.addEventListener('click', handleClick, true);

				console.log('Iframe content loaded and event listeners added');
			} else {
				console.error('Failed to access iframe document');
			}
		} else {
			console.error('Iframe element not found');
		}
	});

	onDestroy(() => {
		if (iframeDoc) {
			iframeDoc.removeEventListener('mouseover', handleMouseOver, true);
			iframeDoc.removeEventListener('mouseout', handleMouseOut, true);
			iframeDoc.removeEventListener('click', handleClick, true);
			console.log('Event listeners removed');
		}
	});

	function handleMouseOver(event: MouseEvent) {
		if (!iframeDoc) return;
		const target = event.target as HTMLElement;

		if (target  && target.tagName !== 'HTML' && target.tagName !== 'BODY') {
			if (hoveredElement && selectedElements.has(hoveredElement)) {
				removeHighlight(hoveredElement);
			}
			if (!selectedElements.has(target)) {
				highlightElement(target);
			}
			hoveredElement = target;
			dispatch('elementHover', { element: target });
		}
		event.stopPropagation();
	}

	function handleMouseOut(event: MouseEvent) {
		if (!iframeDoc) return;
		const target = event.target as HTMLElement;
		if (target === hoveredElement && !selectedElements.has(target)) {
			removeHighlight(target);
		}
		event.stopPropagation();
	}

	function handleClick(event: MouseEvent) {
		if (!iframeDoc) return;
		event.preventDefault();
		event.stopPropagation();
		const target = event.target as HTMLElement;

		if (target && target.tagName !== 'HTML' && target.tagName !== 'BODY') {
			if (selectedElements.has(target)) {
				deselectElement(target);
			} else {
				selectElement(target);
			}
			dispatch('selectionChange', { selectedElements: Array.from(selectedElements) });
		}
	}

	function highlightElement(element: HTMLElement): void {
		element.classList.add('web-scraper-hovered');
		hoveredElement = element;
	}

	function removeHighlight(element: HTMLElement): void {
		element.classList.remove('web-scraper-hovered');
		hoveredElement = null;
	}

	function selectElement(element: HTMLElement): void {
		element.classList.add('web-scraper-selected');
		selectedElements.add(element);
		console.log('Element selected:', element.tagName, element.className);
	}

	function deselectElement(element: HTMLElement): void {
		element.classList.remove('web-scraper-selected');
		selectedElements.delete(element);
		console.log('Element deselected:', element.tagName, element.className);
	}

</script>

<div class="iframe-container">
	<iframe title="Embedded Webpage" bind:this={iframe} sandbox="allow-same-origin allow-scripts"></iframe>
</div>

<style>
    .iframe-container {
        width: 100%;
        height: 600px;
        border: 1px solid #ccc;
        overflow: hidden;
    }

    iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
</style>
