const https = require('https');

exports.handler = async function(event, context) {
  const user = 'snarrtayson08@gmail.com';
  const pass = 'Buzzlightyear755';
  const creds = Buffer.from(user + ':' + pass).toString('base64');

  return new Promise((resolve) => {
    const options = {
      hostname: 'opensky-network.org',
      path: '/api/states/all',
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + creds,
        'User-Agent': 'EagleView/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=60'
            },
            body: body
          });
        } else {
          resolve({
            statusCode: res.statusCode,
            body: JSON.stringify({ error: 'OpenSky returned ' + res.statusCode })
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: e.message })
      });
    });

    req.end();
  });
};
