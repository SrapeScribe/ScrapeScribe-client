<script lang="ts">
    import '../app.css'
    import {Provider} from '$lib/components/ui/sidebar/index.js'
    import AppSidebar from '$lib/components/app-sidebar.svelte'
    import Navbar from '$lib/components/navbar.svelte'
    import {Toaster} from 'svelte-sonner'
    import {onMount} from "svelte"
    import {initializeAuth} from "$lib/states/auth.svelte"

    let {children} = $props()

    onMount(async () => {
        await initializeAuth()
    })
</script>

<Provider>
    <AppSidebar/>
    <div class="flex flex-col w-full">

        <Navbar/>
        <main class="">
            {@render children?.()}
            <Toaster richColors/>
        </main>
    </div>

</Provider>
