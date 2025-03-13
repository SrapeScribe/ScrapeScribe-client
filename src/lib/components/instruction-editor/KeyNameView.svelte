<script lang="ts">
    let { keyName, onSave } = $props()

    let isEditing = $state(false)
    let tempKeyName = $state(keyName)
    let inputRef: HTMLInputElement | undefined = $state()

    function startEditing() {
        isEditing = true
        tempKeyName = keyName

        requestAnimationFrame(() => {
            inputRef?.focus()
        })
    }

    function save() {
        isEditing = false
        onSave(tempKeyName)
    }

    function cancel() {
        isEditing = false
        tempKeyName = keyName
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            save();
        } else if (e.key === 'Escape') {
            cancel();
        }
    }
</script>

{#if isEditing}
    <input 
        type="text" 
        bind:value={tempKeyName} 
        onblur={save} 
        onkeydown={handleKeyDown}
        bind:this={inputRef}
    />
{:else}
    <span onclick={startEditing}>"{keyName}"</span>
{/if}