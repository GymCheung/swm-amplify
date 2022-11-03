import React, { useState } from 'react'
import { Amplify, API, Auth } from 'aws-amplify';

import { withAuthenticator, Flex, Divider, Card, Heading, Button, SelectField, Grid, Text, ScrollView, Badge, Image } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from './aws-exports';

import { IoTSiteWiseClient, DescribeProjectCommand, DescribePortalCommand } from '@aws-sdk/client-iotsitewise';

Amplify.configure(awsExports);

const region = 'us-west-2';
const portalId = '55309920-59d5-4cc1-a8c9-9340b7fae247';
const projectId = '9372dc1a-3f01-4fa4-a196-781544441862';
const noAccessPortalId = 'bea83406-c5ef-4b33-b7a3-0decd94f17a3';
const noAccessProjectId = '173dd79a-a739-4aef-afda-1bab2a7fe88e';

const cardStyle = { overflow: 'auto' };
const codeStyle = {
  'whiteSpace': 'pre-wrap',
}

const getData = async (projectId) => { 
  const apiName = 'gettoken';
  const path = '/gettoken';

  const myInit = { // OPTIONAL
    headers: {}, // OPTIONAL
    queryStringParameters: {
      portal: portalId,
      project: projectId,
    },
  };

  return API.get(apiName, path, myInit);
}

