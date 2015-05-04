
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
	      url: api_url,
	      data: this.params,
	      dataType: this.dataType,
	      async: false,
	      statusCode: {
	        200: function(data) {
	          response_data = data.responseText;
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

	function encodeURLParam(param) {
	  return param.replace(new RegExp(' ', 'g'), "+");
	}
}


$(document).ready(function(){
	
	var properties = [];
	$(".d1085m_show table table").each(function(){
		var property = MLSProperty.parseProperty($(this));
		properties.push(property);
		
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
	var school = get_nearby_school(properties[0]);
	console.log(school);
});