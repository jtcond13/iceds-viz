

d3.json('data/us_region.json').then(function(data) {





// var width = 500;
// var height = 200;
    

 var svg = d3.select("#content").append("svg");

 var projection = d3.geoAlbersUsa();
    
 var path = d3.geoPath().projection(projection);


 data.geometries.forEach(element => {
   
   svg.append("path")
   .attr("d", path(element))
   .attr("stroke", "black")
   .attr("fill", "#d9e2df")
   .on("mouseover", function(){
      d3.select(this)
      .attr("fill", "orange")})
   .on("mouseout", function(){
      d3.select(this)
      .attr("fill", "#d9e2df")
       })

});

   


});
   






