

/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */


class BarChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;

        this.initVis();
    }

    /*
     * Initialize visualization (static content; e.g. SVG area, axes)
     */

    initVis() {
        let vis = this;

        //initialize dimensions
        vis.margin = {top:10, right: 40, bottom: 10, left: 40};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 160 - vis.margin.top - vis.margin.bottom;
        vis.totalDeaths = 300;
        //create drawing svg area
        vis.svg = d3.select('#'+ vis.parentElement)
            .append('svg')
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        //create scale and axis - not sure if this is the correct step
        //scale
        vis.x = d3.scaleLinear()
            .range([0, vis.width - vis.margin.right])
            .domain([0,20287]);

        vis.y = d3.scaleBand()
            .range([0, vis.height])
            .padding(0.1)

        //axis
        vis.yAxis = d3.axisLeft()
            .scale(vis.y)

        vis.svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(0,"+ vis.margin.top+")");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     */

    updateVis() {
        let vis = this;

        // (1) Update domains
        //vis.x.domain([0, d3.max(vis.displayData, d=> d.deaths)]);
        //vis.y.domain(vis.configGroup.map(function(d) {return d.key;}))

        let bars = vis.svg.selectAll('rect').data(vis.displayData);

        // (2) Draw rectangles
        bars.enter().append('rect')
            .merge(bars)
            .transition()
            .duration(300)
            .attr("y", 0)
            .attr("x", d => vis.x(0))
            .attr("height", 25)
            .attr("width",vis.x(vis.totalDeaths))
            .attr("fill", "#FFFF66")
            .attr("class","rect");

        bars.exit().remove();


        //I think this is not the proper way to do this, go back and check
        //vis.svg.select(".y-axis").call(vis.yAxis)

    }

    selectionChanged(brushRegion) {
        let vis = this;

        // Filter data accordingly without changing the original data

        vis.brushFilter = vis.data.filter( d => {
            return (d.date > brushRegion[0] && d.date < brushRegion[1])
        });
        console.log('brushfilter')
        console.log(vis.brushFilter)
        vis.displayData = vis.brushFilter
        vis.totalDeaths = 0;

        vis.displayData.forEach(d => {
            vis.totalDeaths = vis.totalDeaths + d.deaths
        })
        console.log('total deaths')
        console.log(vis.totalDeaths)



        // Update the visualization
        vis.wrangleData();
    }
}
