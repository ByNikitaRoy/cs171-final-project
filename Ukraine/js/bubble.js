//the dist from the label position to the center
const labelPosRadius = Math.min(innerWidth, innerHeight) / 2 - 60;
//the dist from the bubbles position to the center
const bubblesPosRadius = labelPosRadius - 140;

//the radius of the bubble core
const bubbleCoreRadius = 2;
//the radius of the bubble
const bubbleRadius = bubbleCoreRadius * 4;

//bubble count
const bubbleCount = 100;
const bubblePctScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, bubbleCount]);

class BubbleViz {
    constructor(_parentNodeId, _data) {
        this.container = d3.select(`#${_parentNodeId}`);
        this.data = this.dataWrangling(_data);

        //
        this.timeIndexSelected = 0;
        this.isLooping = true;

        //the time between days, unit is ms
        this.loopStepTime = 1000;

        //init
        this.initVis();
    }

    initVis() {
        //svg size
        const margin = { top: 0, right: 0, bottom: 0, left: 0 };
        const width = 1000;
        const height = 1000;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        this.controlWrapper = this.container.append("div").attr("class", "control");
        this.control();

        //svg
        this.svg = this.container
            .append("svg")
            .attr("width", width)
            .attr("viewBox", [
                -margin.left - innerWidth / 2,
                -margin.top - innerHeight / 2,
                width,
                height,
            ]);

        this.groupLayout();
        this.start();
    }

    control() {
        //
        const label = this.controlWrapper.selectAll("div.time-label").data([""]);
        const labelEnter = label.enter().append("div").attr("class", "time-label");
        const labelUpdate = label.merge(labelEnter);
        label.exit().remove();

        labelUpdate.text(
            d3.timeFormat("%Y-%m-%d")(this.data[this.timeIndexSelected].date)
        );

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
    }

    groupLayout() {
        this.groups = {};

        const keywords = this.data.keywords;
        keywords.forEach((key) => {
            const i = keywords.findIndex((f) => f == key);

            const angle = (i * Math.PI * 2) / keywords.length;

            const center = polarToCartesian(bubblesPosRadius, angle);
            const labelCenter = polarToCartesian(labelPosRadius, angle);

            this.groups[key] = { angle, center, labelCenter };
        });
    }

    bubbleLayout() {
        //assign keyword to bubble
        if (!this.bubbles)
            this.bubbles = d3.range(0, bubbleCount).map((id) => ({ id }));

        this.bubbles.forEach((bubble) => {
            bubble.keyword = undefined;
        });

        this.data[this.timeIndexSelected].groups.forEach(({ iRange, keyword }) => {
            if (!iRange) return;
            this.bubbles.slice(...iRange).forEach((bubble) => {
                bubble.keyword = keyword;
            });
        });

        //simulation
        if (this.simulation) this.simulation.stop();

        this.simulation = d3
            .forceSimulation(this.bubbles.filter((d) => d.keyword))
            .force("charge", d3.forceManyBody().strength(-5))
            .force("collision", d3.forceCollide().radius(bubbleRadius))
            .force(
                "x",
                d3.forceX().x((d) => this.groups[d.keyword].center.x)
            )
            .force(
                "y",
                d3.forceY().y((d) => this.groups[d.keyword].center.y)
            )
            .on("tick", () => {
                this.render();
            });
    }

    render() {
        //
        const dot = this.svg.selectAll("circle.dot").data(
            this.bubbles.filter((d) => d.keyword),
            (d) => d.id
        );
        const dotEnter = dot.enter().append("circle").attr("class", "dot");
        const dotUpdate = dot.merge(dotEnter);
        dot.exit().remove();

        dotEnter
            .attr("fill", "white")
            .attr("stroke", "white")
            .attr("stroke-width", bubbleRadius)
            .attr("r", bubbleCoreRadius);
        dotUpdate.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        //
        const label = this.svg
            .selectAll("g.label")
            .data(this.data[this.timeIndexSelected].groups, (d) => d.keyword);
        const labelEnter = label.enter().append("g").attr("class", "label");
        const labelUpdate = label.merge(labelEnter);
        label.exit().remove();

        //
        labelEnter.attr("transform", (d) => {
            const { x, y } = this.groups[d.keyword].labelCenter;
            return `translate(${x},${y})`;
        });

        labelEnter.append("text").attr("class", "name");
        labelEnter
            .append("text")
            .attr("class", "value")
            .attr("dy", 14 * 1.4);

        labelUpdate.select(".name").text((d) => d.keyword);
        labelUpdate.select(".value").text((d) => d.percentage + "%");
    }

    start() {
        //clear prev
        if (this.interval) clearInterval(this.interval);

        //interval
        const onStep = (isFirstStep = false) => {
            if (!isFirstStep) this.timeIndexSelected++;

            if (this.timeIndexSelected >= this.data.length)
                this.timeIndexSelected = 0;

            this.bubbleLayout();
            this.control();
        };

        onStep(true);
        this.interval = setInterval(onStep, this.loopStepTime);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }

    dataWrangling(raw) {
        const dataTypeConverted = raw
            .map((d) => ({
                date: d.Date,
                keyword: d.Keyword.trim(),
                percentage:
                    d["Percentage of articles about keyword"].replaceAll("%", "") * 1,
            }))
            .filter((d) => d.keyword !== "");

        const data = d3
            .rollups(
                dataTypeConverted,
                (v) => {
                    v.reduce((prev, curr) => {
                        const count = Math.round(bubblePctScale(curr.percentage));
                        const from = prev;
                        const to = prev + count;
                        curr.iRange = count !== 0 ? [from, to] : undefined;
                        return count !== 0 ? to : prev;
                    }, 0);

                    return v;
                },
                (d) => d.date
            )
            .map((d) => ({ date: new Date(d[0]), groups: d[1] }));

        data.sort((a, b) => a.date.getTime() - b.date.getTime());
        data.keywords = [...new Set(dataTypeConverted.map((d) => d.keyword))];

        return data;
    }
}

function polarToCartesian(dist, angle) {
    return { x: dist * Math.sin(angle), y: dist * Math.cos(angle) * -1 };
}