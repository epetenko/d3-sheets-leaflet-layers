var geoJsonObject;

var pymChild = null;


var spreadsheet_id = "1epS-gwFJNrQ3oYFvUlcX8vNu6xifXWnFvFxM-LPKj54"

var dem_cand = "MENENDEZ";

var rep_cand = "HUGIN";

var csv_file = "data/2018 TOWN BY TOWN ELECTION SENATE RESULTS (Responses) - Ultimate Map.csv"




$(document).ready(function() {



// Dropdown Function Pt. 1

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

    // Create the D3 map on leaflet

    var winwidth = parseInt(d3.select('#mapcanvas').style('width'))
    var winheight = parseInt(d3.select('#mapcanvas').style('height'))


    var mobile_threshold = 450;




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
        minZoom: isMobile ? 6.5 : 5.5,
        scrollWheelZoom: false
    });




    var osm = new L.TileLayer('');
    map.setView(new L.LatLng(40.560, -74.4057), isMobile ? 7.5 : 8.5);
    map.addLayer(osm);
    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
        g = svg.append("g").attr("class", "leaflet-zoom-hide");


    // The tooltip
    var div = d3.select("#mapcanvas").append("div")
        .attr("class", "tooltip")
        .html("<h3>Loading...</h3>")
        .style("top", "0px")
        .style("left", winwidth - 180 + "px")


    var usedNames = [];

    $('#town1').hide();




    // Queue up the json and csv files
    queue()
        .defer(d3.json, "js/nj_munis.json")
        .defer(d3.csv, csv_file)
        // .defer(d3.csv, "https://docs.google.com/spreadsheets/d/" + spreadsheet_id + "/export?format=csv&gid=811830641")
        .await(makemap);




    // Run function to create map   
    function makemap(error, us, data) {

        var sen_dem = {};
        var sen_rep = {};
        var others = {};

        var muni_code = {};

        var town_name = {};

        var dem_per = {};

        var rep_per = {};
        var others_per = {};
        var margin_vic = {};
        var the_winner = {};

        var total_votes = {};




        data.forEach(function(d) {



            sen_dem[d.MUNI_CODE] = +d.sen_dem;
            dem_per[d.MUNI_CODE] = +d.sen_dem_per;
            sen_rep[d.MUNI_CODE] = +d.sen_rep;
            rep_per[d.MUNI_CODE] = +d.sen_rep_per;
            others[d.MUNI_CODE] = +d.others_total;
            others_per[d.MUNI_CODE] = +d.others_per;
            margin_vic[d.MUNI_CODE] = +d.margin_victory;
            the_winner[d.MUNI_CODE] = d.winner;
            muni_code[d.MUNI_CODE] = d.muni_code;
            town_name[d.MUNI_CODE] = d.Municipality;
            total_votes[d.MUNI_CODE] = d.total_votes;




            if (usedNames.indexOf(d.County) == -1) {
                var option = $('<option value="' + d.County + '">' + d.County + '</option>');

                dropdown_county1.append(option);
                usedNames.push(d.County);

            }




        });


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

        dropdown_county1.trigger("chosen:updated");


        dropdown_county1.chosen().on('chosen:showing_dropdown', function() {

            pymChild = new pym.Child();



        });

        dropdown_county1.on('change', function(e, params) {

            grid.html("")

            //Make town and right-side county options appear
            $('#town1').show();

            //Empty any previous town options
            dropdown_town1.empty();
            var emptyoption = $('<option value=""></option>');
            dropdown_town1.append(emptyoption).trigger('chosen:updated')

            //Fetches the county picked from the left-side county dropdown
            county1value = e.target.value;



            //Initiates populate_cards function
            populate_towns(county1value, dropdown_town1)




        });


        dropdown_town1.on('change', function(e, params) {

            //Fetches the town picked from the left-side town dropdown
            town1value = e.target.value;

            //Initiates populate_cards function
            populate_cards(town1value, grid, dropdown_town1, county1value)


        })

        function populate_towns(btn_value, thedropdown) {

            //A loop that goes through the entry array created earlier 
            data.forEach(function(d) {

                if (btn_value == d.County) {


                    // Add all towns in the picked county into the town dropdown



                    var townoption = $('<option value="' + d.Municipality + '">' + d.Municipality + '</option>');

                    thedropdown.append(townoption);



                }


                // Update all dropdown menus after changes

                dropdown_town1.trigger("chosen:updated");

            })

        }

        function populate_cards(btn_value, thegrid, thedropdown, countyvalue) {



            //A loop that goes through the entry array created earlier 
            data.forEach(function(d) {

                $("path#" + d.MUNI_CODE + ".njmunis").css({
                    'stroke-opacity': 0.6,
                    'stroke': '#595858',
                    "stroke-width": 0.3
                })

                div.style("opacity", 0)




                //Goes through every row and sees if the btn_value matches either the county or the town. If it matches the town, it also checks to see if the county dropdown option matches the county. This is for towns with the same names in different counties.  
                if ((countyvalue == d.County && btn_value == d.Municipality)) {

                    map.setView(new L.LatLng(d.lat, d.lng), 9);

                    $("path#" + d.MUNI_CODE + ".njmunis").css({
                        'stroke-opacity': 1,
                        'stroke': '#444',
                        "stroke-width": 2
                    })




                    //Initializes the variable where all of the html will be appended
                    var gridsquares = '<div class="element-item">'


                    // Name of county/town and Margin of Error text


                    // First Section

                    gridsquares += "<h2 class='" + d.winner + "'>" + d.Municipality + "</h2>"

                    if (d.winner == 'sen_rep') {
                        gridsquares += "<div id='infobox'><div id='winner' style='color:#67000d'><img src='img/republican-candidate-wins.png'></div> <div id='margin'><span>+" + round_num(parseFloat(d.margin_victory)) + "%</span><br>margin of victory</div>"

                        gridsquares += "<table class='muni_grid'><tr><th></th><th></th><th></th></tr><tr><td class='name democrat'>" + dem_cand + " </td><td>" + round_num(parseFloat(d.sen_dem_per)) + "%</td><td>" + addCommas(d.sen_dem) + " votes</td></tr><tr><td class='name republican won'>" + rep_cand + "  &#10003;</td><td class='republican'>" + round_num(parseFloat(d.sen_rep_per)) + "%</td><td class='republican'>" + addCommas(d.sen_rep) + " votes</td></tr><tr><td class='name others'>OTHERS</td><td>" + round_num(parseFloat(d.others_per)) + "%</td><td>" + addCommas(d.others_total) + " votes</td></tr></table><p>TOTAL VOTES: " + addCommas(d.total_votes) + "</p>"
                    } else if (d.winner == 'sen_dem' && d.margin_victory != 0) {

                        gridsquares += "<div id='infobox'><div id='winner' style='color:#08306b'><img src='img/democratic-candidate-wins.png'></div> <div id='margin'><span>+" + round_num(parseFloat(d.margin_victory)) + "%</span><br>margin of victory</div>"

                        gridsquares += "<div id='infobox'><table class='muni_grid'><tr><th></th><th></th><th></th></tr><tr><td class='name democrat won'>" + dem_cand + "  &#10003;</td><td>" + round_num(parseFloat(d.sen_dem_per)) + "%</td><td>" + addCommas(d.sen_dem) + " votes</td></tr><tr><td class='name republican'>" + rep_cand + " </td><td class='republican'>" + round_num(parseFloat(d.sen_rep_per)) + "%</td><td class='republican'>" + addCommas(d.sen_rep) + " votes</td></tr><tr><td class='name others'>OTHERS</td><td>" + round_num(parseFloat(d.others_per)) + "%</td><td>" + addCommas(d.others_total) + " votes</td></tr></table><p>TOTAL VOTES: " + addCommas(d.total_votes) + "</p>"

                    } else if (d.winner == 'tie' && d.margin_victory == 0) {

                        gridsquares += "IT'S A TIE!"

                        gridsquares += "<div id='infobox'><table class='muni_grid'><tr><th></th><th></th><th></th></tr><tr><td class='name democrat'>" + dem_cand + " </td><td>" + round_num(parseFloat(d.sen_dem_per)) + "%</td><td>" + addCommas(d.sen_dem) + " votes</td></tr><tr><td class='name republican'>" + rep_cand + "</td><td class='republican'>" + round_num(parseFloat(d.sen_rep_per)) + "%</td><td class='republican'>" + addCommas(d.sen_rep) + " votes</td></tr><tr><td class='name others'>OTHERS</td><td>" + round_num(parseFloat(d.others_per)) + "%</td><td>" + addCommas(d.others_total) + " votes</td></tr></table><p>TOTAL VOTES: " + addCommas(d.total_votes) + "</p>"


                    }


                    gridsquares += '</div>'

                    //Add all card sections into the grid

                    thegrid.html(gridsquares);

                    //Send the height to Pym after all images are loaded (important for Pym!)

                    thegrid.imagesLoaded(function() {
                        pymChild.sendHeight();
                    });




                }


                // Update all dropdown menus after changes

                dropdown_county1.trigger('chosen:updated');

            })

        }


        //Create the legend
        var legend_width = 250,
            divisions = 8;


        var svgleg = d3.select("#legend").append("svg")
        var legend = svgleg.append("g").attr("transform", "translate(5,25)")


        var EqualColor = "#f7f7f7",
            republicanColorMax = "#a50f15",
            democratColorMax = "#08519c";
        PercentMax = 55;

        // Create the color scales for both map and legend
        var republicanColor = d3.scale.linear()
            .range([EqualColor, republicanColorMax])
            .domain([0, PercentMax])
            .interpolate(d3.interpolateLab);
        var democratColor = d3.scale.linear()
            .range([EqualColor, democratColorMax])
            .domain([0, PercentMax])
            .interpolate(d3.interpolateLab);

        var fakeData = [];
        var rectWidth = Math.floor(legend_width / divisions);


        for (var i = 0; i < legend_width / 2; i += rectWidth) {
            fakeData.push(i);
        }


        var republicanScaleLegend = d3.scale.linear()
            .domain([0, fakeData.length - 1])
            .interpolate(d3.interpolateLab)
            .range([EqualColor, republicanColorMax]);
        var democratScaleLegend = d3.scale.linear()
            .domain([fakeData.length - 1, 0])
            .interpolate(d3.interpolateLab)
            .range([EqualColor, democratColorMax]);

        var republicanLegend = legend.append("g").attr("class", "republicanLegend").attr("transform", "translate(" + (legend_width / 2) + ",0)");
        var democratLegend = legend.append("g").attr("class", "democratLegend");



        republicanLegend.selectAll("rect")
            .data(fakeData)
            .enter()
            .append("rect")
            .attr("x", function(d) {
                return d;
            })
            .attr("y", 10)
            .attr("height", 10)
            .attr("width", rectWidth)
            .attr("fill", function(d, i) {
                return republicanScaleLegend(i)
            });

        democratLegend.selectAll("rect")
            .data(fakeData)
            .enter()
            .append("rect")
            .attr("x", function(d) {
                return d;
            })
            .attr("y", 10)
            .attr("height", 10)
            .attr("width", rectWidth)
            .attr("fill", function(d, i) {
                return democratScaleLegend(i)
            });

        legend.append("text").text("MARGIN OF VICTORY").attr("transform", "translate(" + legend_width / 3 + ",60)").style('font-weight', 'bold');
        legend.append("text").text(dem_cand).attr("transform", "translate(" + (0) + ",0)");
        legend.append("text").text(rep_cand).attr("transform", "translate(" + (legend_width - 25) + ",0)");
        legend.append("text").text(function() {
            return "0%";
        }).attr("transform", "translate(" + (legend_width / 2) + ",35)");
        legend.append("text").text(function() {
            return "+" + (PercentMax * 1).toFixed(0) + "%";
        }).attr("transform", "translate(0,35)");
        legend.append("text").text(function() {
            return "+" + (PercentMax * 1).toFixed(0) + "%";
        }).attr("transform", "translate(" + (legend_width) + ",35)");




        //Remove the hourglass animation
        $(".waiting").remove();




        //Call in the shapefile
        collection = topojson.feature(us, us.objects.nj_munis)


        var transform = d3.geo.transform({
                point: projectPoint
            }),
            path = d3.geo.path().projection(transform);
        path2 = d3.geo.path().projection(transform);
        var feature = g.selectAll("path")
            .data(collection.features)
            .enter().append("path")
            .attr('class', 'njmunis')
            .attr('id', function(d) {
                return d.properties.mun_code;
            })
            .attr('d', path)
            .on("mouseover", mousemove)
            .on("mousemove", mousemove)
            .on("click", mousemove)
            .on("mouseout", function(d) {

                feature.style({
                    'stroke-opacity': 0.6,
                    'stroke': '#595858',
                    "stroke-width": 0.3
                });
                div.style("opacity", 0)
            });




        // Reset the map when panning and zooming
        map.on("viewreset", reset);
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



        // Add the default loading tooltip

        div.html("<h3>Hover over for more info</h3>")



        // Change the color based on winners and votes
        feature.style("fill", function(d) {


                if (the_winner[d.id] == 'sen_rep' && margin_vic[d.id] != 0) {

                    return republicanColor(margin_vic[d.id])

                } else if (the_winner[d.id] == 'sen_dem' && margin_vic[d.id] != 0) {

                    return democratColor(margin_vic[d.id])

                } else if (the_winner[d.id] == 'tie' && margin_vic[d.id] == 0) {



                    return "#FFF";
                } else if (the_winner[d.id] == 'none') {



                    return "#333";
                }

            })
            .style("stroke", "#595858")
            .style("stroke-opacity", 0.6)
            .style("stroke-width", 0.3)
            .style("fill-opacity", 0.88)


        function mousemove(d) {

            feature.style({
                'stroke-opacity': 0.6,
                'stroke': '#595858',
                "stroke-width": 0.3
            })

            var coords = d3.mouse(this);




            d3.select(this.parentNode.appendChild(this))
                .style({
                    'stroke-opacity': 1,
                    'stroke': '#5C5C5C',
                    "stroke-width": 1.5
                });
            div.style("opacity", .95)
                .style("left", d3.event.pageX + mobileoffset(d3.event.pageX) + "px")
                .style("z-index", 1400)
                .style("top", d3.event.pageY + mobileoffset_y(d3.event.pageY) + "px")
                .html("<h2 class='" + the_winner[d.id] + "'>" + town_name[d.id] + "</h2><div id='infobox'><table class='muni_elex'><tr><th></th><th></th><th></th></tr><tr><td class='name democrat'>" + dem_cand + "</td><td>" + dem_per[d.id].toFixed(1) + "%</td><td>" + sen_dem[d.id].toLocaleString() + " votes</td></tr><tr><td class='name republican'>" + rep_cand + "</td><td class='republican'>" + rep_per[d.id].toFixed(1) + "%</td><td class='republican'>" + sen_rep[d.id].toLocaleString() + " votes</td></tr><tr><td class='name others'>OTHERS</td><td>" + others_per[d.id].toFixed(1) + "%</td><td>" + others[d.id].toLocaleString() + " votes</td></tr></table>")




            function mobileoffset_y(d) {


                var xoff = winheight - (d);


                var xper2 = xoff / winheight;

                var xper = 1 - xper2

                if (xper > 0.50) {


                    return -195;
                } else if (xper <= 0.50) {
                    return -30;

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




            if (the_winner[d.id] == 'sen_rep') {
                div.selectAll(".name").filter('.republican')
                    .html(rep_cand + " &#10003;")
                    .style({
                        'color': '#67000d'
                    })
            } else if (the_winner[d.id] == 'sen_dem' && margin_vic[d.id] != 0) {

                div.selectAll(".name").filter('.democrat')
                    .html(dem_cand + "&#10003;")
                    .style({
                        'color': '#08306b'
                    })

            } else if (the_winner[d.id] == 'tie' && margin_vic[d.id] == 0) {




            }



        }

        pymChild = new pym.Child();


    }




});