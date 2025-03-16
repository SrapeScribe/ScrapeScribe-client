<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { getElementPath } from './lib/pathinator';
    import { selectedElement } from './lib/selectedElemStore.svelte';

    export let pageContent: string;
    
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
                
                // Add selection styles directly in the iframe
                const style = iframeDoc.createElement('style');
                style.textContent = `
                    .web-scraper-selected { outline: red dashed 2px !important; }
                    .web-scraper-hovered { outline: blue solid 2px !important; }
                `;
                iframeDoc.head.appendChild(style);

                // Add event listeners
                iframeDoc.addEventListener('mouseover', handleMouseOver, true);
                iframeDoc.addEventListener('mouseout', handleMouseOut, true);
                iframeDoc.addEventListener('click', handleClick, true);
            }
        }
    });

    onDestroy(() => {
        if (iframeDoc) {
            iframeDoc.removeEventListener('mouseover', handleMouseOver, true);
            iframeDoc.removeEventListener('mouseout', handleMouseOut, true);
            iframeDoc.removeEventListener('click', handleClick, true);
        }
    });

    function handleMouseOver(event: MouseEvent) {
        if (!iframeDoc) return;
        const target = event.target as HTMLElement;
        if (target && target.tagName !== 'HTML' && target.tagName !== 'BODY') {
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

    function highlightElement(element: HTMLElement) {
        element.classList.add('web-scraper-hovered');
    }

    function removeHighlight(element: HTMLElement) {
        element.classList.remove('web-scraper-hovered');
    }

    function selectElement(element: HTMLElement) {
        element.classList.add('web-scraper-selected');
        selectedElements.add(element);

        console.log(getElementPath(element))
        selectedElement.elem = element  // selectedElementHere
    }

    function deselectElement(element: HTMLElement) {
        element.classList.remove('web-scraper-selected');
        selectedElements.delete(element);
    }
</script>

<div class="iframe-container">
    <iframe title="Selectable Iframe" bind:this={iframe} sandbox="allow-same-origin allow-scripts"></iframe>
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
