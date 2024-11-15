import {
	AuthorizationType,
	CfnApi,
	CfnApiKey,
	CfnChannelNamespace,
} from 'aws-cdk-lib/aws-appsync'
import { defineBackend } from '@aws-amplify/backend'

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({})

const customResources = backend.createStack('custom-resources-snapscribe')

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