function Token() {
  const [tokenProjectSelection, setTokenProjectSelection] = useState(projectId);
  const [portalSelection, setPortalSelection] = useState(portalId);
  const [projectSelection, setProjectSelection] = useState(projectId);

  const [awsCreds, setAwsCreds] = useState(undefined);
  const [tokenStatus, setTokenStatus] = useState(undefined);

  const [describeProject, setDescribeProject] = useState(undefined);
  const [projectStatus, setProjectStatus] = useState(undefined);

  const [describePortal, setDescribePortal] = useState(undefined);
  const [portalStatus, setPortalStatus] = useState(undefined);

  const requestPortalToken = () => {
    setAwsCreds(undefined);
    setTokenStatus('loading');

    getData()
      .then(data => setAwsCreds(data)).then(() => setTokenStatus('success'))
      .catch(err => { setAwsCreds(err); setTokenStatus('failure'); });
  }

  const requestProjectToken = () => {
    setAwsCreds(undefined);
    setTokenStatus('loading');

    getData(tokenProjectSelection)
      .then(data => setAwsCreds(data)).then(() => setTokenStatus('success'))
      .catch(err => { setAwsCreds(err); setTokenStatus('error'); });
  }

  const requestProject = () => {
    setDescribeProject(undefined);
    setProjectStatus('loading');

    const creds = awsCreds.data.Credentials;
    const swClient = new IoTSiteWiseClient({
      credentials: {
        accessKeyId: creds.AccessKeyId,
        secretAccessKey: creds.SecretAccessKey,
        sessionToken: creds.SessionToken,
        expiration: creds.Expiration,
      },
      region,
    });

    swClient
      .send(new DescribeProjectCommand({
        projectId: projectSelection,
      }))
      .then(setDescribeProject).then(() => setProjectStatus('success'))
      .catch(err => { setDescribeProject(err); setProjectStatus('error'); });
  }

  const requestPortal = () => {
    setDescribePortal(undefined);
    setPortalStatus('loading');

    const creds = awsCreds.data.Credentials;
    const swClient = new IoTSiteWiseClient({
      credentials: {
        accessKeyId: creds.AccessKeyId,
        secretAccessKey: creds.SecretAccessKey,
        sessionToken: creds.SessionToken,
        expiration: creds.Expiration,
      },
      region,
    });

    swClient
      .send(new DescribePortalCommand({
        portalId: portalSelection,
      }))
      .then(setDescribePortal).then(() => setPortalStatus('success'))
      .catch(err => { setDescribePortal(err); setPortalStatus('error'); });
  }

  return (
    <Grid
      columnGap="0.5rem"
      rowGap="0.5rem"
      templateColumns="1fr 1fr 1fr"
    >
      <Card
        columnStart="1"
        columnEnd="2"
        style={cardStyle}
      >
        <Heading level={2}>
          GetToken:
        </Heading>
        <SelectField
          label="Project Id:"
          descriptiveText="Select the project Id to get token for Project Token"
          onChange={(e) => setTokenProjectSelection(e.target.value)}
        >
          <option value={projectId}>{projectId} (with access)</option>
          <option value={noAccessProjectId}>{noAccessProjectId} (no access)</option>
          <option value="bad-project-id">bad-project-id (no access)</option>
        </SelectField>
        
        <Divider orientation="horizontal" size='large' />

        <Grid
          columnGap="0.5rem"
          templateColumns="1fr 1fr 1fr"
        >
          <Button onClick={requestPortalToken} variation="primary">Portal Token</Button>
          <Button onClick={requestProjectToken} variation="primary">Project Token</Button>
          <Button onClick={() => {setAwsCreds(undefined);setTokenStatus(undefined);}} variation="primary">Clear Token</Button>
        </Grid>

        <Text>Request Status:</Text>
        <Badge variation={tokenStatus}>{tokenStatus}</Badge>

        <ScrollView>
          <Text style={codeStyle}>{JSON.stringify(awsCreds, null, 2)}</Text>
        </ScrollView>
      </Card>

      <Card
        style={cardStyle}
      >
        <Heading level={2}>Portal Admin Access - DescribePortal:</Heading>
        <SelectField
          label="Portal Id:"
          descriptiveText="Select the portal Id to describe"
          onChange={(e) => setPortalSelection(e.target.value)}
        >
          <option value={portalId}>{portalId} (with access)</option>
          <option value={noAccessPortalId}>{noAccessPortalId} (no access unless tagged &#123; "swm-{portalId}": "ALLOW" &#125;)</option>
          <option value="bad-portal-id">bad-portal-id (no access)</option>
        </SelectField>
        
        <Divider orientation="horizontal" />

        <Grid
          columnGap="0.5rem"
          templateColumns="1fr 1fr 1fr"
        >
          {awsCreds?.data?.Credentials && <Button onClick={requestPortal} variation="primary">Describe Portal</Button>}
          {describePortal && <Button onClick={() => {setDescribePortal(undefined);setPortalStatus(undefined)}} variation="primary">Clear Portal</Button>}
        </Grid>

        <Text>Request Status: {portalStatus}</Text>
        <Badge variation={portalStatus}>{portalStatus}</Badge>
        
        <ScrollView>
          <Text style={codeStyle}>{JSON.stringify(describePortal, null, 2)}</Text>
        </ScrollView>
      </Card>

      <Card
        style={cardStyle}
      >
        <Heading level={2}>Project Admin Access - DescribeProject:</Heading>
        <SelectField
          label="Project Id:"
          descriptiveText="Select the project Id to describe"
          onChange={(e) => setProjectSelection(e.target.value)}
        >
          <option value={projectId}>{projectId} (with access)</option>
          <option value={noAccessProjectId}>{noAccessProjectId} (no access unless tagged &#123; "swp-{projectId}": "ALLOW" &#125;)</option>
          <option value="bad-project-id">bad-project-id (no access)</option>
        </SelectField>
        
        <Divider orientation="horizontal" />

        <Grid
          columnGap="0.5rem"
          templateColumns="1fr 1fr 1fr"
        >
          {awsCreds?.data?.Credentials && <Button onClick={requestProject} variation="primary">Describe Project</Button>}
          {describeProject && <Button onClick={() => {setDescribeProject(undefined);setProjectStatus(undefined);}} variation="primary">Clear Project</Button>}
        </Grid>

        <Text>Request Status:</Text>
        <Badge variation={projectStatus}>{projectStatus}</Badge>

        <ScrollView>
          <Text style={codeStyle}>{JSON.stringify(describeProject, null, 2)}</Text>
        </ScrollView>
      </Card>
    </Grid>
  );
}

function AmplifyAuth() {
  const [awsCreds, setAwsCreds] = useState();
  const [describePortal, setDescribePortal] = useState(undefined);
  const [portalStatus, setPortalStatus] = useState(undefined);
  const [portalSelection, setPortalSelection] = useState(portalId);

  const requestAwsCreds = () => {
    setAwsCreds(undefined);

    Auth.currentCredentials().then((creds) => setAwsCreds(creds, null, 2));
  }

  const requestPortal = () => {
    setDescribePortal(undefined);
    setPortalStatus('loading');

    const creds = awsCreds;
    const swClient = new IoTSiteWiseClient({
      credentials: {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken,
        expiration: creds.expiration
      },
      region,
    });

    swClient
      .send(new DescribePortalCommand({
        portalId: portalSelection,
      }))
      .then(setDescribePortal).then(() => setPortalStatus('success'))
      .catch(err => { setDescribePortal(err); setPortalStatus('error'); });
  }

  return (
    <Grid
      columnGap="0.5rem"
      rowGap="0.5rem"
      templateColumns="1fr 1fr 1fr"
    >
      <Card
        columnStart="1"
        columnEnd="2"
        style={cardStyle}
      >
        <Button onClick={requestAwsCreds} variation="primary">AWS Creds</Button>
        <Text style={codeStyle}>{JSON.stringify(awsCreds, null, 2)}</Text>
      </Card>
      <Card
        style={cardStyle}
      >
        <Heading level={2}>Portal Admin Access - DescribePortal:</Heading>
        <SelectField
          label="Portal Id:"
          descriptiveText="Select the portal Id to describe"
          onChange={(e) => setPortalSelection(e.target.value)}
        >
          <option value={portalId}>{portalId} (with access)</option>
          <option value={noAccessPortalId}>{noAccessPortalId} (no access unless tagged &#123; "swm-{portalId}": "ALLOW" &#125;)</option>
          <option value="bad-portal-id">bad-portal-id (no access)</option>
        </SelectField>
        
        <Divider orientation="horizontal" />

        <Grid
          columnGap="0.5rem"
          templateColumns="1fr 1fr 1fr"
        >
          {!!awsCreds && <Button onClick={requestPortal} variation="primary">Describe Portal</Button>}
          {describePortal && <Button onClick={() => {setDescribePortal(undefined);setPortalStatus(undefined)}} variation="primary">Clear Portal</Button>}
        </Grid>

        <Text>Request Status: {portalStatus}</Text>
        <Badge variation={portalStatus}>{portalStatus}</Badge>
        
        <ScrollView>
          <Text style={codeStyle}>{JSON.stringify(describePortal, null, 2)}</Text>
        </ScrollView>
      </Card>
    </Grid>
  );
}

function App({ signOut, user }) {
  return (
    <>
      <Card
        columnStart="1"
        columnEnd="-1"
        rowStart="1"
        rowEnd="2"
      >
        <Flex>
          <Heading level={1}>
            Open Source - GetToken Api Demo
          </Heading>
          <Button onClick={signOut}>Sign out</Button>
        </Flex>
      </Card>
      <Token></Token>
      <AmplifyAuth/>
    </>
  );
}

export default withAuthenticator(App);