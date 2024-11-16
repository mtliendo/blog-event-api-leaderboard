# Creating an Ephemeral Leaderboard with AppSync Events

AWS AppSync simplifies and manages connecting applications to events, data, and AI models. Until recently, this meant setting up a GraphQL API that came with queries, mutations for HTTP connections and realtime subscription endpoints using WebSockets.

However, the team has [recently announced](https://aws.amazon.com/blogs/mobile/announcing-aws-appsync-events-serverless-websocket-apis/) AWS AppSync Event API. This feature of AppSync offers a standalone Pub/Sub service that is not bound to GraphQL. In this initial post in a series, we'll start small by discussing a practical-yet-simple use case: a leaderboard. However, in future posts, we'll showcase different authorization modes, how to enrich data, and other scenarios where an Event API would be useful.

## Application Overview

Ephemeral leaderboards, as the name suggests, are simply leaderboards that do not persist data. While often used in fast, short-lived games, this architecture also applies to high-volume chat apps where what was said previously, is less important than what is said in the moment.
