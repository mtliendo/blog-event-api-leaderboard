'use client'

import React, { useEffect, useState } from 'react'
import ViewOnlyLeaderboard, { Player } from '@/components/leaderboard'
import { events } from 'aws-amplify/data'

import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

function LeaderboardPage() {
	const [leaderboardData, setLeaderboardData] = useState<Player[]>([
		{
			name: 'Michael',
			score: 0,
			id: '1',
		},
		{
			name: 'Brice',
			score: 0,
			id: '2',
		},
		{
			name: 'Bill',
			score: 0,
			id: '3',
		},
		{
			name: 'Dan',
			score: 0,
			id: '4',
		},
		{
			name: 'Arundeep',
			score: 0,
			id: '5',
		},
	])

	const handlePublish = async () => {
		//listen for changes and update the state with new data when it comes in.
		const res = await fetch(
			'https://zugexm5j5h5sk5g5sfhy4r3p6e0cnler.lambda-url.us-east-1.on.aws/'
		)

		const data = await res.json()

		console.log('done executing', data)
	}

	useEffect(() => {
		const channelConnect = async () => {
			console.log('in here')
			try {
				const channel = await events.connect('/default/channel')
				console.log('channel subscribinb')
				return channel
			} catch (e) {
				console.log('uh oh, ', e)
			}
		}
		channelConnect()
			.then((channel) => {
				if (!channel) {
					console.log('no channel')
					return
				}
				channel.subscribe({
					next: (data) => {
						console.log('data', data)
						//find the player by their id
						const foundPlayer = leaderboardData.find(
							(player) => player.id === data.id
						) as Player

						foundPlayer.score += data.score
						const newLeaderboardData = leaderboardData.map((player) => {
							if (player.id === data.id) {
								return foundPlayer
							}
							return player
						})
						setLeaderboardData(newLeaderboardData)
					},
					error: (err) => console.log(err),
				})
			})
			.catch((error) => {
				console.log('error', error)
			})

		return () => {
			console.log('closing all connections')
			events.closeAll()
		}
	}, [])

	return (
		<div className="flex flex-col min-h-screen bg-background">
			<Navbar />
			<main className="flex-grow container mx-auto px-4 py-8">
				<button onClick={handlePublish}>Start Publishing</button>
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="text-3xl font-bold text-center text-primary">
							Welcome to the Leaderboard
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-center text-muted-foreground">
							Track your progress and compete with others. May the best player
							win!
						</p>
					</CardContent>
				</Card>
				<div className="max-w-4xl mx-auto">
					<ViewOnlyLeaderboard initialData={leaderboardData} />
				</div>
			</main>
			<Footer />
		</div>
	)
}

export default LeaderboardPage
