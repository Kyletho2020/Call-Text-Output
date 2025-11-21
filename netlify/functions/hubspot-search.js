const fetchFromRuntime = (...args) => {
  if (typeof fetch === 'function') {
    return fetch(...args);
  }
  throw new Error(
    'Fetch API is not available in this runtime. Please ensure the function runs on Node 18+'
  );
};

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
      throw new Error('HubSpot access token not configured');
    }

    const body = JSON.parse(event.body || '{}');
    const searchQuery = (body.query || '').trim();
    const searchType = body.searchType || 'name'; // name, email, phone, company

    if (!searchQuery) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Search query is required' }),
      };
    }

    // Build HubSpot search filters based on search type
    let filterGroups = [];

    if (searchType === 'name') {
      // Split name into parts for firstname/lastname matching
      const parts = searchQuery.split(/\s+/);

      if (parts.length >= 2) {
        const first = parts[0];
        const last = parts.slice(1).join(' ');

        // Try firstname + lastname
        filterGroups.push({
          filters: [
            { propertyName: 'firstname', operator: 'CONTAINS_TOKEN', value: first },
            { propertyName: 'lastname', operator: 'CONTAINS_TOKEN', value: last },
          ],
        });

        // Try reversed (lastname + firstname)
        filterGroups.push({
          filters: [
            { propertyName: 'firstname', operator: 'CONTAINS_TOKEN', value: last },
            { propertyName: 'lastname', operator: 'CONTAINS_TOKEN', value: first },
          ],
        });
      } else {
        // Single word - search both firstname and lastname
        filterGroups.push({
          filters: [{ propertyName: 'firstname', operator: 'CONTAINS_TOKEN', value: searchQuery }],
        });
        filterGroups.push({
          filters: [{ propertyName: 'lastname', operator: 'CONTAINS_TOKEN', value: searchQuery }],
        });
      }
    } else if (searchType === 'email') {
      filterGroups.push({
        filters: [{ propertyName: 'email', operator: 'CONTAINS_TOKEN', value: searchQuery }],
      });
    } else if (searchType === 'phone') {
      // Clean phone number for search
      const cleanPhone = searchQuery.replace(/[^0-9]/g, '');
      filterGroups.push({
        filters: [{ propertyName: 'phone', operator: 'CONTAINS_TOKEN', value: cleanPhone }],
      });
    } else if (searchType === 'company') {
      filterGroups.push({
        filters: [{ propertyName: 'company', operator: 'CONTAINS_TOKEN', value: searchQuery }],
      });
    }

    // Search HubSpot contacts
    const searchBody = {
      filterGroups,
      properties: ['firstname', 'lastname', 'email', 'phone', 'address', 'city', 'state', 'zip', 'company'],
      limit: 50,
    };

    const response = await fetchFromRuntime(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HubSpot API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const results = data.results || [];

    // Get company associations for contacts with companies
    const companyIds = new Set();
    results.forEach(contact => {
      if (contact.associations?.companies?.results) {
        contact.associations.companies.results.forEach(company => {
          if (company.id) companyIds.add(company.id);
        });
      }
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

      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        companyMap = (companyData.results || []).reduce((acc, company) => {
          acc[company.id] = company.properties || {};
          return acc;
        }, {});
      }
    }

    // Format results
    const contacts = results.map(contact => {
      const props = contact.properties || {};
      const associatedCompany = contact.associations?.companies?.results?.[0];
      const companyId = associatedCompany?.id;
      const companyProperties = companyId ? companyMap[companyId] : null;

      // Build full address
      const contactAddress = [props.address, props.city, props.state, props.zip]
        .filter(Boolean)
        .join(', ');

      const companyAddress = companyProperties
        ? [companyProperties.address, companyProperties.city, companyProperties.state, companyProperties.zip]
            .filter(Boolean)
            .join(', ')
        : '';

      return {
        id: contact.id,
        firstName: props.firstname || '',
        lastName: props.lastname || '',
        email: props.email || '',
        phone: props.phone || '',
        contactAddress,
        contactAddress1: props.address || '',
        contactCity: props.city || '',
        contactState: props.state || '',
        contactZip: props.zip || '',
        companyName: companyProperties?.name || props.company || '',
        companyAddress,
        companyAddress1: companyProperties?.address || '',
        companyCity: companyProperties?.city || '',
        companyState: companyProperties?.state || '',
        companyZip: companyProperties?.zip || '',
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ results: contacts, total: contacts.length }),
    };
  } catch (error) {
    console.error('HubSpot search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

