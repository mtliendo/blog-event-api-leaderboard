import { env } from '$amplify/env/leaderboard-updater'
const ids = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }]
export const handler = async () => {
	// Promise that resolves when all intervals are done
	return new Promise((resolve) => {
		let count = 0
		const maxIterations = 20 // For example, run 20 times

		// Keep track of the interval so we can clear it
		const interval = setInterval(() => {
			count++
			console.log(`Iteration ${count} at ${new Date().toISOString()}`)

			// Your actual work here
			doSomething()

			// Check if we're done
			if (count >= maxIterations) {
				clearInterval(interval)
				resolve({
					statusCode: 200,
					body: `Completed ${count} iterations`,
				})
			}
		}, 3000) // Run every 3 seconds

		// Safety cleanup - clear interval after 3 minutes (or whatever your timeout is)
		setTimeout(() => {
			clearInterval(interval)
			resolve({
				statusCode: 200,
				body: `Timed out after ${count} iterations`,
			})
		}, 60000) // 1 minute in milliseconds
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
