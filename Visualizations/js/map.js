
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
    const valueMax =
      d3.max(
        this.data.map((d) => d.data.map((dd) => dd[this.metrics])).flat()
      ) || 1;

    this.radius = d3.scaleSqrt().domain([0, valueMax]).nice().range([2, 40]);

    //init
    this.initVis();
  }

  initVis() {
    //svg size
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = 1000;
    const height = 500;

    //geo
    const extent = [
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ];
    const projection = d3.geoEquirectangular().fitExtent(extent, this.geo);
    this.geoGenerator = d3.geoPath().projection(projection);

    //svg
    const viewBox = [-margin.left, -margin.top, width, height];
    this.svg = this.container
      .append("svg")
      .attr("width", width)
      .attr("viewBox", viewBox);
    this.gGeoArea = this.svg.append("g");
    this.gDot = this.svg.append("g");

    //control
    this.controlWrapper = this.container.append("div").attr("class", "control");
    this.control();

    //render all
    this.geoArea();
    this.start();
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
      .attr("max", this.data.length - 1)
      .attr("step", 1);

    progressEnter.append("span").attr("class", "slider-label");

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

    progressUpdate
      .select(".slider-label")
      .text(
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
    const data =
      this.data[this.timeIndexSelected]?.data.filter(
        (d) => this.featureMapping[d.country]
      ) || [];

    //bind
    const item = this.gDot.selectAll("g.dot").data(data, (d) => d.country);
    const itemEnter = item.enter().append("g").attr("class", "dot");
    const itemUpdate = item.merge(itemEnter);
    item.exit().remove();

    //enter
    itemEnter.attr("transform", (d) => {
      const feature = this.featureMapping[d.country];
      const [x, y] = this.geoGenerator.centroid(feature);
      return `translate(${x},${y})`;
    });
    itemEnter.append("circle").attr("class", "body");
    itemEnter.append("circle").attr("class", "core").attr("r", 2);

    //update
    itemUpdate
      .select(".body")
      .transition(d3.easeQuadOut)
      .duration(this.loopStepTime)
      .attr("r", (d) => this.radius(d[this.metrics]));
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

    onStep();
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
        value: d["Value"].trim() * 1,
      }))
      .filter((d) => d.country !== "" && d.country !== "#N/A");

    //find the mapping
    this.featureMapping = {};

    //NOTE - it is used to match country names between data and geo data
    const countryNameMapping = {
      "United States": "USA",
      "United Kingdom": "England", //put the data at the lotation of England

      //not sure what are the names in the GeoJson
      Singapore: "",
      Comoros: "",
      Mayotte: "",
      "Cape Verde": "",
      Monaco: "",
      "Hong Kong": "",
      Bahrain: "",
      Mauritius: "",
      "Slovak Republic": "",
      "Bosnia-Herzegovina": "",
      Malta: "",
      Guam: "",
    };
    const notFound = [];
    [...new Set(dataTypeConverted.map((d) => d.country))].forEach((name) => {
      const feature = geo.features.find(
        (f) =>
          f.properties.name == name ||
          f.properties.name.includes(name) ||
          name.includes(f.properties.name) ||
          f.properties.name == countryNameMapping[name]
      );

      if (feature) this.featureMapping[name] = feature;
      else notFound.push(name);
    });

    console.info("[!] Country Names Are Not found", notFound);

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
