# WIP

Small web app that lets you search UMD courses by building, room, and time. Since the official website doesn't provide such functionality (and I would find use for it often).

To be integrated into my [UMD CS course registration tracker](https://github.com/ChristianNguyendinh/cs-upper-level-registration-stats) eventually.

Rest of README to come after some housekeeping tasks.

## Setup:

0. Setup `MongoDB`. Settings in `src/config.json`. Scrape scripts (ugly) will scrape the data into Mongo.

1. Use proper `node` version (8.7.0), using `nvm` or some other method

```
$ nvm use
```

2. Install dependecies

```
$ npm install
```

3. Ensure `MongoDB` instance is running

4. Start the application

- `npm run start` starts the server
- `PORT=4001 npm run start` starts the server on port 4001

## Development:

`npm run watch` starts the server and restarts on changes to any file in `src/`

`npm run test:unit` runs unit tests

Scrape scripts for gathering data work, but need to be cleaned up.

### TODO:
- finish converting src to typescript
- convert tests to typescript
- linter
- code coverage
- logger
- actual frontend - maybe leave that for another project? - integrate in CS registration?
- autofill buildings
- deploy MVP
- clean up old scrape scripts (i dislike my past self)
