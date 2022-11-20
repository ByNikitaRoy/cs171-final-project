let multiLineChart, AreaChart1, AreaChart2, LineChart1, map, bubbleChart;

let parseDate = d3.timeParse("%m/%d/%Y");
let parseDateDash = d3.timeParse("%Y-%m-%d");

let promises = [
  d3.csv("data/cableNewsCoverageUpdate.csv", (d) => {
    //convert to ints and parse the date
    d.value = +d.Value;
    d.date = parseDateDash(d.Date);
    return d;
  }),
  d3.csv("data/newsVolumeOverTime.csv", (d) => {
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
  d3.csv("data/CableNewsCoverage/cableNewsCovRT.csv"),
  d3.csv("data/new_data_topics.csv"),
  d3.csv("data/volume_news_over_country - country coverage over time 2y.csv"),
  d3.json("data/geo-world.json"),
];

Promise.all(promises)
  .then(function (data) {
    createVis(data);
  })
  .catch(function (err) {
    console.log(err);
  });

//data.group(({type})) => type);

//filter

function createVis(data) {
  let cableNewsCoverageData = data[0];
  let newsCoverageData = data;
  let newsVolumeOverTime = data[1];

  console.log("data", data);

  //multiLineChart = new MultiLineChart("multiLineChart", newsCoverageData);
  AreaChart1 = new AreaChart("areaChart", newsVolumeOverTime);
  AreaChart2 = new AreaChart_2("areaChart2", newsVolumeOverTime);
  LineChart1 = new LineChart("lineChart", cableNewsCoverageData);
  map = new MapViz("map", data[11], data[12]);
  bubbleChart = new BubbleViz("bubble", data[10]);
}

function wrangleData(data) {
  //grouping function to gather all the news channel
  //then filter function to send them to the right array
}
