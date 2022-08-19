const roundTo2 = require('./helpers.js').roundTo2

module.exports = function(initial_amount, er){
	return function calc(data){
		let holdings = {}
		let stats = {
			sum_values: 0,
			sum_diff: 0,
			realized: 0,
			initial_amount: initial_amount,
			holdings_cost: 0
		}

		//enter data to holdings object
		data.forEach((d) => {
			if(!holdings[d.Symbol]){
				holdings[d.Symbol] = {
					shares: d.Quantity,
					cost: d['Purchase Price'],
					enrich: d.enrich,
					realized: 0,
					realized_cost: 0,
					lots: [{shares: d.Quantity, cost: d['Purchase Price'], date: tradeDateFormat(d['Trade Date'])}]
				}
				stats.holdings_cost += (d.Quantity * d['Purchase Price'])
			}

			else if(d.Quantity > 0){
				let newQty = holdings[d.Symbol].shares + d.Quantity
				holdings[d.Symbol].cost = ((holdings[d.Symbol].cost * holdings[d.Symbol].shares) + (d.Quantity * d['Purchase Price'])) / newQty
				holdings[d.Symbol].shares = newQty
				stats.holdings_cost += (d.Quantity * d['Purchase Price'])
				holdings[d.Symbol].lots.push({shares: d.Quantity, cost: d['Purchase Price'], date: tradeDateFormat(d['Trade Date'])})
			}

			else if(d.Quantity < 0){
				let newQty = holdings[d.Symbol].shares + d.Quantity
				let real = (Math.abs(d.Quantity) * d['Purchase Price']) - (Math.abs(d.Quantity) * holdings[d.Symbol].cost) 
				stats.realized += real
				// holdings[d.Symbol].cost = 0
				holdings[d.Symbol].shares = newQty
				holdings[d.Symbol].realized += real
				holdings[d.Symbol].realized_cost += (Math.abs(d.Quantity) * holdings[d.Symbol].cost)
				stats.holdings_cost = stats.holdings_cost - (Math.abs(d.Quantity) * holdings[d.Symbol].cost)
				holdings[d.Symbol].lots.push({shares: d.Quantity, cost: d['Purchase Price'], date: tradeDateFormat(d['Trade Date'])})
			}

		})

		holdings['CASH'] = {
			price: roundTo2(parseFloat(stats.initial_amount) - parseFloat(stats.holdings_cost) + parseFloat(stats.realized)),
			shares: 1,
			cost: 0,
			diff: 0,
			realized: 0,
			realized_cost: 0
		}
		holdings['CASH'].value = holdings['CASH'].price

		for (let h in holdings){
			let v = holdings[h]
			if(v['enrich']){
				if(v['enrich']['quote']){
					let curPrice = v['enrich']['quote']['price']['regularMarketPrice']
					// let currency = v['enrich']['quote']['price']['currency']
					// if(currency.toLowerCase() == 'gbp'){
					// 	curPrice = curPrice / 100 //convert penny to pound
					// 	curPrice = curPrice / (er.gbp) //convert gbp to usd
					// }

					v.value = roundTo2(curPrice * v.shares)
					v.diff = (curPrice - v.cost) * v.shares
					v.diffPercent = roundTo2((curPrice - v.cost) / v.cost * 100)
					v.diff = roundTo2(v.diff)
					v.cost = roundTo2(v.cost)					
				}else{
					v.value = 0
					v.diff = (0 - v.cost) * v.shares
					v.diffPercent = roundTo2((0 - v.cost) / v.cost * 100)
					v.diff = roundTo2(v.diff)
					v.cost = roundTo2(v.cost)						
				}
			}

			stats.sum_values += v.value
			stats.sum_diff += v.diff
		}

		for (let h in holdings){
			let v = holdings[h]
			v.weight = roundTo2(v.value/stats.sum_values*100)
		}
		stats.realized = roundTo2(stats.realized)
		stats.sum_diff = roundTo2(stats.sum_diff)

		let arr = objToArr(holdings)
		arr.sort((a, b) => {
			return b.weight - a.weight
		})
		return {arr, stats}
	}


}

function tradeDateFormat(td){
	let ds = String(td)
	let y = ds.substring(0, 4)
	let m = ds.substring(4, 6)
	let d = ds.substring(6, 8)
	let o = new Date(`${y}-${m}-${d}`)

	return o
}

function objToArr(obj){
	let arr = []
	for(let h in obj){
		let o = {symbol: h}
		let keys = Object.keys(obj[h])
		keys.forEach((k) => {
			o[k] = obj[h][k]
		})
		arr.push(o)
	}
	return arr
}


