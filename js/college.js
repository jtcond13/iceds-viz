

d3.json('data/us_features.json').then(function(data) {

   var svg = d3.select("#content").append("svg");
   var projection = d3.geoAlbersUsa();
   var path = d3.geoPath().projection(projection);

   data.features.forEach(element => {
   
      console.log(element.properties['name']);

      svg.append("path")
      .attr("d", path(element.geometry))
      .attr("stroke", "black")
      .attr("fill", "#d9e2df")
      .on("mouseover", function(){
         d3.select(this)
         .attr("fill", "#82edcd")
         d3.select('.region').text(element.properties['name'])
      })
      .on("mouseout", function(){
         d3.select(this)
         .attr("fill", "#d9e2df")
         d3.select('.region').text('')
      });
   });
});

