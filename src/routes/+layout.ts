import { configureAmplify } from '$lib/aws-amplify';

// Configuring Amplify before the app mounts
configureAmplify();

// fuck server-side rendering
export const ssr = false;
