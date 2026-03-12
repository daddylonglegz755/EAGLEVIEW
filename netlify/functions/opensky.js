const https = require('https');

const CLIENT_ID = 'snarrtayson08@gmail.com-api-client';
const CLIENT_SECRET = 'bHAbCtmyCmgKify9q4dZl27UcG565ng6';
const TOKEN_URL = 'auth.opensky-network.org';
const TOKEN_PATH = '/auth/realms/opensky-network/protocol/openid-connect/token';

function getToken() {
  return new Promise((resolve, reject) => {
    const body = `grant_type=client_credentials&client_id=${encodeURIComponent(CLIENT_ID)}&client_secret=${encodeURIComponent(CLIENT_SECRET)}`;
    const options = {
      hostname: TOKEN_URL,
      path: TOKEN_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error('No token: ' + data));
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getFlights(token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'opensky-network.org',
      path: '/api/states/all',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'User-Agent': 'EagleView/1.0'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(body);
        else reject(new Error('OpenSky returned ' + res.statusCode + ': ' + body));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

exports.handler = async function(event, context) {
  try {
    const token = await getToken();
    const data = await getFlights(token);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      },
      body: data
    };
  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
