# Amazon AWS S3 Upload via Form Example

A simple application which uploads files to Amazon S3 via direct upload without proxying the files through the own server.
The files in the bucket can then be downloaded (or displayed) by a signed URL directly from S3 again.

## What it does

For uploading a policy is needed which pre-authorizes the upload.

The Client requests this policy beside other information from the node server which provides the data.

After performing an Ajax Request to the server the client fills out the hidden form input fields following: http://aws.amazon.com/articles/1434 and submits the form which gets send directly to Amazon S3.

For the files already in the bucket the server creates a signed URL for the file. This is done with the npm module knox.
The file list is requested via an ajax call from the server and appended to the document.

Using Twitter Bootstrap to give it a nice layout.

Using jQuery's ajax for uploading the file to S3.

### Customization
To use this demo create your own config.json file following the sampleConfig.json file.

### Getting it started
Create a AWS Account, create Credentials and set up a S3 bucket
Create your own config.json file
Install the modules via `npm install` in the project folder
Start the app via `node app.js`

## Credits
http://blog.tcs.de/post-file-to-s3-using-node/

https://npmjs.org/package/s3-policy

http://aws.amazon.com/articles/1434
