class MapViz {
  constructor(_parentNodeId, _data, _geo) {
    this.container = d3.select(`#${_parentNodeId}`);

    [this.data, this.geo] = this.dataWrangling(_data, _geo);

    //
    this.timeIndexSelected = 0;
    this.isLooping = true;

    this.loopStepTime = 800;

    //scale radius
    this.metrics = "sum";
    const valueExt = d3
        .extent(this.data.map((d) => d.data.map((dd) => dd[this.metrics])).flat())
        .map((d, i) => d || i);

    this.radius = d3.scaleLog().domain(valueExt).nice().range([2, 40]);

    //init
    this.initVis();
  }

  initVis() {
    //svg size
    const margin = { top: 40, right: 20, bottom: 30, left: 20 };
    const width = 1000;
    const height = 500;

    //geo
    const extent = [
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ];
    this.projection = d3.geoEquirectangular().fitExtent(extent, this.geo);
    this.geoGenerator = d3.geoPath().projection(this.projection);

    //svg
    const viewBox = [-margin.left, -margin.top, width, height];
    this.svg = this.container
        .append("svg")
        .attr("width", "100%")
        .attr("viewBox", viewBox);

    this.gLegend = this.svg.append("g");
    this.lengend({ margin, width, height });

    this.gGeoArea = this.svg.append("g");
    this.gDot = this.svg.append("g");

    //
    this.boardWrapper = this.container.append("div").attr("class", "board");

    //control
    this.controlWrapper = this.container.append("div").attr("class", "control");
    this.control();

    //render all
    this.geoArea();

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
          const text = d3.timeFormat("%b. %Y")(this.data[d].minDateOfWeek);
          const rst = ticks[text] ? "hidden" : "visible";
          ticks[text] = true;
          return rst;
        })
        .text((d) => d3.timeFormat("%b. %Y")(this.data[d].minDateOfWeek));

    //progress update
    progressUpdate
        .select("input")
        .property("value", this.timeIndexSelected)
        .on("input", (e) => {
          this.timeIndexSelected = e.target.value;

          //render
          this.dot();
          this.control();
        });

    //date labal
    const dateLabel = this.svg.selectAll("text.date-label").data([""]);
    const dateLabelEnter = dateLabel
        .enter()
        .append("text")
        .attr("class", "date-label");
    const dateLabelUpdate = dateLabel.merge(dateLabelEnter);
    dateLabel.exit().remove();

    dateLabelEnter.attr("x", 50).attr("y", 60);

    dateLabelUpdate.text(
        d3.timeFormat("%b. %Y")(this.data[this.timeIndexSelected].minDateOfWeek)
    );
  }

  geoArea() {
    this.gGeoArea
        .selectAll("path.area")
        .data(this.geo.features, (d) => d.properties.name)
        .join("path")
        .attr("class", "area")
        .attr("d", this.geoGenerator);
  }

  dot() {
    //selected data
    let data = this.data[this.timeIndexSelected]?.data || [];
    data.forEach((d) => {
      [d.x, d.y] = this.projection([d.lon, d.lat]);
    });
    data = data.filter((d) => ![d.x, d.y].some((dd) => isNaN(dd)));

    //bind
    const item = this.gDot.selectAll("g.dot").data(data, (d) => d.country);
    const itemEnter = item.enter().append("g").attr("class", "dot");
    const itemUpdate = item.merge(itemEnter);
    item.exit().remove();

    //enter
    itemEnter.attr("transform", (d) => `translate(${d.x},${d.y})`);
    itemEnter.append("circle").attr("class", "body");
    itemEnter.append("circle").attr("class", "core").attr("r", 2);

    //update
    itemUpdate
        .select(".body")
        .transition(d3.easeQuadOut)
        .duration(this.loopStepTime)
        .attr("r", (d) => this.radius(d[this.metrics]))
  }

  lengend({ margin, width, height }) {
    const ticks = [5, 10, 15];

    const total = d3.sum(ticks) * 2 + (ticks.length - 1) * 10;

    //
    const dot = this.gLegend.selectAll("g.dot").data(ticks);
    const dotEnter = dot.enter().append("g").attr("class", "dot");

    dotEnter.attr(
        "transform",
        (d, i) =>
            `translate(${
                i == 0 ? 0 : ticks[0] + d3.sum(ticks.slice(1, i)) * 2 + d + 10 * i
            },${0})`
    );

    dotEnter
        .append("circle")
        .attr("class", "body")
        .attr("r", (d) => d);
    dotEnter.append("circle").attr("class", "core").attr("r", 2);

    this.gLegend
        .selectAll("text")
        .data([""])
        .join("text")
        .attr("dominant-baseline", "hanging")
        .attr("text-anchor", "middle")
        .attr("fill", "#FFFF66FF")
        .attr("font-size", 12)
        .attr("x", total)
        .attr("y", d3.max(ticks) + 24)
        .text("Increasing number of publications");

    this.gLegend
        .selectAll("text.arrow")
        .data([""])
        .join("text")
        .attr("class", "arrow")
        .attr("dominant-baseline", "hanging")
        .attr("text-anchor", "end")
        .attr("fill", "#FFFF66FF")
        .attr("font-size", 18)
        .attr("transform", `translate(${total},${d3.max(ticks) + 20})rotate(90)`)
        .text("▲");

    this.gLegend
        .selectAll("rect")
        .data([""])
        .join("rect")
        .attr("fill", "#FFFF66FF")
        //.attr("stroke", "#FFFF66FF")
        .attr("y", d3.max(ticks) + 10)
        .attr("width", total - d3.max(ticks))
        .attr("height", 4);

    this.gLegend.attr(
        "transform",
        `translate(${70},${350})`
    );
  }

  start() {
    //clear prev
    if (this.interval) clearInterval(this.interval);

    //interval
    const onStep = (isFirstStep = false) => {
      if (!isFirstStep) this.timeIndexSelected++;

      if (this.timeIndexSelected >= this.data.length)
        this.timeIndexSelected = 0;

      this.dot();
      this.control();
    };

    onStep(true);

    this.interval = setInterval(onStep, this.loopStepTime);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  dataWrangling(rawdata, geo) {
    //data type convert
    const dataTypeConverted = rawdata
        .map((d) => ({
          date: new Date(d.Date.trim()),
          country: d.Country.trim(),
          value: d.NumberOfArticles*1,
          lat: d.Lat * 1,
          lon: d.Lon * 1,
        }))
        .filter((d) => d.country !== "" && d.country !== "#N/A");

    //do stat
    const data = d3
        .rollups(
            dataTypeConverted,
            stat,
            (d) => d3.timeFormat("%G%V")(d.date) * 1
        )
        .map((d) => ({
          week: d[0],
          minDateOfWeek: d3.min(
              d[1].map((dd) => dd.data).flat(),
              (dd) => dd.date
          ),
          data: d[1],
        }));

    data.sort((a, b) => a.week - b.week);

    return [data, geo];

    function stat(rows) {
      const result = d3
          .rollups(
              rows,
              (v) => ({
                country: v[0].country,
                lat: v[0].lat,
                lon: v[0].lon,
                sum: d3.sum(v, (d) => d.value),
                avg: d3.mean(v, (d) => d.value),
                data: v,
              }),
              (d) => d.country
          )
          .map((d) => d[1]);

      return result;
    }
  }
}
