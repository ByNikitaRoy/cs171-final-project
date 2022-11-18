let multiLineChart, AreaChart1, AreaChart2, LineChart1;

let parseDate = d3.timeParse('%m/%d/%Y');
let parseDateDash = d3.timeParse('%Y-%m-%d');
//let yellow = rgba(255, 255, 102, 1);
//let blueDark = rgba(51, 50, 70, 1);
let promises = [

	d3.csv("data/cableNewsCoverageUpdate.csv", d => {
		//convert to ints and parse the date
		d.value = +d.Value;
		d.date = parseDateDash(d.Date);
		return d;
	}),
	d3.csv("data/newsVolumeOverTime.csv", d => {
		//convert to ints and parse the date
		d.value = +d.Value;
		d.date = parseDate(d.Date);
		d.deaths = +d.Deaths;
		return d;
	}),
	d3.csv("data/CableNewsCoverage/cableNewsCovAljaz.csv"),
	d3.csv("data/CableNewsCoverage/cableNewsCovBBC.csv"),
	d3.csv("data/CableNewsCoverage/cableNewsCovCNBC.csv"),
	d3.csv("data/CableNewsCoverage/cableNewsCovCNN.csv"),
	d3.csv("data/CableNewsCoverage/cableNewsCovDW.csv"),
	d3.csv("data/CableNewsCoverage/cableNewsCovFOX.csv"),
	d3.csv("data/CableNewsCoverage/cableNewsCovMSNBC.csv"),
	d3.csv("data/CableNewsCoverage/cableNewsCovRT.csv")
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
	let cableNewsCoverageData = data[0];
	let newsCoverageData = data;
	let newsVolumeOverTime = data[1]



	multiLineChart = new MultiLineChart("multiLineChart", newsCoverageData);
	AreaChart1 = new AreaChart("areaChart", newsVolumeOverTime);
	AreaChart2 = new AreaChart_2("areaChart2", newsVolumeOverTime);
	LineChart1 = new LineChart("lineChart", cableNewsCoverageData);



}

function wrangleData(data){



	//grouping function to gather all the news channel
	//then filter function to send them to the right array

}