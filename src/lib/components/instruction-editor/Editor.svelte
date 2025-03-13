<script lang="ts">
    import {SchemeType, type Instructions, type Scheme, type Endpoint} from "../../../interfaces"
    import SchemeView from "./SchemeView.svelte";
    import {getContext, setContext} from "svelte"

    const endpoint = getContext<Endpoint>('endpoint');

    setContext('instructions', endpoint.instructions);

</script>

<div class="box">
    <div class="flex gap-2 items-center mb-4">
        <label for="name" class="font-medium">Label(optional):</label>
        <input
                id="name"
                type="text"
                bind:value={endpoint.name}
                class="flex-grow p-2 border rounded"
        />
    </div>
    <div class="flex gap-2 items-center mb-4">
        <label for="url" class="font-medium">Website to scrape URL:</label>
        <input
                id="url"
                type="text"
                bind:value={endpoint.instructions.url}
                class="flex-grow p-2 border rounded"
        />
    </div>

    <p class="font-medium mb-2">Schema:</p>
    <div class="box">
        <SchemeView
                bind:scheme={endpoint.instructions.scheme}
        />
    </div>
</div>

<style>
    .box {
        border: 2px solid blue;
        padding: 1rem;
        border-radius: 0.5rem;
    }
</style>
