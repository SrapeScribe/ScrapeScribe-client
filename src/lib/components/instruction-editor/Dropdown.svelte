<script lang="ts">
    import type { SchemeType } from "./interfaces";

    let { onSelect } = $props()

    function handleChange(event: Event) {
        const select = event.target as HTMLSelectElement
        onSelect(select.value as SchemeType)
    }
</script>

<select onchange={handleChange}>
    <option value="">pick one</option>
    <option value="OBJECT">object</option>
    <option value="LIST">list</option>
    <option value="STRING">string</option>
</select>