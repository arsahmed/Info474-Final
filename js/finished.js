'use strict';

(function() {

  let data = ""; // keep data in global scope
  let svgContainer = ""; // keep SVG reference in global scope
  let selectedPopularity = "";

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 620);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./data/popularity.csv")
      .then((csvData) => {
        data = csvData;
        let popularities = [];

        // Loop through and get the unique values for the year
        data.forEach(row => {
          let popularity = (row["popularity"])
          if (popularities.indexOf(popularity) == -1) {
            popularities.push(popularity)
          }
        });

        // Sort so that the dropdown is alphabetical
        popularities.sort()
        selectedPopularity = popularities[0];

        // Create a dropdown menu
        addDropdown(popularities);
        makeBarChart(data)
      });
  }

    // Adds the dropdown menu with the years onto the svg
    function addDropdown(popularity_data) {

      // Append the dropdown to the SVG
      let dropdown = d3.select('select')
  
      // Append the options to the dropdown
      dropdown.selectAll('option')
        .data(popularity_data).enter()
        .append('option')
          .text(d => d)
          
      // Remove current points and redraw the scatter plot
      dropdown.on('change', function(){
        selectedPopularity = d3.select('select').property('value');
        makeBarChart();
      });
  
    }

  // make bar chart with avg line
  function makeBarChart() {
    svgContainer.html("");

    // get an array of gre year and an array of chance of views
    let popularityData = data.filter((row) => row["popularity"] == selectedPopularity);
    let genre = popularityData.map((row) => parseInt(row["index"]));
    let tracks = popularityData.map((row) => parseInt(row["tracks"]));

    let axesLimits = findMinMax(genre, tracks);

    // draw axes with ticks and return mapping and scaling functions
    let mapFunctions = drawTicks(axesLimits);

    // plot the data using the mapping and scaling functions
    plotData(mapFunctions, popularityData);

	// make lables for the axis
	makeLabels();
  }

  // plot all the data points on the SVG
  function plotData(map, popularityData) {
    let xMap = map.x;
    let yMap = map.y;

    svgContainer.append("rect")
      .attr("x", "85")
      .attr("y", "50")
      .attr("width", "800")
      .attr("height", "400")
      .attr("fill", "#eaf2f8")
      .attr("opacity", '0.5');

    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(popularityData)
      .enter()
      .append('rect')
        .attr('x', xMap)
        .attr('y', yMap)
  	  	.attr('width', '25')
	  	  .attr('height', (d) => 450 - yMap(d))
        .attr('fill', "#2a5396")
        .attr('stroke-width', '1')
        .attr('stroke', 'rgb(47,79,79)')
        .attr("opacity", 0.9)	
  }

  // draw the axes and ticks
  function drawTicks(limits) {
    // return year from a row of data
    let xValue = function(d) { return +d["index"]; }
    let xLabel = function(d) { return +d["genre"]; }

    // function to scale year
    let xScale = d3.scaleLinear()
      .domain([limits.genreMin, limits.genreMax + 1]) // give domain buffer room
      .range([85, 850]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };
    let tickLabels = ['A Capella','Alternative','Anime','Blues','Children Music','Classical','Comedy',
    'Country','Dance','Electronic','Folk','Hip-Hop','Indie','Jazz','Movie','Opera',
    'Pop','R&B','Rap','Reggae','Reggaeton','Rock','Ska','Soul','Soundtrack','World']

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale)
        .ticks(26)
        .tickFormat(function(d,i){ return tickLabels[i]});

    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis)
      .selectAll("text")
        .style('text-anchor', 'end')
        .attr("dx", "-0.5em")
        .attr("transform", "rotate(-90)");

    // return views from a row of data
    let yValue = function(d) { return +d["tracks"]}

    // function to scale views
    let yScale = d3.scaleLinear()
      .domain([limits.tracksMax + 1, limits.tracksMin - 0.05]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(80, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for year and views
  function findMinMax(genre, tracks) {

    // get min/max year
    let genreMin = d3.min(genre);
    let genreMax = d3.max(genre);

    // round x-axis limits
    genreMax = Math.round(genreMax*10)/10;
    genreMin = Math.round(genreMin*10)/10;

    // get min/max views
    let tracksMin = 0;
    let tracksMax = d3.max(tracks);

    // round y-axis limits to nearest 0.05
    tracksMax = Number((Math.ceil(tracksMax*20)/20).toFixed(2));
    tracksMin = Number((Math.ceil(tracksMin*20)/20).toFixed(2));

    // return formatted min/max data as an object
    return {
      genreMin : genreMin,
      genreMax : genreMax,
      tracksMin : tracksMin,
      tracksMax : tracksMax
    }
  }
  
  // function that makes the lables
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 50)
      .attr('y', 30)
      .style('font-size', '22pt')
      .text("Spotify Tracks By Genre");

    svgContainer.append('text')
      .attr('x', 400)
      .attr('y', 550)
      .style('font-size', '15pt')
      .text('Genre');

    svgContainer.append('text')
      .attr('transform', 'translate(25, 300)rotate(-90)')
      .style('font-size', '15pt')
      .text('Tracks');
  }
  
})();
