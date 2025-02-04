import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import ApiClient from '$lib/api/client';
export const load = (async ({ params }) => {
	const project_name = params.name;

	const project = await ApiClient.getProjectWithRelations(project_name);

	if (!project) {
		throw error(404, {
			message: `Project with name ${project_name} not found`
		});
	}

	return {
		project,
		endpoints: project.endpoints
	};
}) satisfies PageLoad;
