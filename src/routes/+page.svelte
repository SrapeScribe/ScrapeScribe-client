<script>
    import { add } from "../wasm/scraping-instructions/pkg/scraping_instructions.js";
    import {toast} from "svelte-sonner"

    let i = 0
</script>

<main>
    <h1>Page {i}</h1>
    <button onclick={() => i += 1}>Increment</button>
    <button onclick={() => i -= 1}>Decrement</button>

    <h2>{add(1, 1)}</h2>

    <button onclick={() => {
				setTimeout(() => {
					// handleClose();
					setTimeout(() => {
						toast.success("Successfully saved the document");
					}, 200);
				}, 100);

			}}>
        Save
    </button>
</main>
