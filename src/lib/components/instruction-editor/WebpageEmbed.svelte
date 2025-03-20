<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { selectionMode, endSelection } from './lib/selectionMode.svelte';

    let {
        pageContent,
        currentTool = $bindable<'select' | 'click'>('select')
    } = $props<{
        pageContent: string,
        currentTool?: 'select' | 'click'
    }>();

    const dispatch = createEventDispatcher();
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

                // Add styles for different modes
                const style = iframeDoc.createElement('style');
                style.textContent = `
                    .web-scraper-hovered { outline: blue solid 2px !important; }
                    body[data-tool="click"] * { cursor: pointer !important; }
                    body[data-tool="select"] * { cursor: crosshair !important; }
                `;
                iframeDoc.head.appendChild(style);

                // Initial tool setting
                iframeDoc.body.dataset.tool = currentTool;

                setTimeout(() => {
                    applyCurrentCursorStyle();
                }, 50);

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

    function applyCurrentCursorStyle() {
        if (!iframe?.contentDocument?.body) return;

        const doc = iframe.contentDocument;
        doc.body.dataset.tool = currentTool;

        // The cursor style to apply
        const cursorStyle = currentTool === 'select' ? 'crosshair' : 'pointer';

        // First, update the style tag with the stronger selector
        try {
            const styleTag = doc.querySelector('style');
            if (styleTag) {
                styleTag.textContent += `
                    html, body, * {
                        cursor: ${cursorStyle} !important;
                    }
                `;
            }
        } catch (e) {
            console.error("Error updating style tag:", e);
        }

        // Then directly set cursor on all elements
        try {
            // Set on document elements
            doc.documentElement.style.setProperty('cursor', cursorStyle, 'important');
            doc.body.style.setProperty('cursor', cursorStyle, 'important');

            // Set on all other elements
            const allElements = doc.querySelectorAll('*');
            allElements.forEach(el => {
                (el as HTMLElement).style.setProperty('cursor', cursorStyle, 'important');
            });
        } catch (e) {
            console.error("Error setting cursor style directly:", e);
        }
    }

    // Update cursor style when tool changes
    $effect(() => {
        if (iframe?.contentDocument?.body) {
            applyCurrentCursorStyle();
        }
    });

    function handleMouseOver(event: MouseEvent) {
        if (!iframeDoc || currentTool !== 'select') return;
        const target = event.target as HTMLElement;

        if (target && target.tagName !== 'HTML' && target.tagName !== 'BODY') {
            if (hoveredElement) {
                removeHighlight(hoveredElement);
            }
            highlightElement(target);
            hoveredElement = target;
            dispatch('elementHover', { element: target });
        }
        event.stopPropagation();
    }

    function handleMouseOut(event: MouseEvent) {
        if (!iframeDoc || currentTool !== 'select') return;
        const target = event.target as HTMLElement;
        if (target === hoveredElement) {
            removeHighlight(target);
        }
        event.stopPropagation();
    }

    function handleClick(event: MouseEvent) {
        if (!iframeDoc) return;

        if (currentTool === 'select') {
            event.preventDefault();
            event.stopPropagation();

            const target = event.target as HTMLElement;
            if (target && target.tagName !== 'HTML' && target.tagName !== 'BODY') {
                if (selectionMode.isActive && selectionMode.callback) {
                    selectionMode.callback(target);
                    endSelection();
                }
            }
        } else if (currentTool === 'click') {
            // Don't prevent default click behavior in click/interact mode
            console.log('Interact mode: clicking element', (event.target as HTMLElement).tagName);
        }
    }

    function highlightElement(element: HTMLElement) {
        element.classList.add('web-scraper-hovered');
    }

    function removeHighlight(element: HTMLElement) {
        element.classList.remove('web-scraper-hovered');
    }
</script>

<div class="iframe-container relative">
    <iframe title="Selectable Iframe" bind:this={iframe} sandbox="allow-same-origin allow-scripts"></iframe>
    {#if selectionMode.isActive && currentTool === 'select'}
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

    .selection-overlay {
        position: absolute;
        top: 10px;
        left: 10px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 14px;
    }
</style>
