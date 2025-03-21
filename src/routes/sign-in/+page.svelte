<script lang="ts">
    import {onMount} from 'svelte'
    import {goto} from '$app/navigation'
    import {authStore} from '$lib/states/auth.svelte'
    import {Button} from "$lib/components/ui/button"
    import {Input} from "$lib/components/ui/input"
    import {Label} from "$lib/components/ui/label"
    import AuthLayout from '$lib/components/auth/auth-layout.svelte'
    import * as Alert from '$lib/components/ui/alert/index.js'
    import { CircleAlert } from 'lucide-svelte'

    // Form state
    let email = $state('')
    let password = $state('')
    let isSubmitting = $state(false)

    // Validation state
    let emailError = $state('')
    let passwordError = $state('')

    // state from the store
    const signInState = $derived(authStore.signInState)
    const authState = $derived(authStore.authState)

    onMount(() => {
        console.log("📍 SignIn component mounted")
    })

    $effect(() => {
        // user is already authenticated => redirect to profile
        if (authState.isAuthenticated) {
            goto('/dashboard')
        }
    })

    // Basic validation
    function validateForm(): boolean {
        let isValid = true

        // Reset errors
        emailError = ''
        passwordError = ''

        if (!email) {
            emailError = 'Email is required'
            isValid = false
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            emailError = 'Please enter a valid email address'
            isValid = false
        }

        if (!password) {
            passwordError = 'Password is required'
            isValid = false
        } else if (password.length < 8) {
            passwordError = 'Password must be at least 8 characters'
            isValid = false
        }

        return isValid
    }

    async function handleSignIn(event: Event) {
        event.preventDefault()
        console.log("📍 Sign in form submitted")

        if (!validateForm()) {
            console.log("📍 Form validation failed")
            return
        }

        isSubmitting = true
        console.log("📍 isSubmitting set to true")

        try {
            const success = await authStore.handleSignIn(email, password)
            console.log("📍 Sign in result:", success)

            if (success) {
                await goto('/dashboard')
            }
        } finally {
            isSubmitting = false
            console.log("📍 isSubmitting set to false")
        }
    }

    // Clear the error when input changes
    function handleEmailChange() {
        emailError = ''
        authStore.signInState.error = null
    }

    function handlePasswordChange() {
        passwordError = ''
        authStore.signInState.error = null
    }
</script>

<svelte:head>
    <title>Sign In | ScrapeScribe</title>
</svelte:head>

<AuthLayout title="Sign In to ScrapeScribe" subtitle="Welcome back! Please enter your credentials">
    {#if signInState.error}
        <Alert.Root variant="destructive" class="mb-6">
            <CircleAlert class="size-4" />
            <Alert.Description>{signInState.error}</Alert.Description>
        </Alert.Root>
    {/if}

    <form onsubmit={handleSignIn} class="space-y-6">
        <div>
            <Label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</Label>
            <Input
                    id="email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    bind:value={email}
                    oninput={handleEmailChange}
                    class={emailError ? "border-red-500" : ""}
                    placeholder="you@example.com"
                    disabled={isSubmitting || signInState.isLoading}
            />
            {#if emailError}
                <p class="mt-1 text-sm text-red-600">{emailError}</p>
            {/if}
        </div>

        <div>
            <div class="flex items-center justify-between">
                <Label for="password" class="block text-sm font-medium text-gray-700">Password</Label>
                <!-- <a href="#" class="text-xs text-blue-600 hover:text-blue-500">Forgot your password?</a> -->
            </div>
            <Input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    bind:value={password}
                    oninput={handlePasswordChange}
                    class={passwordError ? "border-red-500" : ""}
                    placeholder="••••••••"
                    disabled={isSubmitting || signInState.isLoading}
            />
            {#if passwordError}
                <p class="mt-1 text-sm text-red-600">{passwordError}</p>
            {/if}
        </div>

        <Button
                type="submit"
                class="w-full flex justify-center py-2"
                disabled={isSubmitting || signInState.isLoading}
        >
            {#if isSubmitting || signInState.isLoading}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
            {:else}
                Sign in
            {/if}
        </Button>

        <div class="text-center">
            <p class="text-sm text-gray-600">
                Don't have an account?
                <a href="/sign-up" class="font-medium text-blue-600 hover:text-blue-500">
                    Sign up
                </a>
            </p>
        </div>
    </form>
</AuthLayout>
