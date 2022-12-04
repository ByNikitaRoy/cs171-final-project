// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/multi-line-chart
class GapMinderVis {

    constructor(parentElement, data) {

        this.parentElement = parentElement;
        this.data = data;

        this.data = data.map(({name, region, income, population, lifeExpectancy}) => ({
            name,
            region,
            income: parseSeries(income),
            population: parseSeries(population),
            lifeExpectancy: parseSeries(lifeExpectancy)
        }))

        function parseSeries(series) {
            return series.map(([year, value]) => [new Date(Date.UTC(year, 0, 1)), value]);
        }

        console.log('data')
        console.log(this.data)

        this.initVis()

    }


    initVis() {
        let vis = this;
        vis.height = 800;
        vis.width = 1000;
        vis.margin = ({top: 20, right: 20, bottom: 35, left: 40});
        vis.bisectDate = d3.bisector(([date]) => date).left;

        vis.interval = d3.utcMonth;

        vis.dates = vis.interval.range(
            d3.min(vis.data, d => {
                return d3.min([
                    d.income[0],
                    d.population[0],
                    d.lifeExpectancy[0]
                ], ([date]) => date);
            }),
            d3.min(vis.data, d => {
                return d3.max([
                    d.income[d.income.length - 1],
                    d.population[d.population.length - 1],
                    d.lifeExpectancy[d.lifeExpectancy.length - 1]
                ], ([date]) => date);
            })
        )

        vis.formatTime = d3.timeFormat("%Y-%m-%d")

        vis.datesUpdate = []

        function formatTimeFunc(date) {
           datesUpdate.push(vis.formatTime(date));
        }
        console.log('datesUpdate')
        console.log(vis.dates)

        vis.dates.forEach( d => {

                vis.datesUpdate.push(vis.formatTime(d));
        });

        console.log('datesUpdate')
        console.log(vis.datesUpdate)

        vis.color = d3.scaleOrdinal(vis.data.map(d => d.region), d3.schemeCategory10).unknown("black")

        vis.radius = d3.scaleSqrt([0, 5e8], [0, vis.width / 24])

        vis.y = d3.scaleLinear([14, 86], [vis.height - vis.margin.bottom, vis.margin.top])

        vis.x = d3.scaleLog([200, 1e5], [vis.margin.left, vis.width - vis.margin.right])

        vis.currentData = dataAt(vis.data);

        console.log('dates')
        console.log(vis.dates)
        vis.dates = vis.datesUpdate


        function valueAt(values, date) {
            const i = vis.bisectDate(values, date, 0, values.length - 1);
            const a = values[i];
            if (i > 0) {
                const b = values[i - 1];
                const t = (date - a[0]) / (b[0] - a[0]);
                return a[1] * (1 - t) + b[1] * t;
            }
            return a[1];
        }

        function dataAt(data) {
            return data.map(d => ({
                name: d.name,
                region: d.region,
                income: valueAt(d.income, data),
                population: valueAt(d.population, data),
                lifeExpectancy: valueAt(d.lifeExpectancy, data)
            }));
        }

        vis.grid = g => g
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.1)
            .call(g => g.append("g")
                .selectAll("line")
                .data(vis.x.ticks())
                .join("line")
                .attr("x1", d => 0.5 + vis.x(d))
                .attr("x2", d => 0.5 + vis.x(d))
                .attr("y1", vis.margin.top)
                .attr("y2", vis.height - vis.margin.bottom))
            .call(g => g.append("g")
                .selectAll("line")
                .data(vis.y.ticks())
                .join("line")
                .attr("y1", d => 0.5 + vis.y(d))
                .attr("y2", d => 0.5 + vis.y(d))
                .attr("x1", vis.margin.left)
                .attr("x2", vis.width - vis.margin.right));


        vis.yAxis = g => g
            .attr("transform", `translate(${vis.margin.left},0)`)
            .call(d3.axisLeft(vis.y))
            .call(g => g.select(vis.parentElement).remove())
            .call(g => g.append("text")
                .attr("x", -vis.margin.left)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text("↑ Life expectancy (years)"))

        vis.xAxis = g => g
            .attr("transform", `translate(0,${vis.height - vis.margin.bottom})`)
            .call(d3.axisBottom(vis.x).ticks(vis.width / 80, ","))
            .call(g => g.select(vis.parentElement).remove())
            .call(g => g.append("text")
                .attr("x", vis.width)
                .attr("y", vis.margin.bottom - 4)
                .attr("fill", "currentColor")
                .attr("text-anchor", "end")
                .text("Income per capita (dollars) →"))

        vis.updateVis(vis.currentData);

    }

    updateVis() {

        let vis = this;

        const svg = d3.select("#gapMinderVis" ).append("svg")
            .attr("viewBox", [0, 0, vis.width, vis.height]);
        console.log('init running')
        console.log(vis.x)
        svg.append("g")
            .call(vis.xAxis);
        console.log('running')

        svg.append("g")
            .call(vis.yAxis);
        console.log('still running')

        svg.append("g")
            .call(vis.grid);

        const circle = svg.append("g")
            .attr("stroke", "black")
            .selectAll("circle")
            .data(dataAt(2000), d => d.name)
            .join("circle")
            .sort((a, b) => d3.descending(a.population, b.population))
            .attr("cx", d => vis.x(d.income))
            .attr("cy", d => vis.y(d.lifeExpectancy))
            .attr("r", d => vis.radius(d.population))
            .attr("fill", d => vis.color(d.region))
            .call(circle => circle.append("title")
                .text(d => [d.name, d.region].join("\n")));

        return Object.assign(svg.node(), {
            update(data) {
                circle.data(data, d => d.name)
                    .sort((a, b) => d3.descending(a.population, b.population))
                    .attr("cx", d => vis.x(d.income))
                    .attr("cy", d => vis.y(d.lifeExpectancy))
                    .attr("r", d => vis.radius(d.population));
            }
        });

        function dataAt(data) {
            return vis.data.map(d => ({
                name: d.name,
                region: d.region,
                income: valueAt(d.income, data),
                population: valueAt(d.population, data),
                lifeExpectancy: valueAt(d.lifeExpectancy, data)
            }));
        }
        function valueAt(values, date) {
            console.log('date')
            console.log(date)
            console.log('values')
            console.log(values)
            const i = vis.bisectDate(values, date, 0, values.length - 1);
            console.log('i')
            console.log(i)
            const a = values[i];
            console.log('a')
            console.log(a)
            if (i > 0) {
                const b = values[i - 1];
                const t = (date - a[0]) / (b[0] - a[0]);
                return a[1] * (1 - t) + b[1] * t;
            }
            console.log(a[1])
            return a[1];
        }
    }

}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/multi-line-char

