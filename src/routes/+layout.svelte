<script lang="ts">
	import '../app.css';
	import { Provider } from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import Navbar from '$lib/components/navbar.svelte';

	let { children } = $props();
</script>

<Provider>
	<AppSidebar />
	<div class="flex flex-col w-full">

		<Navbar />
		<main class="">
			{@render children?.()}
		</main>
	</div>

</Provider>
