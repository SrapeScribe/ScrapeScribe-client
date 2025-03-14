import {
    signIn,
    signOut,
    signUp,
    confirmSignUp,
    getCurrentUser,
    fetchUserAttributes,
    type AuthUser,
    autoSignIn
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
    });

    // Initialization state
    initState = $state<InitState>({
        isLoading: false,
        error: null,
        isInitialized: false
    });

    // Sign up state
    signUpState = $state<SignUpState>({
        isLoading: false,
        error: null,
        email: '',
        isConfirmRequired: false
    });

    // Sign in state
    signInState = $state<SignInState>({
        isLoading: false,
        error: null
    });

    constructor() {
        console.log("🔐 AuthStore instantiated");
    }

    /**
     * Initialize the auth store by checking for a current user
     */
    async initialize(): Promise<AuthUser | null> {
        if (this.initState.isInitialized) {
            console.log("🔐 AuthStore already initialized, skipping");
            return this.authState.user;
        }

        this.initState.isLoading = true;
        console.log("📍 initState.isLoading set to true");

        try {
            console.log("📍 Attempting to get current user");
            const currentUser = await getCurrentUser();
            console.log("📍 Current user retrieved", currentUser);

            this.authState.user = currentUser;
            this.authState.isAuthenticated = true;
            this.initState.isInitialized = true;
            console.log("📍 isAuthenticated set to true");
            console.log("📍 isInitialized set to true");

            // Fetch user attributes if user exists
            await this.fetchAttributes();

            return currentUser;
        } catch (error) {
            console.error("📍 Error initializing auth:", error);

            this.authState.user = null;
            this.authState.isAuthenticated = false;
            this.initState.error = error instanceof Error ? error.message : 'Failed to initialize authentication';
            console.log("📍 isAuthenticated set to false");
            console.log("📍 Error stored:", this.initState.error);

            this.initState.isInitialized = true;
            console.log("📍 isInitialized set to true (after error)");

            return null;
        } finally {
            this.initState.isLoading = false;
            console.log("📍 initState.isLoading set to false");
        }
    }

    /**
     * Fetch user attributes
     */
    async fetchAttributes(): Promise<Record<string, string> | null> {
        if (!this.authState.isAuthenticated) {
            console.log("📍 Not authenticated, skipping attribute fetch");
            return null;
        }

        this.authState.isLoading = true;
        console.log("📍 authState.isLoading set to true for fetchAttributes");

        try {
            console.log("📍 Fetching user attributes");
            const attributes = await fetchUserAttributes();
            console.log("📍 User attributes fetched", attributes);

            // @ts-ignore
            this.authState.userAttributes = attributes;
            // @ts-ignore
            return attributes;
        } catch (error) {
            console.error("📍 Error fetching user attributes:", error);
            this.authState.error = error instanceof Error ? error.message : 'Failed to fetch user attributes';
            console.log("📍 Error stored:", this.authState.error);
            return null;
        } finally {
            this.authState.isLoading = false;
            console.log("📍 authState.isLoading set to false after fetchAttributes");
        }
    }

    /**
     * Sign up a new user
     */
    async handleSignUp(email: string, password: string): Promise<boolean> {
        this.signUpState.isLoading = true;
        this.signUpState.error = null;
        this.signUpState.email = email;
        this.signUpState.isConfirmRequired = false;
        console.log("📍 signUpState.isLoading set to true");
        console.log("📍 Attempting sign up for email:", email);

        try {
            const { isSignUpComplete, nextStep } = await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email
                    }
                }
            });

            console.log("📍 Sign up response:", { isSignUpComplete, nextStep });

            // Check if confirmation is required
            if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
                console.log("📍 Confirmation required");
                this.signUpState.isConfirmRequired = true;
                return false; // Not complete yet, needs confirmation
            }

            if (isSignUpComplete) {
                console.log("📍 Sign up completed successfully");
                return true;
            }

            return false;
        } catch (error) {
            console.error("📍 Error during sign up:", error);
            this.signUpState.error = error instanceof Error ? error.message : 'Failed to sign up';
            console.log("📍 Sign up error stored:", this.signUpState.error);
            return false;
        } finally {
            this.signUpState.isLoading = false;
            console.log("📍 signUpState.isLoading set to false");
        }
    }

    /**
     * Confirm sign up with verification code
     */
    async handleConfirmSignUp(email: string, confirmationCode: string): Promise<boolean> {
        this.signUpState.isLoading = true;
        this.signUpState.error = null;
        console.log("📍 signUpState.isLoading set to true for confirmation");
        console.log("📍 Attempting to confirm sign up for email:", email);

        try {
            const { isSignUpComplete, nextStep } = await confirmSignUp({
                username: email,
                confirmationCode
            });

            console.log("📍 Confirm sign up response:", { isSignUpComplete, nextStep });

            if (isSignUpComplete) {
                console.log("📍 Sign up confirmation completed successfully");
                this.signUpState.isConfirmRequired = false;


                // TODO: Auto sign in isn't working, fix this

                // const { nextStep } = await autoSignIn()

                // if (nextStep.signInStep === 'DONE')
                //     console.log("📍 Sign in successful after sign up confirmation");

                return true;
            }

            return false;
        } catch (error) {
            console.error("📍 Error during sign up confirmation:", error);
            this.signUpState.error = error instanceof Error ? error.message : 'Failed to confirm sign up';
            console.log("📍 Confirmation error stored:", this.signUpState.error);
            return false;
        } finally {
            this.signUpState.isLoading = false;
            console.log("📍 signUpState.isLoading set to false after confirmation");
        }
    }

    /**
     * Sign in a user
     */
    async handleSignIn(email: string, password: string): Promise<boolean> {
        this.signInState.isLoading = true;
        this.signInState.error = null;
        console.log("📍 signInState.isLoading set to true");
        console.log("📍 Attempting sign in for email:", email);

        try {
            await signIn({
                username: email,
                password,
                options: {
                    authFlowType: "USER_SRP_AUTH"
                }
            });

            console.log("📍 Sign in successful");

            // Update auth state
            this.authState.isAuthenticated = true;
            console.log("📍 isAuthenticated set to true");

            // Get current user after successful sign in
            this.authState.user = await getCurrentUser();
            console.log("📍 Current user updated after sign in");

            // Fetch user attributes
            await this.fetchAttributes();

            return true;
        } catch (error) {
            console.error("📍 Error during sign in:", error);
            this.signInState.error = error instanceof Error ? error.message : 'Failed to sign in';
            console.log("📍 Sign in error stored:", this.signInState.error);
            return false;
        } finally {
            this.signInState.isLoading = false;
            console.log("📍 signInState.isLoading set to false");
        }
    }

    /**
     * Sign out the current user
     */
    async handleSignOut(): Promise<boolean> {
        this.authState.isLoading = true;
        this.authState.error = null;
        console.log("📍 authState.isLoading set to true for sign out");

        try {
            await signOut();
            console.log("📍 Sign out successful");

            // Reset auth state
            this.authState.user = null;
            this.authState.userAttributes = null;
            this.authState.isAuthenticated = false;
            console.log("📍 Auth state reset after sign out");

            return true;
        } catch (error) {
            console.error("📍 Error during sign out:", error);
            this.authState.error = error instanceof Error ? error.message : 'Failed to sign out';
            console.log("📍 Sign out error stored:", this.authState.error);
            return false;
        } finally {
            this.authState.isLoading = false;
            console.log("📍 authState.isLoading set to false after sign out");
        }
    }

    /**
     * Clear any sign up/in errors
     */
    clearErrors(): void {
        console.log("📍 Clearing all errors");
        this.authState.error = null;
        this.signUpState.error = null;
        this.signInState.error = null;
        this.initState.error = null;
    }
}

export const authStore = new AuthStore();
