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
  firstname: string;
  lastname: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  company?: HubSpotCompany | null;
  companyLocation?: string;
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
    const contactLocationParts = [contact.address, contact.city, contact.state, contact.zip];
    const contactLocation = contactLocationParts.filter(Boolean).join(', ');
    if (contactLocation) {
      locations.add(contactLocation);
    }

    if (contact.companyLocation) {
      locations.add(contact.companyLocation);
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
