<script lang="ts">
import {Button} from "$lib/components/ui/button/index.js"
import * as Dialog from '$lib/components/ui/dialog'

</script>

<Dialog.Root>
    <Dialog.Trigger>
        <Button class="h-[40px] w-full font-bold" variant="outline">Select content
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="max-w-3xl">
        <Dialog.Header>
            <Dialog.Title>Select content to scrape</Dialog.Title>
            <Dialog.Description>
                Use box selection for scraping content
            </Dialog.Description>
        </Dialog.Header>
        <span class="py-72 text-center">Content</span>
        <Dialog.Footer>
            <Button type="submit">Save changes</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
