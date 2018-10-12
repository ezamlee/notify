var map, markers = {}, tile_layer, layers = {}, marker, unitID, unitEventID, polyline, mapWaypts = []; // global variables

// Print message to log
function msg(text) { $("#log").prepend(text + "<br/>"); }

function init() { // Execute after login succeed
	var sess = wialon.core.Session.getInstance(), // get instance of current Session
		flags = wialon.item.Item.dataFlag.base | wialon.item.Unit.dataFlag.lastMessage, // specify what kind of data should be returned
		renderer = wialon.core.Session.getInstance().getRenderer();
	
	renderer.addListener("changeVersion", update_renderer);
	sess.loadLibrary("itemIcon"); // load Icon Library 
	
	sess.updateDataFlags( // load items to current session
	    [{type: "type", data: "avl_unit", flags: flags, mode: 0},{type: "type", data: "avl_resource", flags: flags, mode: 0}], // Items specification
	    function (code) { // updateDataFlags callback
		    if (code) { msg(wialon.core.Errors.getErrorText(code)); return; } // exit if error code

		    var units = sess.getItems("avl_unit"); // get loaded 'avl_resource's items
		    var users = sess.getItems("user"); // get loaded 'avl_resource's items
		    var geofences = sess.getItems("avl_resource"); // get loaded 'avl_resource's items

		    $('#unitsNo').text(units.length);
		    $('#usersNo').text(users.length);
		    $('#geofencesNo').text(geofences.length);
			
		    if (!units || !units.length){ msg("No units found"); return; } // check if units found
		    for (var i = 0; i< units.length; i++){ // construct Select list using found resources
			    $("#units").append("<option value='"+ units[i].getId() +"'>"+ units[i].getName()+ "</option>");
		    	$("#unit").append("<option value='"+ units[i].getId() +"'>"+ units[i].getName()+ "</option>");
			}
			$("#unit").change( showUnit );
			$("#build").click( show_track );  // bind action to select change event
			$("#tracks").on("click", ".close_btn", delete_track); //click, when need delete current track
			$("#tracks").on("click", ".unit", focus_track); //click, when need to see any track
	});
}



/*************************** unit trace ************************/


function showUnit(){ // show selected unit on map
	var val = $("#unit").val(); // get selected unit id
	if (!val) return; // exit if no unit selected
	var sess = wialon.core.Session.getInstance(); // get instance of current Session
	// specify what kind of data should be returned
	var flags = wialon.item.Unit.dataFlag.lastMessage;
	var unit = null;
	if (unitID) { // check if we already have previous unit
		unit = sess.getItem(unitID);
		sess.updateDataFlags( // remove previous item from current session
			[{type: "id", data: unitID, flags: flags, mode: 2}], // item specification
			function(code) {
				if (code) { msg(wialon.core.Errors.getErrorText(code)); return; }
			
				if (unitEventID) unit.removeListenerById(unitEventID); // unbinding event from this unit
		});
	}

	unitID = val;
	unitEventID = null; // empty event ID
	mapWaypts = []; // remove all old checkpoints if they were here

	sess.updateDataFlags( // load item with necessary flags to current session
		[{type: "id", data: unitID, flags: flags, mode: 1}], // item specification
		function(code) {
			if (code) { msg(wialon.core.Errors.getErrorText(code)); return; }

			unit = wialon.core.Session.getInstance().getItem(val); // get unit by id
			if(!unit) return; // exit if no unit
            var position = unit.getPosition(); // get unit position
			if (!position) return; // exit if no position 
			if (map) { // check if map created and we can detect position of unit

                var icon = L.icon({
                    iconUrl: unit.getIconUrl(32),
                    iconAnchor: [16, 16]
                });
                if (!marker) {
                    marker = L.marker({lat: position.y, lng: position.x}, {icon: icon}).addTo(map);
                } else {
                    marker.setLatLng({lat: position.y, lng: position.x});
                    marker.setIcon(icon);
                }
                map.setView({lat: position.y, lng: position.x});

                if (!polyline) {
                    polyline = L.polyline([{lat: position.y, lng: position.x}], {color: 'blue'}).addTo(map);
                }

//				if (polyline) polyline.setMap(null); // if there is alreday path of map - remove it
//				mapWaypts.push(latlon); // adding point to path array
			}

			msg("You chose unit: " + unit.getName());

			unitEventID = unit.addListener("messageRegistered", showData); // register event when we will receive message
	});
}

