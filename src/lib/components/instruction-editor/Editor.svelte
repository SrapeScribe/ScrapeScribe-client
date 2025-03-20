<script lang="ts">
    import {SchemeType, type Instructions, type Scheme} from "./lib/interfaces"
    import SchemeView from "./SchemeView.svelte"

    import {onMount} from "svelte"
    import WebpageEmbed from "./WebpageEmbed.svelte"
    import {makeElementSchemePathsRelative} from "./lib/relativizer"
    import {interlaceInstructions, interlaceScheme} from "./lib/interlacer"
    import {authApiClient} from "$lib/api/client"
    import {emptyScheme} from "$lib/interfaces"
    import {selectionMode} from "./lib/selectionMode.svelte"

    import {Button} from "$lib/components/ui/button"
    import {Input} from "$lib/components/ui/input"
    import * as Dialog from '$lib/components/ui/dialog'
    import {CheckCircle} from 'lucide-svelte'
    import {getTimeAgo} from "$lib/utils"

    // Create a reactive timestamp string that updates automatically
    let savedTimeDisplay = $derived(() => {
        if (!lastSaved) return ''
        return getTimeAgo(lastSaved)
    })

    onMount(() => {
        const timeUpdateInterval = setInterval(() => {
            // Force reactivity update by touching the lastSaved value
            if (lastSaved) {
                lastSaved = new Date(lastSaved.getTime())
            }
        }, 1000)

        return () => {
            clearInterval(timeUpdateInterval)
        }
    })

    let {endpointId}: { endpointId: string } = $props()

    let wasmModule: any
    let instructions = $state<Instructions | undefined>(undefined)
    let html = $state<string | undefined>(undefined)
    let instructionSetId = $state<string | undefined>(undefined)
    let isProcessing = $state(false)
    let isSaving = $state(false)
    let modalOpen = $state(false)

    // Autosave related state
    let lastSaved = $state<Date | null>(null)
    let saveTimer = $state<number | null>(null)
    let saveCountdown = $state<number>(0)
    let hasUnsavedChanges = $state(false)

    // This effect makes the dialog close when selection is complete
    $effect(() => {
        if (!selectionMode.isActive && modalOpen) {
            modalOpen = false
        }
    })

    async function loadInstructionSet() {
        try {
            const instructionSet = await authApiClient.instructionSetApi.getByEndpointId(endpointId)
            console.log("INSTRUCTION SET RECEIVED", instructionSet)

            if (instructionSet) {
                instructions = {
                    url: instructionSet.url,
                    scheme: instructionSet.schema as Scheme
                }
                console.log("instruction set ID", instructionSet.id)
                instructionSetId = instructionSet.id
                console.log("INSTRUCTIONS RECEIVED", instructions)
                await fetchHtml()
                processInstructions()
            } else {
                instructions = {
                    url: '',
                    scheme: emptyScheme(SchemeType.Object)
                }
            }
        } catch (err) {
            console.error('error loading instruction set:', err)
        }
    }

    async function saveInstructionSet() {
        if (!instructions) return
        isSaving = true

        try {
            const relativizedScheme = makeElementSchemePathsRelative(instructions.scheme)

            if (!instructionSetId) {
                const created = await authApiClient.instructionSetApi.create(
                    endpointId,
                    relativizedScheme,
                    instructions.url
                )
                instructionSetId = created.id
            } else {
                await authApiClient.instructionSetApi.update(
                    instructionSetId,
                    relativizedScheme,
                    instructions.url
                )
            }

            lastSaved = new Date()
            hasUnsavedChanges = false

        } catch (err) {
            console.error('error saving instruction set:', err)
        } finally {
            isSaving = false
        }
    }

    // Schedules an autosave after changes are detected
    function scheduleAutosave() {
        hasUnsavedChanges = true

        // Clear existing timer if there is one
        if (saveTimer !== null) {
            clearTimeout(saveTimer)
            clearInterval(saveTimer)
        }

        // Schedule actual save after 1 seconds
        saveTimer = setTimeout(() => {
            saveInstructionSet()
            saveTimer = null
        }, 1000)
    }

    async function fetchHtml() {
        console.log("FETCHING HTML")
        if (!instructions?.url) return

        try {
            const response = await fetch(`https://su577lt3di.execute-api.eu-west-1.amazonaws.com/v1/api/urlprocess?url=${instructions.url}`)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            html = await response.text()
            console.log("HTML FETCHED", html?.substring(0, 100) + "...")
        } catch (error) {
            console.error('error fetching HTML:', error)
        }
    }

    function processInstructions() {
        if (!html || !instructions) return
        isProcessing = true

        console.log("PROCESSING INSTRUCTIONS")

        try {
            const relativized = makeElementSchemePathsRelative(instructions.scheme)
            console.log("RELATIVIZED", JSON.stringify(relativized, null, 2))

            const outputJson = wasmModule.scrape_magic(html, JSON.stringify(relativized))
            console.log("OUTPUT JSON", outputJson.substring(0, 100) + "...")

            const output = JSON.parse(outputJson)
            const interlaced = interlaceScheme(relativized, output)
            console.log("INTERLACED", JSON.stringify(interlaced, null, 2))

            instructions.scheme = interlaced
        } catch (error) {
            console.error('error processing:', error)
        } finally {
            isProcessing = false
        }
    }

    async function handleUrlChange() {
        if (instructions?.url) {
            await fetchHtml()
            processInstructions()
            scheduleAutosave()
        }
    }

    function handleUpdate(event: Event) {
        if ((event as CustomEvent).detail?.endpointId === endpointId) {
            console.log("UPDATE for editor", endpointId)
            processInstructions()
            scheduleAutosave()
        }
    }


    onMount(async () => {
        window.addEventListener("refresh", handleUpdate)
        wasmModule = await import('../../../wasm/scraping-instructions/pkg')
        await loadInstructionSet()

        // Track changes to the URL to trigger autosave
        $effect(() => {
            if (instructions?.url) {
                scheduleAutosave()
            }
        })
        return () => {
            window.removeEventListener("refresh", handleUpdate)
            // Clear any pending save timer on unmount
            if (saveTimer !== null) {
                clearTimeout(saveTimer)
                clearInterval(saveTimer)
            }
        }
    })
