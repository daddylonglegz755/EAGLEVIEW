exports.handler = async function(event, context) {
  const user = 'snarrtayson08@gmail.com';
  const pass = 'Buzzlightyear755';
  const creds = Buffer.from(user + ':' + pass).toString('base64');

  try {
    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: {
        'Authorization': 'Basic ' + creds,
        'User-Agent': 'EagleView/1.0'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'OpenSky returned ' + response.status })
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      },
      body: JSON.stringify(data)
    };
  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
