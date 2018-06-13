var express = require('express'),
	https = require('https'),
	app = express(),
	fs = require('fs');
var ALBERT_APPLE = 'albert.apple.com',
	ALBERT_PORT  = 443,
	ALBERT_PATH  = '/deviceservices/deviceActivation';
var PORT_TO_RUN_ON  = (process.env.port || process.env.PORT) || 80,
	PATH_TO_SAVE_TO = (__dirname + '/logs');
var get_savepath = (h) => {
	if(h > 0) {
		return((type)=>{
			return PATH_TO_SAVE_TO + '/' + Math.floor(date % random_number) + '_';
		});
	};
	var random_number = Math.random()*1E6,
		date = new Date().getTime();
	return ((type)=>{
		return PATH_TO_SAVE_TO + '/' + Math.floor(date % random_number) + '_';
	});
};
app.post('/', (client_request, client_response) => {
	var request_data   = '',
		request_saveto = get_savepath(client_request.headers),
		custom_headers = client_request.headers;
	custom_headers.path = ALBERT_PATH;
	custom_headers.host = ALBERT_APPLE;
	client_request.on('data', (data_chunk) => {
		request_data+=data_chunk;
	});
	client_request.on('end', () => {
		fs.writeFileSync(request_saveto('request') + 'request.txt', request_data);
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
				fs.writeFileSync(request_saveto('response') + 'response.txt', data_from_albert);
				client_response.setHeader('Content-Type', 'text/xml');
				client_response.end(data_from_albert);
			});
		});
		request_albert.write(request_data);
		request_albert.end();
	});
});
app.post('/*', (client_request, client_response) => {
	client_response.setHeader('Content-Type', 'text/xml');
	client_response.sendFile(__dirname + client_request.url);
});
app.listen(PORT_TO_RUN_ON);
