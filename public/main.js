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
});

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

