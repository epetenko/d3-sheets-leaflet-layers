// Most of the action here is described in Weed_map.js. Skip to ~373 to see where points are added, etc.
var geoJsonObject;

var pymChild = null;

$(document).ready(function() {
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1; //January is 0!
var yyyy = today.getFullYear();

if (dd < 10) {
  dd = '0' + dd;
}

if (mm < 10) {
  mm = '0' + mm;
}

today = mm + '/' + dd + '/' + yyyy;
$('#date').html(today);
    // Dropdown Function Pt. 1
    var usedNames = [];

    var config = {
        '.chosen-select': {},
        '.chosen-select-deselect': {
            allow_single_deselect: true
        },
        '.chosen-select-no-single': {
            disable_search_threshold: 10
        },
        '.chosen-select-no-results': {
            no_results_text: 'Oops, nothing found!'
        },
        '.chosen-select-width': {
            width: "95%"
        }
    }
    for (var selector in config) {
        $(selector).chosen(config[selector]);
    }

    var dropdown_county1 = $('select.chosen-select.county1'),
        dropdown_town1 = $('select.chosen-select.town1'),
        grid = $('.grid')


    var mobile_threshold = 450;
    var winwidth = parseInt(d3.select('#mapcanvas').style('width'))
    var winheight = parseInt(d3.select('#mapcanvas').style('height'))

    var isMobile = isMobile(winwidth);


    function isMobile(w) {
        if (w < mobile_threshold) {
            return true
        } else {
            return false
        }
    }

    map = new L.Map('mapcanvas', {
        attributionControl: false,
        // minZoom: isMobile? 6.5:5.5,
        scrollWheelZoom: false
    });
    map.createPane('labels');
    map.getPane('labels').style.zIndex = 550;
    map.getPane('labels').style.pointerEvents = 'none';
    var osm = new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
    });
    map.addLayer(osm);
    var positronLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        pane: 'labels'
    }).addTo(map);
    map.setView(new L.LatLng(40.2, -74.4057), 8
        // isMobile? 7.5:8.5
    );

    var points_id = '1mAkQ0pXLmhNSYpgDsO-ruypLhAs3Hm4cZ6T-2wDQmII'


    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");

    // The tooltip
    var div = d3.select("#mapcanvas").append("div")
        .attr("class", "tooltip")
        .html("<h2>Loading...</h2>")
        .style("top", "0px")
        .style("left", winwidth - 180 + "px")

    var spreadsheet_id = "1mAkQ0pXLmhNSYpgDsO-ruypLhAs3Hm4cZ6T-2wDQmII"
    queue()
        .defer(d3.json, "js/nj_munis_2.json")
        .defer(d3.csv, "https://docs.google.com/spreadsheets/d/" + spreadsheet_id + "/export?format=csv")
        .await(ready);




    function ready(error, us, data) {
        console.log(data)

        var dispensary_name = {};
        var lat = {};
        var lang = {};
        var location = {};
        var status = {};
        var census2010 = {};
        // var town_name = {};
        // var county = {};
        // var just_town = {};
        // var dispensary = {};


        data.forEach(function(d) {
            dispensary_name[d.dispensary_name] = d.dispensary_name;
            lat[d.dispensary_name] = +d.lat;
            lang[d.dispensary_name] = +d.lang;
            status[d.census2010] = d.status;


            // if (usedNames.indexOf(d.county) == -1) {
            //            var option = $('<option value="' + d.county + '">' + d.county + '</option>');

            //            dropdown_county1.append(option);
            //            usedNames.push(d.county);
            //        };

        });

        // var max = d3.max(data, function(d) { return d.sen_dem; } );
        // var min = d3.min(data, function(d) { return d.sen_dem; } );



        function isNegative(x) {
            if (x >= 0) {
                return "+"
            } else {
                return ""
            }
        }

        function addCommas(nStr) {
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }

        function round_num(x) {
            if (x) {
                return x.toFixed(1)
            } else {
                return x
            }
        }



        // Dropdown Function Pt. 2

        // dropdown_county1.trigger("chosen:updated");
        // dropdown_county1.chosen().on('chosen:showing_dropdown', function() {
        //     pymChild = new pym.Child();
        // });

        // dropdown_county1.on('change', function(e, params) {
        //     grid.html("")
        //     //Make town and right-side county options appear
        //     $('#town1').show();
        //     //Empty any previous town options
        //     dropdown_town1.empty();
        //     var emptyoption = $('<option value=""></option>');
        //     dropdown_town1.append(emptyoption).trigger('chosen:updated')
        //     //Fetches the county picked from the left-side county dropdown
        //     county1value = e.target.value;

        //     //Initiates populate_cards function
        //     populate_towns(county1value, dropdown_town1)

        // });


        dropdown_town1.on('change', function(e, params) {
            grid.html("")
            var emptyoption = $('<option value=""></option>');
            dropdown_town1.append(emptyoption).trigger('chosen:updated')
            //Fetches the town picked from the left-side town dropdown
            town1value = e.target.value;
            //Initiates populate_cards function
            populate_cards(town1value, grid, dropdown_town1)
        })

        // function populate_towns(btn_value, thedropdown) {

        //     //A loop that goes through the entry array created earlier 
        //     data.forEach(function(d) {
        //         if (btn_value == d.county) {
        //             // Add all towns in the picked county into the town dropdown
        //             var townoption = $('<option value="' + d.town_name + '">' + d.town_name + '</option>');
        //             thedropdown.append(townoption);
        //         }
        //         // Update all dropdown menus after changes
        //         dropdown_town1.trigger("chosen:updated");
        //     })
        // }

        function populate_cards(btn_value, thegrid, thedropdown) {
            if (btn_value == 'Show_all') {
                data.forEach(function(d) {
                    if (d.category != 'N/A') {
                        var gridsquares = '<div class="element-item">'
                        gridsquares +="<h2 class='town_name'>" + d.dispensary_name + "</h2><div class='category " + d.status + "''>" + d.status + "</div><div id='infobox'><table class='muni_elex'><td class='notes'>" + d.location + "</td></tr><td class='name clinton'><a href='" + d.status + "' target='_blank'>" + test_hyperlink(d.status) + "</a></td><td></table>"
                        thegrid.append(gridsquares)
                    }
                     thegrid.imagesLoaded(function() {
                            pymChild.sendHeight();
                        });
                })
            } else {
                //A loop that goes through the entry array created earlier 
                data.forEach(function(d) {
                    console.log(btn_value)
                    console.log(d)
                    // $("path#" + d.census2010 + ".njmunis").css({
                    //     'stroke-opacity': 0.6,
                    //     'stroke': '#595858',
                    //     "stroke-width": 0.3
                    // })
                    div.style("opacity", 0)
                    //Goes through every row and sees if the btn_value matches either the county or the town. If it matches the town, it also checks to see if the county dropdown option matches the county. This is for towns with the same names in different counties.
                    if ((btn_value == d.status.toUpperCase())) {
                        //Initializes the variable where all of the html will be appended
                        var gridsquares = '<div class="element-item">'
                        gridsquares += "<h2 class='town_name'>" + d.dispensary_name + "</h2><div class='category " + d.status + "''>" + d.status + "</div><div id='infobox'><table class='muni_elex'><td class='notes'>" + d.location + "</td></tr><td class='name clinton'><a href='" + d.status + "' target='_blank'>" + test_hyperlink(d.status) + "</a></td><td></table>"
                        gridsquares += '</div>'
                        thegrid.append(gridsquares)
                        //Send the height to Pym after all images are loaded (important for Pym!)

                        thegrid.imagesLoaded(function() {
                            pymChild.sendHeight();
                        });
                    }
                    // Update all dropdown menus after changes
                })
            }
        };


        var legend_width = 250,
            divisions = 8;


        // var svg2 = d3.select("#legend").append("svg")
        // var legend = svg2.append("g").attr("transform", "translate(5,25)")

        // var EqualColor = "#f7f7f7",
        //       TrumpColorMax = "#a50f15",
        //       ClintonColorMax = "#08519c";
        //       var PercentMax = 55;
        //       var PercentMin = -55;


        //  var TrumpColor = d3.scale.linear()
        //         .range([EqualColor, TrumpColorMax])
        //         .domain([0,PercentMax])
        //         .interpolate(d3.interpolateLab);

        // var ClintonColor = d3.scale.linear()
        //     .range([EqualColor, ClintonColorMax])
        //     .domain([0,PercentMax])
        //     .interpolate(d3.interpolateLab);

        //         var fakeData = [];
        //     var rectWidth = Math.floor(legend_width / divisions);
        //     for (var i=0; i < legend_width; i+= rectWidth ) {
        //         fakeData.push(i);
        //     }


        //     var ClintonScaleLegend = d3.scale.linear()
        //           .domain([0, fakeData.length-1])
        //           .interpolate(d3.interpolateLab)
        //           .range([EqualColor, ClintonColorMax]);
        //     var ClintonLegend = legend.append("g").attr("class", "ClintonLegend");

        //     ClintonLegend.selectAll("rect")
        //         .data(fakeData)
        //         .enter()
        //         .append("rect")
        //             .attr("x", function(d) { return d; })
        //             .attr("y", 10)
        //             .attr("height", 10)
        //             .attr("width", rectWidth)
        //             .attr("fill", function(d, i) { return ClintonScaleLegend(i)});

        //     legend.append("text").text("DIFFERENCE 2012 vs. 2016").attr("transform", "translate("+legend_width/3+",60)").style('font-weight', 'bold');
        //     legend.append("text").text("CLINTON/BUONO").attr("transform", "translate("+(0)+",0)");
        //     legend.append("text").text(function(){return "+0%";}).attr("transform","translate(0,35)");
        //     legend.append("text").text(function(){return "+" + (PercentMax*1).toFixed(0) + "%";}).attr("transform","translate("+(legend_width)+",35)");


        var DemColor = d3.scale.quantize()
            .domain([-20, 20])
            .range(["#762a83", "#af8dc3", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#7fbf7b", "#1b7837"]);


        // var legend = d3.select('#legend')
        //     .append('ul')
        //     .attr('class', 'list-inline');

        // var keys = legend.selectAll('li.key')
        //     .data(DemColor.range());

        // //when is this going to over
        // //Let me know 

        // keys.enter().append('li')
        //     .attr('class', 'key')
        //     .style('border-top-color', String)
        //     .text(function(d) {
        //         var r = DemColor.invertExtent(d);
        //         return d3.round(r[0]) + "%";
        //     });


        $(".waiting").remove();

        collection = topojson.feature(us, us.objects.nj_munis_2)

        var transform = d3.geo.transform({
                point: projectPoint
            }),
            path = d3.geo.path().projection(transform);
        var feature = g.selectAll("path")
            .data(collection.features)
            .enter().append("path")
            .attr('style', 'pointer-events:visiblePainted;') // WORKAROUND: required for leaflet 1.0.0-rc1
            .style("stroke", "#000")
            .style("stroke-opacity", 0.5)
            .style("stroke-width", 0.3)
            .attr('class', 'njmunis')
            .attr('id', function(d) {
                return d.properties.CENSUS2010;
            })
            .attr('d', path)
            // .on("mouseover", mousemove)
            // .on("mousemove", mousemove)
            // .on("click", mousemove)
    // var pointsGroup = L.layerGroup();
    // data.forEach(function(d){
    //   latlng = [d.lat, d.lng]
    //     // binding data to marker object's option
    //     L.marker(latlng, { achieve: d.status })
    //         .on("mouseover", mousemove)
    //         .addTo(pointsGroup);
    // });

    // pointsGroup.addTo(map);

// This parses the lat/lang of the data for Leaflet to read
data.forEach(function(d) {
    d.LatLng = new L.LatLng(parseFloat(d.lat),
                            parseFloat(d.lng))
})

// Creating the points 
var points = g.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .style("stroke", "black")  
        .style("opacity", 1) 
        .style("fill", function(d){
            if (d.status.toUpperCase() == 'OPEN') {
                return '#55951b'
            } else {
                return '#80CED7';
            }
        })
        .style('z-index', 750)
        .attr("r", 5)
        .on('click', mousemove)

// Moves the points to correspond to Leaflet's latlang spot
map.on("moveend", update);
update();

        function update() {
            points.attr("transform", 
            function(d) { 
                return "translate("+ 
                    map.latLngToLayerPoint(d.LatLng).x +","+ 
                    map.latLngToLayerPoint(d.LatLng).y +")";
                }
            )
        }


        // .on("mouseout", function(d) { 

        // feature.style({
        //          'stroke-opacity': 0.6,
        //          'stroke': '#444',
        //          "stroke-width": 0.5
        //      });  
        //   div.style("opacity", 0)
        // });


        map.on("moveend", reset);
        reset();

        function reset() {
            var bounds = path.bounds(collection),
                topLeft = bounds[0],
                bottomRight = bounds[1];
            svg.attr("width", bottomRight[0] - topLeft[0])
                .attr("height", bottomRight[1] - topLeft[1])
                .style("left", topLeft[0] + "px")
                .style("top", topLeft[1] + "px");
            g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
            feature.attr("d", path);
        }

        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

        div.html("<h2>Click for more info</h2>")

        feature.style("fill", "#f5f5f5")

        // feature.style("fill", function(d) {



        //         if (category[d.id] == 'YES') {
        //             return '#55951b'
        //         } else if (category[d.id] == 'NO') {
        //             return '#05668D'
        //         } else if (category[d.id] == 'ACTIVE') {
        //             return '#80CED7'
        //         } else {
        //             return '#f5f5f5'
        //         }

        //         // return DemColor(sen_dem[d.id] - sen_dem_2012[d.id])


        //     })
        //     .style('stroke', function (d){
        //         if (dispensary[d.id] == 'Open') {
        //             return '#000'
        //         } else {
        //             return '#000'
        //         }
        //     })
        //     .style("stroke-opacity", 0.5)
        //     .style('stroke-width', function (d){
        //         if (dispensary[d.id] == 'Open') {
        //             return 3
        //         } else {
        //             return 0.4
        //         }
        //     })
        function mousemove(d) {
            console.log(d)

            // feature.style({
            //     'stroke-opacity': 0.6,
            //     'stroke': '#444',
            //     "stroke-width": 0.5
            // })


            d3.select(this.parentNode.appendChild(this))
                // .style({
                //     'stroke-opacity': 1,
                //     'stroke': '#5C5C5C',
                //     "stroke-width": 1.5
                // });
            div.style("opacity", .95)
                // .attr('style', 'pointer-events:visiblePainted;')
                .style('z-index', 1000)
            div.html("<h2 class='town_name'>" + d.dispensary_name + "</h2><div class='category " + d.status + "''>" + d.status + "</div><div id='infobox'><table class='muni_elex'><td class='notes'>" + d.location + "</td></tr><td class='name clinton'><a href='" + d.status + "' target='_blank'>" + test_hyperlink(d.status) + "</a></td><td></table>")
            // div
            //    .style("left", (mobileoffset(d3.event.pageX) + 10) + "px")
            //    .style("z-index", 1400)
            //    .style("top", (d3.event.pageY) + "px");


            function mobileoffset(d) {

                var xoff = winwidth - d;
                var xper = xoff / winwidth;


                if (winwidth < 400 && xper < 0.55) {

                    return d - winwidth / 2;
                } else {
                    return d;
                }

            }
        }




        function mobileoffset(d) {

            var xoff = winwidth - d;

            var xper2 = xoff / winwidth;


            var xper = 1 - xper2

            if (xper > 0.50) {


                return -175;
            } else if (xper <= 0.50) {
                return -10;
            }

        }

        d3.select("#Open-button").on("click", function() {
            console.log('this')
            points
                .transition()
                .style("fill", function(d) {
                    if (d.status.toUpperCase() == 'OPEN') {
                        return '#55951b'
                    } else {
                        return "rgba(255,255,255, 0.2)"
                    }
                })
        });

        d3.select("#No-button").on("click", function() {
            points
                .transition()
                .style("fill", function(d) {
                    if (d.status.toUpperCase() == 'PENDING') {
                        return '#05668D'
                    } else {
                        return "rgba(255,255,255, 0.2)"
                    }
                })
        });
        d3.select("#Pending-button").on("click", function() {
            points
                .transition()
                .style("fill", function(d) {
                    if (d.status == 'PENDING') {
                        return '#80CED7'
                    } else {
                        return "rgba(255,255,255, 0.2)"
                    }

                })
        });
        d3.select("#Reset-button").on("click", function() {
            points
                .transition()
                .style("fill", function(d) {
                     if (d.status.toUpperCase() == 'OPEN') {
                                    return '#55951b'
                                } else {
                                    return '#80CED7';
                                }                
                })
        });




        var pymChild = new pym.Child();

        pymChild.sendHeight();
    }

function test_hyperlink(link) {
    if (link =='N/A') {
        return ''
    } else {
        return 'Read more'
    }
}


    //d3 code stolen from http://bost.ocks.org/mike/leaflet/#init




});