<script lang="ts">
    import '../app.css'
    import {page} from '$app/state'
    import {Provider} from '$lib/components/ui/sidebar/index.js'
    import AppSidebar from '$lib/components/app-sidebar.svelte'
    import PersistentSidebar from '$lib/components/persistent-sidebar.svelte'
    import Navbar from '$lib/components/navbar.svelte'
    import {Toaster} from 'svelte-sonner'
    import {onMount} from "svelte"
    import {goto} from "$app/navigation"
    import {authStore} from "$lib/states/auth.svelte"
    import {isPublicRoute, isProtectedRoute} from "$lib/route-protection"

    let {children} = $props()

    const initState = $derived(authStore.initState)
    const authState = $derived(authStore.authState)

    let isInitializing = $state(true)
    let needsRedirect = $state(false)

    const currentRoute = $derived(page.url.pathname)
    const isCurrentRoutePublic = $derived(isPublicRoute(currentRoute))
    const isCurrentRouteProtected = $derived(isProtectedRoute(currentRoute))

    onMount(async () => {
        console.log("📍 Root layout mounted, initializing auth")
        try {
            await authStore.initialize()
            console.log("📍 Auth initialization complete in layout")
        } catch (error) {
            console.error("📍 Error initializing auth in layout:", error)
        } finally {
            isInitializing = false
            console.log("📍 isInitializing set to false in layout")

            // Check if redirect is needed after auth is initialized
            if (isCurrentRouteProtected && !authState.isAuthenticated) {
                needsRedirect = true
                setTimeout(() => goto('/sign-in'), 1000)
            }
        }
    })
</script>

{#if isInitializing || initState.isLoading}
    <div class="initializing flex items-center justify-center h-screen">
        <p>Initializing application...</p>
    </div>
{:else}
    {#if isCurrentRoutePublic || authState.isAuthenticated}
        {#if isCurrentRoutePublic}
            <!-- Simple layout for public routes -->
            <div class="flex flex-col min-h-screen">
                <main>
                    {@render children?.()}
                    <Toaster richColors/>
                </main>
            </div>
        {:else}
            <!-- Full authenticated layout with sidebar -->
            <Provider>
                <AppSidebar/>
                <PersistentSidebar />
                <div class="flex flex-col w-full">
                    <Navbar/>
                    <main class="p-4">
                        {@render children?.()}
                        <Toaster richColors/>
                    </main>
                </div>
            </Provider>
        {/if}
    {:else if needsRedirect}
        <!-- Show redirect message for unauthenticated users on protected routes -->
        <div class="flex flex-col min-h-screen">
            <main class="flex-grow p-4">
                <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                    <p>Authentication required. Redirecting to sign in...</p>
                </div>
            </main>
        </div>
    {/if}
{/if}
