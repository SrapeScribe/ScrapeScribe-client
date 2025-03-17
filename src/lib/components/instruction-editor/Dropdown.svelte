<script lang="ts">
    import type { SchemeType } from "./lib/interfaces";

    let { onSelect } = $props()

    function handleChange(event: Event) {
        const select = event.target as HTMLSelectElement
        onSelect(select.value as SchemeType)
    }
</script>

<select onchange={handleChange} class="text-sm px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
    <option value="">pick one</option>
    <option value="OBJECT">object</option>
    <option value="LIST">list</option>
    <option value="STRING">string</option>
</select>