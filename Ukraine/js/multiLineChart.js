
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
        /*
                svg.append("path")
                    .datum(vis.data)
                    .attr("fill", "none")
                    .attr("stroke", "#038C9E")
                    .attr("stroke-width", 2.5)
                    .attr("opacity", 0.8)
                    .attr("d", d3.area()
                        .x(function (d) {
                            return xScale(d.Date)
                        })
                        .y0(yScale(0))
                        .y1(function (d) {
                            return yScale(d.Value)
                        })
                    )*/

        vis.wrangleData()
    }

    wrangleData () {
        let vis = this;



        //attempting to figure out grouping but a bunch of this isn't supported
        /*
        let products = [
            { name: 'asparagus', type: 'vegetables', quantity: 5 },
            { name: 'bananas', type: 'fruit', quantity: 0 },
            { name: 'goat', type: 'meat', quantity: 23 },
            { name: 'cherries', type: 'fruit', quantity: 5 },
            { name: 'fish', type: 'meat', quantity: 22 }
        ];
        const groupByCategory = products.groupBy(product => {
            return product.type;
        });
        console.log(groupByCategory);
        console.log("result")
        let ungrouped = vis.data;
        let groupedChannels = ungrouped.group(({Series}) => Series);
        console.log("groupedChannels")
        console.log(groupedChannels)
*/
        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        //append the area
        //with reference to https://d3-graph-gallery.com/graph/area_basic.html
    }
}