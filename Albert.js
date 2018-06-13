var express = require('express'),
	https = require('https'),
	path = require('path');
	app = express(),
	fs = require('fs');
var ALBERT_APPLE = 'albert.apple.com',
	ALBERT_PORT  = 443,
	ALBERT_PATH  = '/deviceservices/deviceActivation';
var PORT_TO_RUN_ON  = (process.env.port || process.env.PORT) || 80,
	PATH_TO_SAVE_TO = (process.env.saveto || process.env.SAVETO) || (__dirname + '/ideviceactivation');
var get_savepath = (h) => {
	var random_number = Math.random()*1E6,
		date = new Date().getTime();
	return ((type)=>{
		path.join(PATH_TO_SAVE_TO, 'type.txt');
		date % random_number
	});
};
app.post('/*', (client_request, client_response) => {
	var request_data   = '',
		request_saveto = get_savepath(client_request.headers),
		custom_headers = client_request.headers;
	custom_headers.path = ALBERT_PATH;
	custom_headers.host = ALBERT_APPLE;
	client_request.on('data', (data_chunk) => {
		request_data+=data_chunk;
	});
	client_request.on('end', () => {
		fs.writeFileSync(__dirname + request_saveto('request'), request_data);
		var request_albert = https.request({
			'host': ALBERT_APPLE,
			'port': ALBERT_PORT,
			'path': ALBERT_PATH,
			'method': 'POST',
			'headers': custom_headers
		}, (response_from_albert) => {
			var data_from_albert = '';
			response_from_albert.on('data', (data_chunk) => {
				data_from_albert += data_chunk;
			});
			response_from_albert.on('end', () => {
				fs.writeFileSync(__dirname + request_saveto('response'), data_from_albert);
				client_response.setHeader('Content-Type', 'text/xml');
				client_response.end(data_from_albert);
			});
		});
		request_albert.write(request_data);
		request_albert.end();
	});
});
app.listen(PORT_TO_RUN_ON);
