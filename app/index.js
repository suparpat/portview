const express = require('express')
const {parse: csvParseSync} = require('csv-parse/sync')
const {stringify} = require('csv-stringify/sync')
const path = require('path')
const csv = require('csv')
const fs = require('fs')
const roundTo2 = require('./helpers.js').roundTo2

let initial_amount = parseFloat(fs.readFileSync(__dirname + '/../data/initial_amount'))

const er = {
	gbp: 0.76, //usdgbp
	eur: 0.91, //usdeur
	hkd: 7.82 //usdhkd
}


const calc = require('./calc.js')(initial_amount, er)
const getPrices = require('./data.js').getPrices
const getHistoricals = require('./data.js').getHistoricals
const getHistorical = require('./data.js').getHistorical

const app = express()
app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, '/../public')))




app.get('/', async (req, res) => {
	let inputPath = __dirname + '/../data/updated.csv'
	if(!fs.existsSync(inputPath)){
		res.render('main', {})
	}

	else{
		let input = fs.readFileSync(inputPath)
		var data = csvParseSync(input)
		data = csvToJson(data)
		data = data.map((d) => {
			d.Quantity = parseFloat(d.Quantity)
			d['Purchase Price'] = parseFloat(d['Purchase Price'])
			if(d.enrich){
				d.enrich = JSON.parse(d.enrich)
			}
			return d
		})

		data = data.map((d) => {
			if(d['enrich']['quote']){
				let currency = (d['enrich']['quote']['price']['currency']).toLowerCase()
				let exchange = (d.enrich.quote.price.exchange).toLowerCase()

				if(d.enrich && exchange == 'lse'){
					// d['Purchase Price'] = d['Purchase Price'] / 100 //convert penny to pound
					d.enrich.historical = d.enrich.historical.map((p) => {
						// if(Number(p.date.substring(0, 4)) < 2022){
						// 	p.usd_close_price = (p.close / 100)						
						// }
						return p
					})
				}

				if(d.enrich && currency == 'gbp'){
					d['Purchase Price'] = d['Purchase Price'] / 100 / (er.gbp) //convert penny to pound, convert gbp to usd
					d['enrich']['quote']['price']['regularMarketPrice'] = d['enrich']['quote']['price']['regularMarketPrice'] / 100 / (er.gbp)
					d.enrich.historical = d.enrich.historical.map((p) => {
						p.usd_close_price = (p.close / 100 / er.gbp)
						return p
					})
				}
				else if(d.enrich && currency == 'hkd'){
					d['Purchase Price'] = d['Purchase Price'] / (er.hkd) //convert hkd to usd
					d['enrich']['quote']['price']['regularMarketPrice'] = d['enrich']['quote']['price']['regularMarketPrice'] / (er.hkd)
					d.enrich.historical = d.enrich.historical.map((p) => {
						p.usd_close_price = (p.close / er.hkd)
						return p
					})
				}				
			}

			return d
		})

		data.sort((a, b) => {
			return a['Trade Date'] - b['Trade Date']
		})

		let calculated = calc(data)
		let port = calculated.arr
		let stats = calculated.stats
		let sp500 = fs.readFileSync(__dirname + '/../data/sp500.csv')
		sp500 = csvParseSync(sp500)
		sp500 = csvToJson(sp500)
		
		res.render('main', {
			data: data,
			port: port,
			stats: stats,
			roundTo2: roundTo2,
			sp500: sp500
		})
	}

})


app.get('/update', async (req, res) => {
	let inputPath = __dirname + '/../data/data.csv'
	if(!fs.existsSync(inputPath)){
		res.send(`Please create data/data.csv and data/initial_amount input files before updating.<br><a href="/">Go back</a>`)
	}

	else{
		let input = fs.readFileSync(__dirname + '/../data/data.csv')
		var data = csvParseSync(input)
		data = csvToJson(data)
		data = await getPrices(data)
		data = await getHistoricals(data)

		data.sort((a, b) => {
			return a['Trade Date'] - b['Trade Date']
		})
		console.log(data)
		fs.writeFileSync(__dirname + '/../data/updated.csv', stringify(data, {header: true}))

		let sp500 = await getHistorical('SPY')
		console.log(sp500)
		fs.writeFileSync(__dirname + '/../data/sp500.csv', stringify(sp500, {header: true}))

		res.send('done. <a href="/">Go back</a>')		
	}

})

app.listen(3000, (err) => {
	console.log(`PortView is listening on ${3000}`)
})



function csvToJson(csv){
    var cols = csv.shift()
    var out = csv.map((r) => {
        var temp = {}
        cols.forEach((c, index) => {
            temp[c] = r[index]
        })
        return temp
    })
    return out
}