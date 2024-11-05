<script>
    let i = 0
</script>

<main>
    <h1>Page {i}</h1>
    <button on:click={() => i += 1}>Increment</button>
    <button on:click={() => i -= 1}>Decrement</button>
</main>
