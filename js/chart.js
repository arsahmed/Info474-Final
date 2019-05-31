'use strict';

(function() {

  let data = "";
  let dataArtist = "";
  let svgContainer = "";
  let selectedPopularity = "";
  let svgTooltip = "";
  let tooltipDiv = "";

  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 620);
 
    d3.csv("./data/popularity.csv")
      .then((csvData) => {
        data = csvData;
        let popularities = [];

         data.forEach(row => {
          let popularity = (row["popularity"])
          if (popularities.indexOf(popularity) == -1) {
            popularities.push(popularity)
          }
        });

        popularities.sort()
        selectedPopularity = popularities[0];


        addDropdown(popularities);
        makeBarChart(data)

        tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)

        svgTooltip = tooltipDiv.append('svg')
        .attr('width', 350)
        .attr('height', 260);

      }),

      d3.csv("./data/artists.csv")
      .then((csvDataArtist) => {
        dataArtist = csvDataArtist;
        makeTooltipChart(dataArtist);
      })
  }

    function addDropdown(popularity_data) {

      let dropdown = d3.select('select')
  
      dropdown.selectAll('option')
        .data(popularity_data).enter()
        .append('option')
          .text(d => d)
          
      dropdown.on('change', function(){
        selectedPopularity = d3.select('select').property('value');
        makeBarChart();
      });
  
    }

  function makeBarChart() {
    svgContainer.html("");

    let popularityData = data.filter((row) => row["popularity"] == selectedPopularity);
    let genre = popularityData.map((row) => parseInt(row["index"]));
    let tracks = popularityData.map((row) => parseInt(row["tracks"]));

    let axesLimits = findMinMax(genre, tracks);

    let mapFunctions = drawTicks(axesLimits);

    plotData(mapFunctions, popularityData);

	makeLabels();
  }

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

        .on("mouseover", (d) => {
          tooltipDiv.transition()
            .duration(200)
            .style("opacity", 1)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

        })
        .on("mouseout", (d) => {
          tooltipDiv.transition()
            .duration(500)
            .style("opacity", 0);
        });
  }

  function makeTooltipChart() {

    let genre = dataArtist.map((row) => parseInt(row["index"]));
    let artists = dataArtist.map((row) => parseInt(row["artists"]));

    let axesLimits = findTooltipMinMax(genre, artists);

    let mapFunctions = drawTooltipTicks(axesLimits);

    plotTooltipData(mapFunctions);

    svgTooltip.append('text')
    .attr('x', 90)
    .attr('y', 20)
    .style('font-size', '12pt')
    .text("Spotify Artists By Genre");
  }

  function plotTooltipData(map) {
    let xMap = map.x;
    let yMap = map.y;

    svgTooltip.selectAll('.dot')
      .data(dataArtist)
      .enter()
      .append('rect')
        .attr('x', xMap)
        .attr('y', yMap)
  	  	.attr('width', '8')
	  	  .attr('height', (d) => 180 - yMap(d))
        .attr('fill', "#771010")
        .attr('stroke-width', '1')
        .attr("opacity", 0.9)
  }

  function drawTicks(limits) {
    let xValue = function(d) { return +d["index"]; }

    let xScale = d3.scaleLinear()
      .domain([limits.genreMin, limits.genreMax + 1]) // give domain buffer room
      .range([85, 850]);

    let xMap = function(d) { return xScale(xValue(d)); };
    let tickLabels = ['A Capella','Alternative','Anime','Blues','Children Music','Classical','Comedy',
    'Country','Dance','Electronic','Folk','Hip-Hop','Indie','Jazz','Movie','Opera',
    'Pop','R&B','Rap','Reggae','Reggaeton','Rock','Ska','Soul','Soundtrack','World']

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

    let yValue = function(d) { return +d["tracks"]}

    let yScale = d3.scaleLinear()
      .domain([limits.tracksMax + 1, limits.tracksMin - 0.05]) // give domain buffer
      .range([50, 450]);

    let yMap = function (d) { return yScale(yValue(d)); };

    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(80, 0)')
      .call(yAxis);

    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  function drawTooltipTicks(limits) {
    let xValue = function(d) { return +d["index"]; }

    let xScale = d3.scaleLinear()
      .domain([limits.genreMin, limits.genreMax + 1]) // give domain buffer room
      .range([40, 340]);

    let xMap = function(d) { return xScale(xValue(d)); };
    let tickLabels = ['A Capella','Alternative','Anime','Blues','Children Music','Classical','Comedy',
    'Country','Dance','Electronic','Folk','Hip-Hop','Indie','Jazz','Movie','Opera',
    'Pop','R&B','Rap','Reggae','Reggaeton','Rock','Ska','Soul','Soundtrack','World']

    let xAxis = d3.axisBottom().scale(xScale)
        .ticks(26)
        .tickFormat(function(d,i){ return tickLabels[i]});

    svgTooltip.append("g")
      .attr('transform', 'translate(0, 180)')
      .call(xAxis)
      .selectAll("text")
        .style('text-anchor', 'end')
        .attr("dx", "-0.5em")
        .attr("transform", "rotate(-90)");

    let yValue = function(d) { return +d["artists"]}

    let yScale = d3.scaleLinear()
      .domain([limits.artistsMax + 1, limits.artistsMin - 0.05]) // give domain buffer
      .range([30, 180]);

    let yMap = function (d) { return yScale(yValue(d)); };

    let yAxis = d3.axisLeft().scale(yScale);
    svgTooltip.append('g')
      .attr('transform', 'translate(40, 0)')
      .call(yAxis);

    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }


  function findMinMax(genre, tracks) {

    let genreMin = d3.min(genre);
    let genreMax = d3.max(genre);

    genreMax = Math.round(genreMax*10)/10;
    genreMin = Math.round(genreMin*10)/10;

    let tracksMin = 0;
    let tracksMax = d3.max(tracks);

    tracksMax = Number((Math.ceil(tracksMax*20)/20).toFixed(2));
    tracksMin = Number((Math.ceil(tracksMin*20)/20).toFixed(2));

    return {
      genreMin : genreMin,
      genreMax : genreMax,
      tracksMin : tracksMin,
      tracksMax : tracksMax
    }
  }

  function findTooltipMinMax(genre, artists) {

    let genreMin = d3.min(genre);
    let genreMax = d3.max(genre);

    genreMax = Math.round(genreMax*10)/10;
    genreMin = Math.round(genreMin*10)/10;

    let artistsMin = 0;
    let artistsMax = d3.max(artists);

    artistsMax = Number((Math.ceil(artistsMax*20)/20).toFixed(2));
    artistsMin = Number((Math.ceil(artistsMin*20)/20).toFixed(2));

    return {
      genreMin : genreMin,
      genreMax : genreMax,
      artistsMin : artistsMin,
      artistsMax : artistsMax
    }
  }
  
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
