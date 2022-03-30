console.log(data)
console.log(port)
console.log(stats)

const ctx = document.getElementById('myChart').getContext('2d');

let colors = []

port.forEach((p) => colors.push(`rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 1)`))

const myChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: port.map((p) => p.symbol),
        datasets: [{
            label: 'Portfolio',
            data: port.map((p) => p.weight),
            backgroundColor: colors,
            borderWidth: 1
        }]
    },
    options: {
    	responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
})

let dailyPortValue = {
    x: [], 
    y: [], 
    type: 'scatter',
    mode: "lines",
    name: 'Portfolio value'
}

let realized = {
    x: [], 
    y: [], 
    type: 'scatter',
    mode: "lines",
    name: 'Realized gain/loss'
}


let dailyPortReturn = {
    x: [], 
    y: [],
    yaxis: 'y2',
    type: 'scatter',
    mode: "lines",
    name: 'Return (%)'
}

let startDate = new Date(`${new Date().getFullYear()-3}-01-01`)
let endDate = new Date(`${new Date().getFullYear()}-12-31`)

let tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
for(let i = startDate; i < endDate; i.setDate(i.getDate() + 1)){
    if(i < tomorrow){
        let dayData = calcDayValue(i)
        // console.log(i, dayData)
        dailyPortValue['x'].push(i.toISOString())
        dailyPortValue['y'].push(dayData.val)
        dailyPortReturn['x'].push(i.toISOString())
        dailyPortReturn['y'].push((dayData.val + dayData.realized - dayData.cost) / dayData.cost * 100)
        realized['x'].push(i.toISOString())
        realized['y'].push(dayData.realized)
        // dailyPortReturn['y'].push((dayData.val - stats.initial_amount) / stats.initial_amount * 100)
    }
}



// console.log('dailyPortValue', dailyPortValue)

function calcDayValue(date){
    let val = 0
    let cost = 0
    let realized = 0
    let todaysHoldings = {}

    data.forEach((d) => {
        let tradedate = (tradeDateFormat(d['Trade Date']))

        if(tradedate <= date){
            if(!todaysHoldings[d['Symbol']]){
                let price = findNearestQuote(d['enrich']['historical'], date, d['Symbol'])

                todaysHoldings[d['Symbol']] = {
                    shares: d['Quantity'],
                    cost: d['Purchase Price'],
                    currentPrice: price
                }                
            }

            else if(d['Quantity'] > 0){
                let newQty = (todaysHoldings[d['Symbol']].shares + d['Quantity'])

                todaysHoldings[d['Symbol']].cost = ((todaysHoldings[d['Symbol']].shares * todaysHoldings[d['Symbol']].cost) + (d['Quantity'] * d['Purchase Price'])) / newQty
                todaysHoldings[d['Symbol']].shares = newQty
            }

            else if(d['Quantity'] < 0){
                let newQty = (todaysHoldings[d['Symbol']].shares + d['Quantity'])
                realized += (Math.abs(d['Quantity']) * d['Purchase Price']) - (Math.abs(d['Quantity']) * todaysHoldings[d['Symbol']].cost)

                todaysHoldings[d['Symbol']].cost = (newQty > 0) ? (((todaysHoldings[d['Symbol']].shares * todaysHoldings[d['Symbol']].cost) + (d['Quantity'] * d['Purchase Price'])) / newQty) : 0
                todaysHoldings[d['Symbol']].shares = newQty

            }



        }
    })

    for(let s in todaysHoldings){
        let thisHolding = todaysHoldings[s]
        if(thisHolding['shares'] > 0){
            val += thisHolding['shares'] * thisHolding['currentPrice']
            cost += thisHolding['shares'] * thisHolding['cost']            
        }
    }

    // console.log(String(date), todaysHoldings)

    return {
        val: val,
        cost: cost,
        realized: realized
    }
}

function findNearestQuote(historical, date, symbol){
    //format date as YYYYMMDD
    let dateNum = Number(`${date.getFullYear()}${("0"+(date.getMonth()+1)).slice(-2)}${("0"+date.getDate()).slice(-2)}`)

    //create hist from historical, enriching formatted date and date diff
    let hist = historical.map((h) => {
        h.d = Number(h.date.substring(0, 10).replace(/-/g, ''))
        h.diff = Math.abs(h.d - dateNum)
        return h
    })

    //sort by diff
    hist.sort((a, b) => a.diff - b.diff)

    // if(symbol.toLowerCase() == 'aapl'){
    //     console.log(dateNum, 'aapl',  hist[0].diff, hist[0].d)
    // }


    return (hist[0].usd_close_price ? hist[0].usd_close_price : hist[0].close)
}

function tradeDateFormat(td){
    let ds = String(td)
    let y = ds.substring(0, 4)
    let m = ds.substring(4, 6)
    let d = ds.substring(6, 8)
    let o = new Date(`${y}-${m}-${d}`)

    return o
}
// https://plotly.com/javascript/time-series/
let plotConfig = {
    data: [dailyPortValue, dailyPortReturn, realized],
    "layout": {
        "width": 1200,
        "height": 700,
        yaxis: {
            title: 'value'
        },
        yaxis2: {
            title: 'return (%)',
            titlefont: {color: 'rgb(148, 103, 189)'},
            tickfont: {color: 'rgb(148, 103, 189)'},
            overlaying: 'y',
            side: 'right'
        }
    }
}

Plotly.newPlot("gd", plotConfig)

// function getFormattedDate(){
// 	let d = new Date()
// 	return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
// }

// $(document).ready( function () {
// 	$('table').each(function() {
// 		let id = $(this).attr('id')
// 		let sortCol = $(this).attr('sort-col')
// 		let pages = parseInt($(this).attr('page-length'))
// 		let options = {
// 			fixedHeader: {
// 				header: true,
// 				footer: true
// 			},
// 			fixedColumns: true,
// 			'paging': false,
// 			// pageLength: 30,
// 			dom: 'Bfrtip',
// 			buttons: [
// 				'copy', 
// 				{extend: 'csv', title: `${getFormattedDate()}_portfolio`},
// 				{extend: 'excel', title: `${getFormattedDate()}_portfolio`},
// 				// 'pdf', 'print'
// 			],
// 		}
// 		if(pages && !isNaN(pages)){
// 			options['paging'] = true
// 			options['pageLength'] = pages
// 		}

// 		if(sortCol){
// 			options['order'] = [[sortCol, 'desc']]
// 		}else{
// 			// prevent auto sorting on first column, https://stackoverflow.com/questions/12124746/disable-automatic-sorting-on-the-first-column-when-using-jquery-datatables
// 			options['order'] = []
// 		}

// 		$(this).DataTable(options);
// 	})

// } );

