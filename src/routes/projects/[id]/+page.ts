import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getEndpoints, getProject } from '$lib/fakeDb';

export const load = (async ({ params }) => {
	const projectId = params.id;

	try {
		const [project, endpoints] = await Promise.all([
			getProject(projectId),
			getEndpoints(projectId)
		]);

		if (!project) {
			throw error(404, {
				message: `Project with ID ${projectId} not found`
			});
		}

		return {
			project,
			endpoints
		};
	} catch (e) {
		const err = e as { status?: number };
		if (err && 'status' in err && err.status === 404) throw e;

		console.error('Error loading project data:', e);
		throw error(500, {
			message: 'Failed to load project data'
		});
	}
}) satisfies PageLoad;
