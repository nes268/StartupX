import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Search, User, MessageSquare, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Mentor } from '../../types';
import { useMentors } from '../../hooks/useMentors';
import { mentorsApi } from '../../services/mentorsApi';
import { useAuth } from '../../context/AuthContext';

const Mentors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [formData, setFormData] = useState({
    startupName: '',
    topic: '',
    preferredTimeSlot: '',
    additionalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { user } = useAuth();

  const {
    mentors,
    loading,
    error,
    refreshMentors
  } = useMentors();

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequestSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowRequestForm(true);
  };

  const handleViewProfile = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowProfile(true);
  };

  const handleBackToMentors = () => {
    setShowProfile(false);
    setShowRequestForm(false);
    setSelectedMentor(null);
    setFormData({
      startupName: '',
      topic: '',
      preferredTimeSlot: '',
      additionalNotes: ''
    });
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (submitError) setSubmitError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.startupName.trim()) {
      setSubmitError('Startup name is required');
      return;
    }
    if (!formData.topic) {
      setSubmitError('Please select a topic');
      return;
    }
    if (!formData.preferredTimeSlot) {
      setSubmitError('Please select a preferred time slot');
      return;
    }
    if (!selectedMentor) {
      setSubmitError('Mentor information is missing');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await mentorsApi.requestSession({
        mentorEmail: selectedMentor.email,
        startupName: formData.startupName.trim(),
        topic: formData.topic,
        preferredTimeSlot: formData.preferredTimeSlot,
        additionalNotes: formData.additionalNotes.trim() || undefined,
        requesterEmail: user?.email,
        requesterName: user?.fullName
      });

      setSubmitSuccess(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        handleBackToMentors();
      }, 3000);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to send session request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (showProfile && selectedMentor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBackToMentors}
          >
            ← Back to Mentors
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text)]">Mentor Profile</h1>
            <p className="text-[var(--text-muted)] mt-1">Detailed profile of {selectedMentor.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="h-24 w-24 bg-[var(--accent)] rounded-full flex items-center justify-center text-[var(--text-inverse)] font-bold text-2xl mx-auto mb-4">
                {selectedMentor.profilePicture}
              </div>
              <h2 className="text-2xl font-bold text-[var(--text)] mb-2">{selectedMentor.name}</h2>
              <p className="text-[var(--accent)] text-lg mb-3">{selectedMentor.role}</p>
              <p className="text-[var(--text-muted)]">{selectedMentor.experience}</p>
            </div>

            <div className="space-y-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setShowProfile(false);
                  setShowRequestForm(true);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Session
              </Button>
              <Button variant="outline" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Contact Mentor
              </Button>
            </div>
          </Card>

          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-[var(--text)] mb-4">About</h3>
              <p className="text-[var(--text)] leading-relaxed">{selectedMentor.bio}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-[var(--text)] mb-4">Expertise Areas</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-[var(--accent)] rounded-full"></div>
                  <span className="text-[var(--text)]">Product Development</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-[var(--accent)] rounded-full"></div>
                  <span className="text-[var(--text)]">Fundraising</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-[var(--accent)] rounded-full"></div>
                  <span className="text-[var(--text)]">Scaling Operations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-[var(--accent)] rounded-full"></div>
                  <span className="text-[var(--text)]">Strategic Planning</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-[var(--text)] mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-[var(--bg-muted)] rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-[var(--text)]" />
                  </div>
                  <div>
                    <p className="text-[var(--text-muted)] text-sm">Email</p>
                    <p className="text-[var(--text)]">{selectedMentor.email}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (showRequestForm && selectedMentor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleBackToMentors}
          >
            ← Back to Mentors
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text)]">Request Session</h1>
            <p className="text-[var(--text-muted)] mt-1">Schedule a mentoring session with {selectedMentor.name}</p>
          </div>
        </div>

        <Card className="p-6 max-w-2xl">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Request Sent Successfully!</h3>
              <p className="text-[var(--text-muted)] mb-4">
                Your session request has been sent to {selectedMentor.name}. They will contact you soon.
              </p>
              <p className="text-sm text-[var(--text-subtle)]">Redirecting back to mentors...</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Session Details</h3>
              </div>

              {submitError && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-600 text-sm">{submitError}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Selected Mentor
                </label>
                <div className="flex items-center space-x-3 p-3 bg-[var(--bg-muted)]/30 rounded-lg">
                  <div className="h-10 w-10 bg-[var(--accent)] rounded-full flex items-center justify-center text-[var(--text-inverse)] font-medium">
                    {selectedMentor.profilePicture}
                  </div>
                  <div>
                    <p className="text-[var(--text)] font-medium">{selectedMentor.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{selectedMentor.role}</p>
                  </div>
                </div>
              </div>

              <Input
                label="Startup Name"
                name="startupName"
                type="text"
                placeholder="Enter your startup name"
                value={formData.startupName}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Topic <span className="text-red-600">*</span>
                </label>
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a topic</option>
                  <option value="business-strategy">Business Strategy</option>
                  <option value="product-development">Product Development</option>
                  <option value="marketing">Marketing & Growth</option>
                  <option value="fundraising">Fundraising</option>
                  <option value="operations">Operations</option>
                  <option value="leadership">Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Preferred Time Slot <span className="text-red-600">*</span>
                </label>
                <select
                  name="preferredTimeSlot"
                  value={formData.preferredTimeSlot}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select preferred time</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 8 PM)</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  rows={4}
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Describe what you'd like to discuss or any specific questions you have..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBackToMentors}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)]">Guidance Center</h1>
          <p className="text-[var(--text-muted)] mt-1">Connect with experienced mentors to grow your startup</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
            <span className="text-[var(--text-muted)]">Loading mentors...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Guidance Center</h1>
        <p className="text-[var(--text-muted)] mt-1">Connect with experienced mentors to grow your startup</p>
      </div>

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
                onClick={refreshMentors}
                className="mt-2 text-red-600 hover:text-red-600"
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                type="text"
                placeholder="Search mentors by name, expertise, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <Card key={mentor.id} className="p-6" hover>
            <div className="text-center mb-4">
              <div className="h-16 w-16 bg-[var(--accent)] rounded-full flex items-center justify-center text-[var(--text-inverse)] font-bold text-xl mx-auto mb-3">
                {mentor.profilePicture}
              </div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-1">{mentor.name}</h3>
              <p className="text-[var(--accent)] text-sm mb-2">{mentor.role}</p>
              <p className="text-[var(--text-muted)] text-sm">{mentor.experience}</p>
            </div>

            <p className="text-[var(--text)] text-sm mb-6 line-clamp-3">
              {mentor.bio}
            </p>

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => handleRequestSession(mentor)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Session
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text)] mb-2">
            {searchTerm ? 'No mentors found' : 'No mentors available'}
          </h3>
          <p className="text-[var(--text-muted)]">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Mentors will appear here once they are added by administrators'
            }
          </p>
        </Card>
      )}
    </div>
  );
};

export default Mentors;