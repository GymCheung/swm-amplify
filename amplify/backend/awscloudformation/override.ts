import { AmplifyRootStackTemplate } from "@aws-amplify/cli-extensibility-helper";

// Override created by Amplify CLI `amplify override project`, https://docs.amplify.aws/cli/project/override/
export function override(resources: AmplifyRootStackTemplate) {
  const ASSET_ROOT = process.env.ASSET_ROOT || "*";

  const authRole = resources.authRole;

  // const basePolicies = Array.isArray(authRole.policies)
  //   ? authRole.policies
  //   : [authRole.policies];

  authRole.policies = [
    // ...basePolicies,
    {
      policyName: "amplify-permissions-custom-resources",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Resource: `${ASSET_ROOT}`,
            Action: [
                "iotsitewise:Describe*",
                "iotsitewise:List*"
            ],
            Effect: "Allow",
          },
        ],
      },
    },
  ];
}