

d3.json('data/us_region.json').then(function(data) {



console.log(data);

// var width = 500;
// var height = 200;
    

 var svg = d3.select("#content").append("svg");

 var projection = d3.geoAlbersUsa();
    
 var path = d3.geoPath().projection(projection);

svg.append("path")
   .attr("d", path(data));


});
   






