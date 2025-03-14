<script lang="ts">
    import {onMount} from 'svelte'
    import {goto} from '$app/navigation'
    import {authStore} from '$lib/states/auth.svelte'

    // Form state
    let email = $state('')
    let password = $state('')
    let confirmPassword = $state('')
    let isSubmitting = $state(false)

    // Form state for confirmation
    let confirmationCode = $state('')
    let isConfirming = $state(false)

    // Validation state
    let emailError = $state('')
    let passwordError = $state('')
    let confirmPasswordError = $state('')
    let confirmationCodeError = $state('')

    // state from the store
    const signUpState = $derived(authStore.signUpState)
    const authState = $derived(authStore.authState)

    onMount(() => {
        console.log("📝 SignUp component mounted")
    })
    $effect(() => {
        // user is already authenticated => redirect to profile
        if (authState.isAuthenticated) {
            console.log("📍 User already authenticated, redirecting to profile")
            goto('/profile')
        }
    })


    // Basic validation TODO: replace with zod
    function validateSignUpForm(): boolean {
        let isValid = true

        // Reset errors
        emailError = ''
        passwordError = ''
        confirmPasswordError = ''

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

        if (password !== confirmPassword) {
            confirmPasswordError = 'Passwords do not match'
            isValid = false
        }

        return isValid
    }

    function validateConfirmationForm(): boolean {
        confirmationCodeError = ''

        if (!confirmationCode) {
            confirmationCodeError = 'Confirmation code is required'
            return false
        }

        return true
    }

    async function handleSignUp(event: Event) {
        event.preventDefault()
        console.log("📍 Sign up form submitted")

        if (!validateSignUpForm()) {
            console.log("📍 Form validation failed")
            return
        }

        isSubmitting = true
        console.log("📍 isSubmitting set to true")

        try {
            const success = await authStore.handleSignUp(email, password)
            console.log("📍 Sign up result:", success)

            if (success && !signUpState.isConfirmRequired) {
                console.log("📍 Sign up completed without confirmation, redirecting to sign in")
                await goto('/sign-in')
            }
        } finally {
            isSubmitting = false
            console.log("📍 isSubmitting set to false")
        }
    }

    async function handleConfirmSignUp(event: Event) {
        event.preventDefault()
        console.log("📍 Confirmation form submitted")

        if (!validateConfirmationForm()) {
            console.log("📍 Confirmation form validation failed")
            return
        }

        isConfirming = true
        console.log("📍 isConfirming set to true")

        try {
            const success = await authStore.handleConfirmSignUp(signUpState.email, confirmationCode)
            console.log("📍 Confirmation result:", success)

            if (success) {
                console.log("📍 Sign up confirmation completed, redirecting to sign in")
                await goto('/profile')
            }
        } finally {
            isConfirming = false
            console.log("📍 isConfirming set to false")
        }
    }

    // Clear validation errors when input changes
    function handleEmailChange() {
        emailError = ''
        authStore.signUpState.error = null
    }

    function handlePasswordChange() {
        passwordError = ''
        authStore.signUpState.error = null
    }

    function handleConfirmPasswordChange() {
        confirmPasswordError = ''
        authStore.signUpState.error = null
    }

    function handleConfirmationCodeChange() {
        confirmationCodeError = ''
        authStore.signUpState.error = null
    }
</script>

<svelte:head>
    <title>Sign Up</title>
</svelte:head>

<div>
    <h1>Sign Up</h1>

    <!-- global loading state -->
    {#if authState.isLoading}
        <div>Loading authentication state...</div>
    {/if}

    <!-- errors from auth store -->
    {#if signUpState.error}
        <div>
            <p>{signUpState.error}</p>
        </div>
    {/if}

    {#if signUpState.isConfirmRequired}
        <!-- Confirmation Form -->
        <div>
            <p>A verification code has been sent to your email. Please enter it below to confirm your account.</p>
        </div>

        <form onsubmit={handleConfirmSignUp}>
            <div>
                <label for="confirmationCode">Verification Code</label>
                <input
                        type="text"
                        id="confirmationCode"
                        bind:value={confirmationCode}
                        oninput={handleConfirmationCodeChange}
                        disabled={isConfirming || signUpState.isLoading}
                        placeholder="Enter verification code"
                />
                {#if confirmationCodeError}
                    <p>{confirmationCodeError}</p>
                {/if}
            </div>

            <button
                    type="submit"
                    disabled={isConfirming || signUpState.isLoading}
            >
                {#if isConfirming || signUpState.isLoading}
                    Confirming...
                {:else}
                    Confirm Sign Up
                {/if}
            </button>
        </form>
    {:else}
        <!-- Sign Up Form -->
        <form onsubmit={handleSignUp}>
            <div>
                <label for="email">Email</label>
                <input
                        type="email"
                        id="email"
                        bind:value={email}
                        oninput={handleEmailChange}
                        disabled={isSubmitting || signUpState.isLoading}
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
                        disabled={isSubmitting || signUpState.isLoading}
                        placeholder="Enter your password"
                />
                {#if passwordError}
                    <p>{passwordError}</p>
                {/if}
            </div>

            <div>
                <label for="confirmPassword">Confirm Password</label>
                <input
                        type="password"
                        id="confirmPassword"
                        bind:value={confirmPassword}
                        oninput={handleConfirmPasswordChange}
                        disabled={isSubmitting || signUpState.isLoading}
                        placeholder="Confirm your password"
                />
                {#if confirmPasswordError}
                    <p>{confirmPasswordError}</p>
                {/if}
            </div>

            <button
                    type="submit"
                    disabled={isSubmitting || signUpState.isLoading}
            >
                {#if isSubmitting || signUpState.isLoading}
                    Signing Up...
                {:else}
                    Sign Up
                {/if}
            </button>
        </form>
    {/if}

    <div>
        <a href="/sign-in">Already have an account? Sign in</a>
    </div>
</div>
