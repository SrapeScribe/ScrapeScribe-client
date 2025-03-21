<script lang="ts">
    import {onMount} from 'svelte'
    import {authStore} from '$lib/states/auth.svelte'
    import {Button} from "$lib/components/ui/button"
    import {Input} from "$lib/components/ui/input"
    import {Label} from "$lib/components/ui/label"
    import * as InputOTP from "$lib/components/ui/input-otp"
    import * as Alert from '$lib/components/ui/alert/index.js'
    import {CircleAlert, CheckCircle} from 'lucide-svelte'
    import AuthLayout from '$lib/components/auth/auth-layout.svelte'
    import {goto} from "$app/navigation"

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
            goto('/dashboard')
        }
    })

    // Basic validation
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
        } else if (!/[!@#$%^&*]/.test(password)) {
            passwordError = 'Password must have at least one symbol character'
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

        if (!confirmationCode || confirmationCode.length !== 6) {
            confirmationCodeError = 'Please enter the complete 6-digit code'
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
            await goto('/dashboard')
            console.log("📍 Confirmation result:", success)
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
    <title>Sign Up | ScrapeScribe</title>
</svelte:head>

<AuthLayout
        title={signUpState.isConfirmRequired ? "Verify your account" : "Create your account"}
        subtitle={signUpState.isConfirmRequired ? "We've sent a code to your email" : "Join ScrapeScribe to start scraping"}
>
    {#if signUpState.error}
        <Alert.Root variant="destructive" class="mb-6">
            <CircleAlert class="size-4"/>
            <Alert.Description>{signUpState.error}</Alert.Description>
        </Alert.Root>
    {/if}

    {#if signUpState.isConfirmRequired}
        <!-- Confirmation Form -->
        <form onsubmit={handleConfirmSignUp} class="space-y-6">
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <CheckCircle class="h-5 w-5 text-blue-600"/>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-blue-700">
                            A verification code has been sent to <span class="font-semibold">{signUpState.email}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div class="text-center">
                <Label for="confirmationCode" class="block text-sm font-medium text-gray-700 mb-4">Enter verification
                    code</Label>
                <div class="flex justify-center mb-1">
                    <InputOTP.Root
                            maxlength={6}
                            bind:value={confirmationCode}
                            disabled={isConfirming || signUpState.isLoading}
                            oninput={handleConfirmationCodeChange}
                            id="confirmationCode"
                            class="text-center mx-auto"
                    >
                        {#snippet children({cells})}
                            <InputOTP.Group>
                                {#each cells.slice(0, 3) as cell}
                                    <InputOTP.Slot {cell}/>
                                {/each}
                            </InputOTP.Group>
                            <InputOTP.Separator/>
                            <InputOTP.Group>
                                {#each cells.slice(3, 6) as cell}
                                    <InputOTP.Slot {cell}/>
                                {/each}
                            </InputOTP.Group>
                        {/snippet}
                    </InputOTP.Root>
                </div>
                {#if confirmationCodeError}
                    <p class="mt-1 text-sm text-red-600">{confirmationCodeError}</p>
                {/if}
                <p class="text-xs text-gray-500 mt-2">
                    Didn't receive a code? Check your spam folder or contact support.
                </p>
            </div>

            <Button
                    type="submit"
                    class="w-full flex justify-center py-2"
                    disabled={isConfirming || signUpState.isLoading || confirmationCode.length !== 6}
            >
                {#if isConfirming || signUpState.isLoading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                {:else}
                    Verify Account
                {/if}
            </Button>
        </form>
    {:else}
        <!-- Sign Up Form -->
        <form onsubmit={handleSignUp} class="space-y-6">
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
                        disabled={isSubmitting || signUpState.isLoading}
                />
                {#if emailError}
                    <p class="mt-1 text-sm text-red-600">{emailError}</p>
                {/if}
            </div>

            <div>
                <Label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</Label>
                <Input
                        id="password"
                        name="password"
                        type="password"
                        bind:value={password}
                        oninput={handlePasswordChange}
                        class={passwordError ? "border-red-500" : ""}
                        placeholder="••••••••"
                        disabled={isSubmitting || signUpState.isLoading}
                />
                {#if passwordError}
                    <p class="mt-1 text-sm text-red-600">{passwordError}</p>
                {:else}
                    <p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters and include a
                        symbol</p>
                {/if}
            </div>

            <div>
                <Label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm
                    password</Label>
                <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        bind:value={confirmPassword}
                        oninput={handleConfirmPasswordChange}
                        class={confirmPasswordError ? "border-red-500" : ""}
                        placeholder="••••••••"
                        disabled={isSubmitting || signUpState.isLoading}
                />
                {#if confirmPasswordError}
                    <p class="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
                {/if}
            </div>

            <Button
                    type="submit"
                    class="w-full flex justify-center py-2"
                    disabled={isSubmitting || signUpState.isLoading}
            >
                {#if isSubmitting || signUpState.isLoading}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                         fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                {:else}
                    Create account
                {/if}
            </Button>

            <div class="text-center">
                <p class="text-sm text-gray-600">
                    Already have an account?
                    <a href="/sign-in" class="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
                    </a>
                </p>
            </div>
        </form>
    {/if}
</AuthLayout>
