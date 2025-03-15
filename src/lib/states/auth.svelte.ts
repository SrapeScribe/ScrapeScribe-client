import {
    signIn,
    signOut,
    signUp,
    confirmSignUp,
    getCurrentUser,
    fetchUserAttributes,
    type AuthUser
} from '@aws-amplify/auth'

type AuthState = {
    user: AuthUser | null;
    userAttributes: Record<string, string> | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
};

type InitState = {
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
};

type SignUpState = {
    isLoading: boolean;
    error: string | null;
    email: string;
    isConfirmRequired: boolean;
};

type SignInState = {
    isLoading: boolean;
    error: string | null;
};

export class AuthStore {
    // Main auth state
    authState = $state<AuthState>({
        user: null,
        userAttributes: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
    })

    // Initialization state
    initState = $state<InitState>({
        isLoading: false,
        error: null,
        isInitialized: false
    })

    // Sign up state
    signUpState = $state<SignUpState>({
        isLoading: false,
        error: null,
        email: '',
        isConfirmRequired: false
    })

    // Sign in state
    signInState = $state<SignInState>({
        isLoading: false,
        error: null
    })

    constructor() {
        console.log("🔐 AuthStore instantiated")
    }

    /**
     * Initialize the auth store by checking for a current user
     */
    async initialize(): Promise<AuthUser | null> {
        // If already initialized and not forced, return current user
        if (this.initState.isInitialized) {
            console.log("🔐 AuthStore already initialized, returning current state")
            return this.authState.user
        }

        this.initState.isLoading = true
        this.initState.error = null
        console.log("🔐 initState.isLoading set to true")

        try {
            console.log("🔐 Attempting to get current user")
            const currentUser = await getCurrentUser()
            console.log("🔐 Current user retrieved", currentUser)

            this.authState.user = currentUser
            this.authState.isAuthenticated = true
            console.log("🔐 isAuthenticated set to true")

            // Fetch user attributes if user exists
            await this.fetchAttributes()

            return currentUser
        } catch (error) {
            // For expected auth errors, handle gracefully
            if (error instanceof Error) {
                // Check for common auth errors, primarily by name
                if (error.name === "UserUnAuthenticatedException" ||
                    error.name === "NoUserPoolClientException" ||
                    error.message.includes("User needs to be authenticated") ||
                    error.message.includes("No current user")) {

                    console.log("🔐 No active session found (expected)")

                    // This is an expected state, not really an error
                    this.authState.user = null
                    this.authState.userAttributes = null
                    this.authState.isAuthenticated = false
                    console.log("🔐 isAuthenticated set to false (no session)")

                    // Don't set error for expected auth state
                    this.initState.error = null
                } else if (error.message.includes("Invalid configuration")) {
                    // This is a configuration error
                    console.error("🔐 AWS Amplify configuration error:", error)
                    this.initState.error = "Auth configuration error. Please check your AWS settings."
                    console.log("🔐 Error stored (config error):", this.initState.error)
                } else {
                    // Unexpected error
                    console.error("🔐 Unexpected auth error:", error)
                    this.initState.error = "Authentication error: " + error.message
                    console.log("🔐 Error stored (unexpected):", this.initState.error)
                }
            } else {
                console.error("🔐 Unknown auth error:", error)
                this.initState.error = "Unknown authentication error occurred"
                console.log("🔐 Error stored (unknown):", this.initState.error)
            }

            this.authState.user = null
            this.authState.userAttributes = null
            this.authState.isAuthenticated = false

            return null
        } finally {
            this.initState.isInitialized = true
            this.initState.isLoading = false
            console.log("🔐 isInitialized set to true")
            console.log("🔐 initState.isLoading set to false")
        }
    }

    /**
     * Fetch user attributes
     */
    async fetchAttributes(): Promise<Record<string, string> | null> {
        if (!this.authState.isAuthenticated) {
            console.log("🔐 Not authenticated, skipping attribute fetch")
            return null
        }

        this.authState.isLoading = true
        console.log("🔐 authState.isLoading set to true for fetchAttributes")

        try {
            console.log("🔐 Fetching user attributes")
            const attributes = await fetchUserAttributes()
            console.log("🔐 User attributes fetched", attributes)

            this.authState.userAttributes = attributes
            return attributes
        } catch (error) {
            console.error("🔐 Error fetching user attributes:", error)
            // Don't show this error to users
            return null
        } finally {
            this.authState.isLoading = false
            console.log("🔐 authState.isLoading set to false after fetchAttributes")
        }
    }

