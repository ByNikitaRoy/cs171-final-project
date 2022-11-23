
class DotPlot {

    /*
     *  Constructor method
     */
    constructor(parentElement, displayData) {
        this.parentElement = parentElement;
        this.data = displayData;
        this.loopStepTime = 1;

        this.initVis();
    }


    initVis() {
        let vis = this;

        //set margins width and height
        vis.margin = {top: 20, right: 20, bottom: 20, left: 50};
        vis.width = 1000;
        vis.height = 800;
        vis.padding = 20;

        //Set the color for each continent
        let color = d3.scaleOrdinal()
            .range(["#FFFF66", "#669166", "#336691", "#D599FF", "#9CDE9C", "#C1F2EC", "#CDCCF4"])
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
            .domain([0, 5]);

        vis.yScale = d3.scaleSymlog()
            .range([vis.margin.bottom, (vis.height - vis.margin.bottom - vis.margin.top)])
            .domain([15000000,400]);

        vis.rScale = d3.scaleLog()
            .range([40 , 0])
            .domain([15000000,400]);


        //x and y axis
        vis.xAxisGroup = vis.svg.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate (${vis.margin.left},${vis.height - vis.margin.bottom-vis.margin.top})`);

        vis.yAxisGroup = vis.svg.append('g')
            .attr('class', 'axis y-axis')
            .attr('transform', `translate (${vis.margin.left},0)`);

        vis.xAxisGroup
            .call(d3.axisBottom()
                .scale(vis.xScale).ticks(0))
            .attr('class', 'xAxis');

        vis.yAxisGroup
            .call(d3.axisLeft()
                .scale(vis.yScale)
                .tickFormat(d3.format(",d"))
                .tickValues([1000,10000,50000, 200000, 1000000, 5000000, 15000000]))
            .attr('class', 'yAxis');

        //add xAxis Labels
        vis.svg.append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "middle")
            .attr("y", vis.height-vis.margin.bottom-10)
            .attr("x", vis.width/2+ vis.margin.left)
            .attr("dy", ".75em")
            .text("Increasingly Negative Tone -->");

        //add yAxis Labels
        vis.svg.append("text")
            .attr("class", "ylabel")
            .attr("text-anchor", "start")
            .attr("y",-10)
            .attr("x", -vis.margin.left)
            .attr("dy", ".75em")
            .text("Number of Publications");


        //add tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'circleTooltip')

        // Add a legend
        var regionSet = new Set();
        for (var i = 0; i < vis.dataByCountryInit.length; i++) {
            regionSet.add(vis.dataByCountryInit[i].continent);
        };

        var regions = Array.from(regionSet);
        var ordinal = d3.scaleOrdinal()
            .domain(regions)
            .range(["#FFFF66", "#669166", "#336691", "#D599FF", "#9CDE9C", "#C1F2EC", "#CDCCF4"]);

        vis.svg.append("g")
            .attr("class", "legendOrdinal")
            .attr('transform', `translate (${vis.width - (vis.width *(1/6))}, ${vis.margin.top})`);


        var legendOrdinal = d3.legendColor()
            .title("Legend: Continent")
            .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
            .shapePadding(10)
            .scale(ordinal);

        vis.svg.select(".legendOrdinal")
            .attr('class','legendDots')
            .call(legendOrdinal);

        vis.svg.append('clipPath')
            .attr('id', 'chart-area')
            .append('rect')
            .attr('x', vis.margin.left)
            .attr('y',0)
            .attr('width', vis.width - vis.padding*2)
            .attr('height', vis.height - vis.padding*2)

        let wrapper = vis.svg.append("g").attr("class", "chordWrapper")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        //control
        this.container = d3.select(`#${this.parentElement}`);

        this.controlWrapper = this.container.append("div").attr("class", "control");
        this.control();

    }


