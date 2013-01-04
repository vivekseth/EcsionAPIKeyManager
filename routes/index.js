
/*
 * GET home page.
 */
var mysql = require('mysql');
var connection = null; 

exports.authenticate = function(req, res){
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

exports.home = function(req, res) {
	res.render("index", {title: "home"});
};

exports.login = function(req, res) {
	var username = req.body.username;
	var password = req.body.password;

	console.log(req.body)
	console.log(req)

	login(username, password, res)
};
 
var dbQuery =function(q, callback) {
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
		if (connection != null) {
			connection.end();
			connection = null;
		}
	});
}

var login = function(username, password, res) {
	console.log(username + ", " + password);
	dbQuery("select * from users where username='"+username+"' AND password='"+password+"'", function(rows, fields) {
		if (rows.length == 1) {
			res.render("login", {title: "home", userinfo: rows[0]});
		}
		else {
			res.write("invalid username or password");
			res.end();
		}
	});
}