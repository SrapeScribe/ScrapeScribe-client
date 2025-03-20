// import adapter from '@sveltejs/adapter-static';
import adapter from 'amplify-adapter';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter: adapter({
		// 	fallback: '200.html'
		// })
		adapter: adapter()
	}
};

export default config;
