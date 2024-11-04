// components/ConfigureAmplify.tsx
'use client'

import { Amplify } from 'aws-amplify'

import outputs from '@/amplify_outputs.json'
Amplify.configure(outputs)
const config = Amplify.getConfig()

Amplify.configure({
	...config,
	API: {
		Events: {
			endpoint:
				'https://h7mlebw5sfgyfl7nr7gqukbgxi.appsync-api.us-east-1.amazonaws.com/event',
			region: 'us-east-1',
			defaultAuthMode: 'apiKey',
			apiKey: 'da2-tagbslpgu5gdhff5vdghj5acc4',
		},
	},
})

export default function ConfigureAmplifyClientSide() {
	return null
}
