// import { redirect } from '@sveltejs/kit';
// import type { PageLoad } from './$types';
//
// // import { getUser } from '../utils/auth';
//
// export const load: PageLoad = async ({ fetch, depends }) => {
//     depends('app:projects'); // Marks this load function as dependent on projects data
//
//     // Check if user is authenticated
//     // const user = await getUser();
//     //
//     // if (!user) {
//     //     throw redirect(302, '/login');
//     // }
//
//     try {
//         // Fetch projects with endpoint counts
//
//         const apiClient = createApiClient(fetch);
//         const user = { cognito_id: 'auth0|123456789' };
//         const projects = await apiClient.projectApi.getWithEndpointCounts(user.cognito_id);
//         return {
//             projects,
//             // user
//         };
//     } catch (error) {
//         console.error('Error loading projects:', error);
//         return {
//             projects: [],
//             // user,
//             error: 'Failed to load projects. Please try again later.'
//         };
//     }
// };
