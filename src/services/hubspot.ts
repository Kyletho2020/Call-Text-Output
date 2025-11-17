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

// Fetch all contacts from HubSpot via our API function
export async function fetchHubSpotContacts(): Promise<HubSpotContact[]> {
  try {
    const response = await fetch('/.netlify/functions/hubspot-contacts');

    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }

    const data = await response.json();
    return data.contacts || [];
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
