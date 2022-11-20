
class DotPlot {

    /*
     *  Constructor method
     */
    constructor(parentElement, displayData) {
        this.parentElement = parentElement;
        this.data = displayData;

        this.initVis();
    }


    initVis() {
        let vis = this;
        console.log("dotPlot Running")
        console.log(vis.data)
        //set margins width and height
        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        vis.width = 1000;
        vis.height = 800;

        //Set the color for each continent
        let color = d3.scaleOrdinal()
            .range(["#EFB605", "#E58903", "#E01A25", "#C20049", "#991C71", "#66489F", "#2074A0"])
            .domain(["Africa", "Asia", "Europe", "North America",
                "South America", "Oceania", "#NA"]);

        vis.initWrangleData()

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        //xscale and yscale these are static
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width - vis.margin.left - vis.margin.right])
            .domain([-5, 0])
            .nice();

        vis.yScale = d3.scaleSymlog()
            .range([0, (vis.height - vis.margin.bottom - vis.margin.top)])
            .domain([39000000, 7000]);

        //x and y axis
        vis.xAxisGroup = vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate (${vis.margin.left},${vis.height - vis.margin.bottom})`);

        vis.yAxisGroup = vis.svg.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.xAxisGroup
            .call(d3.axisBottom()
                .scale(vis.xScale))
            .attr('class', 'xAxis');

        vis.yAxisGroup
            .call(d3.axisLeft()
                .scale(vis.yScale))
            .attr('class', 'yAxis');

        // Add a legend
        var regionSet = new Set();
        for (var i = 0; i < vis.dataByCountry.length; i++) {
            regionSet.add(vis.dataByCountry[i].continent);
        }
        ;
        var regions = Array.from(regionSet);
        var ordinal = d3.scaleOrdinal()
            .domain(regions)
            .range(d3.schemeCategory10);

        vis.svg.append("g")
            .attr("class", "legendOrdinal")
            .attr('transform', `translate (${vis.width - (vis.width *(1/5))}, ${vis.margin.top})`);


        var legendOrdinal = d3.legendColor()
            .title("Legend: Continent")
            .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
            .shapePadding(10)
            .scale(ordinal);


        vis.svg.select(".legendOrdinal")
            .attr('class','legendDots')
            .call(legendOrdinal);

        let wrapper = vis.svg.append("g").attr("class", "chordWrapper")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;
        console.log('wrangleData running')

        //temporarily set selected time range to a day
        vis.selectedTime = "2022-02-01"
        let parseDateDash = d3.timeParse('%Y-%m-%d');

        vis.selectedTimeConverted = parseDateDash(vis.selectedTime)

        // we want to filter data to the period of time up to the selectedTime
        vis.filteredData = [];

        console.log('data')
        console.log(vis.data)

        //go through every line of the data
        //if less than selected date -> add it to the filtered data

        vis.data.forEach(row => {

            if (row.date < vis.selectedTimeConverted) {
                vis.filteredData.push(row)
            }
        })

        //data has been filtered
        console.log(vis.filteredData)

        //group by country
        vis.dataByCountry = Array.from(d3.group(vis.filteredData, d => d.Country), ([country, days, sum, tone, continent]) => ({
            country,
            days,
            sum,
            tone,
            continent
        }))

        //vis.dataByCountry["United Arab Emirates"].sum = 23;
        vis.dataByCountry.forEach((row, index) => {
            let sumPublications = 0
            let avgTone = 0
            let rowLength = row.days.length
            let continentValue = row.days[0].CONTINENT
            row.days.forEach(day => {
                sumPublications += day.NumberOfArticles
                avgTone += day.AverageDocTone
            });

            avgTone = avgTone / rowLength
            vis.dataByCountry[index].tone = avgTone;
            vis.dataByCountry[index].sum = sumPublications;
            vis.dataByCountry[index].continent = continentValue;
        });


        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        console.log('updateVis running')
        console.log('data by country')
        console.log(vis.dataByCountry)
        // Add dots
        vis.svg.append('g')
            .selectAll("dot")
            .data(vis.dataByCountry)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return vis.xScale(d.tone);
            })
            .attr("cy", function (d) {
                return vis.yScale(d.sum);
            })
            .attr("r", function (d) {

                return 9;
            })
            .style("fill", function (d) {
                console.log(d.days[0].CONTINENT)
                let cont;
                let switchTest = d.days[0].CONTINENT
                switch (switchTest) {
                    case "Asia":
                        return "#99CCCC";
                    case "North America":
                        return "#336699";
                    case "Europe":
                        return "#FFFF66";
                    case "Africa":
                        return "#669966";
                    case "South America":
                        return "purple";
                    case "Oceania":
                        return "green"
                    case "#N/A":
                        return 'red';
                }
            })
            .attr('opacity', '0.9')

    }

    initWrangleData() {
        let vis = this;
        console.log('wrangleData running')

        //temporarily set selected time range to a day
        vis.selectedTime = "2022-02-01"
        let parseDateDash = d3.timeParse('%Y-%m-%d');

        vis.selectedTimeConverted = parseDateDash(vis.selectedTime)

        // we want to filter data to the period of time up to the selectedTime
        vis.filteredData = [];

        console.log('data')
        console.log(vis.data)

        //go through every line of the data
        //if less than selected date -> add it to the filtered data

        vis.data.forEach(row => {

            if (row.date < vis.selectedTimeConverted) {
                vis.filteredData.push(row)
            }
        })

        //data has been filtered
        console.log(vis.filteredData)

        //group by country
        vis.dataByCountry = Array.from(d3.group(vis.filteredData, d => d.Country), ([country, days, sum, tone, continent]) => ({
            country,
            days,
            sum,
            tone,
            continent
        }))

        //vis.dataByCountry["United Arab Emirates"].sum = 23;
        vis.dataByCountry.forEach((row, index) => {
            let sumPublications = 0
            let avgTone = 0
            let rowLength = row.days.length
            let continentValue = row.days[0].CONTINENT
            row.days.forEach(day => {
                sumPublications += day.NumberOfArticles
                avgTone += day.AverageDocTone
            });

            avgTone = avgTone / rowLength
            vis.dataByCountry[index].tone = avgTone;
            vis.dataByCountry[index].sum = sumPublications;
            vis.dataByCountry[index].continent = continentValue;
        });

    }

}