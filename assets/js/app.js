
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

    this.to_s = function(){
    	return this.mls_number + " " + this.sent_date + " " + this.status + " " + this.street_address 
    	+ " " + this.price + " " + this.dom + " " + this.bedrooms + " " + this.bathrooms + " " + this.squarefeet 
    	+ " " + this.lot_size + " " + this.city + " " + this.age + " " + this.change_date  + " " + this.change_type;
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
		return JSON.parse(request.responseText)
	};
}

function GreatSchool(apikey, state, city){
	this.apikey = apikey;
	this.state = state;
	this.city = city;

	this.nearby = function(street_address){
		var params = {key: this.apikey, state: this.state, city: encodeURLParam(this.city), address: encodeURLParam(street_address)};
		var request = new ApiRequest("http://api.greatschools.org/schools/nearby", params, 'text/xml');
		return request.get();
	};
}

function GoogleMaps(){
	
}

GoogleMaps.get_distance_json = function(origins, destinations, mode, language, sensor, units){
	var params = {origins: origins, destinations: destinations, mode: mode, language: language, sensor: sensor, units: units};
	var request = new ApiRequest("http://maps.googleapis.com/maps/api/distancematrix/json", params, 'json');
	return request.get();
};

GoogleMaps.get_distance = function(origins, destinations, mode, language, sensor, units){
	return this.get_distance_json(origins, destinations, mode, language, sensor, units).rows[0].elements[0].distance.text;
};

$(document).ready(function(){
	var home_origin = replaceCommas(encodeURLParam("San Francisco 360 S Market St, San Jose, CA, 95113"));
	var work_origin = replaceCommas(encodeURLParam("San Francisco Infinite Loop, Cupertino, CA, 94014"));
	var destinations = "";
	var properties = [];
	$(".portalContent").css("width","1350px");
	$("#_ctl0_m_pnlRenderedDisplay table table:first").find("tr:last").append('<td style="width:110px;"><span style="width:110px;">Work Distance </span></td>');
	$("#_ctl0_m_pnlRenderedDisplay table table:first").find("tr:last").append('<td style="width:110px;"><span style="width:110px;">Home Distance</span></td>');

	$(".d1085m_show table table").each(function(){
		var property = MLSProperty.parseProperty($(this));
		properties.push(property);
		//var school = get_nearby_school(properties[0]);		
		destinations += replaceCommas(encodeURLParam("San+Francisco+" + property.city + "+"+ property.street_address)) +  "|";
	});


	var work_distances = GoogleMaps.get_distance_json(work_origin, destinations, "driving", "en", false, "imperial");
	var home_distances = GoogleMaps.get_distance_json(home_origin, destinations, "driving", "en", false, "imperial");
	var index = 0;
	$(".d1085m_show table table").each(function(){
		$(this).find("tr:last").append('<td style="width:110px;">'+home_distances.rows[0].elements[index].distance.text+"</td>");
		$(this).find("tr:last").append('<td style="width:110px;">'+work_distances.rows[0].elements[index].distance.text+"</td>");
		index++;
	});

	function get_nearby_schools(properties){
		var nearby_schools = [];
		var schools = new GreatSchool("wksvxijz7xpio3ec5wy9paxx", "CA", "San Francisco");
		for (var i = 0; i < properties.length; i++) {
			nearby_schools.push(schools.nearby(properties[i].street_address))
		};
		
		return nearby_schools;	
	}

	function get_nearby_school(property){
		var nearby_schools = [];
		var schools = new GreatSchool("wksvxijz7xpio3ec5wy9paxx", "CA", "San Francisco");
		return schools.nearby(property.street_address);
	}
});