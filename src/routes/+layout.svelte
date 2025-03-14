<script lang="ts">
    import '../app.css'
    import {page} from '$app/state'
    import {Provider} from '$lib/components/ui/sidebar/index.js'
    import AppSidebar from '$lib/components/app-sidebar.svelte'
    import Navbar from '$lib/components/navbar.svelte'
    import AuthGuard from '$lib/components/auth/auth-guard.svelte'
    import {Toaster} from 'svelte-sonner'
    import {onMount} from "svelte"
    import {authStore} from "$lib/states/auth.svelte"

    let {children} = $props()

    const initState = $derived(authStore.initState)

    let isInitializing = $state(true)

    // list of public routes TODO: move to a separate file and make global
    const publicRoutes = ['/sign-in', '/sign-up', '/']

    const isPublicRoute = $derived(() => {
        return publicRoutes.some(route =>
            page.url.pathname === route ||
            page.url.pathname.startsWith(route + '/')
        )
    })

    onMount(async () => {
        console.log("📍 Root layout mounted, initializing auth");
        try {
            await authStore.initialize();
            console.log("📍 Auth initialization complete in layout");
        } catch (error) {
            console.error("📍 Error initializing auth in layout:", error);
        } finally {
            isInitializing = false;
            console.log("📍 isInitializing set to false in layout");
        }
    });
</script>

{#if isInitializing || initState.isLoading}
    <div class="initializing flex items-center justify-center h-screen">
        <p>Initializing application...</p>
    </div>
{:else}
    {#if isPublicRoute()}
        <!-- Public routes - minimal layout without sidebar -->
        <div class="flex flex-col min-h-screen">
            <main class="flex-grow">
                {#if initState.error}
                    <div class="error global-error p-4 bg-red-100 text-red-800">
                        <p>{initState.error}</p>
                    </div>
                {/if}

                {@render children?.()}
                <Toaster richColors/>
            </main>
        </div>
    {:else}
        <!-- Protected routes with AuthGuard -->
        <AuthGuard redirectTo="/sign-in">
            <!-- full layout for authenticated users -->
            <Provider>
                <AppSidebar/>
                <div class="flex flex-col w-full">
                    <Navbar/>
                    <main class="">
                        {#if initState.error}
                            <div class="error global-error p-4 bg-red-100 text-red-800">
                                <p>{initState.error}</p>
                            </div>
                        {/if}

                        {@render children?.()}
                        <Toaster richColors/>
                    </main>
                </div>
            </Provider>
        </AuthGuard>
    {/if}
{/if}
