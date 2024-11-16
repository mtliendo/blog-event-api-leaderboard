'use client'

import React, { useEffect, useRef, useState } from 'react'
import ViewOnlyLeaderboard from '@/components/leaderboard'
import { events, EventsChannel } from 'aws-amplify/data'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const players = [
	{ name: 'Michael', score: 0, id: 'abc123' },
	{ name: 'Brice', score: 0, id: 'def456' },
	{ name: 'Bill', score: 0, id: 'hij789' },
	{ name: 'Dan', score: 0, id: 'adh147' },
	{ name: 'Arundeep', score: 0, id: 'bei258' },
]

function LeaderboardPage() {
	const [leaderboardData, setLeaderboardData] = useState(players)

	const channelRef = useRef<EventsChannel | null>(null)

	const handlePublish = async () => {
		for (let i = 0; i <= 10; i++) {
			const randomItem =
				leaderboardData[Math.floor(Math.random() * leaderboardData.length)].id
			const randomScore = Math.floor(Math.random() * 20)

			await events.post('/default/channel', {
				id: randomItem,
				score: randomScore,
			})
			await new Promise((resolve) => setTimeout(resolve, 100))
		}
	}

	useEffect(() => {
		const handleNewData = (data: { id: string; score: number }) => {
			setLeaderboardData((prevLeaderboard) => {
				return prevLeaderboard.map((player) =>
					player.id === data.id
						? { ...player, score: player.score + data.score }
						: player
				)
			})
		}

		const channelConnect = async () => {
			try {
				const channel = await events.connect('/default/channel')
				channelRef.current = channel

				channel.subscribe({
					next: handleNewData,
					error: (err) => console.log(err),
				})
			} catch (e) {
				console.log('Error connecting to channel: ', e)
			}
		}

		channelConnect()

		return () => {
			if (channelRef.current) {
				channelRef.current.close()
			}
		}
	}, [])

	return (
		<div className="flex flex-col min-h-screen bg-background">
			<Navbar />
			<main className="flex-grow container mx-auto px-4 py-8">
				<Button onClick={handlePublish} className="mb-4">
					Simulate Scoring
				</Button>
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="text-3xl font-bold text-center text-primary">
							Welcome to the Leaderboard
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-center text-muted-foreground">
							View your progress and compete with others. May the best player
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
