

class AreaChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis()

    }

    initVis() {

        let vis = this;
        //initial variables
        // Margin object with properties for the four directions
        let margin = {top: 20, right: 20, bottom: 20, left: 40};


        // Width and height as the inner dimensions of the chart area

       let width = document.getElementById(vis.parentElement).getBoundingClientRect().width - margin.left - margin.right;
       let height = document.getElementById(vis.parentElement).getBoundingClientRect().height - margin.top - margin.bottom;
        //create svg area
        let svg = d3.select("#areaChart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //add tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'circleTooltip')
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

        //add xaxis axis
        svg.append("g")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")))
            .attr("font-size", '12px')
            .attr('class', 'xAxis');

        //add yaxis
        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")))
            .attr("transform", `translate(${margin.left}, 0)`)
            .attr('class', 'yAxis');

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
            .attr("y", height-11.5)
            .attr("x", 58)
            .attr("dy", ".75em")
            .text("2022");

        //append the area
        //with reference to https://d3-graph-gallery.com/graph/area_basic.html
        svg.append("path")
            .datum(vis.data)
            .attr("fill", "rgba(255, 255, 102, 0.5)")
            .attr("stroke","rgba(255, 255, 102, 1)")
            //.attr("stroke", "#038C9E")
            .attr("stroke-width", 2.5)
            .attr("opacity", 0.95)
            .attr("d", d3.area()
                .x(function (d) {
                    return xScale(d.date)
                })
                .y0(yScale(0))
                .y1(function (d) {
                    return yScale(d.value)
                })
            )

        // Add dots
        svg.append('g')
            .selectAll("circle")
            .data(vis.data)
            .enter(vis.data)
            .append("circle")
            .attr("cx", function (d) { return xScale(d.date); } )
            .attr("cy", function (d) { return yScale(d.value); } )
            .attr("r", function(d) {
               // console.log(d.sevent);
                if(d.sevent == 1)
                    return 7;
                else
                    return 0;
            })
            .style("fill", "rgba(145,196,196, 1)")
            .style("stroke-width", 10)
            .style("stroke", "rgba(255,255,255,0.5)")
            .on('mouseover', function(event, d) {

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style=" border-radius: 5px; background:rgba(33,37,47,.85); padding: 10px">
                             <h6 class="keymain">${d.sdescription}</h6> 
                             <h6 class="key">Airtime: ${d.Value} %</h6>  
                             <h6 class="about">Date: ${d.Date}</h6> 
                                                   
                         </div>`);
            })
            .on('mouseout', function(event, d) {

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0+ "px")
                    .style("top", 0 + "px")
            })

        // Add a legend

        d3.select("#keyArea").append("svg")
            .attr("height", '30px')
            .attr("width",'30px')
            .append("circle")
            .attr("cx", '15')
            .attr("cy",'15')
            .attr("r",7)
            .style("fill", "rgba(145,196,196, 1)")
            .style("stroke-width", 10)
            .style("stroke", "rgba(255,255,255,0.5)")

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

