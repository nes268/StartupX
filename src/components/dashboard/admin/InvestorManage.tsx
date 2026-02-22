import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Plus, Edit, Trash2, Search, DollarSign, Mail, Phone, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Investor, CreateInvestorData } from '../../../types';
import { useInvestors } from '../../../hooks/useInvestors';

const InvestorManage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const {
    investors,
    loading,
    error,
    createInvestor,
    updateInvestor,
    deleteInvestor,
    refreshInvestors
  } = useInvestors();
  
  const [formData, setFormData] = useState<CreateInvestorData>({
    name: '',
    firm: '',
    email: '',
    phoneNumber: '',
    investmentRange: '',
    focusAreas: [],
    backgroundSummary: '',
    profilePicture: ''
  });

  const focusAreaOptions = [
    'SaaS', 'AI/ML', 'FinTech', 'HealthTech', 'EdTech', 'CleanTech',
    'E-commerce', 'B2B', 'B2C', 'Mobile', 'Blockchain', 'IoT',
    'Sustainability', 'Healthcare', 'Agriculture', 'Real Estate'
  ];

  const filteredInvestors = investors.filter(investor =>
    investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.firm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    investor.focusAreas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFocusAreaToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    // Clear any previous errors from the hook
    if (error) {
      refreshInvestors().catch(() => {}); // This will reset error state
    }
    
    try {
      // Auto-generate profile picture initials if not provided
      const investorData = {
        ...formData,
        profilePicture: formData.profilePicture || getInitials(formData.name)
      };

      if (editingInvestor) {
        await updateInvestor({
          id: editingInvestor.id,
          ...investorData
        });
        setSuccessMessage('Investor updated successfully!');
      } else {
        await createInvestor(investorData);
        setSuccessMessage('Investor added successfully!');
        // Refresh the investors list to ensure it's up to date
        await refreshInvestors();
      }
      
      // Wait a moment to show success message, then reset
      setTimeout(() => {
        resetForm();
        setSuccessMessage(null);
      }, 1500);
    } catch (error: any) {
      console.error('Error saving investor:', error);
      // Error is handled by the hook and displayed in the UI
      // The error state from useInvestors hook will show the error
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      firm: '',
      email: '',
      phoneNumber: '',
      investmentRange: '',
      focusAreas: [],
      backgroundSummary: '',
      profilePicture: ''
    });
    setShowAddForm(false);
    setEditingInvestor(null);
    setSuccessMessage(null);
  };

  const handleEdit = (investor: Investor) => {
    setFormData({
      name: investor.name,
      firm: investor.firm,
      email: investor.email,
      phoneNumber: investor.phoneNumber,
      investmentRange: investor.investmentRange,
      focusAreas: investor.focusAreas,
      backgroundSummary: investor.backgroundSummary,
      profilePicture: investor.profilePicture
    });
    setEditingInvestor(investor);
    setShowAddForm(true);
  };

  const handleDelete = async (investorId: string) => {
    if (window.confirm('Are you sure you want to delete this investor?')) {
      try {
        await deleteInvestor(investorId);
      } catch (error) {
        console.error('Error deleting investor:', error);
        // Error is handled by the hook and displayed in the UI
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investor Management</h1>
            <p className="text-gray-600 mt-1">Manage investors available for startups</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
            <span className="text-gray-600">Loading investors...</span>
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
            ← Back to Investors
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editingInvestor ? 'Edit Investor' : 'Add New Investor'}
            </h1>
            <p className="text-gray-600 mt-1">
              {editingInvestor ? 'Update investor information' : 'Add a new investor to the platform'}
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
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="text-red-600 font-medium">Error</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Investor Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter investor's full name"
                required
                disabled={isSubmitting}
              />

              <Input
                label="Firm/Company"
                name="firm"
                value={formData.firm}
                onChange={handleInputChange}
                placeholder="Investment firm or company name"
                required
                disabled={isSubmitting}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="investor@example.com"
                required
                disabled={isSubmitting}
              />

              <Input
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting}
              />

              <div className="md:col-span-2">
                <Input
                  label="Investment Range"
                  name="investmentRange"
                  value={formData.investmentRange}
                  onChange={handleInputChange}
                  placeholder="e.g., $100K - $2M"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Focus Areas</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {focusAreaOptions.map(area => (
                  <label key={area} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.focusAreas.includes(area)}
                      onChange={() => handleFocusAreaToggle(area)}
                      className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    />
                    <span className="text-gray-700 text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Summary</label>
              <textarea
                name="backgroundSummary"
                value={formData.backgroundSummary}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Brief background and investment philosophy..."
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
                    {editingInvestor ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingInvestor ? 'Update Investor' : 'Add Investor'
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
          <h1 className="text-3xl font-bold text-gray-900">Investor Management</h1>
          <p className="text-gray-600 mt-1">Manage investors available for startups</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Investor</span>
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
                onClick={refreshInvestors}
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
                placeholder="Search investors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Investors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInvestors.map((investor) => (
          <Card key={investor.id} className="p-6" hover>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-[var(--accent)] rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                    {investor.profilePicture || getInitials(investor.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{investor.name}</h3>
                    <p className="text-sm text-[var(--accent)]">{investor.firm}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(investor)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(investor.id)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{investor.email}</span>
                </div>
                
                {investor.phoneNumber && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{investor.phoneNumber}</span>
                  </div>
                )}
                
                {investor.investmentRange && (
                  <div className="flex items-center text-sm text-gray-700">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{investor.investmentRange}</span>
                  </div>
                )}
              </div>

              {investor.focusAreas && investor.focusAreas.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Focus Areas:</p>
                  <div className="flex flex-wrap gap-2">
                    {investor.focusAreas.map(area => (
                      <span key={area} className="text-xs px-2 py-1 bg-[var(--accent-muted)] text-[var(--accent)] rounded-full">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {investor.backgroundSummary && (
                <p className="text-sm text-gray-600 line-clamp-3">{investor.backgroundSummary}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredInvestors.length === 0 && (
        <Card className="p-12 text-center">
          <DollarSign className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {searchTerm ? 'No investors found' : 'No investors available'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria' 
              : 'Add your first investor to get started'
            }
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            Add First Investor
          </Button>
        </Card>
      )}
    </div>
  );
};

export default InvestorManage;