    wrangleData() {
        let vis = this;
        //temporarily set selected time range to a day
        let parseDateDash = d3.timeParse('%Y-%m-%d');

        //vis.selectedTimeConverted = parseDateDash(this.timeIndexSelected)

        this.selectedTime = this.dataByCountryInit[0].days[this.timeIndexSelected].date;

        // we want to filter data to the period of time up to the selectedTime
        vis.filteredData = [];

        //go through every line of the data
        //if less than selected date -> add it to the filtered data

        vis.timeHolder = this.selectedTime
        vis.lowerBound = new Date((vis.timeHolder- (30* 86400000) ));

        vis.data.forEach(row => {

            if (row.date < this.selectedTime) {
                if( vis.lowerBound < row.date ){
                    vis.filteredData.push(row)
                }
            }
        })


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

        if(this.timeIndexSelected == this.dataByCountryInit[0].days.length - 1){
            this.timeIndexSelected = 14;
            stop();
        }
        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        // Add dots
        let dots = vis.svg.selectAll("circle")
            .data(vis.dataByCountry);

        dots.enter()
            .append("circle")
            .attr('class', 'circle')
            .on('mouseover', function(event, d) {


                d3.select(this)
                    .attr('stroke-width', '10px')
                    .attr('stroke', '#FFFFFF')
                    //.attr('fill', '#FFFFFF');

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style=" border-radius: 5px; background: white; padding: 10px">
                             <h5>${d.country}<h5>                          
                         </div>`);
            })
            .on('mouseout', function(event, d) {

                d3.select(this)
                    .attr('stroke-width', '0px')

                vis.tooltip
                    .style("opacity", 0)
            })
            .merge(dots)
            .transition()
            .duration(100)
            .attr("cx", function (d) {
                return vis.xScale(d.tone);
            })
            .attr("cy", function (d) {
                return vis.yScale(d.sum);
            })
            .attr("r", function (d) {
                let result = vis.rScale(d.sum);
                if(result > 0){
                    return result
                }
                else{
                    return 0;
                }

            })
            .style("fill", function (d) {
                let switchTest = d.days[0].CONTINENT
                switch (switchTest) {

                    case "Asia":
                        return "#FFFF66";
                    case "North America":
                        return "#D599FF";
                    case "Europe":
                        return "#336691";
                    case "Africa":
                        return "#9CDE9C";
                    case "South America":
                        return "#669166";
                    case "Oceania":
                        return "#C1F2EC"
                    case "Russia":
                        return '#CDCCF4';
                }
            })
            .attr('opacity', '0.8')
            .attr('transform', `translate (${vis.margin.left}, 0)`)
            .attr('id','circle')
            .attr('clip-path','url(#chart-area');

        dots.exit()
            .remove();

    }

    initWrangleData() {
        let vis = this;

        //temporarily set selected time range to a day
        vis.selectedTime = "2022-11-17"
        let parseDateDash = d3.timeParse('%Y-%m-%d');

        vis.selectedTimeConverted = parseDateDash(vis.selectedTime)

        // we want to filter data to the period of time up to the selectedTime
        vis.filteredData = [];

        //go through every line of the data
        //if less than selected date -> add it to the filtered data

        vis.data.forEach(row => {

            if (row.date < vis.selectedTimeConverted) {

                vis.filteredData.push(row)
            }
        })

        //group by country
        vis.dataByCountryInit = Array.from(d3.group(vis.filteredData, d => d.Country), ([country, days, sum, tone, continent]) => ({
            country,
            days,
            sum,
            tone,
            continent
        }))

        //vis.dataByCountry["United Arab Emirates"].sum = 23;
        vis.dataByCountryInit.forEach((row, index) => {
            let sumPublications = 0
            let avgTone = 0
            let rowLength = row.days.length
            let continentValue = row.days[0].CONTINENT
            row.days.forEach(day => {
                sumPublications += day.NumberOfArticles
                avgTone += day.AverageDocTone
            });

            avgTone = avgTone / rowLength
            vis.dataByCountryInit[index].tone = avgTone;
            vis.dataByCountryInit[index].sum = sumPublications;
            vis.dataByCountryInit[index].continent = continentValue;
        });
    }

    control() {

        //play-pause button
        const button = this.controlWrapper
            .selectAll("button.play-pause")
            .data([""]);
        const buttonEnter = button
            .enter()
            .append("button")
            .attr("class", "play-pause");
        const buttonUpdate = button.merge(buttonEnter);
        button.exit().remove();

        //button update
        buttonUpdate.text(this.isLooping ? "Pause" : "Play").on("click", () => {
            this.isLooping = !this.isLooping;

            this.control();

            if (this.isLooping) this.start();
            else this.stop();
        });

        //progress slider
        const progress = this.controlWrapper.selectAll("div.progress").data([""]);
        const progressEnter = progress
            .enter()
            .append("div")
            .attr("class", "progress");
        const progressUpdate = progress.merge(progressEnter);
        progress.exit().remove();

        progressEnter
            .append("input")
            .attr("class", "slider")
            .attr("type", "range")
            .attr("min", 0)
            .attr("max", 319)
            .attr("step", 1);

        progressEnter.append("span").attr("class", "slider-label");

        //progress update
        progressUpdate
            .select("input")
            .property("value", this.timeIndexSelected)
            .on("input", (e) => {
                this.timeIndexSelected = e.target.value;


                //render
                this.wrangleData();
                this.control();

            });

        if(this.timeIndexSelected == undefined){
            this.timeIndexSelected  = 14;
        }
        progressUpdate
            .select(".slider-label")
            .text(
                d3.timeFormat("%b-%d-%Y")(this.dataByCountryInit[0].days[this.timeIndexSelected].date)
            );
    }
    progressUpdate
    start(){
        //clear prev
        if (this.interval) clearInterval(this.interval);

        //interval
        const onStep = (isFirstStep = false) => {
            if (!isFirstStep) this.timeIndexSelected++;

            if (this.timeIndexSelected >= this.data.length)
                this.timeIndexSelected = 0;

            this.wrangleData();
            this.control();
        };

        onStep();
        this.interval = setInterval(onStep, this.loopStepTime);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }

}