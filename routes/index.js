
/*
 * GET home page.
 */
var mysql = require('mysql');
var connection = null; 

exports.index = function(req, res){
	console.log(req.query);
	var queryString = "SELECT * FROM enabled WHERE apikey='" + req.query.apikey + "'";
	var jsonObj = {};
	jsonObj["apikey"] = req.query.apikey;
	dbQuery(queryString, function(rows, fields) {
		if (rows.length == 1 && rows[0].enabled == 1) {
			queryString = "SELECT * FROM permissions WHERE apikey='" + req.query.apikey + "'";
			dbQuery(queryString, function(rows, fields) {
				var permissionsObj = {};
				for (var i = 0; i < rows.length; i++) {
					var service = rows[i].service;
					permissionsObj[service] = "enabled";
				};
				jsonObj["permissions"] = permissionsObj;
				jsonObj["messages"] = "";
				console.log(jsonObj);
				res.write(JSON.stringify(jsonObj));
				res.end();
			});
		}
		else {
			jsonObj["permissions"] = {};
			jsonObj["messages"] = "INVALID KEY";
			res.write(JSON.stringify(jsonObj));
			res.end();
		}
	});


	if (req.query.apikey === "hello" && req.query.application === "world") {
		res.render('index', { title: 'Express' });
	} 
};

exports.authenticate = function(req, res){
	if (req.body.apikey === "hello" && req.body.application === "world") {
		res.render('index', { title: 'Express' });
	}
};

var dbQuery =function(q, callback) {
	//connection.connect();
	if (connection == null) {
		connection = mysql.createConnection({
		  host    : 'localhost',
		  user    : 'root',
		  password  : 'root',
		  database  : 'EcsionAPI',
		});
		connection.connect();
	}
	connection.query(q, function(err, rows, fields) {
		if (err) throw err;
		callback(rows, fields);
		connection.end();
		connection = null;
	});
	//connection.end();
}