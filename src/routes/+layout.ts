import { configureAmplify } from '$lib/aws-amplify';

try {
    configureAmplify();

    console.log("🚀 AWS Amplify initialized successfully");
} catch (error) {
    console.error("🚨 Failed to initialize AWS Amplify:", error);
}

// fuck server-side rendering
export const ssr = false;
