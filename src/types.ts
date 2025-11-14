export interface EventTemplate {
  id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  goal?: string;
  agenda: string;
  rsvp: string;
  recurring?: RecurringPattern;
  created_at?: string;
  updated_at?: string;
}

export interface RecurringPattern {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | '';
  daysOfWeek?: string[];
  endDate?: string;
  occurrences?: number;
}

export interface GeneratedInviteText {
  plainText: string;
  formatted: string;
}
