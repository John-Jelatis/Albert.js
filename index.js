var express = require('express'),
	app = express(),
	fs = require('fs'),
	https = require('https');

app.post('/debug', (req,res)=>{
	var e = '';
	var i = (new Date().getTime());
	var headers_ = req.headers;
	headers_.path = '/deviceservices/deviceActivation';
	headers_.host = 'albert.apple.com'
	console.log(JSON.stringify(headers_));
	console.log('\n'+ req.get('user-agent'));
	req.on('data',(d)=>e+=d);
	req.on('end',()=>{
		fs.writeFileSync(__dirname + '/debug/request'+i+'.txt', e);
		/*
		 *  REQUEST FROM APPLE BELOW
		 *
		 */
		var request = https.request({
			'host': 'albert.apple.com',
			'port': 443,
			'path': '/deviceservices/deviceActivation',
			'method': 'POST',
			'headers': headers_
		}, (r)=>{
			var d = '';
			r.on('data', (e)=>d+=e);
			r.on('end', ()=>{
				fs.writeFileSync(__dirname + '/debug/response'+i+'.txt', d);
				res.setHeader('Content-Type','text/xml');
				res.end(d);
			});
		});
		/*
		 *  REQUEST FROM APPLE ABOVE
		 *
		 */
		request.write(e);
		request.end();
	});
});
app.listen(80);
