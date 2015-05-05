
function encodeURLParam(param) {
  return param.replace(new RegExp(' ', 'g'), "+");
}

function replaceCommas(param) {
  return param.replace(new RegExp(',', 'g'), "");
}

function MLSProperty(mls_number, sent_date, status, street_address, price, dom, bedrooms, bathrooms, squarefeet, lot_size, city, age, change_date, change_type) {
    this.sent_date = sent_date;
    this.mls_number = mls_number;
    this.status = status;
    this.street_address = street_address;
    this.price = price;
    this.dom = dom;
    this.bedrooms = bedrooms;
    this.bathrooms = bathrooms;
    this.squarefeet = squarefeet;
    this.lot_size = lot_size;
    this.city = city;
    this.age = age;
    this.change_date = change_date;
    this.change_type = change_type;
    this.lat = 0;
    this.lon = 0;

    this.set_lat_lon = function(){
    	var data = GoogleMaps.get_lat_lon(encodeURLParam(this.street_address + "," + this.city));
    	var lat_lon = data.results[0].geometry.location;
    	this.lat = lat_lon.lat;
    	this.lon = lat_lon.lng;
    };

}

MLSProperty.parseProperty = function(data){
	var mls_number = data.find(".d1085m10 span").text();
	var sent_date = data.find(".d1085m9 span").text();
	var status = data.find(".d1085m14 span").text();
	var street_address = data.find(".d1085m15 span").text();
	var price = data.find(".d1085m17 span").text();
	var dom = data.find(".d1085m18 span").text();
	var bedrooms = data.find(".d1085m20 span").text();
	var bathrooms = data.find(".d1085m21 span").text();
	var squarefeet = data.find(".d1085m21 .d1085m9").text();
	var lot_size = data.find(".d1085m22 span").text();
	var city = data.find(".d1085m23 span").text();
	var age = data.find(".d1085m24 span").text();
	var change_date = data.find(".d1085m25 span").text();
	var change_type = data.find(".d1085m26 span").text();
	return new MLSProperty(mls_number,sent_date, status, street_address, price, 
			dom, bedrooms, bathrooms, squarefeet, lot_size, city, age, change_date, change_type);
}

function ApiRequest(api_url, params, dataType){
	this.api_url = api_url;
	this.params = params;
	this.dataType = dataType;

	this.request = function(method){
		var response_data = null;
	    $.ajax({
	      type: method,
	      url: this.api_url,
	      data: this.params,
	      dataType: this.dataType,
	      async: false,
	      statusCode: {
	        200: function(data) {
	          response_data = (this.dataType == 'text/xml') ? data.responseText : data;

	        },
	        500: function(xhr, textStatus, errorThrown) {
	        	console.log(xhr.Status +" " + xhr.StatusDescription + "\n" + errorThrown);
	        },
	        400: function(xhr, textStatus, errorThrown) {
	        	console.log(xhr.Status +" " + xhr.StatusDescription + "\n" + errorThrown);
	        },
	        401: function(xhr, textStatus, errorThrown) {
	        	console.log(xhr.Status +" " + xhr.StatusDescription + "\n" + errorThrown);
	        },
	        402: function(xhr, textStatus, errorThrown) {
	        	console.log(xhr.Status +" " + xhr.StatusDescription + "\n" + errorThrown);
	        },
	        405: function(xhr, textStatus, errorThrown) {
	        	console.log(xhr.Status +" " + xhr.StatusDescription + "\n" + errorThrown);
	        },
	        406: function(xhr, textStatus, errorThrown) {
	        	console.log(xhr.Status +" " + xhr.StatusDescription + "\n" + errorThrown);
	        }
	      }
	    });
	    return response_data;
	}

	this.post = function(){
		return this.request("POST");
	};

	this.get = function(){
		return this.request("GET");
	}

	this.xml_response = function(request){
		return request.responseXML;
	};

	this.json_response = function(request){
		return JSON.parse(request.responseText);
	};
}

function GreatSchool(apikey, state, city, radius){
	this.apikey = apikey;
	this.state = state;
	this.city = city;
	this.radius = radius;

	this.nearby = function(street_address){
		var params = {key: this.apikey, state: this.state, city: encodeURLParam(this.city), address: encodeURLParam(street_address), radius: radius};
		var request = new ApiRequest("http://api.greatschools.org/schools/nearby", params, 'text/xml');
		return request.get();
	};

}

GreatSchool.assignedSchools = function(lat, lon){
	var params = {lat: lat, lon: lon};
	var request = new ApiRequest("http://www.gscdn.org/geo/boundary/ajax/getAssignedSchoolByLocation.json", params, 'json');
	return request.get();

}

function GoogleMaps(){ }

GoogleMaps.get_distance_json = function(origins, destinations, mode, language, sensor, units){
	var params = {origins: origins, destinations: destinations, mode: mode, language: language, sensor: sensor, units: units};
	var request = new ApiRequest("http://maps.googleapis.com/maps/api/distancematrix/json", params, 'json');
	return request.get();
};

