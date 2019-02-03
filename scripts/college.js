
d3.json('data/us_features.json').then(function(data) {

   var svg = d3.select(".content").append("svg");
   var projection = d3.geoAlbersUsa();
   var path = d3.geoPath().projection(projection);

   data.features.forEach(element => {
   
      svg.append("path")
      .attr("d", path(element.geometry))
      .attr("stroke", "white")
      .attr("fill", "#d9e2df")
      .attr("class", element.properties['name'])
      .on("mouseover", function(){
         d3.select(this)
         .attr("fill", "#82edcd")
         d3.select('.region').text(element.properties['name'])
      })
      .on("mouseout", function(){
         d3.select(this)
         .attr("fill", "#d9e2df")
         d3.select('.region').text('')
      })
      .on("click", function(){
         clicked(element);
      })
      


   });


   function clicked(region){

      d3.select('#header')
       .transition().remove()

      d3.selectAll("svg")
       .transition().remove()
         
      setTimeout(changeLayout(region), 3000)      
   };

   function changeLayout(region) {
      d3.select(".screen1")
      .classed("screen1", false)
      .classed("screen2", true); 
      
      d3.select(".content")
      .classed("content", false)
      .classed("map", true); 

   
      var svg = d3.select(".map").append("svg");
      var svgBox = document.getElementsByTagName("svg")[0];      
      var path = d3.geoPath().projection(projection);


      var centroid = path.centroid(region.geometry);

      function yTranslate(factor) {
                  newHeight = svgBox.getBoundingClientRect()['height'] / 2  - (centroid[1] * factor);
                  return newHeight;
      }

      function xTranslate(factor) {
                  newWidth = svgBox.getBoundingClientRect()['width'] / 2 - (centroid[0] * factor);
                  return newWidth;
      }


         svg.append("path")
            .attr("d", path(region.geometry))
            .attr("stroke", "white")
            .attr("fill", "#d9e2df")
            .attr("class", region.properties['name'])
            .attr("transform", function() {
               if(this.getAttribute('class') == 'Northeast'){
                 var scale_factor = 2.3
               }
               else if(this.getAttribute('class') == 'West'){
                  var scale_factor = .8
               }
               else if(this.getAttribute('class') == 'Midwest'){
                  var scale_factor = 1.5
               }
               else{
                  var scale_factor = 1.2
               }
               return `matrix(${scale_factor} 0 0 ${scale_factor} ${xTranslate(scale_factor)} ${yTranslate(scale_factor)})`
            });
      
      addColleges(region)
   }

   function addColleges(my_region){
      my_region
      
   }

   

});




