<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '$lib/states/auth.svelte';
    import LogoutButton from '$lib/components/auth/logout-button.svelte';
    import * as Alert from '$lib/components/ui/alert/index.js';
    import { CircleAlert } from 'lucide-svelte';

    // Derived state from auth store
    const authState = $derived(authStore.authState);
    const isLoading = $derived(authStore.authState.isLoading);
    const isAuthenticated = $derived(authStore.authState.isAuthenticated);
    const error = $derived(authStore.authState.error);
    const user = $derived(authStore.authState.user);
    const userAttributes = $derived(authStore.authState.userAttributes || {});

    // User information
    const email = $derived(userAttributes.email || user?.username || '');
    const userId = $derived(user?.userId || userAttributes.sub || '');
    const name = $derived(userAttributes.name || '');
    const givenName = $derived(userAttributes.given_name || '');
    const familyName = $derived(userAttributes.family_name || '');
    const preferredUsername = $derived(userAttributes.preferred_username || '');
    const phoneNumber = $derived(userAttributes.phone_number || '');

    // Display-friendly attribute names
    const attributeLabels: Record<string, string> = {
        sub: 'User ID',
        email: 'Email',
        name: 'Full Name',
        family_name: 'Last Name',
        given_name: 'First Name',
        middle_name: 'Middle Name',
        nickname: 'Nickname',
        preferred_username: 'Username',
        profile: 'Profile URL',
        picture: 'Profile Picture',
        website: 'Website',
        gender: 'Gender',
        birthdate: 'Birthdate',
        zoneinfo: 'Time Zone',
        locale: 'Locale',
        updated_at: 'Last Updated',
        address: 'Address',
        phone_number: 'Phone Number',
        email_verified: 'Email Verified',
        phone_number_verified: 'Phone Verified'
    };

    // For attributes we want to exclude from the additional section
    const excludedAttributes = ['email', 'sub', 'email_verified'];

    onMount(async () => {
        console.log("👤 Profile: Component mounted");
        await initializeProfile();
    });

    async function initializeProfile() {
        // Initialize auth if needed
        if (!authStore.initState.isInitialized) {
            console.log("👤 Profile: Auth not initialized, initializing");
            await authStore.initialize();
        }

        // Fetch attributes if authenticated but no attributes yet
        if (isAuthenticated && !userAttributes) {
            console.log("👤 Profile: Authenticated but no attributes, fetching");
            await authStore.fetchAttributes();
        }
    }

    // Format the attribute value based on its type and name
    function formatAttributeValue(key: string, value: any): string {
        if (key === 'email_verified' || key === 'phone_number_verified') {
            return value === 'true' ? 'Yes' : 'No';
        } else if (key === 'updated_at') {
            return new Date(parseInt(value) * 1000).toLocaleString();
        } else if (typeof value === 'string') {
            return value;
        } else {
            return JSON.stringify(value);
        }
    }
</script>

<svelte:head>
    <title>Profile</title>
</svelte:head>

<div class="container max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Your Profile</h1>

    {#if isLoading}
        <div class="bg-gray-100 p-4 rounded">Loading your profile...</div>
    {:else if !isAuthenticated}
        <div class="bg-yellow-100 p-4 rounded">
            <p>You are not signed in. Redirecting to sign in page...</p>
        </div>
    {:else}
        {#if error}
            <Alert.Root variant="destructive" class="mb-4">
                <CircleAlert class="size-4" />
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
        {/if}

        <div class="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
            <!-- Primary Account Information -->
            <div class="p-4">
                <h2 class="text-xl font-semibold mb-4">Account Information</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-gray-500 text-sm">Email</p>
                        <p class="font-medium">{email}</p>
                    </div>

                    <div>
                        <p class="text-gray-500 text-sm">User ID</p>
                        <p class="font-mono text-sm break-all">{userId}</p>
                    </div>

                    {#if name}
                        <div>
                            <p class="text-gray-500 text-sm">Full Name</p>
                            <p>{name}</p>
                        </div>
                    {/if}

                    {#if preferredUsername}
                        <div>
                            <p class="text-gray-500 text-sm">Username</p>
                            <p>{preferredUsername}</p>
                        </div>
                    {/if}

                    {#if phoneNumber}
                        <div>
                            <p class="text-gray-500 text-sm">Phone Number</p>
                            <p>{phoneNumber}</p>
                        </div>
                    {/if}

                    {#if userAttributes.email_verified}
                        <div>
                            <p class="text-gray-500 text-sm">Email Status</p>
                            <p>
                                {userAttributes.email_verified === 'true'
                                    ? '✓ Verified'
                                    : '⚠️ Not Verified'}
                            </p>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Additional User Attributes -->
            {#if Object.keys(userAttributes).some(key => !excludedAttributes.includes(key))}
                <div class="p-4">
                    <h3 class="text-lg font-semibold mb-4">Additional Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {#each Object.entries(userAttributes) as [key, value]}
                            {#if !excludedAttributes.includes(key) && value}
                                <div>
                                    <p class="text-gray-500 text-sm">{attributeLabels[key] || key}</p>
                                    <p>{formatAttributeValue(key, value)}</p>
                                </div>
                            {/if}
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Account Actions -->
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-4">Account Actions</h3>
                <div class="flex gap-2">
                    <LogoutButton />
                </div>
            </div>
        </div>
    {/if}
</div>
