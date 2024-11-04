'use client'

import React, {
	useEffect,
	useCallback,
	useRef,
	useMemo,
	createContext,
	useContext,
	useState,
} from 'react'
import ViewOnlyLeaderboard, { Player } from '@/components/leaderboard'
import { events } from 'aws-amplify/data'
import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Create a context for the leaderboard data
const LeaderboardContext = createContext<{
	leaderboardData: Player[]
	setLeaderboardData: React.Dispatch<React.SetStateAction<Player[]>>
} | null>(null)

// Custom hook to use the leaderboard context
const useLeaderboard = () => {
	const context = useContext(LeaderboardContext)
	if (!context) {
		throw new Error('useLeaderboard must be used within a LeaderboardProvider')
	}
	return context
}

// LeaderboardProvider component
const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [leaderboardData, setLeaderboardData] = useState<Player[]>([
		{ name: 'Michael', score: 0, id: '1' },
		{ name: 'Brice', score: 0, id: '2' },
		{ name: 'Bill', score: 0, id: '3' },
		{ name: 'Dan', score: 0, id: '4' },
		{ name: 'Arundeep', score: 0, id: '5' },
	])

	return (
		<LeaderboardContext.Provider
			value={{ leaderboardData, setLeaderboardData }}
		>
			{children}
		</LeaderboardContext.Provider>
	)
}

// Optimized LeaderboardPage component
function LeaderboardPage() {
	const { leaderboardData, setLeaderboardData } = useLeaderboard()
	const channelRef = useRef<any>(null)

	const handlePublish = useCallback(async () => {
		for (let i = 0; i < 5; i++) {
			const randomItem =
				leaderboardData[Math.floor(Math.random() * leaderboardData.length)].id
			const randomScore = Math.floor(Math.random() * 20)
			console.log('randomItem', randomItem, randomScore)
			await events.post('/default/channel', {
				id: randomItem,
				score: randomScore,
			})
			await new Promise((resolve) => setTimeout(resolve, 2000))
		}
	}, [leaderboardData])

	useEffect(() => {
		const handleNewData = (data: { id: string; score: number }) => {
			console.log('data', data)
			setLeaderboardData((prevLeaderboard) => {
				return prevLeaderboard.map((player) =>
					player.id === data.id
						? { ...player, score: player.score + data.score }
						: player
				)
			})
		}

		const channelConnect = async () => {
			console.log('Connecting to channel')
			try {
				const channel = await events.connect('/default/channel')
				console.log('Channel subscribed')
				channelRef.current = channel.subscribe({
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
				channelRef.current.unsubscribe()
			}
		}
	}, [])

	const memoizedLeaderboard = useMemo(
		() => <ViewOnlyLeaderboard initialData={leaderboardData} />,
		[leaderboardData]
	)

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
							Track your progress and compete with others. May the best player
							win!
						</p>
					</CardContent>
				</Card>
				<div className="max-w-4xl mx-auto">{memoizedLeaderboard}</div>
			</main>
			<Footer />
		</div>
	)
}

// Wrap the LeaderboardPage with the LeaderboardProvider
const WrappedLeaderboardPage = () => (
	<LeaderboardProvider>
		<LeaderboardPage />
	</LeaderboardProvider>
)

export default WrappedLeaderboardPage
