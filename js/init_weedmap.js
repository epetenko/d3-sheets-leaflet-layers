var geoJsonObject;

// var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/10ckGqR5cHCVk5R_IF6ej55VF5Rh7FwobD2Xe0h8awLE/pubhtml';

   
   $(document).ready(function(){

   //   function init() {
   //     Tabletop.init({
   //         key: public_spreadsheet_url,
   //         callback: showInfo,
   //         simpleSheet: true
   //     })
   // }

  // init();

  map = new L.Map('mapcanvas', {attributionControl: false, minZoom: 7.5, scrollWheelZoom: false});

    var winwidth = parseInt(d3.select('#mapcanvas').style('width'))
   
    var osm = new L.TileLayer('');    
    map.setView(new L.LatLng(40.058, -74.4057),7.5 );
    map.addLayer(osm);
    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

    // The tooltip
var div = d3.select("#mapcanvas").append("div") 
    .attr("class", "tooltip")   
    .html("<h3>Loading...</h3>")
    .style("top", "0px")
    .style("left", winwidth - 180 + "px")

   // function showInfo(resultsdata, tabletop) {

 

    // var data = tabletop.sheets('Ultimate_map')['elements']

  


queue()
    .defer(d3.json, "js/nj_munis_2.json")
    .defer(d3.csv, "data/Weed_map_by_town.csv")
    // .defer(d3.csv,"data/njelection_results.csv")
    .await(ready);



function ready(error, us, data){
          


      var census2010 = {};
      var town_name = {};
      var category = {};
      var notes = {};
      var hyperlink = {};
      var declared_date = {};
      var test = {};

 


        data.forEach(function(d) {
    census2010[d.census2010] = d.census2010;
    town_name[d.census2010] = +d.town_name;
    category[d.census2010] = d.category;
    notes[d.census2010] = d.notes;
    // name_county[d.census2010] = d.name_county;
    hyperlink[d.census2010] = +d.hyperlink;
    declared_date[d.census2010] = +d.declared_date;
    test[d.census2010] = +d.test;
    // raw_change[d.census2010] = +d.raw_change;
    // times[d.census2010] = +d.times;
console.log(census2010)

 
  });



       
console.log(data)

var legend_width = 500,
      divisions = 4;




var RentColor = d3.scale.quantize()
    .domain([0,90])
    .range(["#c4d2d8",
"#90a6ae",
"#627b84",
"#3d5159",
"#1f2b30",]);

var HouseColor = d3.scale.quantize()
    .domain([-100,200])
    .range(['#284c58','#305b69','#f6e8c3','#f5f5f5','#c7eae5','#5ab4ac','#01665e']);


     // var JohnsonColor = d3.scale.linear()
     //    .range([EqualColor, JohnsonColorMax])
     //    .domain([0,JohnsonMax-150])
     //    .interpolate(d3.interpolateLab);

        var legend = d3.select('#legend')
  .append('ul')
    .attr('class', 'list-inline');

var keys = legend.selectAll('li.key')
    .data(RentColor.range());

keys.enter().append('li')
    .attr('class', 'key')
    .style('border-top-color', String)
    .text(function(d) {
        var r = RentColor.invertExtent(d);
        return d3.round(r[0],1).toLocaleString();
    });





  $( ".waiting" ).remove();

      collection = topojson.feature(us, us.objects.nj_munis_2)

      



      var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform);
      var feature = g.selectAll("path")
        .data(collection.features)
        .enter().append("path")
                 .attr('class', 'njmunis')
                 .attr('id', function(d) {  

                     return d.properties.CENSUS2010;
                 })
                 .attr('d', path)
                 .on("mouseover", mousemove)
          .on("mousemove", mousemove)
          .on("click", mousemove)  
          .on("mouseout", function(d) { 

          feature.style({
                   'stroke-opacity': 0.6,
                   'stroke': '#444',
                   "stroke-width": 0.5
               });  
            div.style("opacity", 0)
          });


         map.on("viewreset", reset);
      reset();

       function reset() {
        var bounds = path.bounds(collection),
        topLeft = bounds[0],
        bottomRight = bounds[1];
        svg .attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");
        g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        feature.attr("d", path);
      }
      function projectPoint(x, y) {
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
      }

      div.html("<h3>Hover over for more info</h3>")


          feature.style("fill", function(d) { 
            
              if (d.category == 'Yes') {
                    return '#55951b'
              } else if (d.category == 'No') {
                return '#05668D'
              } else if (d.category == 'Active') {
                return '#4A314D'
              } else {
                return '#000'
              }            
            })
          .style("stroke", "#444")
          .style("stroke-opacity", 0.6 )
          .style("stroke-width", 0.5)
          .style("fill-opacity", 1 )


          function mousemove(d) {

            feature.style({
              'stroke-opacity': 0.6,
                   'stroke': '#444',
                   "stroke-width": 0.5})


             d3.select(this.parentNode.appendChild(this))
                     .style({
                         'stroke-opacity': 1,
                         'stroke': '#5C5C5C',
                         "stroke-width": 1.5
                     });   
                  div .style("opacity", .95)   
                  div .html("<h2 class='" + pop_estimate[d.id] +"'>" + town_name[d.id] + "</h2><div id='infobox'><table class='muni_elex'><tr><th></th><th></th><th></th></tr><tr><td class='name clinton'>Incidents per 1000: </td><td>"+d3.round(per_1000[d.id], 1)+"</td></tr><tr><td class='name clinton'>Incidents:</td><td>"+incident_key[d.id]+"</td><tr><td class='name clinton'>Arrests: </td><td>"+d3.round(tot_arrests[d.id],1)+"</table>")
                   // div
                   //    .style("left", (mobileoffset(d3.event.pageX) + 10) + "px")
                   //    .style("z-index", 1400)
                   //    .style("top", (d3.event.pageY) + "px");


                  function mobileoffset(d) {

                    var xoff = winwidth - d;
                    var xper = xoff/winwidth;
                   
                  
                        if (winwidth < 400 && xper < 0.55) {
                     
                          return d - winwidth/2;
                        }

                        else {
                          return d;
                        }

                      }
              }

      d3.select("#start").on("click", function() {
          feature
            .transition()
            .style("fill", function(d) {
              return HouseColor(raw_change[d.id])
            })
        });

        d3.select("#reset").on("click", function() {
          feature
            .transition()
            .style("fill", function(d) {
              return RentColor(decade_change[d.id])
            })
        });
  
 }

var pymChild = new pym.Child();



    //d3 code stolen from http://bost.ocks.org/mike/leaflet/#init
     
     


    
  
  });
