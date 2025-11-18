import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../ui/ProgressBar';
import PersonalInfo from './steps/PersonalInfo';
import EnterpriseInfo from './steps/EnterpriseInfo';
import IncubationDetails from './steps/IncubationDetails';
import Documentation from './steps/Documentation';
import PitchDeckTraction from './steps/PitchDeckTraction';
import FundingInfo from './steps/FundingInfo';
import { Profile } from '../../types';
import { Building2 } from 'lucide-react';
import { profileApi } from '../../services/profileApi';
import { startupsApi } from '../../services/startupsApi';

const ProfileWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<Profile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileSubmitted, setProfileSubmitted] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 6;

  const updateProfileData = (stepData: Partial<Profile>) => {
    setProfileData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete profile - save to backend
      if (!user?.id) {
        setError('User not found. Please login again.');
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        // Save profile to backend
        const savedProfile = await profileApi.saveProfile({
          userId: user.id,
          ...profileData
        } as Partial<Profile> & { userId: string });

        // Create startup entry from profile data
        if (savedProfile.startupName && savedProfile.founderName && savedProfile.sector) {
          try {
            await startupsApi.createStartup({
              name: savedProfile.startupName,
              founder: savedProfile.founderName,
              sector: savedProfile.sector,
              type: savedProfile.applicationType || 'incubation',
              email: savedProfile.email,
              submissionDate: new Date().toISOString().split('T')[0],
              userId: user.id,
              status: 'pending'
            });
          } catch (startupError) {
            console.error('Error creating startup entry:', startupError);
            // Don't fail the profile save if startup creation fails
          }
        }

        // Update user profileComplete status (but don't mark as complete until approved)
        // The profile is saved but pending admin approval
        setProfileSubmitted(true);
      } catch (err: any) {
        setError(err.message || 'Failed to save profile. Please try again.');
        console.error('Error saving profile:', err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfo data={profileData} updateData={updateProfileData} onNext={nextStep} />;
      case 2:
        return <EnterpriseInfo data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <IncubationDetails data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <Documentation data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <PitchDeckTraction data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 6:
        return <FundingInfo data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  // Show success message after profile submission
  if (profileSubmitted) {
    return (
      <div className="min-h-screen bg-gray-900 px-4 py-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <Building2 className="h-10 w-10 text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Profile Submitted Successfully!</h1>
            <p className="text-gray-300 mb-6">
              Your profile has been submitted and is now pending admin review. 
              You will be notified once your application has been reviewed.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Please wait for admin approval before accessing the dashboard.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-cyan-400" />
            <h1 className="text-3xl font-bold text-white">Profile Setup</h1>
          </div>
          <p className="text-gray-300">Complete your profile to access the dashboard</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar current={currentStep} total={totalSteps} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
          {renderStep()}
        </div>

        {/* Loading Overlay */}
        {isSaving && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <p className="text-white">Saving profile...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileWizard;