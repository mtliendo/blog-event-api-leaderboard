import { leaderboardUpdater } from './functions/jobs/leaderboard-updater/resource'
import { auth } from './auth/resource'
import { defineBackend } from '@aws-amplify/backend'
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda'

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
	auth,
	leaderboardUpdater,
})

//setup a function URL
const furl = backend.leaderboardUpdater.resources.lambda.addFunctionUrl({
	authType: FunctionUrlAuthType.NONE,
	cors: {
		allowedOrigins: ['*'],
	},
})

// add outputs to the configuration file
backend.addOutput({
	custom: {
		functionUrl: furl.url,
		events: {
			url: 'https://zqvge2fzvbejxcjtjahp7mdt2e.appsync-api.us-east-1.amazonaws.com/event',
			aws_region: 'us-east-1',
			default_authorization_type: 'API_KEY',
			api_key: 'da2-a6zwsss6qzatbdi6omwf55jjja',
		},
	},
})
