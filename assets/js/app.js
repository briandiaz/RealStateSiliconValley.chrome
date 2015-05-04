
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
	var index = 0;

	


	$(".portalContent").css("width","1350px");
	$("#_ctl0_m_pnlRenderedDisplay table table:first").find("tr:last").append('<td style="width:110px;"><span style="width:110px;">Work Distance </span></td>');
	$("#_ctl0_m_pnlRenderedDisplay table table:first").find("tr:last").append('<td style="width:110px;"><span style="width:110px;">Home Distance</span></td>');

	$(".d1085m_show table table").each(function(){
		var property = MLSProperty.parseProperty($(this));
		properties.push(property);
		
		destinations += replaceCommas(encodeURLParam("San+Francisco+" + property.city + "+"+ property.street_address)) +  "|";

		var schools = $.parseXML(get_nearby_school(properties[index]));
		var data = (schools != null) ? schools.getElementsByTagName("school") : null;
		
		$(this).data("mls-property-index", index);
		$(this).css("cursor","pointer");

		var dialog = '<div style="display:none;" class="dialog_'+index+'" title="Schools"><table class="data_table"><thead><tr><th style="width:150px"><b>Name</b></th><th style="width:150px"><b>Rating</b></th><th style="width:150px"><b>Grade Range</b></th><th style="width:150px"><b>Map</b></th></tr></thead>';
		
		if(data != null && typeof data !== "undefined"){
			for (var i = 0; i < data.length; i++) {
				
				var nearby_school = data[i];

				if (nearby_school !== null && typeof nearby_school !== "undefined" && get_value_from_node(nearby_school.getElementsByTagName("gsRating")) !== 'None'){
					var school_name = get_value_from_node(nearby_school.getElementsByTagName("name"));
					var gsRating = get_value_from_node(nearby_school.getElementsByTagName("gsRating"));
					var gradeRange = get_value_from_node(nearby_school.getElementsByTagName("gradeRange"));
					var enrollment = get_value_from_node(nearby_school.getElementsByTagName("enrollment"));
					var phone = get_value_from_node(nearby_school.getElementsByTagName("phone"));
					var fax = get_value_from_node(nearby_school.getElementsByTagName("fax"));
					var distance = get_value_from_node(nearby_school.getElementsByTagName("distance"));
					var overviewLink = get_value_from_node(nearby_school.getElementsByTagName("overviewLink"));
					var ratingsLink = get_value_from_node(nearby_school.getElementsByTagName("ratingsLink"));
					var reviewsLink = get_value_from_node(nearby_school.getElementsByTagName("reviewsLink"));
					var lat = get_value_from_node(nearby_school.getElementsByTagName("lat"));
					var lon = get_value_from_node(nearby_school.getElementsByTagName("lon"));
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

	$('.data_table').DataTable();

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
		    height: 450,
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
			text_home = '<td style="width:110px;">'+home_school_distance.distance.text+"</td>";
		}
		else{
			text_home = '<td style="width:110px;">Not Found</td>';
		}
		if(work_school_distance !== null && typeof work_school_distance !== "undefined"){
			text_work = '<td style="width:110px;">'+work_school_distance.distance.text+"</td>";
		}
		else{
			text_work = '<td style="width:110px;">Not Found</td>';
		}
		$(this).find("tr:last").append(text_home);
		$(this).find("tr:last").append(text_work);
		index++;
	});

	function get_nearby_schools(properties){
		var nearby_schools = [];
		var schools = new GreatSchool("wksvxijz7xpio3ec5wy9paxx", "CA", "San Francisco", 30);
		for (var i = 0; i < properties.length; i++) {
			nearby_schools.push(schools.nearby(properties[i].street_address))
		};
		
		return nearby_schools;	
	}

	function get_nearby_school(property){
		var schools = new GreatSchool("wksvxijz7xpio3ec5wy9paxx", "CA", "San Francisco", 30);
		return schools.nearby(property.street_address);
	}
});