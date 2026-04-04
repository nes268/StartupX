import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ModalPortal } from '../ui/ModalPortal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  X,
  ExternalLink,
  MapPin,
  User,
} from 'lucide-react';
import { Event } from '../../types';
import { useEvents } from '../../hooks/useEvents';

function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate.includes('T') ? isoDate : `${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Use shared events API instead of local state
  const {
    events,
    upcomingEvents,
    loading,
    error,
    createEvent,
    refreshEvents
  } = useEvents();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.date || !formData.time) {
      alert('Please fill in all required fields (Title, Date, Time)');
      return;
    }

    try {
      // Create new event using the shared API
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location || 'TBD',
        category: formData.category || 'Meeting',
        organizedBy: 'Current User', // You might want to get this from auth context
        registrationLink: '',
        onlineEventUrl: ''
      };

      await createEvent(eventData);

      // Navigate to the month of the new event
      const eventDate = new Date(formData.date);
      setCurrentDate(eventDate);

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      // Reset form and close
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: ''
      });
      setShowEventForm(false);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderMonthView = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      const dayEvents = events.filter(event => event.date === dateStr);
      const isToday = isCurrentMonth && dayNumber === new Date().getDate() && 
                     currentDate.getMonth() === new Date().getMonth() && 
                     currentDate.getFullYear() === new Date().getFullYear();

      days.push(
        <div key={i} className={`min-h-24 p-2 border border-[var(--border)] ${isCurrentMonth ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-subtle)]'}`}>
          {isCurrentMonth && (
            <>
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                {dayNumber}
              </div>
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <div key={event.id} className="text-xs bg-[var(--accent)] text-[var(--text-inverse)] px-2 py-1 rounded truncate">
                    {event.title}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-4 bg-[var(--bg-muted)] text-center text-sm font-medium text-[var(--text)] border border-[var(--border)]">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text)]">Calendar</h1>
            <p className="text-[var(--text-muted)] mt-1">Manage your events and meetings</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
            <span className="text-[var(--text-muted)]">Loading events...</span>
          </div>
        </div>
      </div>
    );
  }

  if (showEventForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setShowEventForm(false)}>
            ← Back to Calendar
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text)]">Create Event</h1>
            <p className="text-[var(--text-muted)] mt-1">Schedule a new event or meeting</p>
          </div>
        </div>

        <Card className="p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Event Title *</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Description</label>
              <textarea 
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Event description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Date *</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Time *</label>
                <input 
                  type="time" 
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Location</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Event location or 'Online'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="">Select category</option>
                <option value="Meeting">Meeting</option>
                <option value="Mentorship">Mentorship</option>
                <option value="Presentation">Presentation</option>
                <option value="Workshop">Workshop</option>
                <option value="Networking">Networking</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={() => setShowEventForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Event
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-300">Event created successfully!</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-900/20 border-red-500/50">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-red-600 font-medium">Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshEvents}
                className="mt-2 text-red-600 hover:text-red-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Calendar</h1>
        <p className="text-[var(--text-muted)] mt-1">Manage your events and meetings</p>
      </div>

      {/* Calendar Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-[var(--bg-muted)] rounded-lg">
              <ChevronLeft className="h-5 w-5 text-[var(--text)]" />
            </button>
            <h2 className="text-xl font-semibold text-[var(--text)]">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-[var(--bg-muted)] rounded-lg">
              <ChevronRight className="h-5 w-5 text-[var(--text)]" />
            </button>
          </div>

        </div>

        {/* Calendar Grid */}
        {renderMonthView()}
      </Card>

      {/* Upcoming Events — titles only; full admin details in modal */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Upcoming Events
        </h3>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4 text-center">No upcoming events scheduled.</p>
        ) : (
          <ul className="space-y-1">
            {upcomingEvents.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-muted)]/30 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-surface)]"
                >
                  <span className="font-medium text-[var(--text)]">{event.title}</span>
                  <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                    {formatDisplayDate(event.date)}
                    {event.time ? ` · ${event.time}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {selectedEvent && (
        <ModalPortal onBackdropClick={() => setSelectedEvent(null)}>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Card className="max-h-[min(88vh,640px)] overflow-hidden border border-[var(--border-muted)] shadow-[var(--shadow-card)]">
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border-muted)] px-5 py-4">
                <h2 className="pr-8 text-lg font-semibold leading-snug text-[var(--text)]">
                  {selectedEvent.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-muted)]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[min(72vh,520px)] space-y-4 overflow-y-auto px-5 py-4 text-[var(--text)]">
                {selectedEvent.description?.trim() ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Description</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text-muted)]">{selectedEvent.description}</p>
                  </div>
                ) : null}

                <div className="grid gap-3 text-sm">
                  <div className="flex gap-2">
                    <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)]">When</p>
                      <p className="text-[var(--text)]">
                        {formatDisplayDate(selectedEvent.date)}
                        {selectedEvent.time ? ` at ${selectedEvent.time}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)]">Location</p>
                      <p className="text-[var(--text)]">{selectedEvent.location || '—'}</p>
                    </div>
                  </div>
                  {selectedEvent.category ? (
                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)]">Category</p>
                      <span
                        className={`mt-1 inline-block text-xs px-2 py-1 rounded-full ${
                          selectedEvent.category === 'Meeting'
                            ? 'bg-blue-900/30 text-blue-400'
                            : selectedEvent.category === 'Mentorship'
                              ? 'bg-emerald-900/30 text-emerald-400'
                              : 'bg-[var(--bg-muted)] text-[var(--text)]'
                        }`}
                      >
                        {selectedEvent.category}
                      </span>
                    </div>
                  ) : null}
                  {selectedEvent.organizedBy?.trim() ? (
                    <div className="flex gap-2">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                      <div>
                        <p className="text-xs font-medium text-[var(--text-muted)]">Organized by</p>
                        <p className="text-[var(--text)]">{selectedEvent.organizedBy}</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {(selectedEvent.registrationLink?.trim() || selectedEvent.onlineEventUrl?.trim()) && (
                  <div className="flex flex-col gap-2 border-t border-[var(--border-muted)] pt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Links</p>
                    {selectedEvent.registrationLink?.trim() ? (
                      <a
                        href={selectedEvent.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        Registration
                      </a>
                    ) : null}
                    {selectedEvent.onlineEventUrl?.trim() ? (
                      <a
                        href={selectedEvent.onlineEventUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        Online event
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="border-t border-[var(--border-muted)] px-5 py-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </div>
            </Card>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default Calendar;