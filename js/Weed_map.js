var geoJsonObject;

var pymChild = null;

$(document).ready(function() {

// Getting today's date if you want to say "As of..." 
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
// setting variables for the dropdown
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

// Some variables to set the width/height of the map
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

// Leaflet Pt. 1 -- creating the map, pulling the Carto tilelayer and labels, and setting the viewpoint
    map = new L.Map('mapcanvas', {
        attributionControl: false,
        // minZoom: isMobile? 6.5:5.5,
        scrollWheelZoom: false
    });
    map.createPane('labels');
    map.getPane('labels').style.zIndex = 650;
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

// This is the ID you could use if you have a latlong spreadsheet
    var points_id = '1mAkQ0pXLmhNSYpgDsO-ruypLhAs3Hm4cZ6T-2wDQmII'
// This is the ID you use if you have a town-by-town spreadsheet
    var spreadsheet_id = "1ii8TBGiR6PxugVt7kzMt8EZvqOgctzsBV6-aMRs5a9c"

// D3 append SVG to start
    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");

    // The tooltip
    var div = d3.select("#mapcanvas").append("div")
        .attr("class", "tooltip")
        .html("<h2>Loading...</h2>")
        .style("top", "0px")
        .style("left", winwidth - 180 + "px")

// queue for the town-by-town data
    queue()
        .defer(d3.json, "js/nj_munis_2.json")
        .defer(d3.csv, "https://docs.google.com/spreadsheets/d/" + spreadsheet_id + "/export?format=csv")
        .await(ready);




    function ready(error, us, data) {

// Need to read in the variables and make them into numbers in some cases
        var category = {};
        var notes = {};
        var hyperlink = {};
        var declared_date = {};
        var test = {};
        var census2010 = {};
        var town_name = {};
        var county = {};
        var just_town = {};
        var dispensary = {};


        data.forEach(function(d) {
            census2010[d.census2010] = +d.census2010;
            category[d.census2010] = d.category.toUpperCase();
            notes[d.census2010] = d.notes;
            hyperlink[d.census2010] = d.hyperlink;
            declared_date[d.census2010] = d.declared_date;
            test[d.census2010] = d.test;
            town_name[d.census2010] = d.town_name;
            county[d.census2010] = d.county;
            just_town[d.census2010] = d.just_town;
            dispensary[d.census2010] = d.dispensary;

        });


        // var max = d3.max(data, function(d) { return d.sen_dem; } );
        // var min = d3.min(data, function(d) { return d.sen_dem; } );


// some number formatting functions
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



        // Dropdown Function Pt. 2 - how much of this you want to use depends on whether you want a county/town level that Carla originally had.

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

        //This specifically creates the cards that pop up for each area:
        function populate_cards(btn_value, thegrid, thedropdown) {
            // The option to reveal all cards -- will reveal unless the category is specifically set to N/A
            if (btn_value == 'Show_all') {
                data.forEach(function(d) {
                    if (d.category != 'N/A') {
                        var gridsquares = '<div class="element-item">'
                        gridsquares += "<h2 class='town_name'>" + d.just_town + "</h2><h3 class='county'>" + d.county + "</h3><div class='category " + d.category + "''>" + d.category + "</div><div id='infobox'><table class='muni_elex'><td class='notes'>" + d.notes + "</td></tr><td class='name clinton'><a href='" + d.hyperlink + "' target='_blank'>Read more</a></td><td></table>"
                        thegrid.append(gridsquares)
                    }
                     thegrid.imagesLoaded(function() {
                        console.log('this')
                            pymChild.sendHeight();
                        });
                })
            } else {
                //A loop that goes through the entry array created earlier 
                data.forEach(function(d) {
                    // $("path#" + d.census2010 + ".njmunis").css({
                    //     'stroke-opacity': 0.6,
                    //     'stroke': '#595858',
                    //     "stroke-width": 0.3
                    // })
                    div.style("opacity", 0)
                    //Goes through every row and sees if the btn_value matches either the county or the town. If it matches the town, it also checks to see if the county dropdown option matches the county. This is for towns with the same names in different counties.
                    if ((btn_value == d.category.toUpperCase())) {
                        //Initializes the variable where all of the html will be appended
                        var gridsquares = '<div class="element-item">'
                        gridsquares += "<h2 class='town_name'>" + d.just_town + "</h2><h3 class='county'>" + d.county + "</h3><div class='category " + d.category + "''>" + d.category + "</div><div id='infobox'><table class='muni_elex'><td class='notes'>" + d.notes + "</td></tr><td class='name clinton'><a href='" + d.hyperlink + "' target='_blank'>" + test_hyperlink(d.hyperlink) + " </a></td><td></table>"
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

// This is an optional variable to set the color for a quantitative variable. To use this set fill to DemColor(d.whatever);
        var DemColor = d3.scale.quantize()
            .domain([-20, 20])
            .range(["#762a83", "#af8dc3", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#7fbf7b", "#1b7837"]);

// optional - create a legend with those colors - 
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
// All this adds in the shapefiles for the town-by-town data. Can be re-jiggered to do county instead. 
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
            .style("stroke-width", 0.4)
            .attr('class', 'njmunis')
            .attr('id', function(d) {
                return d.properties.CENSUS2010;
            })
            .attr('d', path)
            // .on("mouseover", mousemove)
            // .on("mousemove", mousemove)
            .on("click", mousemove)
        // .on("mouseout", function(d) { 

// Leaflet pt. 2 - This ensures both Leaflet and D3 update when the map is moved.
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


// A test for qualitative color categories -- this is where you would put the DemColor() if you have quantitative categories.
        feature.style("fill", function(d) {
                if (category[d.id] == 'YES') {
                    return '#55951b'
                } else if (category[d.id] == 'NO') {
                    return '#05668D'
                } else if (category[d.id] == 'ACTIVE') {
                    return '#80CED7'
                } else {
                    return '#f5f5f5'
                }

                // return DemColor(sen_dem[d.id] - sen_dem_2012[d.id])

            })
            .style('stroke', function (d){
                if (dispensary[d.id] == 'Current') {
                    return '#000'
                } else {
                    return '#000'
                }
            })
            .style("stroke-opacity", 0.5)
            .style('stroke-width', function (d){
                if (dispensary[d.id] == 'Current') {
                    return 3
                } else {
                    return 0.4
                }
            })

// Function to handle mouseover and tooltips
        function mousemove(d) {
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
// The tooltip text
            div.html("<h2 class='town_name'>" + just_town[d.id] + "</h2><h3 class='county'>" + county[d.id] + "</h3><div class='category " + category[d.id] + "''>" + category[d.id] + "</div><div id='infobox'><table class='muni_elex'><td class='notes'>" + notes[d.id] + "</td></tr><td class='name clinton'><a href='" + hyperlink[d.id] + "' target='_blank'>" + test_hyperlink(hyperlink[d.id]) + "</a></td><td></table>")
            // div
            //    .style("left", (mobileoffset(d3.event.pageX) + 10) + "px")
            //    .style("z-index", 1400)
            //    .style("top", (d3.event.pageY) + "px");

// Functions to test the mobile width to see what side of your finger the tooltip appears on
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

// Filter buttons to only show positive towns
        d3.select("#Yes-button").on("click", function() {
            console.log('this')
            feature
                .transition()
                .style("fill", function(d) {
                    if (category[d.id] == 'YES') {
                        return '#55951b'
                    } else {
                        return '#fff'
                    }
                })
        });
        d3.select("#No-button").on("click", function() {
            feature
                .transition()
                .style("fill", function(d) {
                    if (category[d.id] == 'NO') {
                        return '#05668D'
                    } else {
                        return '#fff'
                    }
                })
        });
        d3.select("#Active-button").on("click", function() {
            feature
                .transition()
                .style("fill", function(d) {
                    if (category[d.id] == 'ACTIVE') {
                        return '#80CED7'
                    } else {
                        return '#fff'
                    }

                })
        });
        d3.select("#Reset-button").on("click", function() {
            feature
                .transition()
                .style("fill", function(d) {
                    if (category[d.id] == 'YES') {
                        return '#55951b'
                    } else if (category[d.id] == 'NO') {
                        return '#05668D'
                    } else if (category[d.id] == 'ACTIVE') {
                        return '#80CED7'
                    } else {
                        return '#fff'
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