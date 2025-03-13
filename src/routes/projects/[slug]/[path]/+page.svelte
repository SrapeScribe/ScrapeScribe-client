<script lang="ts">
    /** @type {import('./$types').PageData} */
    let { data } = $props();

    let { params } = data;

</script>

<h1>Endpoint page</h1>
<span>Slug: {params.path}</span>
