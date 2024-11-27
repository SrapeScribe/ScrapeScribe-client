<script lang="ts">

	import Endpoints from "\$lib/components/endpoints.svelte";
	import type { Endpoint } from '../../interfaces';
	import { HTTPMethod } from '../../constants';

	const endpoints: Endpoint[] = [
		{
			method: HTTPMethod.POST,
			url: "/api/v1/users",
			body: {
				name: "John Doe",
				email: "johndoe@email.com"
			}
		},
		{
			method: HTTPMethod.GET,
			url: "/api/v1/users",
			body: {}
		},
		{
			method: HTTPMethod.PUT,
			url: "/api/v1/users/1",
			body: {
				name: "Jane Doe",
				email: "janedoe@email.com"
			}
		},
		{
			method: HTTPMethod.DELETE,
			url: "/api/v1/users/1",
			body: {}
		}
	];
</script>

<div class="max-w-5xl mx-auto divide-y">
	<h2 class="text-3xl mb-3">Setup Endpoints</h2>

	<Endpoints  endpoints={endpoints} class="pt-8" />

</div>
