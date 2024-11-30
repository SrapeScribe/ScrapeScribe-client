<script lang="ts">
	import type { Endpoint as EndpointView } from '../../../interfaces';
	import type { Endpoint } from '$lib/fakeDb';
	import Endpoints from '$lib/components/endpoints.svelte';
	import { HTTPMethod } from '../../../constants';
	import { onMount } from 'svelte';

	interface PageData {
		project: {
			id: string;
			name: string;
			user_id: string;
		};
		endpoints: Endpoint[];
	}

	let { data } = $props();
	let endpointsView: EndpointView[] = $state([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	function transformEndpoint(endpoint: Endpoint): EndpointView {
		try {
			const instructions = JSON.parse(endpoint.instructions);
			return {
				method: HTTPMethod.GET,
				url: `/api/${data.project.name}/${endpoint.name}`,
				body: instructions
			};
		} catch (err) {
			console.error(`Error parsing instructions for endpoint ${endpoint.name}:`, err);
			return {
				method: HTTPMethod.GET,
				url: `/api/${data.project.name}/${endpoint.name}`,
				body: {}
			};
		}
	}

	$effect(() => {
		try {
			endpointsView = data.endpoints.map(transformEndpoint);
			isLoading = false;
		} catch (err) {
			console.error('Error transforming endpoints:', err);
			error = 'Failed to process endpoint data';
			isLoading = false;
		}
	});
</script>

<div class="max-w-5xl px-4 mx-auto divide-y">
	<h2 class="text-3xl mb-3">Setup Endpoints</h2>

	{#if isLoading}
		<div class="py-4">Loading endpoints...</div>
	{:else if error}
		<div class="py-4 text-red-600">{error}</div>
	{:else}
		<Endpoints endpoints={endpointsView} class="pt-8" />
	{/if}
</div>
