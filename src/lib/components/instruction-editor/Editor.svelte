<script lang="ts">
    import { SchemeType, type Instructions, type Scheme } from "./lib/interfaces";
    import SchemeView from "./SchemeView.svelte";
    // import init, { scrape_magic } from "$lib/pkg/my_package";
    
    import { onMount } from "svelte";
    import WebpageEmbed from "./WebpageEmbed.svelte";
    import { makeElementSchemePathsRelative } from "./lib/relativizer";
    import { interlaceInstructions } from "./lib/interlacer";
	// import { scrape_magic } from "../../../wasm/scraping-instructions/pkg/scraping_instructions_bg";

    let wasmModule: any

    const listOfObjects: Scheme = {
        type: SchemeType.Object,
        fields: [
            {
                key: "title",
                value: {
                    type: SchemeType.String,
                    path: "body > h1",
                    mode: "INNER_HTML"
                },
            },
            {
                key: "things",
                value: {
                    type: SchemeType.List,
                    path: "body > div:nth-of-type(1) > ul",
                    element_scheme: {
                        type: SchemeType.Object,
                        fields: [
                            {
                                key: "activity",
                                value: {
                                    type: SchemeType.String,
                                    path: "body > div:nth-of-type(1) > ul > li:nth-of-type(1) > div:nth-of-type(2) > p > span",
                                    mode: "INNER_HTML"
                                },
                            },
                            {
                                key: "id",
                                value: {
                                    type: SchemeType.String,
                                    path: "body > div:nth-of-type(1) > ul > li:nth-of-type(1) > p:nth-of-type(1)",
                                    mode: "INNER_HTML"
                                },
                            }
                        ]
                    }
                }
            }
        ]
    };

    // const content = {"things":[{"activity":"golfing","id":"1"},{"activity":"fireworks","id":"2"},{"activity":"fireworks","id":"2"}],"title":"this is a test page for the scraper"}

    // const interlaced = interlaceScheme(listOfObjects, content)

    // console.log('interlaced')
    // console.log(JSON.stringify(interlaced, null, 2))

    // console.log(JSON.stringify(makeElementSchemePathsRelative(listOfObjects), null, 2))

    let instructions = $state<Instructions>({
        url: "https://rootofminus1atu.neocities.org",
        scheme: listOfObjects
        // scheme: {
        //     type: SchemeType.Object,
        //     fields: [
        //         {
        //             key: "title",
        //             value: {
        //                 type: SchemeType.String,
        //                 path: "body > h1",
        //                 mode: "INNER_HTML"
        //             }
        //         }
        //     ]
        // }
        // scheme: {
        //     type: SchemeType.Object,
        //     fields: [
        //         {
        //             key: "title",
        //             value: {
        //                 type: SchemeType.String,
        //                 path: "body > h1",
        //                 mode: "INNER_HTML"
        //             },
        //         },
        //         {
        //             key: "activities",
        //             value: {
        //                 type: SchemeType.List,
        //                 path: "body > div:nth-of-type(1) > ul",
        //                 element_scheme: {
        //                     type: SchemeType.String,
        //                     path: "li > div:nth-of-type(2) > p > span",
        //                     mode: "INNER_HTML"
        //                 }
        //             }
        //         }
        //     ]
        // }
    })

    let html = $state<string | undefined>(undefined)

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
        console.log("PROCESSING")
        console.log(JSON.stringify(instructions.scheme, null, 2))
        
        if (!html || !instructions) return

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
        console.log("UPDATE")
        processInstructions()
    }

    onMount(async () => {
        window.addEventListener("refresh", handleUpdate)
        // await init()
        wasmModule = await import('../../../wasm/scraping-instructions/pkg')
        await fetchHtml()
        processInstructions()
    })

    // window is undefined, thanks svelte, very cool
    // onDestroy(async () => {
    //     window.removeEventListener("refresh", handleUpdate)
    // })
</script>

{#if instructions}
    <div class="box">
        <p>url: {instructions.url}</p>
        <p>json:</p>
        <div class="box">
            <SchemeView bind:scheme={instructions.scheme} />
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