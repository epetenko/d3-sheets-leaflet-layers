# d3-sheets-leaflet-layers
A blend of d3 and leaflet with a back layer, powered by Google Sheets.

Just some code to add a Leaflet tile layer to bind to a D3 map, roughly based on [Mike Bostock's](https://bost.ocks.org/mike/leaflet/#init) tutorial but with a few fixes for the latest leaflet. Also, powered by Google Sheets, so [live-updating!](https://www.nj.com/news/2019/06/more-and-more-nj-towns-are-banning-plastic-bags-check-out-the-growing-list.html) You can also [feed a Google Form into the map](https://www.nj.com/news/2019/06/what-shore-beach-has-the-most-bennies-vote-and-see-our-live-map-of-the-results.html).

Two options here:
- Weed_map.js: Shaded (choropleth) map with options to color by a number or by a category. See example spreadsheet [here](https://docs.google.com/spreadsheets/d/1wLGxm54vkX2SZ27mIyk77AIMZQQ4QDpsS6E-UwvM2zw/edit?usp=sharing). 
- dispensaries.js: A point-level map based on lat/long. See example spreadsheet [here](https://docs.google.com/spreadsheets/d/1t0wiDRMaqLwCdSWAKMbUTTALJfrS5xHivxrC8gC70lI/edit?usp=sharing).

How this works:
In this code, you create a Leaflet map and bind it to an SVG. You use `queue` to read in a CSV with an FIPS ID code, convert some columns, and bind it to the dropdown menu. You use `d3.range()` to create a color scale and legend if desired. Then you read in a TopoJSON of New Jersey geography, use some D3 projection trickery to bind it to the Leaflet map, and shade it based on lining up the TopoJSON's FIPS id with the CSV's. You add a tooltip on mouseover and adjust it to mobile view. Then you can optionally add buttons to filter down to a single category with `d3.on("click")`. 

Basic to-dos for these maps:
- For shaded map, you will need a csv with the Census county subdivision (town) FIPS code already worked in. 
- For point map, you will need a csv with lat and long in separate columns.
- The main things you'll need to change are the variables, the color range, the dropdown results and the tooltips. You may want to change or comment out the button options as well.
- Your shapefile/TopoJSON for municipal level shaded maps is already in here. You're connecting the results on the ID field.
- This only works with D3v3 due to changes to the Leaflet mess.



