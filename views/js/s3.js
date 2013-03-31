// Get the file list from the server
var getFiles = function () {
	
	$.ajax({
		url : '/files',
		type : 'GET',
		success : function (contents) {
			
			// Clear the files container
			$('#fileList').html('');
			
			contents.forEach(function (content) {
				$('#fileList').append(
					'<div class="row">'
					+ '<div class="span2">' + content.Key + '</div>'
					+ '<div class="span2"><a href="' + content.url + '">' + content.Key + '</a></div>'
					+ '<div class="span2">' + content.Owner.DisplayName + '</div>'
					+ '<div class="span4">' + content.LastModified + '</div>'
					+ '</div>'
				);
			});
			
		}
	});
};


$(document).ready(function() {
	
	getFiles();
	
	// Adding an event handler to the form
	$('form.form-upload').submit(function (e) {
		
		// Self reference for submiting without triggering the submit event again
		var that = this;
		
		// Prevent the browsers default behaviour of sending the form
		e.preventDefault();
		
		var _file = $("#file").val().replace(/.+[\\\/]/, "");
		
		// Make sure a file is present
		if (_file) {
			// Get a valid policy from the server
			$.ajax({
				url : '/policy',
				type : 'GET',
				// Append the filename to the request url
				data : { file : _file },
				// Getting the s3 authentication / policy
				success : function (data) {
					//Setting the values in the form
					$('input#key').val(data.key);
					$('input#AWSKey').val(data.s3Key);
					$('input#policy').val(data.policy);
					$('input#acl').val(data.acl);
					$('input#signature').val(data.signature);
					$('input#contentType').val(data.mimeType);
					$('input#successRedirect').val(data.successRedirect);
					
					// Finally submit the form to Amazon
					that.submit();
				}
			});
		}

	});

});