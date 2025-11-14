# 📅 Calendar Invite Text Generator

A modern, sleek calendar invite text generator built with React, TypeScript, and Tailwind CSS. Inspired by Spotify and Uber's minimalist design language.

## ✨ Features

- 🎨 **Modern UI** - Clean, dark theme with accent colors
- 📝 **Event Templates** - Save and reuse event templates
- 🔄 **Recurring Events** - Support for daily, weekly, and monthly recurring events
- 📋 **Copy to Clipboard** - One-click copy functionality
- 💾 **Supabase Integration** - Cloud storage for event templates
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Real-time Preview** - See your invite text as you type

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works!)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/Kyletho2020/Call-Text-Output.git
cd Call-Text-Output
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a \`.env\` file based on \`.env.example\`:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Update the \`.env\` file with your Supabase credentials:
\`\`\`env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

5. Set up the Supabase database (see [Database Setup](#database-setup) below)

6. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

7. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🗄️ Database Setup

Create the following table in your Supabase project:

\`\`\`sql
CREATE TABLE event_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  goal TEXT,
  agenda TEXT NOT NULL,
  rsvp TEXT NOT NULL,
  recurring JSONB DEFAULT '{"enabled": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth setup)
CREATE POLICY "Allow all operations" ON event_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);
\`\`\`

## 🎨 Color Scheme

This project uses the same color scheme as Volt1.1:

- **Background**: \`#050b16\` - Deep dark blue
- **Surface**: \`#0b1424\` - Dark surface
- **Surface Highlight**: \`#101d33\` - Highlighted surface
- **Accent**: \`#1CFF87\` - Bright neon green
- **Accent Soft**: \`rgba(28, 255, 135, 0.12)\` - Transparent accent

## 📦 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚢 Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Deploy on bolt.new

1. Open [bolt.new](https://bolt.new)
2. Import this GitHub repository
3. Set environment variables
4. Click "Deploy"

## 📝 Usage

1. **Fill Event Details**: Enter event title, date, time, location, goal, agenda, and RSVP details
2. **Set Recurring Options** (optional): Configure recurring event patterns
3. **Preview**: See real-time preview of your calendar invite text
4. **Save Template**: Save frequently used event templates
5. **Copy Text**: Click "Copy Text" to copy the formatted invite to clipboard
6. **Reuse Templates**: Load saved templates with one click

## 🔮 Future Features (v2)

- [ ] HubSpot integration for locations
- [ ] HubSpot integration for attendee lists
- [ ] Email preview mode
- [ ] iCal file export
- [ ] Multiple timezone support
- [ ] Custom branding/themes
- [ ] Calendar integration (Google Calendar, Outlook)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👤 Author

**Kyle Thompson**
- GitHub: [@Kyletho2020](https://github.com/Kyletho2020)

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
