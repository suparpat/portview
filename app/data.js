const yahooFinance = require('yahoo-finance')

// https://github.com/pilwon/node-yahoo-finance
// https://github.com/pilwon/node-yahoo-finance/blob/master/docs/quote.md
async function getPrices(data){
	let results = []
	let dataChunks = split(data, 7) //split data array into subarrays of length 10 each

	// for each chunk, create an array of promises and wait for them to finish,
	// then add results back to each datum
	for(let i = 0; i < dataChunks.length; i++){
		console.log(`chunks: ${i}/${dataChunks.length}`)

		//
		let promises = []
		dataChunks[i].forEach(async (d) => {
			console.log(d.Symbol)
			let p = getPrice(d.Symbol)
			promises.push(p)
		})

		await Promise.all(promises).then((values) => {
			console.log(values)

			dataChunks[i].map((d, idx) => {
				d.enrich = {
					quote: values[idx]
				}
				return d
			})
			results = results.concat(dataChunks[i])
		})

	}

	results.flat()
	return results

	
}
function split(arr, chunk){
	var temp = []
	for(var i = 0; i < arr.length; i+=chunk){
		temp.push(arr.slice(i, i+chunk))
	}
	return temp
}


async function getPrice(symbol){
	return new Promise((resolve, reject) => {
		yahooFinance.quote({
		  symbol: symbol,
		  modules: [ 
		  'price', 
		  'summaryDetail',
		  'summaryProfile',
		  'recommendationTrend',
		  'financialData'
		  ] // see the docs for the full list
		}, function (err, quotes) {
			if(err){
				reject(err)
			}else{
				resolve(quotes)
			}
		});		
	})
}

module.exports = {
	getPrices: getPrices
}

