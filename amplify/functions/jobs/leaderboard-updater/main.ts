import { env } from '$amplify/env/leaderboard-updater'
const ids = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }]
export const handler = async () => {
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			console.log(`Iteration at ${new Date().toISOString()}`)
			doSomething()
		}, 3000)

		setTimeout(() => {
			clearInterval(interval)
			resolve({
				statusCode: 200,
				body: 'Completed interval run',
			})
		}, 15000)
	})
}

async function doSomething() {
	// Your actual work goes here
	console.log('Doing work...')
	const randomItem = ids[Math.floor(Math.random() * ids.length)]
	const randomScore = Math.floor(Math.random() * (20 - 5 + 1)) + 5

	const xAmzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')

	await fetch(env.PUBLISH_ENDPOINT, {
		method: 'POST',
		headers: {
			'x-api-key': env.ENDPOINT_API_KEY,
			'x-amz-date': xAmzDate,
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			channel: 'default/channel',
			events: [
				//! Note that the array is not to be serialized, but its contents are 👇
				JSON.stringify({
					id: randomItem.id,
					score: randomScore,
				}),
			],
		}),
	})
}
