<script lang="ts">
    import {authStore} from '$lib/states/auth.svelte'

    let { children, title, subtitle = '' } = $props<{
        children: any,
        title: string,
        subtitle?: string
    }>()

    const authState = $derived(authStore.authState)
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
    <div class="max-w-md w-full space-y-8">
        <div class="text-center">
            <h1 class="text-3xl font-extrabold text-gray-900">{title}</h1>
            {#if subtitle}
                <p class="mt-2 text-sm text-gray-600">{subtitle}</p>
            {/if}
        </div>

        {#if authState.isLoading}
            <div class="bg-blue-50 p-4 rounded-md text-center text-blue-700">
                <svg class="animate-spin h-5 w-5 text-blue-700 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Loading authentication state...</p>
            </div>
        {/if}

        <div class="bg-white p-6 shadow-lg rounded-xl">
            {@render children?.()}
        </div>

        <div class="text-center mt-4">
            <a href="/about" class="text-sm text-gray-600 hover:text-gray-900">
                Learn more about ScrapeScribe
            </a>
        </div>
    </div>
</div>
