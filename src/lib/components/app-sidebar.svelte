<script lang="ts" module>
    import {
        FileJson,
        FolderClosed,
        LayoutDashboard,
        NotebookText,
    } from 'lucide-svelte'

    const data = {
        items: [
            {
                name: 'Dashboard',
                url: '/dashboard',
                icon: LayoutDashboard
            },
            {
                name: 'Projects',
                url: '/projects',
                icon: FolderClosed
            },
            {
                name: 'Endpoints',
                url: '/endpoints',
                icon: NotebookText
            },
            {
                name: 'Instructions',
                url: '/instructions',
                icon: FileJson
            }
        ]
    }

</script>

<script lang="ts">
    import NavMain from '$lib/components/nav-main.svelte'
    import NavItems from '$lib/components/nav-items.svelte'
    import NavUser from '$lib/components/nav-user.svelte'
    import TeamSwitcher from '$lib/components/team-switcher.svelte'
    import * as Sidebar from '$lib/components/ui/sidebar/index.js'
    import type {ComponentProps} from 'svelte'

    let {
        ref = $bindable(null),
        collapsible = 'icon',
        ...restProps
    }: ComponentProps<typeof Sidebar.Root> = $props()
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
    <!--	<Sidebar.Header>-->
    <!--		<TeamSwitcher teams={data.teams} />-->
    <!--	</Sidebar.Header>-->
    <Sidebar.Content>
        <!--		<NavMain items={data.navMain} />-->
        <NavItems items={data.items}/>
    </Sidebar.Content>
    <Sidebar.Footer>
        <NavUser/>
    </Sidebar.Footer>
    <Sidebar.Rail/>
</Sidebar.Root>