</script>

{#if instructions}
    <div class="space-y-4">
        <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium">Scraping Instructions</h3>
            <div class="flex items-center gap-2">
                {#if lastSaved}
                    <div class="flex items-center text-sm text-gray-500">
                        {#if hasUnsavedChanges}
                            {#if saveCountdown > 0}
                                <span class="text-orange-500">Saving in {saveCountdown}s...</span>
                            {:else}
                                <span class="text-orange-500">Saving...</span>
                            {/if}
                        {:else}
                            <CheckCircle class="text-green-500 mr-1 size-4"/>
                            <span>Saved {savedTimeDisplay()}</span>
                        {/if}
                    </div>
                {/if}
                <Button
                        onclick={saveInstructionSet}
                        disabled={isSaving || (!hasUnsavedChanges && lastSaved)}
                        variant={isSaving ? "outline" : "default"}
                >
                    {isSaving ? "Saving..." : "Save Now"}
                </Button>
            </div>
        </div>

        <div class="space-y-2">
            <label class="text-sm font-medium">Target URL:</label>
            <div class="flex gap-2">
                <Input
                        type="text"
                        bind:value={instructions.url}
                        placeholder="https://example.com"
                />
                <Button variant="outline" onclick={handleUrlChange} disabled={!instructions.url}>
                    Fetch
                </Button>
            </div>
        </div>

        <div class="space-y-2">
            <label class="text-sm font-medium">Instructions Schema:</label>
            <div class="p-4 border rounded-md bg-gray-50">
                <Dialog.Root bind:open={modalOpen}>
                    <SchemeView
                            bind:scheme={instructions.scheme}
                            endpointId={endpointId}
                            modalOpen={modalOpen}
                    />

                    <Dialog.Content class="max-w-5xl max-h-[90vh]">
                        <Dialog.Header>
                            <Dialog.Title>Select {selectionMode.type} element</Dialog.Title>
                            <Dialog.Description>
                                {selectionMode.message}
                                {#if instructions.url}
                                    <span class="block mt-2 text-sm text-gray-500 truncate">From: {instructions.url}</span>
                                {/if}
                            </Dialog.Description>
                        </Dialog.Header>

                        <div class="mt-2 mb-4 overflow-auto max-h-[70vh]">
                            {#if html}
                                <WebpageEmbed pageContent={html}/>
                            {:else}
                                <div class="py-20 text-center text-gray-400">No content loaded</div>
                            {/if}
                        </div>

                        <Dialog.Footer>
                            <Button variant="outline" onclick={() => {
                                if (selectionMode.isActive) {
                                    selectionMode.isActive = false;
                                    selectionMode.type = null;
                                    selectionMode.message = '';
                                    selectionMode.callback = null;
                                }
                                modalOpen = false;
                            }}>Cancel
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Root>
            </div>
        </div>

        {#if isProcessing}
            <div class="p-4 text-center">
                <p class="text-gray-600">Processing instructions...</p>
            </div>
        {/if}
    </div>
{:else}
    <div class="p-8 text-center">
        <p class="text-gray-600">Loading...</p>
    </div>
{/if}
