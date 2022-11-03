import { AmplifyRootStackTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyRootStackTemplate) {
    const ASSET_ROOT = process.env.ASSET_ROOT || "*";
  
    const authRole = resources.authRole;
  
    const basePolicies = Array.isArray(authRole.policies)
      ? authRole.policies
      : [authRole.policies];
  
    const policies = [
      ...basePolicies,
      {
        PolicyName: "amplify-permissions-custom-resources",
        PolicyDocument: {
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

    authRole.addOverride('Properties.Policies', policies);
}
