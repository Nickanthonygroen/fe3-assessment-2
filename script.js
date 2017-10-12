/*
Bron Data:
http://statline.cbs.nl/Statweb/publication/?DM=SLNL&PA=82439NED&D1=0-2&D2=a&D3=59&HDR=T&STB=G1%2cG2&VW=T

Sources for the code:
https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4
http://bl.ocks.org/d3noob/7030f35b72de721622b8
https://bl.ocks.org/mbostock/3885705
https://bl.ocks.org/d3noob/3c040800ff6457717cca586ae9547dbf

*/

//
d3.text("data.csv")
  .mimeType("text/plain")
  .get(function (err, data) {
    var dirtyCSV = data;

// The clean data begins at headerEnd and ends at "docEnd" egint de "schone data" en bij docEnd eindigt het"

    var headerIndicator = '"";"Onderwerpen";"Indexcijfers omzet";"Indexcijfers omzet";"Indexcijfers omzet"';
    var headerEnd = dirtyCSV.indexOf('"Onderwerpen";"Indexcijfers omzet";"Indexcijfers omzet";"Indexcijfers omzet"') + headerIndicator.length - 1;
    var docEnd = dirtyCSV.indexOf('"� Centraal Bureau voor de Statistiek, Den Haag/Heerlen 11-10-2017"');


// In cleanedData the clean data gets cut out of the dirty data.

    var cleanedData = dirtyCSV.substring(headerEnd, docEnd);

// Replace the unidentified symbol with utf code for "é"
    var cleanedData = cleanedData.replace("�", "&#233");

// Parse the data into a CSV format.
    var parsedData = d3.csvParse(cleanedData);

// Remove the top 2 lines since the were not needed.
    parsedData = parsedData.splice(1);

// Referal to function "draw"
    draw(parsedData);
  });

// Set the dimensions of the graph
var margin = {top: 20, right: 20, bottom: 160, left: 60},
    width = 960 - margin.left - margin.right,
    height = 520 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);

var y = d3.scaleLinear()
          .range([height, 0]);

// Append the svg object to the body of the page
// Append a 'group' element to 'svg'
// Moves the 'group' element to the top left margin
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Add eventlistener to the checkbox to check if true
function draw(data) {
  document.querySelector("input").addEventListener("click", function(e) {
    draw(e.target.checked);
  })

  // Check data for value to set the height of the y axis
  data.forEach(function(d) {
    d.Waarde = +d.Waarde;
  });

  // Scale the range of the data in the domains and format the var "Waarde" into numbers
  y.domain([0, d3.max(data, function(d) { return Number(d.Waarde); })]);
  x.domain(data.map(function(d) { return d.Onderwerpen; }));

  // Add the x Axis
  svg.append("g")
      .attr('class', 'x axis')
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.9em")
        .attr("dy", "-0.2em")
        .attr("transform", "rotate(-50)");

  // Add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y)
        .ticks(10))

  var bars = svg.selectAll(".bar").data(data, function(d) { return d.Onderwerpen; })
  bars.enter().append("rect")
    .attr("class", "bar")
    .attr("y", y(0))
    .attr("height", height - y(0));



// Function draw checks the value of draw to sort the bars when the checkbox is being clicked
  function draw(value) {
    if (value) {
      sortedData = data.sort(function(a, b) {
        return a.Waarde > b.Waarde;
      })
    } else {
      sortedData = data.sort(function(a, b) {
        return a.Waarde < b.Waarde;
      })
    }

    // The xAxis gets defined with the sorted data
    x.domain(sortedData.map(function(d) { return d.Onderwerpen; }));

    // Select the xAxis for the transition
    svg.select(".x.axis")
      .transition()
      .duration(300)
      .call(d3.axisBottom(x))

    // Select all the bars and replace the cleanData with the sortedData
    var bars = svg.selectAll(".bar")
      .data(sortedData, function(d) { return d.Onderwerpen; })

    // Cleans the DOM elements without changing the chart
    bars.exit()
      .transition()
      .duration(300)
      .attr("y", y(0))
      .attr("height", height - y(0))
      .style('fill-opacity', 1e-6)


    // Makes new bars from the sortedData
    bars.enter()
    .append("rect")
      .attr("class", "bar")
      .attr("y", y(0))
      .attr("height", height - y(0));

    // Transition with the bar elements
    bars.transition()
      .duration(300)
      .attr("x", function(d) { return x(d.Onderwerpen); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.Waarde); })
      .attr("height", function(d) { return height - y(d.Waarde); });
  }


//Give "draw" value of false to prevent from clicking the checkbox twice before stuff happens
  draw(false);
};
