<script lang="ts">
    import { SchemeType, type Instructions, type Scheme } from "./lib/interfaces";
    import SchemeView from "./SchemeView.svelte";
    // import init, { scrape_magic } from "$lib/pkg/my_package";
    
    import { onMount } from "svelte";
    import WebpageEmbed from "./WebpageEmbed.svelte";
    import { makeElementSchemePathsRelative } from "./lib/relativizer";
    import { interlaceInstructions } from "./lib/interlacer";
	import { authApiClient } from "$lib/api/client";
	import { cognitoUserPoolsTokenProvider } from "@aws-amplify/auth/cognito";
	import { emptyScheme } from "$lib/interfaces";
	// import { scrape_magic } from "../../../wasm/scraping-instructions/pkg/scraping_instructions_bg";

    let { endpointId }: { endpointId: string } = $props()

    let wasmModule: any
    let instructions = $state<Instructions | undefined>(undefined)
    let html = $state<string | undefined>(undefined)
    let instructionSetId = $state<string | undefined>(undefined)

    async function loadInstructionSet() {
        try {
            const instructionSet = await authApiClient.instructionSetApi.getByEndpointId(endpointId)
            console.log("INSTRUCTION SET RECEIVED")
            console.log(instructionSet)
            if (instructionSet) {
                instructions = {
                    url: instructionSet.url,
                    scheme: instructionSet.schema as Scheme
                }
                console.log("instruction set ID", instructionSet.id)
                instructionSetId = instructionSet.id
                console.log("INSTRUCTIONS RECEIVED")
                console.log(instructions)
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

        try {
            if (!instructionSetId) {
                const created = await authApiClient.instructionSetApi.create(endpointId, instructions.scheme, instructions.url)
                instructionSetId = created.id
            } else {
                await authApiClient.instructionSetApi.update(instructionSetId, instructions.scheme, instructions.url)
            }

            
        } catch (err) {
            console.error('error saving instruction set:', err)
        }
    }


    async function fetchHtml() {
        console.log("FETCHING")
        if (!instructions) return
        try {
            const response = await fetch(`https://su577lt3di.execute-api.eu-west-1.amazonaws.com/v1/api/urlprocess?url=${instructions.url}`)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            html = await response.text()
        } catch (error) {
            console.error('error fetching:', error)
        }
    }

    function processInstructions() {
        if (!html || !instructions) return

        console.log("PROCESSING")
        // console.log(JSON.stringify(instructions.scheme, null, 2))
        
        try {
            // NOTE: calling the relativizer below is not ideal as it's only really useful for when the user is creating instructions involving lists
            // in the future we should call this only when needed
            const relativized = makeElementSchemePathsRelative(instructions.scheme)
            const outputJson = wasmModule.scrape_magic(html, JSON.stringify(relativized))
            const output = JSON.parse(outputJson)

            // NOTE: instead of bothering with interlacing instructions and the output, the wasm could take care of it itself, which could be less error prone and faster
            instructions = interlaceInstructions(instructions, output)
        } catch (error) {
            console.error('error processing:', error)
        }
    }

    function handleUpdate(event: Event) {
        // omfg typescript I DONT CAREEEEEEEEEEEEEE
        if (event.detail.endpointId === endpointId) {
            console.log("UPDATE for editor", endpointId)
            processInstructions()
        }
    }

    onMount(async () => {
        window.addEventListener("refresh", handleUpdate)
        wasmModule = await import('../../../wasm/scraping-instructions/pkg')
        await loadInstructionSet()
    })

    // window is undefined, thanks svelte, very cool
    // onDestroy(async () => {
    //     window.removeEventListener("refresh", handleUpdate)
    // })
</script>

{#if instructions}
    <div class="box">
        <button
            onclick={saveInstructionSet}
        >
            Save
        </button>
        <p>url: {instructions.url}</p>
        <input
            type="text"
            bind:value={instructions.url}
            placeholder="your url"
        />
        <p>json:</p>
        <div class="box">
            <SchemeView bind:scheme={instructions.scheme} endpointId={endpointId}/>
        </div>
    </div>
    <div class="box">
        {#if html} 
            <WebpageEmbed pageContent={html} />
        {/if}
    </div>
{:else}
    <p>loading...</p>
{/if}

<style>
    .box {
        border: 2px solid blue;
    }
</style>