export interface HubSpotCompany {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface HubSpotContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  contactAddress?: string;
  contactAddress1?: string;
  contactCity?: string;
  contactState?: string;
  contactZip?: string;
  companyName?: string;
  companyAddress?: string;
  companyAddress1?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  // Legacy fields for backward compatibility
  firstname?: string;
  lastname?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  company?: HubSpotCompany | null;
  companyLocation?: string;
}

export type SearchType = 'name' | 'email' | 'phone' | 'company';

// Search HubSpot contacts by query
export async function searchHubSpotContacts(
  query: string,
  searchType: SearchType = 'name'
): Promise<HubSpotContact[]> {
  try {
    const response = await fetch('/.netlify/functions/hubspot-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, searchType }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Search failed' }));
      throw new Error(error.error || 'Failed to search contacts');
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching HubSpot contacts:', error);
    throw error;
  }
}

// Fetch all contacts from HubSpot via our API function
export async function fetchHubSpotContacts(): Promise<HubSpotContact[]> {
  try {
    const response = await fetch('/.netlify/functions/hubspot-contacts');

    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }

    const data = await response.json();

    // Convert to new format with backward compatibility
    const contacts = (data.contacts || []).map((contact: any) => ({
      ...contact,
      firstName: contact.firstname || contact.firstName || '',
      lastName: contact.lastname || contact.lastName || '',
      contactAddress1: contact.address || contact.contactAddress1 || '',
      contactCity: contact.city || contact.contactCity || '',
      contactState: contact.state || contact.contactState || '',
      contactZip: contact.zip || contact.contactZip || '',
      companyName: contact.company?.name || contact.companyName || '',
    }));

    return contacts;
  } catch (error) {
    console.error('Error fetching HubSpot contacts:', error);
    return [];
  }
}

// Get unique locations from contacts
export function getUniqueLocations(contacts: HubSpotContact[]): string[] {
  const locations = new Set<string>();

  contacts.forEach(contact => {
    const contactLocationParts = [
      contact.contactAddress1 || contact.address,
      contact.contactCity || contact.city,
      contact.contactState || contact.state,
      contact.contactZip || contact.zip
    ];
    const contactLocation = contactLocationParts.filter(Boolean).join(', ');
    if (contactLocation) {
      locations.add(contactLocation);
    }

    if (contact.companyLocation) {
      locations.add(contact.companyLocation);
    }

    if (contact.companyAddress) {
      locations.add(contact.companyAddress);
    }

    if (contact.company) {
      const companyParts = [
        contact.company.address,
        contact.company.city,
        contact.company.state,
        contact.company.zip,
      ];
      const companyLocation = companyParts.filter(Boolean).join(', ');
      if (companyLocation) {
        locations.add(companyLocation);
      }
    }
  });

  return Array.from(locations).sort();
}
