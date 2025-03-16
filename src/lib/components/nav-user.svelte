<script lang="ts">
    import * as Avatar from "$lib/components/ui/avatar/index.js"
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js"
    import * as Sidebar from "$lib/components/ui/sidebar/index.js"
    import {useSidebar} from "$lib/components/ui/sidebar/index.js"
    import BadgeCheck from "lucide-svelte/icons/badge-check"
    import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down"
    import LogoutButton from "./auth/logout-button.svelte"
    import {authStore} from "$lib/states/auth.svelte"
    import {goto} from "$app/navigation"

    const authState = $derived(authStore.authState)

    let email = $derived(authState.userAttributes?.email || authState.user?.username || '')
    let name = $derived(authState.userAttributes?.name || 'User')
    let preferredUsername = $derived(authState.userAttributes?.preferred_username || '')
    let displayName = $derived(name || preferredUsername || email.split('@')[0])
    let avatar = $derived(authState.userAttributes?.picture || '/avatars/shadcn.jpg')

    // Generate initials from name for the fallback avatar
    let initials = $derived(() => {
        if (name) {
            const nameParts = name.split(' ');
            if (nameParts.length >= 2) {
                return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
            } else if (nameParts.length === 1 && nameParts[0].length > 0) {
                return nameParts[0][0].toUpperCase();
            }
        }
        return email.substring(0, 2).toUpperCase();
    })

    const sidebar = useSidebar()

    function redirectToProfile() {
        console.log("Navigation: Redirecting to profile page")
        goto('/profile')
    }

    function redirectToSettings() {
        console.log("Navigation: Redirecting to settings page")
        goto('/settings')
    }

    function redirectToHelp() {
        console.log("Navigation: Redirecting to help page")
        goto('/help')
    }
</script>

<Sidebar.Menu>
    <Sidebar.MenuItem>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                {#snippet child({props})}
                    <Sidebar.MenuButton
                            size="lg"
                            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            {...props}
                    >
                        <Avatar.Root class="h-8 w-8 rounded-lg">
                            {#if avatar}
                                <Avatar.Image src={avatar} alt={displayName}/>
                            {/if}
                            <Avatar.Fallback class="rounded-lg">{initials}</Avatar.Fallback>
                        </Avatar.Root>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="truncate font-semibold">{displayName}</span>
                            <span class="truncate text-xs">{email}</span>
                        </div>
                        <ChevronsUpDown class="ml-auto size-4"/>
                    </Sidebar.MenuButton>
                {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
                    class="w-[--bits-dropdown-menu-anchor-width] min-w-56 rounded-lg"
                    side={sidebar.isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={4}
            >
                <DropdownMenu.Label class="p-0 font-normal">
                    <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar.Root class="h-8 w-8 rounded-lg">
                            {#if avatar}
                                <Avatar.Image src={avatar} alt={displayName}/>
                            {/if}
                            <Avatar.Fallback class="rounded-lg">{initials}</Avatar.Fallback>
                        </Avatar.Root>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="truncate font-semibold">{displayName}</span>
                            <span class="truncate text-xs">{email}</span>
                        </div>
                    </div>
                </DropdownMenu.Label>
                <DropdownMenu.Separator/>
                <DropdownMenu.Group>
                    <DropdownMenu.Item onclick={redirectToProfile} class="cursor-pointer">
                        <BadgeCheck/>
                        Account
                    </DropdownMenu.Item>

                    <DropdownMenu.Item onclick={redirectToSettings} class="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Settings
                    </DropdownMenu.Item>

                    <DropdownMenu.Item onclick={redirectToHelp} class="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                            <path d="M12 17h.01"></path>
                        </svg>
                        Help & Support
                    </DropdownMenu.Item>
                </DropdownMenu.Group>
                <DropdownMenu.Separator/>
                <DropdownMenu.Item class="cursor-pointer">
                    <LogoutButton/>
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </Sidebar.MenuItem>
</Sidebar.Menu>
