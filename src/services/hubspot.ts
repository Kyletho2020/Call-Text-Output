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

export interface HubSpotCredentials {
  access_token: string;
  client_secret: string;
}

// Fetch HubSpot credentials from Supabase
async function getHubSpotCredentials(): Promise<HubSpotCredentials | null> {
  try {
    const { data, error } = await supabase
      .from('hubspot_credentials')
      .select('access_token, client_secret')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching HubSpot credentials:', error);
    return null;
  }
}

// Fetch all contacts from HubSpot
export async function fetchHubSpotContacts(): Promise<HubSpotContact[]> {
  try {
    const credentials = await getHubSpotCredentials();
    if (!credentials) throw new Error('No HubSpot credentials found');

    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,address,city,state,zip`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch contacts');

    const data = await response.json();
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
    return [];
  }
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
