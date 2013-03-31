// Require dependencies
var knox    = require('knox');
var express = require('express');
var fs      = require('fs');
var crypto  = require('crypto');
var mime    = require('mime');
// Require the configuration
var config  = require('./config.json');

// Create the app
var app = express();

// Create a Knox S3 Client by using the config from the config.json file
var s3client = knox.createClient({
	key    : config.accessKeyId,
	secret : config.secretAccessKey,
	region : config.region,
	bucket : config.bucket
});

var createPolicy = function () {
	
	var _date = new Date();
	// The policy object
	var policy = {
		// Set the expiration date 1 hour to the future
		expiration: "" + (_date.getFullYear()) + "-" + (_date.getMonth() + 1) + "-" + (_date.getDate()) + "T" + (_date.getHours() + 1) + ":" + (_date.getMinutes()) + ":" + (_date.getSeconds()) + "Z",
		conditions: [
			{ bucket: config.bucket },
			{ acl: 'private' },
			['starts-with', '$key', ''],
			['starts-with', '$Content-Type', ''],
			['content-length-range', config.minLength, config.maxLength ],
			{ "success_action_redirect": "/" }
	    ]
	};

	// Base64 encoding  
	policy = new Buffer(JSON.stringify(policy)).toString('base64');

	var signature = crypto.createHmac('sha1', config.secretAccessKey).update(policy).digest('base64');

	return {
		signature : signature,
		policy    : policy
	}
};

var createFileCredentials = function (filename) {
	// Create a date
	s3policy = createPolicy();
	
	// Prepare the data which is needed including a policy
	var formData = {
		// Set the filename as key (the filename in S3)
		key : filename,
		// Determine the mime type of the file by its filename extension (e.g. .gif -> image/gif)
		mimeType : mime.lookup(filename),
		// The S3 Acc
		s3Key : config.accessKeyId,
		// The Access Control List
		acl : 'private',
		// The Policy which allows the user to upload the file directly to S3
		policy : s3policy.policy,
		// The signature proves we do have the right credentials
		signature : s3policy.signature,
		// A redirect path after a successful submission of the file to S3
		successRedirect : '/'
	};

	return formData;
	
};

app.configure(function () {
	// Setting the static directory to the views directory in order to include script files
	app.use(express.static('views'));
	// Setting the view directory for jade
	app.set('views', __dirname + '/views');
	// Set jade as the view engine of express
	app.set('view engine', 'jade');
});

// The index file
app.get('/', function (req, res) {
	res.render('index', { bucket : config.bucket });
});

// Get a list of all files
app.get('/files', function (req, res) {
	// Get a list of all keys (files) in the bucket
	s3client.list(function (err, data) {
		var files = [];
		var date = new Date();
		// Set valid date to 30s in the future
		date.setTime(date.getTime() + 30 * 1000);
		// Create a url for each file in the bucket
		data.Contents.forEach(function (content) {
			// Use knox's sign url function
			content.url = s3client.signedUrl(content.Key, date);
			files.push(content);
		});
		// Send the list of files to the client
		res.send(files);
	})
});

// We can forward requested elements to S3 too
app.get('/files/:file', function (req, res) {
	var file = req.params.file;
	if (file) {
		var date = new Date();
		// Set valid date to 5s in the future
		date.setTime(date.getTime() + 5 * 1000);
		res.redirect(s3client.signedUrl(file, date));		
	} else {
		res.send(404);
	}
});

// Get a pre-authorization / policy
app.get('/policy', function (req, res) {
	// Create a new policy object
	var data = createFileCredentials(req.query.file);
	res.send(data);
});

// Listen to port 8080
app.listen(8080);
console.log('Server is listening to port 8080');

