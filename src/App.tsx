import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FundingProvider } from './context/FundingContext';
import { AlertsProvider } from './context/AlertsContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ApplicationsProvider } from './context/ApplicationsContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProfileWizard from './components/profile/ProfileWizard';
import Loading from './components/Loading';
import DashboardLayout from './components/layout/DashboardLayout';
import Overview from './components/dashboard/startup/Overview';
import AdminOverview from './components/dashboard/admin/AdminOverview';
import DataRoom from './components/dashboard/DataRoom';
import Mentors from './components/dashboard/Mentors';
import Calendar from './components/dashboard/Calendar';
import PitchDeck from './components/dashboard/PitchDeck';
import Fundraising from './components/dashboard/Fundraising';
import Settings from './components/dashboard/Settings';
import AdminReview from './components/dashboard/admin/Review';
import AdminEvents from './components/dashboard/admin/Events';
import AdminMentors from './components/dashboard/admin/MentorManage';
import AdminInvestors from './components/dashboard/admin/InvestorManage';
import AdminStartups from './components/dashboard/admin/StartupManage';
import AdminDataRoom from './components/dashboard/admin/AdminDataRoom';
import { startupsApi } from './services/startupsApi';
import { notificationsApi, UserNotification } from './services/notificationsApi';
import { Startup } from './types';
import { Building2, AlertCircle, X } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Component to check if user's startup is approved before allowing dashboard access
function StartupApprovalCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [rejectionNotification, setRejectionNotification] = useState<UserNotification | null>(null);
  const [showRejectionAlert, setShowRejectionAlert] = useState(false);

  useEffect(() => {
    const checkStartupApproval = async () => {
      if (!user || user.role === 'admin') {
        setIsChecking(false);
        return;
      }

      try {
        const userStartup = await startupsApi.getStartupByUserId(user.id);
        setStartup(userStartup);

        // Check for rejection notifications
        if (userStartup && userStartup.status === 'rejected') {
          try {
            const notifications = await notificationsApi.getUserNotifications(user.id);
            const rejectionNotif = notifications.find(n => n.type === 'rejection' && !n.read);
            if (rejectionNotif) {
              setRejectionNotification(rejectionNotif);
              setShowRejectionAlert(true);
            }
          } catch (error) {
            console.error('Error fetching notifications:', error);
          }
        }
      } catch (error) {
        console.error('Error checking startup approval:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkStartupApproval();
  }, [user]);

  if (isChecking) {
    return <Loading />;
  }

  // Admin users can always access dashboard
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  // If user doesn't have a startup yet, redirect to profile wizard
  if (!startup) {
    return (
      <div className="min-h-screen bg-dots-pattern flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-[var(--bg-surface)] rounded-[18px] shadow-[var(--shadow-card)] p-8">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">Profile Not Complete</h2>
            <p className="text-[var(--text-muted)] mb-6">
              Please complete your profile setup to access the dashboard.
            </p>
            <Navigate to="/profile-wizard" replace />
          </div>
        </div>
      </div>
    );
  }

  // If startup is pending or rejected, show waiting message
  if (startup.status === 'pending' || startup.status === 'rejected') {
    const handleDismissRejection = async () => {
      if (rejectionNotification) {
        try {
          await notificationsApi.markAsRead(rejectionNotification.id);
          setShowRejectionAlert(false);
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      }
    };

    return (
      <div className="min-h-screen bg-dots-pattern flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-4">
          {/* Rejection Notification Alert */}
          {showRejectionAlert && rejectionNotification && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 relative">
              <button
                onClick={handleDismissRejection}
                className="absolute top-2 right-2 text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-[var(--text)] font-semibold mb-1">Application Rejected</h3>
                  <p className="text-red-600 text-sm">{rejectionNotification.message}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[var(--bg-surface)] rounded-[18px] shadow-[var(--shadow-card)] p-8 text-center">
            <Building2 className={`h-12 w-12 mx-auto mb-4 ${startup.status === 'pending' ? 'text-amber-500' : 'text-red-500'}`} />
            <h2 className="text-2xl font-semibold text-[var(--text)] mb-4">
              {startup.status === 'pending' ? 'Application Under Review' : 'Application Rejected'}
            </h2>
            <p className="text-[var(--text-muted)] mb-6">
              {startup.status === 'pending' 
                ? 'Your profile is currently under review by the admin. You will be notified once a decision has been made.'
                : 'Your application has been rejected by the admin. Please contact support for more information.'}
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full font-medium transition-all hover:shadow-lg hover:shadow-[var(--accent)]/20"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If startup is approved, allow access
  if (startup.status === 'approved') {
    return <>{children}</>;
  }

  // For other statuses, allow access (active, completed, etc.)
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  // Allow access to login and signup pages even if user is logged in
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return <>{children}</>;
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      // For regular users, check if they have completed profile
      // The StartupApprovalCheck will handle the approval status
      if (user.profileComplete) {
        return <Navigate to="/dashboard" replace />;
      } else {
        return <Navigate to="/profile-wizard" replace />;
      }
    }
  }

  return <>{children}</>;
}

function App() {
  return (
    <div className="min-h-screen">
      <ApplicationsProvider>
        <AuthProvider>
          <NotificationsProvider>
            <FundingProvider>
              <AlertsProvider>
                <Router>
          <Routes>
          {/* Login route */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          
          {/* Profile Wizard route */}
          <Route 
            path="/profile-wizard" 
            element={
              <ProtectedRoute>
                <ProfileWizard />
              </ProtectedRoute>
            }
          />
          
          {/* Dashboard route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <StartupApprovalCheck>
                  <DashboardLayout />
                </StartupApprovalCheck>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardContent />} />
            <Route path="data-room" element={<DataRoom />} />
            <Route path="mentors" element={<Mentors />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="pitch-deck" element={<PitchDeck />} />
            <Route path="fundraising" element={<Fundraising />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="review" element={<AdminReview />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="mentors" element={<AdminMentors />} />
            <Route path="investors" element={<AdminInvestors />} />
            <Route path="startups" element={<AdminStartups />} />
            <Route path="data-room" element={<AdminDataRoom />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
              </Router>
            </AlertsProvider>
          </FundingProvider>
        </NotificationsProvider>
      </AuthProvider>
    </ApplicationsProvider>
    </div>
  );
}

// Component to determine which dashboard to show based on user role
function DashboardContent() {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <AdminOverview />;
  }
  
  return <Overview />;
}

export default App;