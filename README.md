# waka-next

This is a rewrite of Waka. The notable difference is that it now uses sqlite on both client and server to speed up queries and run offline.

<https://next.waka.app>

## Setup

- `npm ci`
- `npm run dev` for dev
- `npm run build` to build
- `npm run preview` for a preview server

## Application Structure

There's three apps in this repository.

- **lib**: The library for importing, manipulating, and querying GTFS. This will eventually be published as a NPM module that runs on both client and server.
- **apps/orchestrator**: The server that will eventually download & parse GTFS files and serve them to users. It will also provide an HTTP API so queries can be run without downloading the whole database.
- **apps/web**: The new web frontend. It can download and query the sqlite database directly, or use server side rendering to grab the data from the orchestrator's HTTP API.
