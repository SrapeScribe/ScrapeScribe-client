<script>
    import { add } from "../wasm/scraping-instructions/pkg/scraping_instructions.js";

    let i = 0
</script>

<main>
    <h1>Page {i}</h1>
    <button on:click={() => i += 1}>Increment</button>
    <button on:click={() => i -= 1}>Decrement</button>

    <h2>{add(1, 1)}</h2>
</main>
