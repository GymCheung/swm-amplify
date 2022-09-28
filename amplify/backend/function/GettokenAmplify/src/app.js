/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


const { IoTSiteWiseClient, ListAccessPoliciesCommand } = require("@aws-sdk/client-iotsitewise");
const { STSClient, AssumeRoleCommand } = require("@aws-sdk/client-sts");

const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});


/**********************
 * Example get method *
 **********************/

app.get('/gettoken', async function(req, res) {
  console.log(req.apiGateway.event);

  const poratlRoleArn = 'arn:aws:iam::826541393164:role/Admin';
  const portalId = req.apiGateway.event.queryStringParameters.portal;
  const projectId = req.apiGateway.event.queryStringParameters.project;
  const identityId = req.apiGateway.event.requestContext.identity.cognitoIdentityId;

  const swClient = new IoTSiteWiseClient({});
  const command = new ListAccessPoliciesCommand({
    identityType: 'USER',
    identityId,
    resourceType: projectId ? 'PROJECT' : 'PORTAL',
    resourceId: projectId ? projectId : portalId,
  });

  try {
    const listAccessPoliciesResponse = await swClient.send(command);

    if (listAccessPoliciesResponse.accessPolicySummaries?.length) {
      const stsClient = new STSClient({});

      const AssumeRoleResponse = await stsClient.send(new AssumeRoleCommand({
        RoleArn: poratlRoleArn,
        RoleSessionName: 'open-source-demo-project-auth',
        Policy: projectId ?
          JSON.stringify({
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                      "iotsitewise:DescribeProject"
                    ],
                    "Resource": `arn:aws:iotsitewise:us-west-2:826541393164:project/${projectId}`,
                },
                {
                    "Effect": "Allow",
                    "Action": [
                      "iotsitewise:DescribeProject"
                    ],
                    "Resource": "*",
                    "Condition": {
                      "StringEquals": {
                        [`aws:ResourceTag/swp-${projectId}`]: [ "ALLOW" ],
                      }
                    }
                }
            ]
          }) :
          JSON.stringify({
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                      "iotsitewise:DescribePortal"
                    ],
                    "Resource": `arn:aws:iotsitewise:us-west-2:826541393164:portal/${portalId}`,
                },
                {
                    "Effect": "Allow",
                    "Action": [
                      "iotsitewise:DescribePortal"
                    ],
                    "Resource": "*",
                    "Condition": {
                      "StringEquals": {
                        [`aws:ResourceTag/swm-${portalId}`]: [ "ALLOW" ],
                      }
                    }
                }
            ]
          }),
      }));
      
      res.json({ data: AssumeRoleResponse, success: `${projectId ? 'project': 'portal'} access granted` });
    } else {
      res.status(403).json({ failure: 'no access policy' });
    }
  } catch (e) {
    res.status(403).json({ failure: 'request error' });
  }
});

app.get('/gettoken/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});

/****************************
* Example post method *
****************************/

app.post('/gettoken', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/gettoken/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

/****************************
* Example put method *
****************************/

app.put('/gettoken', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/gettoken/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

/****************************
* Example delete method *
****************************/

app.delete('/gettoken', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/gettoken/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
