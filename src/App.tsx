import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Target, FileText, Users, Copy, Check, Save, ChevronDown } from 'lucide-react';
import { EventTemplate, RecurringPattern } from './types';
import { supabase } from './lib/supabase';
import { formatEventText } from './utils/formatters';

function App() {
  const [formData, setFormData] = useState<EventTemplate>({
    title: '',
    date: '',
    time: '',
    location: '',
    goal: '',
    agenda: '',
    rsvp: '',
    recurring: {
      enabled: false,
      frequency: '',
      daysOfWeek: [],
      endDate: '',
      occurrences: undefined
    }
  });

  const [savedTemplates, setSavedTemplates] = useState<EventTemplate[]>([]);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);

  // Load saved templates from Supabase
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('event_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setSavedTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleInputChange = (field: keyof EventTemplate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRecurringChange = (field: keyof RecurringPattern, value: any) => {
    setFormData(prev => ({
      ...prev,
      recurring: { ...prev.recurring!, [field]: value }
    }));
  };

  const generatePreview = () => {
    const text = formatEventText(formData);
    setGeneratedText(text);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const saveTemplate = async () => {
    try {
      const { error } = await supabase
        .from('event_templates')
        .insert([formData]);

      if (error) throw error;
      await loadTemplates();
      alert('Template saved successfully! ✅');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
  };

  const loadTemplate = (template: EventTemplate) => {
    setFormData(template);
    generatePreview();
  };

  useEffect(() => {
    if (formData.title || formData.date) {
      generatePreview();
    }
  }, [formData]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
            Calendar Invite Generator
          </h1>
          <p className="text-gray-400 text-lg">Create professional event invites in seconds</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Calendar className="text-accent" size={24} />
                Event Details
              </h2>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300">Event Title *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Team Sync Meeting"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                    <Calendar size={16} /> Date *
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                    <Clock size={16} /> Time *
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                  <MapPin size={16} /> Location *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Conference Room A / Zoom Link"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              {/* Event Goal */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                  <Target size={16} /> Event Goal (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Align on Q1 objectives"
                  value={formData.goal}
                  onChange={(e) => handleInputChange('goal', e.target.value)}
                />
              </div>

              {/* Agenda */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                  <FileText size={16} /> Agenda *
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={4}
                  placeholder={\`1. Review progress
2. Discuss challenges
3. Plan next steps\`}
                  value={formData.agenda}
                  onChange={(e) => handleInputChange('agenda', e.target.value)}
                />
              </div>

              {/* RSVP */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300 flex items-center gap-2">
                  <Users size={16} /> RSVP Details *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="john@company.com, jane@company.com"
                  value={formData.rsvp}
                  onChange={(e) => handleInputChange('rsvp', e.target.value)}
                />
              </div>

              {/* Recurring Options Toggle */}
              <button
                onClick={() => setShowRecurring(!showRecurring)}
                className="w-full btn-secondary flex items-center justify-between mb-4"
              >
                <span>Recurring Event Options</span>
                <ChevronDown className={\`transition-transform \${showRecurring ? 'rotate-180' : ''}\`} size={20} />
              </button>

              {/* Recurring Options */}
              {showRecurring && (
                <div className="bg-surface-highlight rounded-lg p-4 mb-4 space-y-4 border border-accent-soft">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.recurring?.enabled}
                        onChange={(e) => handleRecurringChange('enabled', e.target.checked)}
                        className="w-4 h-4 accent-accent"
                      />
                      <span className="text-sm font-medium">Enable Recurring Event</span>
                    </label>
                  </div>

                  {formData.recurring?.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Frequency</label>
                        <select
                          className="input-field"
                          value={formData.recurring?.frequency}
                          onChange={(e) => handleRecurringChange('frequency', e.target.value)}
                        >
                          <option value="">Select frequency</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      {formData.recurring?.frequency === 'weekly' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Days of Week</label>
                          <div className="flex flex-wrap gap-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                              <label key={day} className="flex items-center gap-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.recurring?.daysOfWeek?.includes(day)}
                                  onChange={(e) => {
                                    const days = formData.recurring?.daysOfWeek || [];
                                    const newDays = e.target.checked
                                      ? [...days, day]
                                      : days.filter(d => d !== day);
                                    handleRecurringChange('daysOfWeek', newDays);
                                  }}
                                  className="w-4 h-4 accent-accent"
                                />
                                <span className="text-sm">{day}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">End Date</label>
                          <input
                            type="date"
                            className="input-field"
                            value={formData.recurring?.endDate}
                            onChange={(e) => handleRecurringChange('endDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Or # Occurrences</label>
                          <input
                            type="number"
                            className="input-field"
                            placeholder="10"
                            value={formData.recurring?.occurrences || ''}
                            onChange={(e) => handleRecurringChange('occurrences', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button onClick={saveTemplate} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <Save size={18} />
                  Save Template
                </button>
              </div>
            </div>

            {/* Saved Templates */}
            {savedTemplates.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Saved Templates</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className="w-full text-left p-3 bg-surface-highlight rounded-lg hover:border-accent border border-transparent transition-all"
                    >
                      <div className="font-medium">{template.title}</div>
                      <div className="text-sm text-gray-400">{template.date} at {template.time}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Preview</h2>
                <button
                  onClick={copyToClipboard}
                  disabled={!generatedText}
                  className={\`btn-primary flex items-center gap-2 \${!generatedText ? 'opacity-50 cursor-not-allowed' : ''}\`}
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy Text
                    </>
                  )}
                </button>
              </div>

              <div className="bg-background rounded-lg p-6 min-h-[400px] border border-surface-highlight">
                {generatedText ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-200">
                    {generatedText}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p className="text-center">
                      Fill in the event details to see a preview
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
