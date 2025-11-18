import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { useNotifications } from '../../../context/NotificationsContext';
import { useStartups } from '../../../hooks/useStartups';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Bell,
  BarChart3,
  Search,
  X,
  Eye,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Startup } from '../../../types';

const AdminOverview: React.FC = () => {
  const { 
    getRecentNotifications, 
    getUnreadCount, 
    markAsRead, 
    deleteNotification,
    refreshNotifications
  } = useNotifications();
  
  const { startups, loading, error, refreshStartups, updateStartup } = useStartups();

  // Refresh notifications when component mounts and periodically
  useEffect(() => {
    refreshNotifications();
    // Refresh notifications every 30 seconds to get new signups and update times
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);
  
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Calculate metrics from real data
  const metrics = useMemo(() => {
    const total = startups.length;
    const incubation = startups.filter(s => s.type === 'incubation').length;
    const innovation = startups.filter(s => s.type === 'innovation').length;
    const dropout = startups.filter(s => s.status === 'dropout').length;
    const pending = startups.filter(s => s.status === 'pending').length;

    return [
      { 
        title: 'Total Startups', 
        value: total.toString(), 
        icon: Building2, 
        color: 'text-blue-400',
        type: 'total'
      },
      { 
        title: 'Incubation Startups', 
        value: incubation.toString(), 
        icon: TrendingUp, 
        color: 'text-green-400',
        type: 'incubation'
      },
      { 
        title: 'Innovation Startups', 
        value: innovation.toString(), 
        icon: Users, 
        color: 'text-cyan-400',
        type: 'innovation'
      },
      { 
        title: 'Pending Approval', 
        value: pending.toString(), 
        icon: AlertTriangle, 
        color: 'text-yellow-400',
        type: 'pending'
      },
    ];
  }, [startups]);

  // Get unique sectors from startups
  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(new Set(startups.map(s => s.sector))).sort();
    return uniqueSectors;
  }, [startups]);

  const stages = ['Incubation', 'Innovation'];

  // Calculate TRL distribution
  const trlData = useMemo(() => {
    const trl1to3 = startups.filter(s => s.trlLevel >= 1 && s.trlLevel <= 3).length;
    const trl4to6 = startups.filter(s => s.trlLevel >= 4 && s.trlLevel <= 6).length;
    const trl7to9 = startups.filter(s => s.trlLevel >= 7 && s.trlLevel <= 9).length;

    return [
      { level: 'TRL 1-3', count: trl1to3, color: 'bg-gradient-to-t from-purple-600 to-purple-500', hexColor: '#8b5cf6', description: 'Basic Research' },
      { level: 'TRL 4-6', count: trl4to6, color: 'bg-gradient-to-t from-cyan-600 to-cyan-500', hexColor: '#06b6d4', description: 'Technology Development' },
      { level: 'TRL 7-9', count: trl7to9, color: 'bg-gradient-to-t from-emerald-600 to-emerald-500', hexColor: '#10b981', description: 'System Demo & Deployment' },
    ];
  }, [startups]);

  const handleApproveStartup = async (startupId: string) => {
    setUpdatingStatus(startupId);
    try {
      await updateStartup(startupId, { status: 'active' });
      await refreshStartups();
    } catch (error) {
      console.error('Error approving startup:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleRejectStartup = async (startupId: string) => {
    setUpdatingStatus(startupId);
    try {
      await updateStartup(startupId, { status: 'dropout' });
      await refreshStartups();
    } catch (error) {
      console.error('Error rejecting startup:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleMetricClick = (metricType: string) => {
    setSelectedMetric(metricType);
    setShowModal(true);
    setSearchTerm('');
    setSelectedSector('all');
    setSelectedStage('all');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMetric(null);
  };

  const getFilteredStartups = (): Startup[] => {
    let filtered = [...startups];

    // Filter by metric type
    if (selectedMetric === 'incubation') {
      filtered = filtered.filter(startup => startup.type === 'incubation');
    } else if (selectedMetric === 'innovation') {
      filtered = filtered.filter(startup => startup.type === 'innovation');
    } else if (selectedMetric === 'pending') {
      filtered = filtered.filter(startup => startup.status === 'pending');
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(startup => 
        startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startup.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        startup.founder.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sector filter
    if (selectedSector !== 'all') {
      filtered = filtered.filter(startup => startup.sector === selectedSector);
    }

    // Apply stage filter
    if (selectedStage !== 'all') {
      const stageType = selectedStage.toLowerCase() as 'incubation' | 'innovation';
      filtered = filtered.filter(startup => startup.type === stageType);
    }

    return filtered;
  };

  const getModalTitle = () => {
    switch (selectedMetric) {
      case 'total': return 'All Startups';
      case 'incubation': return 'Incubation Startups';
      case 'innovation': return 'Innovation Startups';
      case 'pending': return 'Pending Approval';
      default: return 'Startups';
    }
  };

  const getStatusBadge = (status: Startup['status']) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', label: 'Pending' },
      active: { bg: 'bg-green-900/30', text: 'text-green-400', label: 'Active' },
      completed: { bg: 'bg-blue-900/30', text: 'text-blue-400', label: 'Completed' },
      dropout: { bg: 'bg-red-900/30', text: 'text-red-400', label: 'Dropout' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: Startup['type']) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${
        type === 'incubation' 
          ? 'bg-green-900/30 text-green-400' 
          : 'bg-blue-900/30 text-blue-400'
      }`}>
        {type === 'incubation' ? 'Incubation' : 'Innovation'}
      </span>
    );
  };

  // Get dynamic notifications
  const notifications = getRecentNotifications(5);
  const unreadCount = getUnreadCount();

  const maxCount = Math.max(...trlData.map(d => d.count), 1);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of platform metrics and recent activity</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="text-gray-400">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of platform metrics and recent activity</p>
        </div>
        <Card className="p-6 bg-red-900/20 border-red-500/50">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <h3 className="text-red-400 font-medium">Error</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshStartups}
                className="mt-2 text-red-400 hover:text-red-300"
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Overview of platform metrics and recent activity</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="cursor-pointer transition-all duration-200 hover:scale-105"
            onClick={() => handleMetricClick(metric.type)}
          >
            <Card hover className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold text-white">{metric.value}</p>
                </div>
                <div className={`p-3 bg-gray-700 rounded-lg ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* TRL Distribution Bar Chart */}
        <Card className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            TRL Level Distribution
          </h2>
          
          {/* Bar Chart Container - Takes remaining space */}
          <div className="relative flex-1 flex flex-col">
            {/* Y-axis Labels */}
            <div className="absolute left-2 top-0 h-64 flex flex-col justify-between py-4">
              {[maxCount, Math.round(maxCount * 0.75), Math.round(maxCount * 0.5), Math.round(maxCount * 0.25), 0].map((value, index) => (
                <div key={index} className="text-xs text-gray-400 text-right w-8">
                  {value}
                </div>
              ))}
            </div>
            
            {/* Chart Area - Flexible height */}
            <div className="flex items-end justify-between gap-2 h-64 pl-12 pr-4 pb-16 border-b border-gray-700">
              {trlData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  {/* Bar */}
                  <div 
                    className={`w-full max-w-16 ${item.color} rounded-t-lg transition-all duration-500 hover:opacity-80 relative group`}
                    style={{ height: maxCount > 0 ? `${(item.count / maxCount) * 200}px` : '0px', minHeight: item.count > 0 ? '4px' : '0px' }}
                  >
                    {/* Enhanced Hover tooltip */}
                    <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-3 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48 shadow-lg border border-gray-600">
                      <div className="text-center">
                        <div className="font-semibold text-white mb-2">{item.level}</div>
                        <div className="text-2xl font-bold text-cyan-400 mb-1">{item.count}</div>
                        <div className="text-xs text-gray-300 mb-2">startups</div>
                        <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
                          {item.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const total = trlData.reduce((sum, d) => sum + d.count, 0);
                            return total > 0 ? `${((item.count / total) * 100).toFixed(1)}% of total` : '0% of total';
                          })()}
                        </div>
                      </div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* X-axis Labels */}
            <div className="flex justify-between gap-2 pl-12 pr-4 mt-3">
              {trlData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <span className="text-gray-300 font-medium text-xs">{item.level}</span>
                  <span className="text-gray-400 text-xs mt-1 text-center leading-tight">{item.description}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Notifications - Right */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Recent Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refreshNotifications()}
                className="text-xs text-gray-400 hover:text-cyan-400 transition-colors"
                title="Refresh notifications"
              >
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No notifications</h3>
                <p className="text-gray-400">Notifications will appear here when users sign up or other events occur</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    notification.read ? 'bg-gray-700/30' : 'bg-gray-700/50 border border-gray-600'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    notification.type === 'signup' ? 'bg-emerald-400' :
                    notification.type === 'application' ? 'bg-blue-400' :
                    notification.type === 'review' ? 'bg-yellow-400' :
                    notification.type === 'feedback' ? 'bg-purple-400' :
                    notification.type === 'milestone' ? 'bg-cyan-400' :
                    notification.type === 'info' ? 'bg-gray-400' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm flex-1 ${notification.read ? 'text-gray-300' : 'text-white font-medium'}`}>
                        {notification.type === 'signup' && !notification.read && (
                          <span className="inline-block mr-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                            New Applicant
                          </span>
                        )}
                        {notification.message}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    {notification.userName && notification.userEmail && (
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.userName} • {notification.userEmail}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1"
                    title="Delete notification"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Startups Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{getModalTitle()}</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={closeModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search startups..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sector</label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Sectors</option>
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="all">All Stages</option>
                    {stages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4">
                <p className="text-gray-400">
                  Showing {getFilteredStartups().length} of {startups.length} startup{startups.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Startup Name</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Founder</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Sector</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">TRL Level</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Submitted</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredStartups().map((startup) => (
                      <tr key={startup.id} className="border-b border-gray-800 hover:bg-gray-700/20">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <span className="text-white font-medium">{startup.name}</span>
                              <div className="text-xs text-gray-400">{startup.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300">{startup.founder}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300">{startup.sector}</span>
                        </td>
                        <td className="py-4 px-4">
                          {getTypeBadge(startup.type)}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(startup.status)}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-300">TRL {startup.trlLevel}</span>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {new Date(startup.submissionDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {startup.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApproveStartup(startup.id)}
                                  disabled={updatingStatus === startup.id}
                                  className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors disabled:opacity-50"
                                  title="Approve startup"
                                >
                                  {updatingStatus === startup.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleRejectStartup(startup.id)}
                                  disabled={updatingStatus === startup.id}
                                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                                  title="Reject startup"
                                >
                                  {updatingStatus === startup.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                </button>
                              </>
                            )}
                            <button 
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {getFilteredStartups().length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No startups found</h3>
                    <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;