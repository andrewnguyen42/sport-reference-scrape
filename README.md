# nflscrape
A casperjs bot to scrape pro-football-reference.com for historical nfl data

Requirements: CasperJS 1.9.7 or greater

Basic usage:

```
casperjs nflscrape.js --type=rushing
casperjs nflscrape.js --type=passing
casperjs nflscrape.js --type=receiving
```

These will spit out csv files with the season totals for rushing, passing and receiving since 1932.
