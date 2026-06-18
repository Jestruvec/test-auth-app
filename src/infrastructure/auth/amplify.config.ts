import { Amplify } from "aws-amplify";
import type { ResourcesConfig } from "aws-amplify";

export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.PUBLIC_AWS_USER_POOL_ID ?? "",
      userPoolClientId: import.meta.env.PUBLIC_AWS_USER_POOL_CLIENT_ID ?? "",
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: "code" as const,
      userAttributes: {
        email: {
          required: true,
        },
      },
    },
  },
  API: {
    REST: {},
  },
};

export function initializeAmplify() {
  Amplify.configure(amplifyConfig, { ssr: true });
}
