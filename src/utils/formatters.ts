import { EventTemplate } from '../types';
import { format, parse } from 'date-fns';

export const formatEventText = (event: EventTemplate): string => {
  if (!event.title || !event.date || !event.time) {
    return '';
  }

  try {
    // Parse and format date
    const dateObj = new Date(event.date);
    const formattedDate = format(dateObj, 'EEEE, MMMM d, yyyy');

    // Format time to 12-hour format
    const [hours, minutes] = event.time.split(':');
    const timeObj = new Date();
    timeObj.setHours(parseInt(hours), parseInt(minutes));
    const formattedTime = format(timeObj, 'h:mm a');

    let text = `📅 **EVENT INVITATION**

━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 **Event:** ${event.title}

📆 **Date:** ${formattedDate}
🕐 **Time:** ${formattedTime} PST

📍 **Location:** ${event.location}
`;

    if (event.goal) {
      text += `\n🎯 **Goal:** ${event.goal}`;
    }

    if (event.agenda) {
      text += `\n\n📋 **Agenda:**
${event.agenda}`;
    }

    if (event.rsvp) {
      text += `\n\n👥 **RSVP:** ${event.rsvp}`;
    }

    // Add recurring information if enabled
    if (event.recurring?.enabled && event.recurring.frequency) {
      text += `\n\n🔄 **Recurring:** `;

      if (event.recurring.frequency === 'daily') {
        text += 'Daily';
      } else if (event.recurring.frequency === 'weekly') {
        text += `Weekly`;
        if (event.recurring.daysOfWeek && event.recurring.daysOfWeek.length > 0) {
          text += ` on ${event.recurring.daysOfWeek.join(', ')}`;
        }
      } else if (event.recurring.frequency === 'monthly') {
        text += 'Monthly';
      }

      if (event.recurring.endDate) {
        const endDate = format(new Date(event.recurring.endDate), 'MMMM d, yyyy');
        text += ` until ${endDate}`;
      } else if (event.recurring.occurrences) {
        text += ` for ${event.recurring.occurrences} occurrences`;
      }
    }

    text += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━

Please confirm your attendance. Looking forward to seeing you there!`;

    return text;
  } catch (error) {
    console.error('Error formatting event text:', error);
    return '';
  }
};
