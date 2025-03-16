<script lang="ts">
    import '../app.css'
    import {page} from '$app/state'
    import {Provider} from '$lib/components/ui/sidebar/index.js'
    import AppSidebar from '$lib/components/app-sidebar.svelte'
    import Navbar from '$lib/components/navbar.svelte'
    import {Toaster} from 'svelte-sonner'
    import {onMount} from "svelte"
    import {goto} from "$app/navigation"
    import {authStore} from "$lib/states/auth.svelte"

    let {children} = $props()

    const initState = $derived(authStore.initState)
    const authState = $derived(authStore.authState)

    // TODO: Computed error message
    // const errorMessage = $derived(getErrorMessage(new Error(initState.error)));

    let isInitializing = $state(true)

    // list of public routes TODO: move to a separate file and make global
    const publicRoutes = ['/sign-in', '/sign-up', '/auth', '/', '/demo', '/about']

    const isPublicRoute = $derived(() => {
        return publicRoutes.some(route =>
            page.url.pathname === route ||
            page.url.pathname.startsWith(route + '/')
        )
    })

    const shouldRedirect = $derived(
        initState.isInitialized && !initState.isLoading && !authState.isAuthenticated && !authState.isLoading
    )

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
        }
    })

    $effect(() => {
        if (shouldRedirect) {
            console.log("📍 Not authenticated and on protected route, redirecting")
            handleRedirect()
        }
    })

    // TODO:Function to handle error dismissal
    function clearInitError() {
        authStore.clearErrors()
    }

    function getErrorMessage(error: Error | null): string {
        if (!error) return ''

        if (error.name === 'User needs to be authenticated') {
            return isPublicRoute()
                ? ''
                : 'Your session has expired. Please sign in again.'
        }

        if (error.name === 'configuration') {
            return 'Authentication service configuration issue. Please contact support.'
        }

        return error.message
    }

    function handleRedirect() {
        setTimeout(() => {
            goto('/sign-in')
        }, 1000)
    }


</script>

{#if isInitializing || initState.isLoading}
    <div class="initializing flex items-center justify-center h-screen">
        <p>Initializing application...</p>
    </div>
{:else}
    {#if isPublicRoute()}
        <!-- Public routes - minimal layout without sidebar -->
        <div class="flex flex-col min-h-screen">
            <main class="flex-grow p-4">
                <!--TODO: Add error message component-->
                <!--{#if errorMessage}-->
                <!--    <ErrorMessage-->
                <!--            message={errorMessage}-->
                <!--            dismissable={true}-->
                <!--            autoDismiss={true}-->
                <!--            type="error"-->
                <!--    />-->
                <!--{/if}-->

                {@render children?.()}
                <Toaster richColors/>
            </main>
        </div>
    {:else if authState.isAuthenticated}
        <!-- Only show full layout for authenticated users on protected routes -->
        <Provider>
            <AppSidebar/>
            <div class="flex flex-col w-full">
                <Navbar/>
                <main class="p-4">
                    <!-- TODO: Add error message component-->

                    <!--{#if errorMessage}-->
                    <!--    <ErrorMessage-->
                    <!--            message={errorMessage}-->
                    <!--            dismissable={true}-->
                    <!--            autoDismiss={true}-->
                    <!--            type="error"-->
                    <!--    />-->
                    <!--{/if}-->

                    {@render children?.()}
                    <Toaster richColors/>
                </main>
            </div>
        </Provider>
    {:else}
        <!-- Show redirect message for unauthenticated users on protected routes -->
        <div class="flex flex-col min-h-screen">
            <main class="flex-grow p-4">
                <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                    <p>Authentication required. Redirecting to sign in...</p>
                </div>
                <Toaster richColors/>
            </main>
        </div>
    {/if}
{/if}