function showData(event) {
	var data = event.getData(); // get data from event
	
	if (!data.pos) return; // exit if no position 

	var appended = ''; // here we will put all required information
	var position = { // get unit position 
		x: data.pos.x,
		y: data.pos.y
	};
	appended += "Position (x: " + data.pos.x + "; y: " + data.pos.y +")"; // printing position
	if (data.t) appended += ", time " + wialon.util.DateTime.formatTime(data.t, 1); // printing event time (return user time)
	msg(appended); // writing to log message about this event

	if (map) { // check if map created

        marker.setLatLng({lat: position.y, lng: position.x});

        if (polyline) {
            polyline.addLatLng({lat: position.y, lng: position.x});
        }
        map.setView({lat: position.y, lng: position.x});

	}
}

/**************************end unit trace *********************/



function show_track () {
	var unit_id =  $("#units").val(),
		sess = wialon.core.Session.getInstance(), // get instance of current Session	
		renderer = sess.getRenderer(),
		cur_day = new Date(),
		from = Math.round(new Date(cur_day.getFullYear(), cur_day.getMonth(), cur_day.getDate()) / 1000), // get begin time - beginning of day
		to = from + 3600 * 24 - 1, // end of day in seconds
		unit = sess.getItem(unit_id), // get unit by id
		color = $("#color").val() || "ffffff"; // track color

		if (!unit) return; // exit if no unit

		// check the existence info in table of such track 
		if (document.getElementById(unit_id))
		{
			msg("You already have this track.");
			return;
		}
      
		var pos = unit.getPosition(); // get unit position
		if(!pos) return; // exit if no position

		// callback is performed, when messages are ready and layer is formed
		callback =  qx.lang.Function.bind(function(code, layer) {
			if (code) { msg(wialon.core.Errors.getErrorText(code)); return; } // exit if error code
			
			if (layer) { 
				var layer_bounds = layer.getBounds(); // fetch layer bounds
				if (!layer_bounds || layer_bounds.length != 4 || (!layer_bounds[0] && !layer_bounds[1] && !layer_bounds[2] && !layer_bounds[3])) // check all bounds terms
				    return;
				
				// if map existence, then add tile-layer and marker on it
				if (map) {
				   //prepare bounds object for map
				    var bounds = new L.LatLngBounds(
					L.latLng(layer_bounds[0],layer_bounds[1]),
					L.latLng(layer_bounds[2],layer_bounds[3])
				    );
				    map.fitBounds(bounds); // get center and zoom
				    // create tile-layer and specify the tile template
					if (!tile_layer)
						tile_layer = L.tileLayer(sess.getBaseUrl() + "/adfurl" + renderer.getVersion() + "/avl_render/{x}_{y}_{z}/"+ sess.getId() +".png", {zoomReverse: true, zoomOffset: -1}).addTo(map);
					else 
						tile_layer.setUrl(sess.getBaseUrl() + "/adfurl" + renderer.getVersion() + "/avl_render/{x}_{y}_{z}/"+ sess.getId() +".png");
				    // push this layer in global container
				    layers[unit_id] = layer;
				    // get icon
				    var icon = L.icon({ iconUrl: unit.getIconUrl(24) });
				    //create or get marker object and add icon in it
				    var marker = L.marker({lat: pos.y, lng: pos.x}, {icon: icon}).addTo(map);
				    
					marker.setLatLng({lat: pos.y, lng: pos.x}); // icon position on map
					marker.setIcon(icon); // set icon object in marker
					markers[unit_id] = marker;	    
				}
				// create row-string with data
				var row = "<tr id='" + unit_id + "'>";  
				// print message with information about selected unit and its position
				row += "<td class='unit'><img src='" + unit.getIconUrl(16) + "'/> " + unit.getName() + "</td>"; 
				row += "<td>Position " + pos.x + ", " + pos.y + "<br> Mileage " + layer.getMileage() + "</td>";
				row += "<td><p style='width:20px;height:20px;border: 1px solid #" + color + "'></p>     </td>";
				row += "<td class='btn btn-xs btn-danger close_btn'>x</td></tr>";
				//add info in table
				$("#tracks").append(row);
			}
	});
	// query params
	params = {
		"layerName": "route_unit_" + unit_id, // layer name
		"itemId": unit_id, // ID of unit which messages will be requested
		"timeFrom": from, //interval beginning
		"timeTo": to, // interval end
		"tripDetector": 0, //use trip detector: 0 - no, 1 - yes
		"trackColor": color, //track color in ARGB format (A - alpha channel or transparency level)
		"trackWidth": 5, // track line width in pixels
		"arrows": 0, //show course of movement arrows: 0 - no, 1 - yes
		"points": 1, // show points at places where messages were received: 0 - no, 1 - yes
		"pointColor": color, // points color
		"annotations": 0 //show annotations for points: 0 - no, 1 - yes
	};
	renderer.createMessagesLayer(params, callback);
}

