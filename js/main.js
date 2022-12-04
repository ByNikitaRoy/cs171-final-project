let multiLineChart, AreaChart1, AreaChart2, LineChart1, map, bubbleChart;

let parseDate = d3.timeParse("%m/%d/%Y");
let parseDateDash = d3.timeParse("%Y-%m-%d");

Promise.all([
    d3.json("data/sentimentAnalysisMap2.json"),
    d3.json("data/geo-world.json"),
]).then(([data, geo]) => {
    data.forEach((d) => {
        d.date = new Date(d.Date);
    });

    map = new MapViz("map", data, geo);
});

d3.csv("data/newsVolumeOverTime.csv", (d) => {
    //convert to ints and parse the date
    d.value = +d.Value / 100;
    d.date = parseDate(d.Date);
    d.deaths = +d.Deaths;
    return d;
}).then((data) => {
    AreaChart1 = new AreaChart("areaChart", data);
    AreaChart2 = new AreaChart_2("areaChart2", data);
    barchart = new BarChart('barChart', data);

});

d3.csv("data/cableNewsCoverageUpdate.csv", (d) => {
    //convert to ints and parse the date
    d.value = +d.Value;
    d.date = parseDateDash(d.Date);
    return d;
}).then((data) => {
    // multiLineChart = new MultiLineChart("multiLineChart", data);
    LineChart1 = new LineChart("lineChart", data);
});

Promise.all([
    d3.csv("data/new_data_topics.csv"),
    d3.csv("data/Events_for_bubble_chart.csv"),
]).then(([data, events]) => {
    bubbleChart = new BubbleViz("bubble", data, events);
});

Promise.all([
    d3.json("data/sentimentAnalysisFinal.json"),
]).then(([data]) => {
    data.forEach((d) => {
        d.date = new Date(d.Date);
    });

    DotPlotChart = new DotPlot("dotPlotVis", data);
});

// React to 'brushed' event and update bar chart
function brushed() {

    let selectionRange = d3.brushSelection(d3.select(".brush").node());

    // Convert the extent into the corresponding domain values
    let selectionDomain = selectionRange.map(AreaChart2.x.invert);
    
    barchart.selectionChanged(selectionDomain);

}