
/*
 * GET home page.
 */
var everyauth = require('everyauth-express3');
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
	displayPageIfAuth(req, res, "login", {title: "home", userinfo: req.user});

	if (req.user) {
		res.render("login", {title: "home", userinfo: req.user});
	}
	else {
		res.render("index", {title: "home"});
	}
}
 
exports.adduser = function(req, res) {
	displayPageIfAuth(req, res, "adduser", null);
}


var displayPageIfAuth = function(req, res, jadeFileName, data) {
	if (req.user) {
		res.render(jadeFileName, data);
	}
	else {
		res.writeHead(302, {
		  'Location': '/'
		});
		res.end();
	}
}

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

everyauth.everymodule.findUserById(function(userId, callback) {
	console.log(userId);
	dbQuery("select * from users where id='"+userId+"'", function(rows, fields) {
		//if (rows.length == 1) {
			console.log(rows[0]);
			callback(false, rows[0]);
		//}
	});
});

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

everyauth.password
  .getLoginPath('/') // Uri path to the login page
  .postLoginPath('/login') // Uri path that your login form POSTs to
  .loginView('index')
  .authenticate( function (login, password) {

    var promise = this.Promise()
    
    dbQuery("select * from users where username='"+login+"' AND password='"+password+"'", function(rows, fields) {
      if (rows.length == 1) {
      	console.log(rows[0]);
        promise.fulfill(rows[0]);

      }
      else {
        promise.fulfill(["invalid password or username"]);
      }
    });

    console.log(promise);

    return promise;

  })
  .loginSuccessRedirect('/login') // Where to redirect to after a login

    // If login fails, we render the errors via the login view template,
    // so just make sure your loginView() template incorporates an `errors` local.
    // See './example/views/login.jade'

  .getRegisterPath('/register') // Uri path to the registration page
  .postRegisterPath('/register') // The Uri path that your registration form POSTs to
  .registerView('a string of html; OR the name of the jade/etc-view-engine view')
  .validateRegistration( function (newUserAttributes) {
    // Validate the registration input
    // Return undefined, null, or [] if validation succeeds
    // Return an array of error messages (or Promise promising this array)
    // if validation fails
    //
    // e.g., assuming you define validate with the following signature
    // var errors = validate(login, password, extraParams);
    // return errors;
    //
    // The `errors` you return show up as an `errors` local in your jade template
  })
  .registerUser( function (newUserAttributes) {
    // This step is only executed if we pass the validateRegistration step without
    // any errors.
    //
    // Returns a user (or a Promise that promises a user) after adding it to
    // some user store.
    //
    // As an edge case, sometimes your database may make you aware of violation
    // of the unique login index, so if this error is sent back in an async
    // callback, then you can just return that error as a single element array
    // containing just that error message, and everyauth will automatically handle
    // that as a failed registration. Again, you will have access to this error via
    // the `errors` local in your register view jade template.
    // e.g.,
    // var promise = this.Promise();
    // User.create(newUserAttributes, function (err, user) {
    //   if (err) return promise.fulfill([err]);
    //   promise.fulfill(user);
    // });
    // return promise;
    //
    // Note: Index and db-driven validations are the only validations that occur 
    // here; all other validations occur in the `validateRegistration` step documented above.
  })
  .registerSuccessRedirect('/');

 everyauth.password
  .loginFormFieldName('username')       // Defaults to 'login'
  .passwordFormFieldName('password') // Defaults to 'password'
//  .loginLayout('custom_login_layout') // Only with `express`
//  .registerLayout('custom reg_layout') // Only with `express`
//  .loginLocals(fn);                    // See Recipe 3 below