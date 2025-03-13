import { Amplify } from 'aws-amplify';
import { PUBLIC_COGNITO_USER_POOL_ID, PUBLIC_COGNITO_USER_POOL_CLIENT_ID,   PUBLIC_API_GATEWAY_URL, PUBLIC_AWS_REGION } from '$env/static/public';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: PUBLIC_COGNITO_USER_POOL_ID,
            userPoolClientId: PUBLIC_COGNITO_USER_POOL_CLIENT_ID,
        }
    },
    API: {
        REST: {
            scrapeApi: {
                endpoint:   PUBLIC_API_GATEWAY_URL,
                region: PUBLIC_AWS_REGION,
            },
        }
    }
});
