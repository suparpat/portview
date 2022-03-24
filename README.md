# portview
Track and analyse your investment portfolio. Runs as a web app with NodeJS + Express.

![This is an image](/portview.png)


Features
* Works directly with .csv portfolio data exported from Yahoo Finance, or manually create trade data in a CSV file
* Pulls up-to-date data from Yahoo Finance
* Calculates:
  * Total profit/loss
  * Total realized/unrealized profit/loss
  * Net worth
  * Cash on hands
  * Weight of each holding in portfolio
  * Realized profit/loss of each holding



Usage
1. Clone repository
2. Install dependencies with `npm install`
3. Copy and paste `data-sample` directory and rename it to `data`
4. Edit the data files inside to reflect your portfolio
5. Start app by calling `node app/index.js`
6. By default app runs on port 3000. Visit localhost:3000