    /**
     * Sign up a new user
     */
    async handleSignUp(email: string, password: string): Promise<boolean> {
        this.signUpState.isLoading = true
        this.signUpState.error = null
        this.signUpState.email = email
        this.signUpState.isConfirmRequired = false
        console.log("🔐 signUpState.isLoading set to true")
        console.log("🔐 Attempting sign up for email:", email)

        try {
            const {isSignUpComplete, nextStep} = await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email
                    }
                }
            })

            console.log("🔐 Sign up response:", {isSignUpComplete, nextStep})

            // Check if confirmation is required
            if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
                console.log("🔐 Confirmation required")
                this.signUpState.isConfirmRequired = true
                return false // Not complete yet, needs confirmation
            }

            if (isSignUpComplete) {
                console.log("🔐 Sign up completed successfully")
                return true
            }

            return false
        }         catch (error) {
            console.error("🔐 Error during sign up:", error)
            if (error instanceof Error) {
                // First try to use the error name (standard for Cognito errors)
                this.signUpState.error = this.formatAuthError(error.name, 'signup')
            } else {
                this.signUpState.error = 'An unexpected error occurred during sign up'
            }
            console.log("🔐 Sign up error stored:", this.signUpState.error)
            return false
        } finally {
            this.signUpState.isLoading = false
            console.log("🔐 signUpState.isLoading set to false")
        }
    }

    /**
     * Confirm sign up with verification code
     */
    async handleConfirmSignUp(email: string, confirmationCode: string): Promise<boolean> {
        this.signUpState.isLoading = true
        this.signUpState.error = null
        console.log("🔐 signUpState.isLoading set to true for confirmation")
        console.log("🔐 Attempting to confirm sign up for email:", email)

        try {
            const {isSignUpComplete, nextStep} = await confirmSignUp({
                username: email,
                confirmationCode
            })

            console.log("🔐 Confirm sign up response:", {isSignUpComplete, nextStep})

            if (isSignUpComplete) {
                console.log("🔐 Sign up confirmation completed successfully")
                this.signUpState.isConfirmRequired = false
                return true
            }

            return false
        }         catch (error) {
            console.error("🔐 Error during sign up confirmation:", error)
            if (error instanceof Error) {
                // First try to use the error name (standard for Cognito errors)
                this.signUpState.error = this.formatAuthError(error.name, 'confirm')
            } else {
                this.signUpState.error = 'Failed to confirm sign up'
            }
            console.log("🔐 Confirmation error stored:", this.signUpState.error)
            return false
        } finally {
            this.signUpState.isLoading = false
            console.log("🔐 signUpState.isLoading set to false after confirmation")
        }
    }

    /**
     * Sign in a user
     */
    async handleSignIn(email: string, password: string): Promise<boolean> {
        this.signInState.isLoading = true
        this.signInState.error = null
        console.log("🔐 signInState.isLoading set to true")
        console.log("🔐 Attempting sign in for email:", email)

        try {
            await signIn({
                username: email,
                password,
                options: {
                    authFlowType: "USER_SRP_AUTH"
                }
            })

            console.log("🔐 Sign in successful")

            // Update auth state
            this.authState.isAuthenticated = true
            console.log("🔐 isAuthenticated set to true")

            // Get current user after successful sign in
            this.authState.user = await getCurrentUser()
            console.log("🔐 Current user updated after sign in")

            // Fetch user attributes
            await this.fetchAttributes()

            return true
        }         catch (error) {
            console.error("🔐 Error during sign in:", error)
            if (error instanceof Error) {
                // First try to use the error name (standard for Cognito errors)
                this.signInState.error = this.formatAuthError(error.name, 'signin')
            } else {
                this.signInState.error = 'Failed to sign in'
            }
            console.log("🔐 Sign in error stored:", this.signInState.error)
            return false
        } finally {
            this.signInState.isLoading = false
            console.log("🔐 signInState.isLoading set to false")
        }
    }

    /**
     * Sign out the current user
     */
    async handleSignOut(): Promise<boolean> {
        this.authState.isLoading = true
        this.authState.error = null
        console.log("🔐 authState.isLoading set to true for sign out")

        try {
            await signOut()
            console.log("🔐 Sign out successful")

            // Reset auth state
            this.authState.user = null
            this.authState.userAttributes = null
            this.authState.isAuthenticated = false
            console.log("🔐 Auth state reset after sign out")

            return true
        }         catch (error) {
            console.error("🔐 Error during sign out:", error)
            if (error instanceof Error) {
                // First try to use the error name (standard for Cognito errors)
                this.authState.error = this.formatAuthError(error.name, 'signout')
            } else {
                this.authState.error = 'Failed to sign out'
            }
            console.log("🔐 Sign out error stored:", this.authState.error)
            return false
        } finally {
            this.authState.isLoading = false
            console.log("🔐 authState.isLoading set to false after sign out")
        }
    }

    /**
     * Clear any sign up/in errors
     */
    clearErrors(): void {
        console.log("🔐 Clearing all errors")
        this.authState.error = null
        this.signUpState.error = null
        this.signInState.error = null
        this.initState.error = null
    }

    /**
     * Format auth errors to be more user-friendly
     */
    private formatAuthError(errorInfo: string, context: 'signin' | 'signup' | 'confirm' | 'signout'): string {
        // Common AWS Cognito error names
        switch (errorInfo) {
            case 'UserNotFoundException':
                return 'The email you entered does not exist in our system.';

            case 'NotAuthorizedException':
                return 'Incorrect email or password. Please try again.';

            case 'UserNotConfirmedException':
                return 'Your account is not confirmed yet. Please check your email for a verification code.';

            case 'CodeMismatchException':
                return 'The verification code you entered is incorrect. Please try again.';

            case 'ExpiredCodeException':
                return 'The verification code has expired. Please request a new one.';

            case 'UsernameExistsException':
                return 'An account with this email already exists.';

            case 'InvalidPasswordException':
                return 'Password does not meet requirements. Please use a stronger password.';

            case 'LimitExceededException':
                return 'Too many attempts. Please try again later.';

            case 'UserUnAuthenticatedException':
                return 'Your session has expired. Please sign in again.';
        }

        if (errorInfo.includes('User needs to be authenticated')) {
            return 'Your session has expired. Please sign in again.';
        }

        if (errorInfo.includes('configuration')) {
            return 'There\'s a configuration issue with the authentication service. Please contact support.';
        }

        switch (context) {
            case 'signin':
                return 'Sign-in failed. Please check your credentials and try again.'
            case 'signup':
                return 'Sign-up failed. Please try again later.'
            case 'confirm':
                return 'Failed to confirm your account. Please try again.'
            case 'signout':
                return 'Sign-out failed. Please try again.'
            default:
                return 'An error occurred. Please try again.'
        }
    }
}

export const authStore = new AuthStore()
