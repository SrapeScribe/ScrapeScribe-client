<script lang="ts">
    import {onMount} from 'svelte'
    import {goto} from '$app/navigation'
    import {authStore} from '$lib/states/auth.svelte'

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

    onMount(async () => {
        console.log("📍 SignIn component mounted")
    })

    $effect(() => {
        // user is already authenticated => redirect to profile
        if (authState.isAuthenticated) {
            console.log("📍 User already authenticated, redirecting to profile")
            goto('/profile')
        }
    })

    // Basic validation TODO: replace with zod
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
                console.log("📍 Sign in successful, redirecting to profile")
                await goto('/profile')
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
    <title>Sign In</title>
</svelte:head>

<div>
    <h1>Sign In</h1>

    <!-- global store loading state -->
    {#if authState.isLoading}
        <div>Loading authentication state...</div>
    {/if}

    <!-- errors from auth store -->
    {#if signInState.error}
        <div>
            <p>{signInState.error}</p>
        </div>
    {/if}

    <form onsubmit={handleSignIn}>
        <div>
            <label for="email">Email</label>
            <input
                    type="email"
                    id="email"
                    bind:value={email}
                    oninput={handleEmailChange}
                    disabled={isSubmitting || signInState.isLoading}
                    placeholder="Enter your email"
            />
            {#if emailError}
                <p>{emailError}</p>
            {/if}
        </div>

        <div>
            <label for="password">Password</label>
            <input
                    type="password"
                    id="password"
                    bind:value={password}
                    oninput={handlePasswordChange}
                    disabled={isSubmitting || signInState.isLoading}
                    placeholder="Enter your password"
            />
            {#if passwordError}
                <p>{passwordError}</p>
            {/if}
        </div>

        <button
                type="submit"
                disabled={isSubmitting || signInState.isLoading}
        >
            {#if isSubmitting || signInState.isLoading}
                Signing In...
            {:else}
                Sign In
            {/if}
        </button>
    </form>

    <div>
        <a href="/sign-up">Don't have an account? Sign up</a>
    </div>
</div>
