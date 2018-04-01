const url = "https://gist.githubusercontent.com/mackmmiller/26bf0bc2f26eb06e73000cc28740c71f/raw/4a223fa063fd2308c6b5c1578f4fa157344887c9/same-sex-marriage.json";

const fetchData = async () => {
  const res = await fetch(url);
  return await res.json();
};

const domYear = document.querySelector("#year");
const slider = document.querySelector("#slider");
let year = slider.value;
domYear.innerHTML = year;

function chartData() {
  fetchData().then(data => {
    const titles = ["No Law", "Statutory Ban", "Constitutional Ban", "Legal"];  
    const path = d3.geoPath();
    let svg = d3.select("svg");
    let dataL = 0;
    let offset = 125;

    const legality = i => {
      if (i < 11) return data[i][year];
      if (i > 11) return data[i - 1][year];
      return data[8][year];
    };

    function handleTransform(d, i) {
      if (i === 0) {
        dataL = d.length + offset;
        return "translate(0,0)";
      } else {
        let newDataL = dataL;
        dataL += d.length + offset;
        return `translate(${newDataL},0)`;
      }
    };

    function stateColor(d, i) {
      if (legality(i) === "No Law") return "rgb(200, 192, 189)";
      if (legality(i) === "Statutory Ban") return "rgb(231, 121, 122)";
      if (legality(i) === "Constitutional Ban") return "rgb(245, 165, 85)";
      if (legality(i) === "Legal") return "rgb(122, 180, 114)";
    }

    function legendColor(d) {
      if (d === "No Law") return "rgb(200, 192, 189)";
      if (d === "Statutory Ban") return "rgb(231, 121, 122)";
      if (d === "Constitutional Ban") return "rgb(245, 165, 85)";
      if (d === "Legal") return "rgb(122, 180, 114)";
    }

    function drawMap(err, us) {
      if (err) throw err;

      // States
      svg
        .append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("data-legend", (d, i) => legality(i))
        .attr("fill", stateColor);

      // Borders
      svg
        .append("path")
        .attr("class", "border")
        .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));

      // Legend
      const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(300, 0)')
        .selectAll(".legends")
        .data(titles)
        .enter()
        .append("g")
        .attr("class", "legend-group")
        .attr("transform", (d, i) => handleTransform(d, i));

      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("class", "legend-rect")
        .style("fill", legendColor);

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text(d => d)
        .style("text-anchor", "start")
        .style("font-size", 15);
    }

    function redraw() {
      year = slider.value;
      domYear.innerHTML = year;
      svg.remove();
      svg = d3.select('#graph').append('svg').attr('width', '960').attr('height', '600');
      d3.json("https://d3js.org/us-10m.v1.json", drawMap);
    }

    d3.select('#slider').on('input', redraw);
    d3.json("https://d3js.org/us-10m.v1.json", drawMap);
  });
}

chartData();