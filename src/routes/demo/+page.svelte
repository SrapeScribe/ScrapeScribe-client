<script lang="ts">
    import {onMount} from 'svelte'

    type StringScheme = {
        type: "STRING";
        path: string;
    };

    type ListScheme = {
        type: "LIST";
        path: string;
        element_scheme: Scheme;
    };

    type ObjectScheme = {
        type: "OBJECT";
        fields: Array<{
            key: string;
            value: Scheme;
        }>;
    };

    type Scheme = StringScheme | ListScheme | ObjectScheme;

    // These will be the imports for your WASM module
    let wasmModule: any
    let isLoading = true
    let error: string | null = null

    // Form inputs
    let htmlContent = `<div class="product">
  <h2 class="title">Awesome Product</h2>
  <div class="price">$49.99</div>
  <div class="description">This is a fantastic product that will change your life.</div>
  <ul class="features">
    <li>Feature 1</li>
    <li>Feature 2</li>
    <li>Feature 3</li>
  </ul>
</div>`

    let schemeContent = JSON.stringify({
        type: "OBJECT",
        fields: [
            {
                key: "title",
                value: {
                    type: "STRING",
                    path: ".title"
                }
            },
            {
                key: "price",
                value: {
                    type: "STRING",
                    path: ".price"
                }
            },
            {
                key: "description",
                value: {
                    type: "STRING",
                    path: ".description"
                }
            },
            {
                key: "features",
                value: {
                    type: "LIST",
                    path: ".features",
                    element_scheme: {
                        type: "STRING",
                        path: "li"
                    }
                }
            }
        ]
    }, null, 2)

    let result = ""

    onMount(async () => {
        try {
            // Load the WASM module
            wasmModule = await import('../../wasm/scraping-instructions/pkg')
            isLoading = false
        } catch (e) {
            isLoading = false
            error = `Failed to load WASM module: ${e}`
            console.error(e)
        }
    })

    function scrape() {
        if (!wasmModule) {
            error = "WASM module not loaded yet"
            return
        }

        try {
            result = wasmModule.scrape_magic(htmlContent, schemeContent)
            error = null
        } catch (e) {
            result = ""
            error = `Error scraping content: ${e}`
            console.error(e)
        }
    }
</script>

<main>
    <h1>ScrapeScribe Demo</h1>

    {#if isLoading}
        <div class="loading">Loading WASM module...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else}
        <div class="container">
            <div class="column">
                <h2>HTML Content</h2>
                <textarea bind:value={htmlContent} rows="15"></textarea>
            </div>

            <div class="column">
                <h2>Scraping Scheme</h2>
                <textarea bind:value={schemeContent} rows="15"></textarea>
            </div>
        </div>

        <button onclick={scrape}>Scrape Content</button>

        {#if result}
            <div class="result">
                <h2>Scraped Result</h2>
                <pre>{result}</pre>
            </div>
        {/if}
    {/if}
</main>

<style>
    main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
    }

    h1 {
        text-align: center;
        color: #333;
    }

    .container {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }

    .column {
        flex: 1;
    }

    textarea {
        width: 100%;
        box-sizing: border-box;
        font-family: monospace;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    button {
        display: block;
        margin: 0 auto 20px;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }

    button:hover {
        background-color: #45a049;
    }

    .result {
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 15px;
        background-color: #f9f9f9;
    }

    pre {
        white-space: pre-wrap;
        overflow-x: auto;
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
    }

    .loading {
        text-align: center;
        font-style: italic;
        color: #666;
    }

    .error {
        color: #d9534f;
        padding: 10px;
        border: 1px solid #d9534f;
        border-radius: 4px;
        background-color: #f2dede;
        margin-bottom: 20px;
    }
</style>