GoogleMaps.get_distance = function(origins, destinations, mode, language, sensor, units){
	return this.get_distance_json(origins, destinations, mode, language, sensor, units).rows[0].elements[0].distance.text;
};

GoogleMaps.get_lat_lon = function(origin){
	var params = {address: origin};
	var request = new ApiRequest("http://maps.googleapis.com/maps/api/geocode/json", params, 'json');
	return request.get();
};

$(document).ready(function(){
	var home_origin = replaceCommas(encodeURLParam("360 S Market St,San Jose,CA 95113, USA"));
	var work_origin = replaceCommas(encodeURLParam("Apple Campus, Cupertino, CA 95014, USA"));
	var destinations = "";
	var properties = [];
	var index = 0;

	
	$(".portalContent").css("width","1350px");
	$("#_ctl0_m_pnlRenderedDisplay table table:first").find("tr:last").append('<td style="width:120px;"><span style="width:120px;">Work Distance</span></td>');
	$("#_ctl0_m_pnlRenderedDisplay table table:first").find("tr:last").append('<td style="width:120px;"><span style="width:120px;">Home Distance</span></td>');

	$(".d1085m_show table table").each(function(){
		var property = MLSProperty.parseProperty($(this));
		property.set_lat_lon();
		properties.push(property);
		
		destinations += replaceCommas(encodeURLParam(property.city + "+"+ property.street_address)) +  "|";

		var schools = GreatSchool.assignedSchools(properties[index].lat, properties[index].lon);
		
		$(this).data("mls-property-index", index);
		$(this).css("cursor","pointer");

		var dialog = '<div style="display:none;" class="dialog_'+index+'" title="Schools"><table class="data_table"><thead><tr><th style="width:150px"><b>Name</b></th><th style="width:150px"><b>Rating</b></th><th style="width:150px"><b>Grade Range</b></th><th style="width:150px"><b>Map</b></th></tr></thead>';
		
		if(schools != null && typeof schools !== "undefined"){
			for (var i = 0; i < schools.results.length; i++) {
				
				var assigned_school = schools.results[i].schools[0];

				if (assigned_school !== null && typeof assigned_school !== "undefined"){
					var school_name = assigned_school.name;
					var gsRating = assigned_school.rating;
					var gradeRange = assigned_school.gradeRange;
					var lat = assigned_school.lat;
					var lon = assigned_school.lon;
					var map = "https://www.google.com.do/maps/dir/"+lat+","+lon;
					dialog += '<tr><td style="width:150px">'+school_name+'</td><td style="width:150px">'+gsRating+'</td><td style="width:150px">'+gradeRange+'</td><td style="width:150px"><a target="_blank" href="'+map+'">See Map</a></td></tr>';	
				}

			}	
			dialog += "</table></div>";
		}
		else{
			dialog += '</table><b>No Schools found.</b></div>';
		}

		$(this).closest("div").append(dialog);
		
		index++;
	});

	$('.data_table').DataTable({"order": [[ 1, "desc" ]]});

	function get_value_from_node(node){
		if(typeof node[0] !== "undefined" && node !== null){
			var data = node[0];
		 	return data.textContent ? data.textContent : data.innerText;
		}
		else{
		  	return "None";
		}
	}

	$(".d1085m_show table table").click(function(){
		var mls_property_index = $(this).data("mls-property-index");
		$('.dialog_'+mls_property_index).css("width","600px");
		$('.dialog_'+mls_property_index).css("max-height","450px");
		$('.dialog_'+mls_property_index).css("overflow","auto");
		$('.dialog_'+mls_property_index).dialog({
		    height: 300,
		    width: 600,
		    modal: true,
		    resizable: true
		});
	});

	var work_distances = GoogleMaps.get_distance_json(work_origin, destinations, "driving", "en", false, "imperial");
	var home_distances = GoogleMaps.get_distance_json(home_origin, destinations, "driving", "en", false, "imperial");
	index = 0;

	$(".d1085m_show table table").each(function(){
		var home_school_distance = home_distances.rows[0].elements[index];
		var work_school_distance = work_distances.rows[0].elements[index];
		var text_home;
		var text_work;
		if(home_school_distance !== null && typeof home_school_distance !== "undefined"){
			text_home = '<td style="width:120px;"><b>'+home_school_distance.distance.text+"</b> ("+home_school_distance.duration.text+")</td>";
		}
		else{
			text_home = '<td style="width:120px;">Not Found</td>';
		}
		if(work_school_distance !== null && typeof work_school_distance !== "undefined"){
			text_work = '<td style="width:120px;"><b>'+work_school_distance.distance.text+"</b> ("+work_school_distance.duration.text+")</td>";
		}
		else{
			text_work = '<td style="width:120px;">Not Found</td>';
		}
		$(this).find("tr:last").append(text_home);
		$(this).find("tr:last").append(text_work);
		index++;
	});
	
});