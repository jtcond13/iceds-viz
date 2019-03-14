
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
       .remove()

      d3.selectAll("svg")
       .remove()
         
      changeLayout(region)  
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

      function getTransformFactor(my_region) {
         if(my_region.properties['name'] == 'Northeast'){
             var scale_factor = 1.9
          }
          else if(my_region.properties['name'] == 'West'){
             var scale_factor = 1.1
          }
          else if(my_region.properties['name'] == 'Midwest'){
             var scale_factor = 1.5
          }
          else{
             var scale_factor = 1.2
          }
          return `matrix(${scale_factor} 0 0 ${scale_factor} ${xTranslate(scale_factor)} ${yTranslate(scale_factor)})`
      }

      d3.json('data/state_features.json').then(function(state){

         // Removing Alaska and Hawaii to keep scale reasonable in the West
            const regions = {
               South: ["Maryland", "District of Columbia", "West Virginia", "Kentucky", "Virginia", "North Carolina", "Tennessee", 
                        "South Carolina", "Georgia", "Florida", "Alabama", "Mississippi", "Arkansas", "Louisiana", "Oklahoma", "Texas"],
               West: ["Montana", "Wyoming", "Colorado", "New Mexico", "Arizona", "Utah", "Idaho", "Washington", "Oregon", "Nevada", "California"],
               Northeast: ["Maine", "New Hampshire", "Vermont", "Massachusetts", "Rhode Island", "Connecticut", "New York", "New Jersey", "Pennsylvania"],
               Midwest: ["Ohio", "Michigan", "Indiana", "Illinois", "Wisconsin", "Minnesota", "North Dakota", "South Dakota", "Nebraska", "Kansas", "Iowa", "Missouri"]
            }

            var local_states = state.features.filter((value) => {
               var current_region = region.properties['name']
               return (regions[current_region].indexOf(value.properties.NAME) > -1)
            })
            
         d3.csv('data/college.csv').then(function(college) {
     
               var local_colleges = college.filter((value) => {
                  return d3.geoContains(region.geometry, [value['longitude'], value['latitude']])
               })
                 
         var foo = d3.local()

         // Build tooltip
         // Inspiration from Stack Overflow: https://stackoverflow.com/questions/20644415/d3-appending-text-to-a-svg-rectangle
               
               svg.selectAll('g')
                        .data(local_colleges)
                        .enter().append('g')
                        .attr("class", function(d){
                           return(d.name.replace(/\s+|'|-/g, '').toLowerCase())
                        })
                        .attr("opacity", 0)
                  .append("text")
                        .attr("x", function(d){
                                 return projection([d.longitude, d.latitude])[0] + 10;
                        })
                        .attr("y", function(d){
                           return projection([d.longitude, d.latitude])[1];
                        })
                        .attr("class", function(d){
                           return(d.name.replace(/\s+|'|-/g, '').toLowerCase())
                        })
                        .attr("transform", getTransformFactor(region))
                        .text( function (d) { return d.name })
                        .attr("font-size", "10px")
                        .attr("z-index", 20)
                        .attr("opacity", 0)

               svg.selectAll('g')
                  .append('rect')
                        .attr("x", function(d){
                           return projection([d.longitude, d.latitude])[0] + 10;
                        })
                        .attr("y", function(d){
                           return projection([d.longitude, d.latitude])[1] - 10;
                        })
                        .attr("width", function(d){
                           var tmp = d3.select(this).node().previousSibling.getBBox();
                           return tmp['width']
                        })
                        .attr("height", function(d) {
                           var tmp = d3.select(this).node().previousSibling.getBBox();
                           return tmp['height']
                        })
                        .attr("stroke", "green")
                        .attr("transform", getTransformFactor(region))
                        .style("fill", "gray")
                        .attr("opacity", .59)
                  
         // add the dots to the map
               svg.selectAll('circle')
                        .data(local_colleges)
                        .enter()
                  .append('circle')
                  .attr("cx", function(d){
                        return projection([d.longitude, d.latitude])[0];
                  })
                  .attr("cy", function(d){
                        return projection([d.longitude, d.latitude])[1];
                  })
                  .attr("r", function(){
                        var r_factor;
                        if(region.properties['name'] == 'Northeast'){
                           var r_factor = 2
                        }
                        else if(region.properties['name'] == 'West'){
                           var r_factor = 3.2
                        }
                        else if(region.properties['name'] == 'Midwest'){
                           var r_factor = 2.5
                        }
                        else{
                           var r_factor = 2.9
                        }
                        return r_factor
                  })
                  .attr("transform", getTransformFactor(region))
                  .style("fill", "blue")
                  .style("opacity", .5)
                  .on("mouseover", function(d){
                     var thisCollege = "." + d.name.replace(/\s+|'|-/g, '').toLowerCase();
                     d3.selectAll(thisCollege)
                        .style("opacity", 1) 
                  })
                  .on("mouseout", function(d){
                     var thisCollege = "." + d.name.replace(/\s+|'|-/g, '').toLowerCase();
                     d3.selectAll(thisCollege)
                        .style("opacity", 0) 
                  })

            
         })

         // add the states for the selected region
         local_states.forEach(element => {
            
               svg.append("path")
                  .attr("d", path(element.geometry))
                  .attr("stroke", "white")
                  .attr("fill", "#d9e2df")
                  .attr("opacity", .6)
                  .attr("transform", getTransformFactor(region));
            });

        })
      

      
   }

});




