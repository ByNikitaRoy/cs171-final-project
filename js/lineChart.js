// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/multi-line-chart
class LineChart {

    constructor(parentElement, data) {

        this.parentElement = parentElement;
        this.data = data;
        this.initVis()



    }

    initVis() {
        let vis = this;
        vis.newsChannels = ['Al Jazeera', 'BBC News', 'CNN','Deutsche Welle News', 'Fox News', 'MSNBC', 'Russia Today'];
        vis.chart = LineChart(vis.data, {
            x: d => d.date,
            y: d => d.Value/100,
            z: d => d.Series,
            yLabel: "% Airtime on Day",
            width: document.getElementById(vis.parentElement).getBoundingClientRect().width - 40,
            height: document.getElementById(vis.parentElement).getBoundingClientRect().height - 40,
            color: "rgba(255, 255, 255, 1)",
            voronoi: false // if true, show Voronoi overlay
        })

        function LineChart(data, {
            x = ([x]) => x, // given d in data, returns the (temporal) x-value
            y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
            z = () => 1, // given d in data, returns the (categorical) z-value
            title, // given d in data, returns the title text
            defined, // for gaps in data
            curve = d3.curveCatmullRom, // method of interpolation between points
            marginTop = 20, // top margin, in pixels
            marginRight = 30, // right margin, in pixels
            marginBottom = 30, // bottom margin, in pixels
            marginLeft = 55, // left margin, in pixels
            width = 640, // outer width, in pixels
            height = 400, // outer height, in pixels
            xType = d3.scaleUtc, // type of x-scale
            xDomain, // [xmin, xmax]
            xRange = [marginLeft, width - marginRight], // [left, right]
            yType = d3.scaleLinear, // type of y-scale
            yDomain, // [ymin, ymax]
            yRange = [height - marginBottom, marginTop], // [bottom, top]
            yFormat, // a format specifier dotplotjsonextract for the y-axis
            yLabel, // a label for the y-axis
            zDomain, // array of z-values
            color = "rgba(255, 255, 255, 0.6)", // stroke color of line, as a constant or a function of *z*
            strokeLinecap, // stroke line cap of line
            strokeLinejoin, // stroke line join of line
            strokeWidth = 1.5, // stroke width of line
            strokeOpacity, // stroke opacity of line
            mixBlendMode = "overlay", // blend mode of lines
            voronoi // show a Voronoi overlay? (for debugging)
        } = {}) {
            // Compute values.
            const X = d3.map(data, x);
            const Y = d3.map(data, y);
            const Z = d3.map(data, z);
            const O = d3.map(data, d => d);
            if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
            const D = d3.map(data, defined);

            // Compute default domains, and unique the z-domain.
            if (xDomain === undefined) xDomain = d3.extent(X);
            if (yDomain === undefined) yDomain = [0, d3.max(Y, d => typeof d === "dotplotjsonextract" ? +d : d)];
            if (zDomain === undefined) zDomain = Z;
            zDomain = new d3.InternSet(zDomain);

            // Omit any data not present in the z-domain.
            const I = d3.range(X.length).filter(i => zDomain.has(Z[i]));

            // Construct scales and axes.
            const xScale = xType(xDomain, xRange);
            const yScale = yType(yDomain, yRange);
            const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
            const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);

            // Compute titles.
            const T = title === undefined ? Z : title === null ? null : d3.map(data, title);

            // Construct a line generator.
            const line = d3.line()
                .defined(i => D[i])
                .curve(curve)
                .x(i => xScale(X[i]))
                .y(i => yScale(Y[i]));

            //create svg and specify functions for actions
            const svg = d3.select("#lineChart" ).append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
                .style("-webkit-tap-highlight-color", "transparent")
                .on("pointerenter", pointerentered)
                .on("pointermove", pointermoved)
                .on("pointerleave", pointerleft)
                .on("touchstart", event => event.preventDefault());

            svg.append("g")
                .attr("transform", `translate(0,${height - marginBottom})`)
                .call(xAxis)
                .attr('class','xAxis');

            svg.append("g")
                .attr("transform", `translate(${marginLeft},0)`)
                //call yAxis
                .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")))
                .attr('class','yAxis')
                .call(g => g.select(".domain").remove())
                .call(voronoi ? () => {} : g => g.selectAll(".tick line").clone()
                    .attr("x2", width - marginLeft - marginRight)
                    .attr("stroke-opacity", 0.05))


            svg.append("g").append("text")
                .attr("class", "yLabelDot")
                .attr("text-anchor", "middle")
                .attr("y", 0)
                .attr("x", -height/2)
                .attr("dy", ".75em")
                .attr("transform", "rotate(-90)")
                .text("Percent of Airtime");


            //add all of the paths
            const path = svg.append("g")
                .attr("fill", "none")
                .attr("stroke", typeof color === "dotplotjsonextract" ? color : "#eaa61d")
                .attr("stroke-linecap", strokeLinecap)
                .attr("stroke-linejoin", strokeLinejoin)
                .attr("stroke-width", strokeWidth)
                .attr("stroke-opacity", strokeOpacity)
                .selectAll("path")
                .data(d3.group(I, i => Z[i]))
                .join("path")
                .style("mix-blend-mode", mixBlendMode)
                //.attr("stroke", typeof color === "function" ? ([z]) => color(z) : null)\
                .attr("stroke", typeof color === "dotplotjsonextract" ? color : "rgba(255, 255, 102)")
                .attr("d", ([, I]) => line(I));

            //tooltip dot
            const dot = svg.append("g")
                .attr("display", "none");

            dot.append("circle")
                .attr("r", 10)
                //.attr('fill', 'rgba(255, 255, 102, 1')
                //.attr("stroke", typeof color === "dotplotjsonextract" ? color : 'rgba(255, 255, 102)')
                //.attr("stroke-width", 20)
                //.attr("stroke-opacity", 0.2)
                .style("fill", "rgba(145,196,196, 1)")
                .style("stroke-width", 10)
                .style("stroke", "rgba(255,255,255,0.5)");

            const dotTool = svg.append("g")
                .attr("display", "none")
                .attr('x',200)
                .attr('y', 200);
            //tooltip text
            dotTool.append("text")
                .attr("font-family", "Barlow")
                .attr("font-weight", 700)
                .attr("font-size", 35)
                .attr('fill', 'rgba(255, 255, 102, 0.9)')
                .attr("text-anchor", "end")



            function pointermoved(event) {
                const [xm, ym] = d3.pointer(event);
                const i = d3.least(I, i => Math.hypot(xScale(X[i]) - xm, yScale(Y[i]) - ym)); // closest point
                path.style("stroke", ([z]) => Z[i] === z ? null : "rgba(255, 255, 255, 0.15)").filter(([z]) => Z[i] === z).raise();
                dot.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);
                dotTool.select('text')
                    .attr('x', width-marginLeft-marginRight)
                    .attr('y',100)
                    .attr('display',null);
                if (T) dotTool.select("text").text(T[i]);
                svg.property("value", O[i]).dispatch("input", {bubbles: true});
            }

            function pointerentered() {
                path.style("mix-blend-mode", null)
                    .style("stroke", "rgba(255, 255, 255, 0.8)");
                dot.attr("display", null);
                dotTool.attr("display", null);

            }

            function pointerleft() {
                path.style("mix-blend-mode", mixBlendMode).style("stroke", null);
                dot.attr("display", "none");
                dotTool.attr("display", 'none');
                svg.node().value = null;
                svg.dispatch("input", {bubbles: true});
            }

            function legendSelect(){
                console.log('legendSelect Running')

            }

            return Object.assign(svg.node(), {value: null});
        }
        //focus = null
        //focus = Generators.input(vis.chart) // or say viewof focus = LineChart(…)
       // vis.LineChart(vis.chart)

    }


}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/multi-line-char

