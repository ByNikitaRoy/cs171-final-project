let  AreaChart1, AreaChart2, LineChart1, GapMinderChart,DotPlotChart;

let parseDate = d3.timeParse('%m/%d/%Y');
let parseDateDash = d3.timeParse('%Y-%m-%d');

let promises = [

	d3.csv("data/cableNewsCoverageUpdate.csv", d => {
		//convert to ints and parse the date
		d.value = +d.Value;
		d.date = parseDateDash(d.Date);
		return d;
	}),
	d3.csv("data/newsVolumeOverTime.csv", d => {
		//convert to ints and parse the date
		d.Average = +d.Value;
		d.date = parseDate(d.Date);
		d.deaths = +d.Deaths;
		return d;
	}),
	d3.json("data/nations.json"),
	d3.csv("data/sentimentAnalysis3.csv", d => {
		//convert to ints and parse the date
		d.AverageDocTone = +d.AverageDocTone;
		d.Lat = +d.Lat;
		d.Lon = +d.Lon;
		d.NumberOfArticles = +d.NumberOfArticles;
		d.date = parseDateDash(d.Date);
		return d;
	})
	];

Promise.all(promises)
	.then(function (data) {
		createVis(data)
	})
	.catch(function (err) {
		console.log(err)
	});


function createVis(data) {
	let cableNewsCoverageData = data[0];
	let newsVolumeOverTime = data[1];
	let nationsData = data[2];
	let dotPlotData = data[3];

	console.log("nationsData")
	console.log(nationsData)
	console.log("dotPlotData")
	console.log(dotPlotData)

	//AreaChart1 = new AreaChart("areaChart", newsVolumeOverTime);
	//AreaChart2 = new AreaChart_2("areaChart2", newsVolumeOverTime);
	//LineChart1 = new LineChart("lineChart", cableNewsCoverageData);
	//GapMinderChart = new GapMinderVis("gapMinderVis", nationsData);
	DotPlotChart = new DotPlot("dotPlotVis", dotPlotData);



}

function wrangleData(data){



	//grouping function to gather all the news channel
	//then filter function to send them to the right array

}