function update_renderer () {
	var sess = wialon.core.Session.getInstance(),
		renderer = sess.getRenderer();
	if (tile_layer && tile_layer.setUrl)
		tile_layer.setUrl(sess.getBaseUrl() + "/adfurl" + renderer.getVersion() + "/avl_render/{x}_{y}_{z}/" + sess.getId() + ".png"); // update url-mask in tile-layer
}

function focus_track (evt) {
	var row = evt.target.parentNode, // get row with data by target parentNode
		unit_id = row.id; // get unit id from current row
	// get bounds for map
	if (layers && layers[unit_id])
		var bounds =  layers[unit_id].getBounds();
	if (bounds && map)
	{
		// create object with need params
		var map_bounds = new L.LatLngBounds(
			L.latLng(bounds[0],bounds[1]),
			L.latLng(bounds[2],bounds[3])
		);
		// set view in geting bounds
		map.fitBounds(map_bounds); // get center and zoom
	}
}

function delete_track (evt) {
	var row = evt.target.parentNode, // get row with data by target parentNode
		unit_id = row.id, // get unit id from current row
		sess = wialon.core.Session.getInstance(),
		renderer = sess.getRenderer();
	if (layers && layers[unit_id])
	{
		// delete layer from renderer
		renderer.removeLayer(layers[unit_id], function(code) { 
			if (code) 
				msg(wialon.core.Errors.getErrorText(code)); // exit if error code
			else 
				msg("Track removed."); // else send message, then ok
		});
		delete layers[unit_id]; // delete layer from container
	}
	// move marker behind bounds
	if (map)
		map.removeLayer(markers[unit_id]);
	delete markers[unit_id];
	// remove row from info table
	$(row).remove();
}

function init_map() {
    // create a map in the "map" div, set the view to a given place and zoom
    map = L.map('map').setView([53.9, 27.55], 10);
	var sess = wialon.core.Session.getInstance(); // get instance of current Session	
    // add WebGIS tile layer
	L.tileLayer(sess.getBaseGisUrl("render") + "/gis_render/{x}_{y}_{z}/" + sess.getCurrUser().getId() + "/tile.png", {
		zoomReverse: true, 
		zoomOffset: -1
	}).addTo(map);
}

// execute when DOM ready
$(document).ready(function () {

  	wialon.core.Session.getInstance().initSession("https://hst-api.wialon.com"); // init session
    // For more info about how to generate token check
    // http://sdk.wialon.com/playground/demo/app_auth_token
	wialon.core.Session.getInstance().loginToken("5dce19710a5e26ab8b7b8986cb3c49e58C291791B7F0A7AEB8AFBFCEED7DC03BC48FF5F8", "", // try to login
		function (code) { // login callback
		    // if error code - print error message
			if (code){ msg(wialon.core.Errors.getErrorText(code)); return; }
			msg("Logged successfully");
            init_map();
            init(); // when login suceed then run init() function
	});
})
