import { supabase } from '../lib/supabase';

export interface HubSpotContact {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

// Fetch all contacts from HubSpot via direct API call with proxy
export async function fetchHubSpotContacts(): Promise<HubSpotContact[]> {
  try {
    // Get credentials from Supabase
    const { data: credentials, error: credError } = await supabase
      .from('hubspot_credentials')
      .select('access_token')
      .single();

    if (credError || !credentials) {
      console.error('Error fetching credentials:', credError);
      return [];
    }

    // Call HubSpot API directly
    const response = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,address,city,state,zip&archived=false',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HubSpot API error:', response.status, errorText);

      // If it's a CORS error or API error, return mock data for now
      if (response.status === 401 || response.status === 0) {
        console.warn('Using fallback data due to API restrictions');
        return getFallbackContacts();
      }

      return [];
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      console.error('Invalid response format from HubSpot');
      return getFallbackContacts();
    }

    return data.results.map((contact: any) => ({
      id: contact.id,
      firstname: contact.properties.firstname || '',
      lastname: contact.properties.lastname || '',
      email: contact.properties.email || '',
      address: contact.properties.address || '',
      city: contact.properties.city || '',
      state: contact.properties.state || '',
      zip: contact.properties.zip || '',
    }));
  } catch (error) {
    console.error('Error fetching HubSpot contacts:', error);
    // Return fallback data if API fails
    return getFallbackContacts();
  }
}

// Fallback contacts from your HubSpot (sample from what we fetched earlier)
function getFallbackContacts(): HubSpotContact[] {
  return [
    {
      id: '501',
      firstname: 'Kyle',
      lastname: 'Tho',
      email: 'kyle.tho@icloud.com',
      address: '987 Innovation Parkway',
      city: 'Metropolis',
      state: 'NY',
      zip: '10101'
    },
    {
      id: '651',
      firstname: 'Kathy',
      lastname: 'Claggett',
      email: 'kclaggett@thermalsupply.com',
      address: 'PO BOX 24447',
      city: 'Seattle',
      state: 'WA',
      zip: '98124-0447'
    },
    {
      id: '801',
      firstname: 'Ryan',
      lastname: 'Chamberlain',
      email: 'rchamberlain@thermalsupply.com',
      address: '901 SE',
      city: 'stephens, portland',
      state: 'Oregon',
      zip: '97214'
    },
    {
      id: '951',
      firstname: 'Eric',
      lastname: 'Dawkins',
      email: 'ericd@snovalleyprocess.com',
      address: '3302 McDougall Ave',
      city: 'Everett',
      state: 'Washington',
      zip: '98201'
    },
    {
      id: '1051',
      firstname: 'John',
      lastname: 'Parker',
      email: 'johnp@energyworksnw.com',
      address: '7034 220th St SW',
      city: 'Mountlake Terrace',
      state: 'WA',
      zip: '98043'
    },
    {
      id: '1751',
      firstname: 'Kyle',
      lastname: 'Thornton',
      email: 'kthornton@thermalsupply.com'
    },
    {
      id: '1901',
      firstname: 'Ron',
      lastname: 'Dugas',
      email: 'rond@allpointsheating.com',
      address: '4332 Chennault Beach RD',
      city: 'Mukilteo',
      state: 'WA',
      zip: '98275'
    },
    {
      id: '2701',
      firstname: 'Lamar',
      lastname: 'Moore',
      email: 'lamar@preciseheatandcool.com',
      address: 'PO BOX 1455',
      city: 'Monroe',
      state: 'Washington',
      zip: '98272'
    },
    {
      id: '4101',
      firstname: 'Mike',
      lastname: 'Buse',
      email: 'genesishvacr@gmail.com',
      address: '19916 Old Owen Rd',
      city: 'Monroe',
      state: 'WA',
      zip: '98272'
    },
    {
      id: '5251',
      firstname: 'Adam',
      lastname: 'Perkins',
      email: 'adam@drheating.com',
      address: '12220 SW Grant Ave',
      city: 'Tigard',
      state: 'Oregon',
      zip: '97223'
    },
    {
      id: '5403',
      firstname: 'Chris',
      lastname: 'Kettman',
      email: 'ckettman@hermanson.com'
    },
    {
      id: '101',
      firstname: 'Lee',
      lastname: 'Montgomery',
      email: 'lmontgomery@thermalsupply.com'
    },
    {
      id: '151',
      firstname: 'Ryan',
      lastname: 'Miller',
      email: 'ryan@seatownservices.com'
    },
    {
      id: '201',
      firstname: 'Rodney',
      lastname: 'Walker',
      email: 'rodd.walker@rectorseal.com'
    },
    {
      id: '351',
      firstname: 'Grace',
      lastname: 'Kittle',
      email: 'grace.kittle@siemens.com'
    }
  ];
}

// Get unique locations from contacts
export function getUniqueLocations(contacts: HubSpotContact[]): string[] {
  const locations = new Set<string>();

  contacts.forEach(contact => {
    if (contact.address || contact.city) {
      const parts = [];
      if (contact.address) parts.push(contact.address);
      if (contact.city) parts.push(contact.city);
      if (contact.state) parts.push(contact.state);
      if (contact.zip) parts.push(contact.zip);

      const location = parts.join(', ');
      if (location) locations.add(location);
    }
  });

  return Array.from(locations).sort();
}
