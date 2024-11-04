'use client'

import Link from 'next/link'
import { Trophy } from 'lucide-react'

export function Navbar() {
	return (
		<nav className="bg-primary text-primary-foreground shadow-md">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<Link href="/" className="flex items-center space-x-2">
						<Trophy className="h-6 w-6 text-yellow-400" />
						<span className="font-bold text-lg ">Leaderboard</span>
					</Link>
				</div>
			</div>
		</nav>
	)
}
