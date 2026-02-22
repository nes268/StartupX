import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Plus, Edit, Trash2, Search, User, Mail, Star, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Mentor, CreateMentorData, UpdateMentorData } from '../../../types';
import { useMentors } from '../../../hooks/useMentors';

const MentorManage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const {
    mentors,
    loading,
    error,
    createMentor,
    updateMentor,
    deleteMentor,
    refreshMentors
  } = useMentors();
  
  const [formData, setFormData] = useState<CreateMentorData>({
    name: '',
    role: '',
    email: '',
    experience: '',
    bio: '',
    profilePicture: ''
  });

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    
    try {
      // Auto-generate profile picture initials if not provided
      const mentorData = {
        ...formData,
        profilePicture: formData.profilePicture || getInitials(formData.name)
      };

      if (editingMentor) {
        await updateMentor({
          id: editingMentor.id,
          ...mentorData
        });
        setSuccessMessage('Mentor updated successfully!');
      } else {
        await createMentor(mentorData);
        setSuccessMessage('Mentor added successfully!');
        // Refresh the mentors list to ensure it's up to date
        await refreshMentors();
      }
      
      // Wait a moment to show success message, then reset
      setTimeout(() => {
        resetForm();
        setSuccessMessage(null);
      }, 1500);
    } catch (error) {
      console.error('Error saving mentor:', error);
      // Error is handled by the hook and displayed in the UI
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      email: '',
      experience: '',
      bio: '',
      profilePicture: ''
    });
    setShowAddForm(false);
    setEditingMentor(null);
    setSuccessMessage(null);
  };

  const handleEdit = (mentor: Mentor) => {
    setFormData({
      name: mentor.name,
      role: mentor.role,
      email: mentor.email,
      experience: mentor.experience,
      bio: mentor.bio,
      profilePicture: mentor.profilePicture
    });
    setEditingMentor(mentor);
    setShowAddForm(true);
  };

  const handleDelete = async (mentorId: string) => {
    if (window.confirm('Are you sure you want to delete this mentor?')) {
      try {
        await deleteMentor(mentorId);
      } catch (error) {
        console.error('Error deleting mentor:', error);
        // Error is handled by the hook and displayed in the UI
      }
    }
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentor Management</h1>
            <p className="text-gray-600 mt-1">Manage mentors available to startups</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
            <span className="text-gray-600">Loading mentors...</span>
          </div>
        </div>
      </div>
    );
  }

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={resetForm} disabled={isSubmitting}>
            ← Back to Mentors
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editingMentor ? 'Edit Mentor' : 'Add New Mentor'}
            </h1>
            <p className="text-gray-600 mt-1">
              {editingMentor ? 'Update mentor information' : 'Add a new mentor to the platform'}
            </p>
          </div>
        </div>

        <Card className="p-6 max-w-4xl">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="text-green-700">{successMessage}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter mentor's full name"
                required
                disabled={isSubmitting}
              />

              <Input
                label="Role/Title"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="e.g., Tech Entrepreneur & VC Partner"
                required
                disabled={isSubmitting}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="mentor@example.com"
                required
                disabled={isSubmitting}
              />

              <Input
                label="Experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="e.g., 15+ years in tech startups"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Brief bio and expertise areas..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingMentor ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingMentor ? 'Update Mentor' : 'Add Mentor'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentor Management</h1>
          <p className="text-gray-600 mt-1">Manage mentors available to startups</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Mentor</span>
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                type="text"
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <Card key={mentor.id} className="p-6" hover>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-[var(--accent)] rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                    {mentor.profilePicture || getInitials(mentor.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                    <p className="text-sm text-[var(--accent)]">{mentor.role}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(mentor)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(mentor.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{mentor.email}</span>
                </div>
                
                <p className="text-sm text-gray-700">{mentor.experience}</p>
              </div>

              <p className="text-sm text-gray-600 line-clamp-3">{mentor.bio}</p>
            </div>
          </Card>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {searchTerm ? 'No mentors found' : 'No mentors available'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Add your first mentor to get started'
            }
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            Add First Mentor
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MentorManage;