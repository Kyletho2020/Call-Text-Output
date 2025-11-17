import fetch from 'node-fetch';

export async function handler(event, context) {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Get HubSpot access token from environment variable
    const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!ACCESS_TOKEN) {
      throw new Error('HubSpot access token not configured');
    }

    // Fetch contacts from HubSpot
    const response = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,address,city,state,zip',
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data
    const contacts = data.results.map(contact => ({
      id: contact.id,
      firstname: contact.properties.firstname || '',
      lastname: contact.properties.lastname || '',
      email: contact.properties.email || '',
      address: contact.properties.address || '',
      city: contact.properties.city || '',
      state: contact.properties.state || '',
      zip: contact.properties.zip || '',
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ contacts }),
    };
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
