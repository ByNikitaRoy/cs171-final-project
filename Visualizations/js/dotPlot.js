
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
            .domain([39000000,400]);

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
        for (var i = 0; i < vis.dataByCountryInit.length; i++) {
            regionSet.add(vis.dataByCountryInit[i].continent);
        };

        var regions = Array.from(regionSet);
        var ordinal = d3.scaleOrdinal()
            .domain(regions)
            .range(["#EFB605", "#E58903", "#E01A25", "#C20049", "#991C71", "#66489F", "#2074A0"]);

        vis.svg.append("g")
            .attr("class", "legendOrdinal")
            .attr('transform', `translate (${vis.width - (vis.width *(1/5))}, ${vis.margin.top})`);


        var legendOrdinal = d3.legendColor()
            .title("Legend:")
            .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
            .shapePadding(10)
            .scale(ordinal);


        vis.svg.select(".legendOrdinal")
            .attr('class','legendDots')
            .call(legendOrdinal);

        let wrapper = vis.svg.append("g").attr("class", "chordWrapper")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        //control
        this.container = d3.select(`#${this.parentElement}`);

        this.controlWrapper = this.container.append("div").attr("class", "control");
        this.control();

    }


    wrangleData() {
        let vis = this;
        console.log('wrangleData running')
        //temporarily set selected time range to a day
        let parseDateDash = d3.timeParse('%Y-%m-%d');


        //vis.selectedTimeConverted = parseDateDash(this.timeIndexSelected)

        this.selectedTime = this.dataByCountryInit[0].days[this.timeIndexSelected].date;

        // we want to filter data to the period of time up to the selectedTime
        vis.filteredData = [];

        //go through every line of the data
        //if less than selected date -> add it to the filtered data

        vis.data.forEach(row => {

            if (row.date < this.selectedTime) {
                vis.filteredData.push(row)
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


        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        console.log('updateVis Running')
        // Add dots
        vis.svg.append('g')
            .selectAll("dot")
            .data(vis.dataByCountry)
            .enter()
            .append("circle")
            .join()
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
                let cont;
                let switchTest = d.days[0].CONTINENT
                switch (switchTest) {

                    case "Asia":
                        return "#EFB605";
                    case "North America":
                        return "#2074A0";
                    case "Europe":
                        return "#C20049";
                    case "Africa":
                        return "#66489F";
                    case "South America":
                        return "#E58903";
                    case "Oceania":
                        return "#E01A25"
                    case "#N/A":
                        return '#991C71';
                }
            })
            .attr('opacity', '0.9')
            .attr('transform', `translate (${vis.margin.left}, 0)`);

    }

    initWrangleData() {
        let vis = this;
        console.log('init wrangleData running')

        //temporarily set selected time range to a day
        vis.selectedTime = "2022-11-17"
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

        console.log('data post init ')
        console.log(vis.dataByCountryInit)
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
                if(this.timeIndexSelected = this.dataByCountryInit[0].days.length - 1){
                    return false;
                }
            });

        if(this.timeIndexSelected == undefined){
            this.timeIndexSelected  = 0;
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