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
  d3.csv("data/new_data_topics.csv"),
  d3.csv("data/volume_news_over_country - country coverage over time 2y.csv"),
  d3.json("data/geo-world.json"),
  d3.csv("data/sentimentAnalysis3.csv", d => {
    //convert to ints and parse the date
    d.AverageDocTone = +d.AverageDocTone;
    d.NumberOfArticles = +d.NumberOfArticles;
    d.date = new Date(d.Date);
    return d;
  })
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
  let newsVolumeOverTime = data[1];
  let dotPlotData = data[5];

  console.log("data", data);

  //multiLineChart = new MultiLineChart("multiLineChart", newsCoverageData);
  AreaChart1 = new AreaChart("areaChart", newsVolumeOverTime);
  //AreaChart2 = new AreaChart_2("areaChart2", newsVolumeOverTime);
  LineChart1 = new LineChart("lineChart", cableNewsCoverageData);
  map = new MapViz("map", data[3], data[4]);
  bubbleChart = new BubbleViz("bubble", data[2]);
  DotPlotChart = new DotPlot("dotPlotVis", dotPlotData);

}

