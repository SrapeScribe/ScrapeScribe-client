<script lang="ts">
    import {SchemeType, type Instructions, type Scheme, type Endpoint} from "$lib/interfaces"
    import SchemeView from "./SchemeView.svelte"
    import {getContext, onMount} from "svelte"
    import {Braces, TableProperties} from "lucide-svelte"
    import {Button} from "$lib/components/ui/button"
    import {instructionSetStore} from "$lib/states/instruction.svelte"

    // Get the endpoint from context set by the parent component
    const endpoint = getContext<Endpoint>('endpoint')

    // Create local state for the editor
    let localInstructions = $state<Instructions | null>(null)
    let hasChanges = $state(false)

    // Derive values from the store
    let instructionSet = $derived(instructionSetStore.instructionSet)
    let isLoading = $derived(instructionSetStore.isLoading)
    let error = $derived(instructionSetStore.error)

    // Reference to scheme for binding
    let currentScheme = $state<Scheme | null>(null)
    let url = $state('')

    // Update local instructions whenever store data changes
    $effect(() => {
        if (instructionSet?.schema) {
            try {
                const parsedInstructions = instructionSet.schema as Instructions
                localInstructions = JSON.parse(JSON.stringify(parsedInstructions))
                if (localInstructions) {
                    currentScheme = localInstructions.scheme
                    url = localInstructions.url || ''
                }
                hasChanges = false
            } catch (err) {
                console.error("Failed to parse instruction set schema:", err)
                initializeEmptyInstructions()
            }
        } else if (!localInstructions) {
            initializeEmptyInstructions()
        }
    })

    // Initialize with empty instructions
    function initializeEmptyInstructions() {
        localInstructions = {
            url: '',
            scheme: {
                type: SchemeType.Object,
                fields: []
            }
        }
        currentScheme = localInstructions.scheme
        url = ''
    }

    // Watch for scheme changes
    $effect(() => {
        if (localInstructions && currentScheme) {
            localInstructions.scheme = currentScheme
            checkForChanges()
        }
    })

    // Watch for URL changes
    $effect(() => {
        if (localInstructions) {
            localInstructions.url = url
            checkForChanges()
        }
    })

    // Track changes to local instructions
    function checkForChanges() {
        if (localInstructions && instructionSet?.schema) {
            const parsedInstructions = instructionSet.schema as Instructions
            hasChanges = JSON.stringify(localInstructions) !== JSON.stringify(parsedInstructions)
        }
    }

    // Load instruction set when component mounts
    onMount(async () => {
        if (endpoint?.id) {
            await instructionSetStore.setActiveEndpoint(endpoint.id)
        }
    })

    // Create a new instruction set
    async function createNewInstructionSet() {
        if (!endpoint?.id || !localInstructions) return

        try {
            await instructionSetStore.createInstructionSet(
                endpoint.id,
                localInstructions
            )
        } catch (err) {
            console.error("Failed to create instruction set:", err)
        }
    }

    // Save changes to the store
    async function saveChanges() {
        if (!localInstructions || !endpoint?.id) return

        try {
            if (instructionSet) {
                // Update existing instruction set
                await instructionSetStore.updateInstructionSet({
                    instructionSet: {
                        id: instructionSet.id,
                        schema: localInstructions
                    }
                })
            } else {
                // Create new instruction set
                await instructionSetStore.createInstructionSet(
                    endpoint.id,
                    localInstructions
                )
            }
            hasChanges = false
        } catch (err) {
            console.error("Failed to save instructions:", err)
        }
    }
</script>

{#if isLoading}
    <div class="py-4">Loading instructions...</div>
{:else if error}
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
        <p>{error}</p>
    </div>
{:else}
    <!-- Instruction Set Actions -->
    <div class="flex justify-between items-center mb-4">
        {#if hasChanges}
            <button
                    onclick={saveChanges}
                    class="px-3 py-1 bg-green-500 text-white rounded"
                    disabled={isLoading}
            >
                Save Changes
            </button>
        {/if}
    </div>

    {#if localInstructions}
        <div class="flex gap-2 items-center mb-4">
            <label for="url" class="font-medium">Website to scrape URL:</label>
            <input
                    id="url"
                    type="text"
                    bind:value={url}
                    class="flex-grow p-2 border rounded"
                    placeholder="https://example.com"
            />
        </div>

        <p class="font-medium mb-2">Schema:</p>
        <div class="box">
            {#if currentScheme}
                <SchemeView bind:scheme={currentScheme}/>
            {/if}
        </div>
    {:else}
        <div class="text-center py-4">
            <p>No instruction sets available.</p>
            <button
                    onclick={createNewInstructionSet}
                    class="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
                    disabled={isLoading}
            >
                Create First Instruction Set
            </button>
        </div>
    {/if}
{/if}
