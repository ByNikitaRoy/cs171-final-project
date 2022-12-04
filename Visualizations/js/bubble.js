//svg size
const margin = { top: 0, right: 0, bottom: 10, left: 0 };
const width = 1000;
const height = 700;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

//the dist from the label position to the center
const labelPosRadius = Math.min(innerWidth, innerHeight) / 2 - 40;
//the dist from the bubbles position to the center
const bubblesPosRadius = labelPosRadius - 110;

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
  constructor(_parentNodeId, _data, _events) {
    this.container = d3.select(`#${_parentNodeId}`);
    [this.data, this.events] = this.dataWrangling(_data, _events);

    //
    this.timeIndexSelected = 0;
    this.isLooping = false;

    //the time between days, unit is ms
    this.loopStepTime = 1000;

    //init
    this.initVis();
  }

  initVis() {
    //svg
    this.svg = this.container
        .append("svg")
        .attr("width", "100%")
        .attr("viewBox", [
          -margin.left - innerWidth / 2,
          -margin.top - innerHeight / 2,
          width,
          height,
        ]);

    this.gLegend = this.svg.append("g");
    this.legend();

    this.gDot = this.svg.append("g");

    //
    this.boardWrapper = this.container.append("div").attr("class", "board");

    //
    this.controlWrapper = this.container.append("div").attr("class", "control");
    this.control();

    this.groupLayout();

    let isInView;
    window.addEventListener("scroll", () => {
      const el = this.svg.node();
      const bounding = el.getBoundingClientRect();

      const currentIsInView =
          bounding.top >= 0 &&
          bounding.bottom <=
          (window.innerHeight || document.documentElement.clientHeight);

      if (currentIsInView !== isInView) {
        isInView = currentIsInView;

        this.isLooping = isInView;

        if (isInView) this.start();
        else this.stop();

        this.control();
      }
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
    buttonUpdate.text(this.isLooping ? "Pause" : "Play");

    //event
    buttonUpdate.on("click", () => {
      this.isLooping = !this.isLooping;

      if (this.isLooping) this.start();
      else this.stop();

      this.control();
    });

    //progress slider
    const progress = this.controlWrapper.selectAll("div.progress").data([""]);
    const progressEnter = progress
        .enter()
        .append("div")
        .attr("class", "progress");
    const progressUpdate = progress.merge(progressEnter);
    progress.exit().remove();

    progressEnter.append("div").attr("class", "range");

    progressEnter
        .select(".range")
        .append("input")
        .attr("class", "slider")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", this.data.length - 1)
        .attr("step", 1);

    progressEnter.select(".range").append("div").attr("class", "sliderticks");

    const ticks = {};
    progressEnter
        .select(".sliderticks")
        .selectAll("p")
        .data(d3.range(0, this.data.length))
        .join("p")
        .style("visibility", (d, i) => {
          const text = d3.timeFormat("%b. %Y")(this.data[d].date);
          const rst = ticks[text] ? "hidden" : "visible";
          ticks[text] = true;
          return rst;
        })
        .text((d) => d3.timeFormat("%b. %Y")(this.data[d].date));

    //progress update
    progressUpdate
        .select("input")
        .property("value", this.timeIndexSelected)
        .on("input", (e) => {
          this.timeIndexSelected = e.target.value;
          //render
          this.bubbleLayout();
          this.control();
        });

    //
    const date = this.data[this.timeIndexSelected].date;
    const boardItem = this.boardWrapper.selectAll("div.board-item").data([
      {
        text: d3.timeFormat("%d %b. %Y")(date),
        className: "date",
      },
      {
        text: this.events.find((f) => f.date.getTime() == date.getTime())
            ?.event,
        className: "event",
      },
    ]);
    const boardItemEnter = boardItem
        .enter()
        .append("div")
        .attr("class", "board-item");
    const boardItemUpdate = boardItem.merge(boardItemEnter);
    boardItem.exit().remove();

    boardItemUpdate
        .attr("class", (d) => `board-item ${d.className}`)
        .text((d) => d.text);
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
    const dot = this.gDot.selectAll("circle.dot").data(
        this.bubbles.filter((d) => d.keyword),
        (d) => d.id
    );
    const dotEnter = dot.enter().append("circle").attr("class", "dot");
    const dotUpdate = dot.merge(dotEnter);
    dot.exit().remove();

    dotEnter.attr("stroke-width", bubbleRadius).attr("r", bubbleCoreRadius);
    dotUpdate.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    //
    const label = this.gDot
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

    labelUpdate.select(".name").text((d) => d.keyword.toUpperCase());
    labelUpdate.select(".value").text((d) => d.percentage + "%");
  }

  legend() {
    this.gLegend.attr("transform", `translate(${85},${innerHeight / 2+3})`);

    this.gLegend
        .selectAll("circle.dot")
        .data([""])
        .join("circle")
        .attr("class", "dot")
        .attr("stroke-width", bubbleRadius)
        .attr("r", bubbleCoreRadius);

    this.gLegend
        .selectAll("text")
        .data([""])
        .join("text")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "start")
        .attr("fill", "white")
        .attr("font-size", 14)
        .attr("x", bubbleRadius)
        .attr("y", 1)
        .text("Each bubble represents 1% of the articles that covered Ukraine");
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

  dataWrangling(raw, rawEvents) {
    //data
    const dataTypeConverted = raw
        .map((d) => ({
          date: d.Date,
          keyword: d.Keyword.trim(),
          percentage:
              d["Percentage of articles about keyword"].replaceAll("%", "") * 1,
        }))
        .filter((d) => d.keyword !== "");

    let data = d3
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
    data = data.filter((d) => d.date.getMonth() >= 1 && d.date.getMonth() <= 3);
    data.keywords = [...new Set(dataTypeConverted.map((d) => d.keyword))];

    //event
    const events = rawEvents.map((d) => ({
      date: new Date(d.Date),
      event: d.Event,
    }));

    return [data, events];
  }
}

function polarToCartesian(dist, angle) {
  return { x: dist * Math.sin(angle), y: dist * Math.cos(angle) * -1 };
}
