

class AreaChart_2 {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;


        this.initVis()

    }

    initVis() {

        let vis = this;
        //initial variables
        // Margin object with properties for the four directions
        let margin = {top: 20, right: 40, bottom: 20, left: 40};

        // Width and height as the inner dimensions of the chart area
        let width = document.getElementById(vis.parentElement).getBoundingClientRect().width - margin.left - margin.right;
        let height = document.getElementById(vis.parentElement).getBoundingClientRect().height - margin.top - margin.bottom;
        //create svg area
        let svg = d3.select("#areaChart2").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //create x scale
        let xScale = d3.scaleTime()
            .domain(d3.extent(vis.data, function (d) {
                return d.date;
            }))
            .range([margin.left, width - margin.right])
        //create y scale
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.data, function (d) {
                return +d.value;
            })])
            .range([height - margin.bottom, margin.top])

        //create yscale deaths
        let yScaleDeaths = d3.scaleLinear()
            .domain([0, d3.max(vis.data, function (d) {
                return +d.deaths;
            })])
            .range([height - margin.bottom, margin.top])

        //add xaxis axis
        svg.append("g")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")))
            .attr("font-size", '12px')
            .attr('class','xAxis');

        //add yaxis
        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")))
            .attr("transform", `translate(${margin.left}, 0)`)
            .attr('class','yAxis');


        //add yaxis label
        svg.append("text")
            .attr("class", "ylabel")
            .attr("text-anchor", "middle")
            .attr("y", -18)
            .attr("x", -height/2)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Percent of Monitored Media Articles");



        //add year label
        svg.append("text")
            .attr("class", "yearLabel")
            .attr("text-anchor", "start")
            .attr("y", height-12)
            .attr("x", 58)
            .attr("dy", ".75em")
            .text("2021");

        //Create chart title
        //svg.append('text')
        //    .text('Percent of Global News Volume Containing "Ukraine"')
        //   .attr('class', 'titleText')
        //   .attr("text-anchor", "middle")
        //   .attr('x', width / 2)
        //  .attr('y', 10)

        //append the area
        //with reference to https://d3-graph-gallery.com/graph/area_basic.html
        svg.append("path")
            .datum(vis.data)
           .attr("fill", "rgba(51,102,145,0.6)")
            .attr("stroke","rgba(145,196,196, 1)")
            .attr("stroke-width", 1)
            // .attr("opacity", 1)
            .attr("d", d3.area()
                .x(function (d) {
                    return xScale(d.date)
                })
                .y0(yScale(0))
                .y1(function (d) {
                    return yScale(d.value)
                })
            )
        //Show Casualties
        document.getElementById("s-ukraine").onclick = () => {
            //add yaxisDeaths
            svg.append("g")
                .call(d3.axisRight(yScaleDeaths))
                .attr("transform", `translate(${width-margin.right}, 0)`)
                .attr('class','yAxisDeaths');

            //add yaxis label for deaths
            svg.append("text")
                .attr("class", "yLabelDeaths")
                .attr("text-anchor", "middle")
                .attr("y", width )
                .attr("x", -height/2)
                .attr("dy", ".75em")
                .attr("transform", "rotate(-90)")
                .text("Number of Casualties");

            svg.append("path")
                .datum(vis.data)
                .attr("fill", "#FFFF66")
                //.attr("stroke", "#FFFF66")
                .attr("stroke-width", 2.5)
                .attr("opacity", 1)
                .attr("d", d3.area()
                    .x(function (d) {
                        return xScale(d.date)
                    })
                    .y0(yScale(0))
                    .y1(function (d) {
                        return yScaleDeaths(d.deaths)
                    })
                ) }
        //TOOLTIP

        //For converting Dates to strings
        var formatTime = d3.timeFormat("%b %d , %Y");
        let bisectDate = d3.bisector(d => d.date).right;

        let group = svg.append('g')
            .attr('class', 'tooltip2')

        //create rect for mouseover
        svg.append('rect')
            .attr('fill', 'transparent')
            .attr('x', 25)
            .attr('y', 0)
            .attr('width', width - (margin.left * 2))
            .attr('height', height)

        //on mouseover
        svg.on('mouseover', function (data) {

        })
        //when mouseover moves create and remove
        svg.on('mousemove', function (data) {
            d3.select('#tooltip').remove();
            d3.select('#tooltip1').remove();
            d3.select('#tooltip2').remove();

            let xPosition = d3.pointer(event)[0];
            let yPosition = d3.pointer(event) [0];

            const mouseDate = xScale.invert(xPosition);
            const mouseVolume = yScale.invert(yPosition);




            //add the line
            group.append('line')
                .attr('id', 'tooltip1')
                .attr('x1', xPosition)
                .attr('x2', xPosition)
                .attr("y1", margin.top)
                .attr("y2", height - margin.bottom)
                .attr('stroke', 'lightgrey')
                .attr('stroke-width', '2px')


            svg.append('text')
                .attr('id', 'tooltip')
                .attr('x', xPosition + 10)
                .attr('y', margin.top + 15)
                .attr('text-anchor', 'start')
                .attr('font-size', '15px')
                .attr('fill', 'white')
                .text(function () {
                    return formatTime(mouseDate);
                })


        })
            //remove the line
            .on('mouseout', function () {
                d3.select('#tooltip').remove();

            })



    }
    wrangleData () {
        let vis = this;

        // No data wrangling/filtering needed

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;


    }
}
