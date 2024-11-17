# Creating an Ephemeral Leaderboard with AppSync Events

AWS AppSync simplifies and manages connecting applications to events, data, and AI models. Until recently, this meant setting up a GraphQL API that came with queries, mutations for HTTP connections and realtime subscription endpoints using WebSockets.

However, the team has [recently announced](https://aws.amazon.com/blogs/mobile/announcing-aws-appsync-events-serverless-websocket-apis/) AWS AppSync Event API. This feature of AppSync offers a standalone Pub/Sub service that is not bound to GraphQL. In this initial post in a series, we'll start small by discussing a practical-yet-simple use case: a leaderboard. However, in future posts, we'll showcase different authorization modes, how to enrich data, and other scenarios where an Event API would be useful.

## Application Overview

Ephemeral leaderboards, as the name suggests, are simply leaderboards that do not persist data. While often used in fast, short-lived games, this architecture also applies to high-volume chat apps where what was said previously, is less important than what is said in the moment.

> In case you'd like to implement this solution yourself, the code along with installation instructions can be cloned from here.

As seen in the screenshot below, our application is a single page that allows users to subscribe to all player position updates in realtime. To simulate an external source posting events, there's an included "Simulate Scoring" button that will publish a series of updates over a quick interval.

[include screenshot of webpage]()

It's important to callout the simplicity of our architecture. There isn't a need for an authZ service, an API, or a database. We're simply using our Event API inside of our web application.

[include complete screenshot of architecture]()

## Creating a Fullstack Application

For clarity, AppSync Events is a feature that is used to create one or more Event APIs. The easiest way to set this up is in the AWS Console, however, this post will show how to create an Event API using [AWS CDK](https://aws.amazon.com/cdk/) L1 constructs.

Additionally, when it comes to building fullstack applications on AWS, AWS Amplify Gen 2 excels by offering a TypeScript-first experience that allows developers to drop down to CDK L2 and L1 constructs when needed.

Get started initializing the frontend repository with Amplify Gen 2 by running the following command:

```bash
npm create amplify
```

Along with automatically installing the AWS CDK and Amplify JavaScript libraries, that command also creates an `amplify` directory where developers can add/modify their AWS backend.

Next, feel free to delete the `auth` and `data` folders since those reference Amazon Cognito and AWS AppSync cofigurations that won't be needed in this project.

Finally, we'll cleanup the references to those services by updating the `amplify/backend.ts` so that it only contains the following:

```ts
import { defineBackend } from '@aws-amplify/backend'

const backend = defineBackend({})
```

## Creating an Event API using the AWS CDK

As mentioend, AWS Amplify Gen 2 is built on top of the AWS CDK. So while Amplify treats several AWS services as first-class citizens, the breadth of AWS offerings means there are many that fallback to using a CDK construct. This is great because it means developers can start using AWS services in their code as soon as those constructs are added.

We'll take advantage of this feature by importing the L1 constructs used for to create an [Event API](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_appsync.CfnApi.html).

To get started, we'll first create a seperate stack of resources that will contain all of L1 constructs for our app. In the `amplify/backend.ts` file, add the following line of code:

```ts
const customResources = backend.createStack('custom-resources-leaderboard')
```

This is simply a logical container that we can use to group services.

The Event API for our purposes will be broken up into 3 parts:

1. The API itself
2. The namespace(s) that the API can use for publishing and subscribing
3. The authorization mechanism needed to secure our API

```ts
import {
	AuthorizationType,
	CfnApi,
	CfnApiKey,
	CfnChannelNamespace,
} from 'aws-cdk-lib/aws-appsync'

// previous code...

// new code
const cfnEventAPI = new CfnApi(customResources, 'cfnEventAPI', {
	name: 'realtime-leaderboard',
	eventConfig: {
		authProviders: [{ authType: AuthorizationType.API_KEY }],
		connectionAuthModes: [{ authType: AuthorizationType.API_KEY }],
		defaultPublishAuthModes: [{ authType: AuthorizationType.API_KEY }],
		defaultSubscribeAuthModes: [{ authType: AuthorizationType.API_KEY }],
	},
})

new CfnChannelNamespace(customResources, 'cfnEventAPINamespace', {
	name: 'default',
	apiId: cfnEventAPI.attrApiId,
})

const cfnApiKey = new CfnApiKey(customResources, 'cfnEventAPIKey', {
	apiId: cfnEventAPI.attrApiId,
	description: 'realtime leaderboard demo',
})
```

> Note that due to the recent release of AppSync Events, only L1 constructs are available. A less verbose construct (L2), is currently in development. This post will be updated once that becomes available.

Worth calling out is how this Event API is currently using an API key for authorization. This is great for development purposes and testing, though other posts will demonstrate how to use authorization modes that include IAM and Cognito permissioning as well.

The last step in creating our backend resources, is to pass the resolved values to our frontend application. Fortunately the Amplify JavaScript libraries have been updated to easy connect, publish, and subscribe to events so long as the required values are passed in a specified format.

At the bottom of the `amplify/backend.ts` file, paste in the following:

```ts
backend.addOutput({
	custom: {
		events: {
			url: `https://${cfnEventAPI.getAtt('Dns.Http').toString()}/event`,
			api_key: cfnApiKey.attrApiKey,
			aws_region: customResources.region,
			default_authorization_type: AuthorizationType.API_KEY,
		},
	},
})
```

We're now ready to deploy our backend. This will create an `amplify_outputs.json` file in the root of our project that contains the output needed to configure our frontend.

> If you do not have an AWS Account setup, follow [this guide](https://docs.amplify.aws/react/start/account-setup/) from Amplify to setup your credentials.

Run the following command to deploy:

```bash
npx ampx sandbox
# npx ampx sandbox --profile your-profile-name
```

## Connecting, Publishing, and Subscribing to an Event API using AWS Amplify

This [project's repository]() is already configured with Amplify. This is shown in the `components/configureAmplify.tsx` file and made use of in the `app/layout.tsx` file.

All that's left to do is test that our backend works by calling the related methods in our frontend.

> By design, an AppSync Event does not need the Amplify libraries. It's possible to [configure a client](https://docs.aws.amazon.com/appsync/latest/eventapi/configure-event-api-auth.html) using native WebSocket protocols. Amplify simply offers a convenient solution to prevent boilerplate.

In the `app/page.tsx` file, we'll want to setup a connection to the channel we created in our backend called `default`. We also have the ability to create segments on our channel. To view this in action, inside of a `useEffect` method, we'll connect to our application with the following code:

```ts
const channelConnect = async () => {
	try {
		const channel = await events.connect('/default/leaderboard')
		channelRef.current = channel

		channel.subscribe({
			next: handleNewData,
			error: (err) => console.log(err),
		})
	} catch (e) {
		console.log('Error connecting to channel: ', e)
	}
}
```

The `events.connect` function from Amplify is used to establish the connection to the `default/leaderboard` channel. This allows us to subscribe to any incoming data from that particular channel.

Whenever a user clicks the "Simulate Scoring" button, we publish events. While this is occuring from the same page, this could easily be added to an AWS Lambda function, or other source.

Publishing data is used with the `events.post` function, as shown with the following code in the `app/page.tsx` file where a random player is selected and given a random score update before posting to the Event API:

```tsx
const handlePublish = async () => {
	for (let i = 0; i <= 10; i++) {
		const randomItem =
			leaderboardData[Math.floor(Math.random() * leaderboardData.length)].id
		const randomScore = Math.floor(Math.random() * 20)

		await events.post('/default/leaderboard', {
			id: randomItem,
			score: randomScore,
		})
		await new Promise((resolve) => setTimeout(resolve, 100))
	}
}
```

## Conclusion

In this post, we discussed how AWS AppSync Events offer a simple Pub/Sub solution that can be used in both greenfield and brownfield applications without the need for a GraphQL API. We also showcased how Amplify Gen 2 can be used to bring in L1 constructs, enabling developers to use newly announced features as infrastructure-as-code sooner.

While this application was a simple demonstration, it's important to note that AppSync Events are applicable to high-throughput applications that can scale to millions of subscribers such as gaming, sports-betting, and live-auctioning.

Get started with 250,000 real-time Event API operations per month for free. To learn more about AWS AppSync Events, [visit the documentation page](https://docs.aws.amazon.com/appsync/latest/eventapi/event-api-welcome.html). For more information on pricing, see [the pricing page](https://aws.amazon.com/appsync/pricing/).
