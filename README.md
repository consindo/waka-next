# waka-next

This is a rewrite of Waka. The notable difference is that it now uses sqlite on both client and server to speed up queries and run offline.

<https://next.waka.app>

## Setup

- `npm ci`
- `npm run dev` for dev
- `npm run build` to build
- `npm run preview` for a preview server

## Configuration

_The orchestrator will start without any configuration and serve the sample configuration._ However, if you do not set up AWS credentials (S3), imports on the server will not work but you can still use the Waka dev tools in the client to test imports locally. If you're not using S3 (e.g Cloudflare R2) you can set `AWS_S3_ENDPOINT`.

To configure the orchestrator, set `WAKA_ORCHESTRATOR_CONFIG` to:

```
database:
  region: ap-southeast-2
  bucketName: your-s3-bucket-name
  publicUrl: https://your-bucket-public-url.com/regions
regions:
  nz-akl:
    name: 'Auckland, New Zealand'
    gtfsZipUrl: https://gtfs.at.govt.nz/gtfs.zip
```

You will also need to set a `WAKA_ORCHESTRATOR_ACCESS_TOKEN` to the administrator bearer token that you want to use. Multiple tokens are not currently supported.

The `WAKA_ORCHESTRATOR_CACHE_PERIOD` variable can also be set to a number in milliseconds to reduce the number of reads from S3.

## Application Structure

There's three apps in this repository.

- **lib**: The library for importing, manipulating, and querying GTFS. This will eventually be published as a NPM module that runs on both client and server.
- **apps/orchestrator**: The server that downloads, parses GTFS files and serves them to users. It also provides a HTTP API so queries can be run without downloading the whole database.
- **apps/web**: The new web frontend. It can download and query the sqlite database directly, or use server side rendering to grab the data from the orchestrator's HTTP API.

## Notes

### Data Loading

This is designed to eventually run fully offline - this is how static GTFS data is loaded in `apps/web`:

1. If the sqlite db is already downloaded to the client, query from that (provider: client)
2. If it's not, query the data via HTTP from `apps/orchestrator` - this is also run when server side rendering (provider: server)
3. If the HTTP request fails, wait until the sqlite db is downloaded, and then query on that (provider: static)
