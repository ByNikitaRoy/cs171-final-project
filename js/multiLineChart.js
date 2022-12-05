

class MultiLineChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis()

    }

    initVis() {

        let vis = this;
        console.log(vis.data)
        //initial variables
        // Margin object with properties for the four directions
        let margin = {top: 20, right: 20, bottom: 20, left: 25};

        // Width and height as the inner dimensions of the chart area
        let width = 1300- margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        //create svg area
        let svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //create x scale
        let xScale = d3.scaleTime()
            .domain(d3.extent(vis.data[3], function (d) {
                return d.Date;
            }))
            .range([margin.left, width - margin.right])
        //create y scale
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(vis.data[3], function (d) {
                return +d.Value;
            })])
            .range([height - margin.bottom, margin.top])

        //add xaxis axis
        svg.append("g")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %Y")))
            .attr("font-size", '12px')
            .attr('class','xAxis');

        //add yaxis
        svg.append("g")
            .call(d3.axisLeft(yScale))
            .attr("transform", `translate(${margin.left}, 0)`)
            .attr('class','yAxis');
        //Create chart title
        svg.append('text')
            .text('Coverage Over Time by Television News Outlet')
            .attr('class', 'titleText')
            .attr("text-anchor", "middle")
            .attr('x', width / 2)
            .attr('y', 10)


        vis.wrangleData()
    }

    wrangleData () {
        let vis = this;


        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        //append the area
        //with reference to https://d3-graph-gallery.com/graph/area_basic.html
    }
}
