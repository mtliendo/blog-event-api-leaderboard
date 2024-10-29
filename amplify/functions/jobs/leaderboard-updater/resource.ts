import { defineFunction } from '@aws-amplify/backend'

export const leaderboardUpdater = defineFunction({
	name: 'leaderboard-updater',
	entry: 'main.ts',
	runtime: 20,
	timeoutSeconds: 90,
	environment: {
		PUBLISH_ENDPOINT:
			'https://zqvge2fzvbejxcjtjahp7mdt2e.appsync-api.us-east-1.amazonaws.com/event',
		ENDPOINT_API_KEY: 'da2-a6zwsss6qzatbdi6omwf55jjja',
	},
})
