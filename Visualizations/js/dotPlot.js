
class DotPlot {

    /*
     *  Constructor method
     */
    constructor(parentElement, displayData) {
        this.parentElement = parentElement;
        this.data = displayData;

        this.initVis();
    }


    initVis () {
        let vis = this;
        console.log("dotPlot Running")

        //set margins width and height
        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        vis.width = 1000;
        vis.height = 800;

        //Set the color for each continent
        let color = d3.scaleOrdinal()
            .range(["#EFB605", "#E58903", "#E01A25", "#C20049", "#991C71", "#66489F", "#2074A0"])
            .domain(["Africa", "Asia", "Europe", "North America",
                "South America", "Oceania", "#NA"]);


        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text('dotPlot')
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        //xscale and yscale these are static
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width - vis.margin.left -vis.margin.right])
            .domain([-5,0])
            .nice();

        vis.yScale = d3.scaleLog()
            .range([0, vis.height - vis.margin.bottom- vis.margin.top])
            .domain([0,39000000])
            .nice();

        //x and y axis
        vis.xAxisGroup = vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate (${vis.margin.left},${vis.height - vis.margin.bottom})`);

        vis.yAxisGroup = vis.svg.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.xAxisGroup
            .call(d3.axisBottom()
                .scale(vis.xScale));

        vis.yAxisGroup
            .call(d3.axisLeft()
                .scale(vis.yScale));

        //figure out how to get the values to show up


        let wrapper = vis.svg.append("g").attr("class", "chordWrapper")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        vis.wrangleData();
    }


    /*
     *  Data wrangling
     */
    wrangleData () {
        let vis = this;
        console.log('wrangleData running')

        //temporarily set selected time range to a day
        vis.selectedTime = "2022-06-05"
        let parseDateDash = d3.timeParse('%Y-%m-%d');

        vis.selectedTimeConverted = parseDateDash(vis.selectedTime)

        // we want to filter data to the period of time up to the selectedTime
        vis.filteredData = [];

        console.log('data')
        console.log(vis.data)

        //go through every line of the data
        //if less than selected date -> add it to the filtered data

        vis.data.forEach(row => {

            if ( row.date < vis.selectedTimeConverted ){
                vis.filteredData.push(row)
            }
        })

        //data has been filtered
        console.log(vis.filteredData)

        //group by country
        vis.dataByCountry = Array.from(d3.group(vis.filteredData, d => d.Country), ([country, days,sum, tone]) => ({country, days, sum, tone}))

        //vis.dataByCountry["United Arab Emirates"].sum = 23;
        vis.dataByCountry.forEach( (row, index) =>{
            let sumPublications = 0
            let avgTone = 0
            let rowLength = row.days.length

            row.days.forEach(day =>{
                sumPublications += day.NumberOfArticles
                avgTone += day.AverageDocTone
            });

            avgTone = avgTone/rowLength
            vis.dataByCountry[index].tone = avgTone;
            vis.dataByCountry[index].sum = sumPublications;
        });

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        console.log('updateVis running')face

    }
}

