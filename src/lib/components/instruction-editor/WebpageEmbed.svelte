<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { selectionMode, endSelection } from './lib/selectionMode.svelte';

    // export let pageContent: string;
    let { pageContent } = $props<{ pageContent: string }>()
    
    let iframe: HTMLIFrameElement;
    let hoveredElement: HTMLElement | null = null;
    let iframeDoc: Document | null = null;

    onMount(() => {
        if (iframe) {
            iframeDoc = iframe.contentDocument;
            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(pageContent);
                iframeDoc.close();
                
                const style = iframeDoc.createElement('style');
                style.textContent = `
                    .web-scraper-hovered { outline: blue solid 2px !important; }
                `;
                iframeDoc.head.appendChild(style);

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
            if (hoveredElement) {
                removeHighlight(hoveredElement);
            }
            highlightElement(target);
            hoveredElement = target;
        }
        event.stopPropagation();
    }

    function handleMouseOut(event: MouseEvent) {
        if (!iframeDoc) return;
        const target = event.target as HTMLElement;
        if (target === hoveredElement) {
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
            if (selectionMode.isActive && selectionMode.callback) {
                selectionMode.callback(target);
                endSelection();
            }
        }
    }

    function highlightElement(element: HTMLElement) {
        element.classList.add('web-scraper-hovered');
    }

    function removeHighlight(element: HTMLElement) {
        element.classList.remove('web-scraper-hovered');
    }

    // Update cursor style based on selection mode
    $effect(() => {
        if (iframe?.contentDocument?.body) {
            iframe.contentDocument.body.style.cursor = selectionMode.isActive ? 'crosshair' : 'default';
        }
    })
</script>

<div class="iframe-container">
    <iframe title="Selectable Iframe" bind:this={iframe} sandbox="allow-same-origin allow-scripts"></iframe>
    {#if selectionMode.isActive}
        <div class="selection-overlay">
            {selectionMode.message}
        </div>
    {/if}
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
