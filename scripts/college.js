var _ = require('lodash');
var d3 = require('d3');
var Sortable = require('sortablejs')


d3.json('data/us_features.json').then(function(data) {

   var svg = d3.select(".content").append("svg");
   var projection = d3.geoAlbersUsa();
   var path = d3.geoPath().projection(projection);

   data.features.forEach(element => {
   
      svg.append("path")
      .attr("d", path(element.geometry))
      .attr("stroke", "#967972")
      .attr("fill", "#d9e2df")
      .attr("class", element.properties['name'])
      .on("mouseover", function(){
         d3.select(this)
            .attr("fill", "#6D9186")
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
            
      // adding 'g' to allow for zoom in Safari/IE
      var svg = d3.select(".map").append("svg").append('g').attr("class", "g")
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
             var scale_factor = 1.7
          }
          else if(my_region.properties['name'] == 'West'){
             var scale_factor = 1.2
          }
          else if(my_region.properties['name'] == 'Midwest'){
             var scale_factor = 1.5
          }
          else{
             var scale_factor = 1.2
          }
            return `matrix(${scale_factor} 0 0 ${scale_factor} ${xTranslate(scale_factor)} ${yTranslate(scale_factor)})`
      }    

      d3.json('data/state_features.json').then(function(state, svgBox){

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

          // add the states for the selected region
         local_states.forEach(element => {
            
               svg.append("path")
                  .attr("d", path(element.geometry))
                  .attr("stroke", "#967972")
                  .attr("fill", "#d9e2df")
                  .attr("opacity", .6)
                  .attr("id", element.properties['NAME'])
                  .attr("transform", getTransformFactor(region))   

            });   

      // map labels
            
            svg.append("text")
               .attr("x", 20)
               .attr("y", 20)
               .attr("font-size", "16px")
               .attr("font-weight", "bold")
               .text(region.properties['name'] + " Region Map")

            svg.append("text")
               .attr("x", 20)
               .attr("y", 36)
               .attr("font-size", "11px")
               .text("Hover to identify a university")

             d3.select(".screen2")
                  .append("div")
                  .attr("class", "colleges-table")
                  .style("grid-column", "4 / 8")
                  .style("grid-row", "3 / 3")
                  .style("overflow-x", "auto")
                  
            var my_variables = ['name', 'graduation_rate', 'percent_out-_of-_state_freshmen', 'percent_receiving_(School-Provided)_financial_aid', 'three_year_tuition_growth', 'admission_rate']

            var table_variables = Object.keys(local_colleges[0]).filter((value) => {
               return my_variables.includes(value)
            });

            var table_data = _.map(local_colleges, function(x) {
               return _.pick(x, my_variables)
            })

            var table_variables = Object.keys(table_data[0]).map(transformVar)

   // Build table 
            d3.select(".colleges-table")
                  .append("table")
                     .append("tbody")
                          .selectAll("tr")
                          .data(table_data)
                          .enter()
                          .append("tr")

   // Data Rows                      
            d3.selectAll("tr").each(function(d, i){
                        d3.select(this).selectAll("td")
                        .data(function(d) { 
                           return Object.values(d); })
                        .enter().append("td")
                           .text(function(d) { 
                              return d; });
            })

   // Header Rows
            d3.select(".colleges-table > table")
                     .append("thead")
                     .append("tr")
                        .selectAll("td")
                           .data(table_variables)
                           .enter().append("td")
                              .text(function(d) { return d; })
                     .style("font-weight", "bold")

   // Buttons
      var btn_variables = table_variables.slice(1, 6)
      var btn_ranks = ["1.", "2.", "3.", "4.", "5."]

      var btn_coll = _.map(btn_ranks, function(x, i){
         return([x, btn_variables[i]])
      })

     btn_coll = _.flatten(btn_coll)

     d3.select(".screen2")
               .append("div")
                  .attr("class", "button-container")
                     .selectAll("div")
                      .data(btn_coll)
                       .enter()
                  .each(function(d,i){
                        if(btn_variables.includes(d)){
                           if(i == 1){
                              d3.select(this).append("button")
                              .text(function(d){  return d; })
                              .style("padding","15.5px")
                              .style("font-size", "13px")
                              .style("list-style-type", "none")
                           }
                           else{
                              d3.select(this).append("button")
                              .text(function(d){  return d; })
                              .style("padding","15.5px")
                              .style("font-size", "13px")
                              .style("list-style-type", "none")
                           }
                        }
                        else{
                           d3.select(this).append("div")
                           .attr("id","num")
                           .text(function(d){ return d})
                           .style("font-size", "20px")
                           .style("font-weight", "bold")
                        }
                     })

  // Sortable Btns    
  var btns = d3.select(".button-container").node()

  Sortable.create(btns, {animation: 150,
                          filter: "#num",
                          swap: true,
                          onMove: evt => {
                             // prevent button from being swapped with a number
                             if(Sortable.utils.is(evt.related, '#num')) {
                                return false
                             }
                             else {
                                return true
                             }
                           },
                           onEnd: e => {
                              calculateColor()
                              sortColleges()
                           }
                        });
  // Initial Sort
       sortColleges()

   // Add header
    d3.select('.screen2')
      .append('div')
      .attr("class", "header")
      .html("Build your own College Ratings for the...  <b>" + region.properties['name'])

    d3.select('.header')
      .append('div')
      .attr("class", "subtext")
      .html("Drag and drop variables to reorder the rankings.")

   // back link
    d3.select('.screen2')
      .append('a')
      .attr('class', 'goback')
      .attr('href', '.')
      .html('Back')

   // Build tooltip
  // Inspiration from Stack Overflow: https://stackoverflow.com/questions/20644415/d3-appending-text-to-a-svg-rectangle
               
       svg.selectAll('g:not(.g)')
               .data(local_colleges)
               .enter().append('g')
               .attr("class", function(d){
                  return(d.name.replace(/\s+|'|-/g, '').toLowerCase())
               })
               .attr("opacity", 0)
         .append("text")
               .attr("x", function(d){
                        return projection([d.longitude, d.latitude])[0] - 30;
               })
               .attr("y", function(d){
                  return projection([d.longitude, d.latitude])[1] - 10;
               })
               .attr("class", function(d){
                  return(d.name.replace(/\s+|'|-/g, '').toLowerCase())
               })
               .attr("transform", getTransformFactor(region))
               .text( function (d) { 
                  return d.name })
               .attr("font-size", "10px")

      svg.selectAll('g:not(.g)')
         .append('rect')
               .attr("x", function(d){
                  return projection([d.longitude, d.latitude])[0] - 30;
               })
               .attr("y", function(d){
                  return projection([d.longitude, d.latitude])[1] - 20;
               })
               .attr("width", function(){
                  var tmp = d3.select(this).node().previousSibling.getBBox();
                  return tmp['width']
               })
               .attr("height", function() {
                  var tmp = d3.select(this).node().previousSibling.getBBox();
                  return tmp['height']
               })
               .attr("stroke", "#0d4f1e")
               .attr("transform", getTransformFactor(region))
               .style("fill", "#cae3d0")
               .attr("opacity", .4)

 
         // Create color scale
         var dotScale = d3.scaleSequential(d3.interpolatePurples)
            .domain(d3.extent(table_data, d => {
            var order = _.map(d3.selectAll("button").nodes(), x => { return x.innerHTML.trim() })
            var weights = [10, 7, 4, 2, 1],
            i = 1,
            score = 0;
            for(i = 1; i < 6; i++){
            if (transformVar(Object.getOwnPropertyNames(d)[i]).trim() != '2010-2013 Tuition Growth'){
               score += weights[order.indexOf(transformVar(Object.getOwnPropertyNames(d)[i]).trim())] * parseFloat(Object.values(d)[i]);
            }
            else {
               score -= weights[order.indexOf(transformVar(Object.getOwnPropertyNames(d)[i]).trim())] * parseFloat(Object.values(d)[i]);
            }
         }
         return score
         })) 

      // To be called after buttons are swapped
      function calculateColor(){
         d3.selectAll('circle')
         .style("fill", function(d){
            var my_variables = ['name', 'graduation_rate', 'percent_out-_of-_state_freshmen', 'percent_receiving_(School-Provided)_financial_aid', 'three_year_tuition_growth', 'admission_rate']
            var y = _.pickBy(d, (value, key) => my_variables.includes(key))
            var order = _.map(d3.selectAll(".button-container > button").nodes(), x => { return x.innerHTML.trim() }),
            weights = [10, 7, 4, 2, 1],
            i = 1,
            score = 0;
            for(i = 1; i < 6; i++){
            if(transformVar(Object.getOwnPropertyNames(y)[i]).trim() != '2010-2013 Tuition Growth'){
               score += weights[order.indexOf(transformVar(Object.getOwnPropertyNames(y)[i]).trim())] * parseFloat(Object.values(y)[i]);
            }
            else{
               score -= weights[order.indexOf(transformVar(Object.getOwnPropertyNames(y)[i]).trim())] * parseFloat(Object.values(y)[i]);
            }
          }
          if(!score){
             score = .5
          }
          return dotScale(score) 
        })

        
   }

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
                  .style("fill", function(d){
                     var my_variables = ['name', 'graduation_rate', 'percent_out-_of-_state_freshmen', 'percent_receiving_(School-Provided)_financial_aid', 'three_year_tuition_growth', 'admission_rate']
                     var y = _.pickBy(d, (value, key) => my_variables.includes(key))
                     var order = _.map(d3.selectAll("button").nodes(), x => { return x.innerHTML.trim() }),
                     weights = [10, 7, 4, 2, 1],
                     i = 1,
                     score = 0;
                     for(i = 1; i < 6; i++){
                     if(transformVar(Object.getOwnPropertyNames(y)[i]).trim() != '2010-2013 Tuition Growth'){
                        score += weights[order.indexOf(transformVar(Object.getOwnPropertyNames(y)[i]).trim())] * parseFloat(Object.values(y)[i]);
                     }
                     else{
                        score -= weights[order.indexOf(transformVar(Object.getOwnPropertyNames(y)[i]).trim())] * parseFloat(Object.values(y)[i]);
                     }
                  }
                   if(!score){
                      score = 3
                   }
                  return dotScale(score)
                  })
                  .style("opacity", .85)
                  .on("mouseover", function(d){
                     var thisCollege = "." + d.name.replace(/\s+|'|-/g, '').toLowerCase();
                     // workaround to deal with rendering order issues
                     d3.selectAll(thisCollege).each(function(){
                        this.parentNode.appendChild(this);
                     })
                        .style("opacity", 1) 
                  })
                  .on("mouseout", function(d){
                     var thisCollege = "." + d.name.replace(/\s+|'|-/g, '').toLowerCase();
                     d3.selectAll(thisCollege)
                        .each(function(){
                           this.parentNode.removeChild(this);
                        })
                        .style("opacity", 0) 
                  })

            // Zoom buttons and behavior
            var cnt = d3.select(".map").insert('div')
               .attr("class", "controls")


            var mapZoom = d3.zoom()
                            .scaleExtent([1,3])
                            .on("zoom", zoomed)

            function zoomed() {
               svg.attr("transform", d3.event.transform)
            }

            cnt.append("button")
               .text("+")
               .attr("id", "zoomin")
               .on("click", function() {
                  mapZoom.scaleBy(svg.transition().duration(500), 1.1)
               })

            cnt.append("button")
               .text("-")
               .attr("id", "zoomin")
               .on("click", function(){
                  mapZoom.scaleBy(svg.transition().duration(500), 0.9)
               })


         })
        // Consider changing this to z-scores
         function sortColleges() {
            var order = _.map(d3.selectAll(".button-container > button").nodes(), x => { return x.innerHTML.trim() });
            d3.selectAll("tr").sort((a,b) => {
               if(a && b){
                  var weights = [10, 7, 4, 2, 1],
                  i = 1,
                  a_score = 0,
                  b_score = 0;
                  for(i = 1; i < 6; i++){
                    if(transformVar(Object.getOwnPropertyNames(a)[i]).trim() != '2010-2013 Tuition Growth'){
                     a_score += weights[order.indexOf(transformVar(Object.getOwnPropertyNames(a)[i]).trim())] * parseFloat(Object.values(a)[i]);
                     b_score +=  weights[order.indexOf(transformVar(Object.getOwnPropertyNames(b)[i]).trim())] * parseFloat(Object.values(b)[i]);
                    }
                    else{
                     a_score -= weights[order.indexOf(transformVar(Object.getOwnPropertyNames(a)[i]).trim())] * parseFloat(Object.values(a)[i]);
                     b_score -=  weights[order.indexOf(transformVar(Object.getOwnPropertyNames(b)[i]).trim())] * parseFloat(Object.values(b)[i]);
                    }
                    
                  }       
                  return(b_score - a_score)
               }
               else{
                  return 0
               }
            })    
         }
        })
   }

          
   // Format variables function 
         function transformVar(x) {
               var y = x.replace(/_|\./g, ' '),
               z = y.split(' '),
               i,
               last = "";
            for(i = 0; i < z.length; i++) {
               if(z[i].slice(0,1) === "("){
                  last +=  z[i].slice(0,1).toUpperCase() + z[i].slice(1,2).toUpperCase() + z[i].slice(2).toLowerCase() + " "
               }
               else if(z[i].slice(0,1) === "p"){
                  last += "" 
               }
               else if(z[i].slice(0) === "three"){
                  last += "2010-"
               }
               else if(z[i].slice(0) === "year"){
                  last += "2013 "
               }
               else if(z[i].slice(-1) === "-"){
                  last +=  z[i].slice(0,1).toUpperCase() + z[i].slice(1).toLowerCase()
               }
               else{
                  last +=  z[i].slice(0,1).toUpperCase() + z[i].slice(1).toLowerCase() + " "
               }
            }
            return last
            }
});




