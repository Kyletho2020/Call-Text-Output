const fetchFromRuntime = (...args) => {
  if (typeof fetch === 'function') {
    return fetch(...args);
  }

  throw new Error(
    'Fetch API is not available in this runtime. Please ensure the function runs on Node 18+' 
  );
};

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

    // Fetch contacts from HubSpot including company associations
    const response = await fetchFromRuntime(
      'https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,address,city,state,zip&associations=companies',
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

    const contactsFromHubSpot = data.results || [];

    // Gather all company ids so we can batch fetch their details
    const companyIds = new Set();
    contactsFromHubSpot.forEach(contact => {
      const associatedCompanies = contact.associations?.companies?.results || [];
      associatedCompanies.forEach(company => {
        if (company.id) {
          companyIds.add(company.id);
        }
      });
    });

    let companyMap = {};

    if (companyIds.size > 0) {
      const companyResponse = await fetchFromRuntime(
        'https://api.hubapi.com/crm/v3/objects/companies/batch/read',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: ['name', 'address', 'city', 'state', 'zip', 'country'],
            inputs: Array.from(companyIds).map(id => ({ id })),
          }),
        }
      );

      if (!companyResponse.ok) {
        throw new Error(`HubSpot company API error: ${companyResponse.status}`);
      }

      const companyData = await companyResponse.json();
      companyMap = (companyData.results || []).reduce((acc, company) => {
        acc[company.id] = company.properties || {};
        return acc;
      }, {});
    }

    // Transform the data and include company information when available
    const contacts = contactsFromHubSpot.map(contact => {
      const associatedCompany = contact.associations?.companies?.results?.[0];
      const companyId = associatedCompany?.id;
      const companyProperties = companyId ? companyMap[companyId] : null;
      const companyLocation = companyProperties
        ? [companyProperties.address, companyProperties.city, companyProperties.state, companyProperties.zip]
            .filter(Boolean)
            .join(', ')
        : '';

      return {
        id: contact.id,
        firstname: contact.properties.firstname || '',
        lastname: contact.properties.lastname || '',
        email: contact.properties.email || '',
        address: contact.properties.address || '',
        city: contact.properties.city || '',
        state: contact.properties.state || '',
        zip: contact.properties.zip || '',
        company: companyProperties
          ? {
              id: companyId,
              name: companyProperties.name || '',
              address: companyProperties.address || '',
              city: companyProperties.city || '',
              state: companyProperties.state || '',
              zip: companyProperties.zip || '',
              country: companyProperties.country || '',
            }
          : null,
        companyLocation,
      };
    });

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
