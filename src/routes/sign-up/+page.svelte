<script lang="ts">
    import {onMount} from 'svelte'
    import {goto} from '$app/navigation'
    import {authStore} from '$lib/states/auth.svelte'

    import {Input} from "$lib/components/ui/input"
    import {Label} from "$lib/components/ui/label"
    import {Button} from "$lib/components/ui/button"
    import * as Card from "$lib/components/ui/card"
    import * as Alert from '$lib/components/ui/alert'
    import * as InputOTP from "$lib/components/ui/input-otp"

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
                await goto('/sign-in')
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
<Card.Root class="max-w-md mx-auto px-8 py-4">

    {#if !signUpState.isConfirmRequired}

        <Card.Header>

            <Card.Title class="text-sm font-bold">Sign Up</Card.Title>
            <Card.Description>Create new account or <a class="underline" href="/sign-in">sign in</a>
            </Card.Description>
        </Card.Header>
    {:else}
        <Alert.Root>
            <Alert.Title>Please check your email!</Alert.Title>
            <Alert.Description>
                A verification code has been sent to your email. Please enter it below to confirm your account.
            </Alert.Description>
        </Alert.Root>
    {/if}

    {#if signUpState.isConfirmRequired}
        <!-- Confirmation Form -->

        <Card.Content>

            <form onsubmit={handleConfirmSignUp}>
                <div class="grid gap-4">

                    <div class="flex flex-col space-y-1.5">
                        <Label for="confirmationCode" class="mx-auto mb-3">Verification Code</Label>
                        <InputOTP.Root
                                class="mx-auto"
                                maxlength={6} bind:value={confirmationCode} disabled={isConfirming || signUpState.isLoading} oninput={handleConfirmationCodeChange} id="confirmationCode">
                            {#snippet children({ cells })}
                                <InputOTP.Group>
                                    {#each cells.slice(0, 3) as cell}
                                        <InputOTP.Slot {cell} />
                                    {/each}
                                </InputOTP.Group>
                                <InputOTP.Separator />
                                <InputOTP.Group>
                                    {#each cells.slice(3, 6) as cell}
                                        <InputOTP.Slot {cell} />
                                    {/each}
                                </InputOTP.Group>
                            {/snippet}
                        </InputOTP.Root>
                        {#if confirmationCodeError}
                            <p>{confirmationCodeError}</p>
                        {/if}
                    </div>

                    <span class="text-secondary-foreground text-sm">Please enter the one-time password sent to your email.</span>

                    <Button
                            type="submit"
                            disabled={isConfirming || signUpState.isLoading}
                    >
                        {#if isConfirming || signUpState.isLoading}
                            Confirming...
                        {:else}
                            Confirm Sign Up
                        {/if}
                    </Button>
                </div>
            </form>
        </Card.Content>
    {:else}
        <!-- Sign Up Form -->
        <Card.Content>

            <form onsubmit={handleSignUp}>
                <div class="grid gap-4">
                    <div class="flex flex-col space-y-1.5">
                        <Label for="email">Email</Label>
                        <Input
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

                    <div class="flex flex-col space-y-1.5">
                        <Label for="password">Password</Label>
                        <Input
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

                    <div class="flex flex-col space-y-1.5">
                        <Label for="confirmPassword">Confirm Password</Label>
                        <Input
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

                    <Button
                            type="submit"
                            disabled={isSubmitting || signUpState.isLoading}
                    >
                        {#if isSubmitting || signUpState.isLoading}
                            Signing Up...
                        {:else}
                            Sign Up
                        {/if}
                    </Button>
                </div>
            </form>
        </Card.Content>
        <Card.Footer>
            <a href="/sign-in">Already have an account? Sign in</a>
        </Card.Footer>
    {/if}


</Card.Root>
