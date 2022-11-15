let multiLineChart, AreaChart1, AreaChart2;

let stationMap;

let parseDate = d3.timeParse('%m/%d/%Y');

let promises = [

	d3.csv("data/CableNewsCoverage/cableNewsCovDW.csv"),
	d3.csv("data/cableNewsCoverageTime.csv", d => {
		//convert to ints and parse the date
		d.value = +d.Value;
		d.date = parseDate(d.Date);
		return d;
	}),
	d3.csv("data/newsVolumeOverTime.csv", d => {
		//convert to ints and parse the date
		d.value = +d.Value;
		d.date = parseDate(d.Date);
		d.deaths = +d.Deaths;
		return d;
	}),

];

Promise.all(promises)
	.then(function (data) {
		createVis(data)
	})
	.catch(function (err) {
		console.log(err)
	});

//data.group(({type})) => type);

//filter


function createVis(data) {
	let dataDW = data[0]
	let cableNewsCoverageData = data[1]
	let newsVolumeOverTime = data[2]

	console.log('news data raw');
	console.log(cableNewsCoverageData);
	console.log(dataDW);

	multiLineChart = new MultiLineChart("multiLineChart", cableNewsCoverageData);
	AreaChart1 = new AreaChart("areaChart", newsVolumeOverTime);
	AreaChart2 = new AreaChart_2("areaChart2", newsVolumeOverTime);


}

function wrangleData(data){



	//grouping function to gather all the news channel
	//then filter function to send them to the right array

}
