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
  PieChart,
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
  const [hoveredSector, setHoveredSector] = useState<{ sector: string; percentage: number; count: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate metrics from real data - only count approved/active startups
  const metrics = useMemo(() => {
    // Filter out pending and rejected startups
    // Include: 'approved', 'active', 'completed', 'dropout'
    const approvedStartups = startups.filter(s => s.status !== 'pending' && s.status !== 'rejected');
    const total = approvedStartups.length;
    const incubation = approvedStartups.filter(s => s.type === 'incubation').length;
    const innovation = approvedStartups.filter(s => s.type === 'innovation').length;
    const dropout = approvedStartups.filter(s => s.status === 'dropout').length;
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
        color: 'text-[var(--accent-soft)]',
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

  // Calculate sector distribution for approved/active startups only
  const sectorData = useMemo(() => {
    const sectorCounts: Record<string, number> = {};
    
    // Only count approved/active startups - exclude pending and rejected
    // Include: 'approved', 'active', 'completed', 'dropout'
    const approvedStartups = startups.filter(s => s.status !== 'pending' && s.status !== 'rejected');
    
    approvedStartups.forEach(startup => {
      const sector = startup.sector || 'Other';
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });

    // Vibrant color palette for charts
    const colors = [
      { hex: '#8b5cf6', name: 'violet' }, // Violet-500
      { hex: '#4F46E5', name: 'accent' }, // Accent color
      { hex: '#10b981', name: 'emerald' }, // Emerald-500
      { hex: '#f59e0b', name: 'amber' }, // Amber-500
      { hex: '#ec4899', name: 'pink' }, // Pink-500
      { hex: '#3b82f6', name: 'blue' }, // Blue-500
      { hex: '#14b8a6', name: 'teal' }, // Teal-500
      { hex: '#f97316', name: 'orange' }, // Orange-500
      { hex: '#6366f1', name: 'indigo' }, // Indigo-500
      { hex: '#84cc16', name: 'lime' }, // Lime-500
    ];

    const sortedSectors = Object.entries(sectorCounts)
      .map(([sector, count], index) => ({
        sector,
        count,
        color: colors[index % colors.length].hex,
        colorName: colors[index % colors.length].name,
      }))
      .sort((a, b) => b.count - a.count);

    return sortedSectors;
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
    // Only show approved/active startups - exclude pending and rejected (except when viewing pending metric)
    // Include: 'approved', 'active', 'completed', 'dropout'
    let filtered = startups.filter(s => {
      if (selectedMetric === 'pending') {
        // Show pending startups only when viewing pending metric
        return s.status === 'pending';
      }
      // For all other views, exclude pending and rejected
      return s.status !== 'pending' && s.status !== 'rejected';
    });

    // Filter by metric type
    if (selectedMetric === 'incubation') {
      filtered = filtered.filter(startup => startup.type === 'incubation');
    } else if (selectedMetric === 'innovation') {
      filtered = filtered.filter(startup => startup.type === 'innovation');
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
    // Normalize status for display: approved/active/completed -> active, dropout -> dropout
    // This is for overview page (not review page)
    const normalizedStatus = status === 'dropout' ? 'dropout' : 'active';
    
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      dropout: { bg: 'bg-red-100', text: 'text-red-700', label: 'Dropout' }
    };
    const config = statusConfig[normalizedStatus] || statusConfig.active;
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
          ? 'bg-green-100 text-green-700' 
          : 'bg-blue-100 text-blue-700'
      }`}>
        {type === 'incubation' ? 'Incubation' : 'Innovation'}
      </span>
    );
  };

  // Get dynamic notifications
  const notifications = getRecentNotifications(5);
  const unreadCount = getUnreadCount();

  // Calculate pie chart data - total startups across all sectors
  const totalStartups = sectorData.reduce((sum, d) => sum + d.count, 0);
  
  // Helper function to create pie chart path (full pie chart)
  const createPieSlice = (startAngle: number, endAngle: number, centerX: number, centerY: number, radius: number) => {
    // Convert angles to radians
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    
    // Calculate arc end points
    const startX = centerX + radius * Math.cos(startRad);
    const startY = centerY + radius * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(endRad);
    const endY = centerY + radius * Math.sin(endRad);
    
    // Determine if we need large arc flag (for angles > 180 degrees)
    const angleDiff = endAngle - startAngle;
    const largeArcFlag = angleDiff > 180 ? 1 : 0;
    
    // Build the path for pie slice
    // Start from center, draw line to start point, arc to end point, close path back to center
    return `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Admin Dashboard</h1>
          <p className="text-[var(--text-muted)]">Overview of platform metrics and recent activity</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
            <span className="text-[var(--text-muted)]">Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Admin Dashboard</h1>
          <p className="text-[var(--text-muted)]">Overview of platform metrics and recent activity</p>
        </div>
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-red-700 font-medium">Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshStartups}
                className="mt-2 text-red-600 hover:text-red-700"
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
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Admin Dashboard</h1>
        <p className="text-[var(--text-muted)]">Overview of platform metrics and recent activity</p>
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
                  <p className="text-sm text-[var(--text-muted)] mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold text-[var(--text)]">{metric.value}</p>
                </div>
                <div className={`p-3 bg-[var(--bg-muted)] rounded-xl ${metric.color}`}>
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sector Distribution Pie Chart */}
        <Card className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-6 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Sector Distribution
          </h2>
          
          {/* Pie Chart Container */}
          <div className="relative flex-1 flex flex-col items-center justify-center">
            {totalStartups === 0 ? (
              <div className="text-center py-12">
                <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No startups</h3>
                <p className="text-[var(--text-muted)]">Startup data will appear here</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full">
                {/* Pie Chart SVG */}
                <div className="relative mb-6">
                  <svg 
                    width="320" 
                    height="320" 
                    viewBox="0 0 320 320" 
                    className="drop-shadow-lg"
                    onMouseMove={(e) => {
                      if (hoveredSector) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipPosition({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top
                        });
                      }
                    }}
                  >
                    {sectorData.reduce((acc, item, index) => {
                      // Calculate percentage accurately
                      const percentage = totalStartups > 0 ? (item.count / totalStartups) * 100 : 0;
                      
                      // Calculate angles based on percentage (ensuring they add up to 360)
                      const startAngle = acc.currentAngle;
                      // For the last slice, ensure it closes the circle exactly at 360
                      const isLastSlice = index === sectorData.length - 1;
                      const endAngle = isLastSlice ? 360 : startAngle + (percentage / 100) * 360;
                      
                      // Center of the SVG (viewBox is 0 0 320 320, so center is 160, 160)
                      const centerX = 160;
                      const centerY = 160;
                      const radius = 125; // Radius of the pie chart
                      
                      // Calculate midpoint angle for label positioning
                      const midAngle = percentage === 100 ? 0 : (startAngle + endAngle) / 2;
                      const midAngleRad = ((midAngle - 90) * Math.PI) / 180;
                      const labelRadius = 70; // Distance from center for labels (positioned in the middle of the slice)
                      const labelX = centerX + labelRadius * Math.cos(midAngleRad);
                      const labelY = centerY + labelRadius * Math.sin(midAngleRad);
                      
                      const slice = (
                        <g 
                          key={index} 
                          className="group cursor-pointer"
                          transform={`translate(${centerX}, ${centerY})`}
                          style={{ 
                            transition: 'transform 0.3s ease-out',
                            transformOrigin: '0 0'
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                            if (rect) {
                              setTooltipPosition({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top
                              });
                            }
                            setHoveredSector({ 
                              sector: item.sector, 
                              percentage: percentage,
                              count: item.count
                            });
                            // Add scale transform on hover
                            e.currentTarget.style.transform = 'translate(160, 160) scale(1.05)';
                          }}
                          onMouseMove={(e) => {
                            const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                            if (rect) {
                              setTooltipPosition({
                                x: e.clientX - rect.left,
                                y: e.clientY - rect.top
                              });
                            }
                          }}
                          onMouseLeave={(e) => {
                            setHoveredSector(null);
                            // Reset scale on leave
                            e.currentTarget.style.transform = 'translate(160, 160) scale(1)';
                          }}
                        >
                          <path
                            d={createPieSlice(startAngle, endAngle, 0, 0, radius)}
                            fill={item.color}
                            className="transition-all duration-300 group-hover:opacity-90 group-hover:brightness-110"
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                          />
                        </g>
                      );
                      
                      acc.slices.push(slice);
                      acc.currentAngle = endAngle;
                      return acc;
                    }, { slices: [] as JSX.Element[], currentAngle: 0 }).slices}
                  </svg>
                  
                  {/* Tooltip */}
                  {hoveredSector && (
                    <div
                      className="absolute pointer-events-none z-10 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-xl min-w-[140px]"
                      style={{
                        left: `${Math.min(tooltipPosition.x + 15, 240)}px`,
                        top: `${Math.max(tooltipPosition.y - 50, 10)}px`,
                        transform: 'translateY(-100%)'
                      }}
                    >
                      <div className="text-sm font-semibold text-[var(--text)] mb-1">
                        {hoveredSector.sector}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {hoveredSector.count} startup{hoveredSector.count !== 1 ? 's' : ''} ({hoveredSector.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Notifications - Right */}
        <Card className="p-6 flex flex-col" style={{ maxHeight: '500px' }}>
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold text-[var(--text)] flex items-center">
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
                className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                title="Refresh notifications"
              >
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}
                  className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)]"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2" style={{ maxHeight: '380px' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No notifications</h3>
                <p className="text-[var(--text-muted)]">Notifications will appear here when users sign up or other events occur</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start space-x-2 p-2.5 rounded-lg transition-colors cursor-pointer ${
                    notification.read ? 'bg-[var(--bg-muted)]' : 'bg-[var(--accent-muted)]/60 border border-[var(--accent-muted-border)]'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    notification.type === 'signup' ? 'bg-emerald-500' :
                    notification.type === 'application' ? 'bg-blue-500' :
                    notification.type === 'review' ? 'bg-yellow-500' :
                    notification.type === 'feedback' ? 'bg-purple-500' :
                    notification.type === 'milestone' ? 'bg-[var(--accent)]' :
                    notification.type === 'info' ? 'bg-gray-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm flex-1 ${notification.read ? 'text-[var(--text-muted)]' : 'text-[var(--text)] font-medium'}`}>
                        {notification.type === 'signup' && !notification.read && (
                          <span className="inline-block mr-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">
                            New Applicant
                          </span>
                        )}
                        {notification.message}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    {notification.userName && notification.userEmail && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {notification.userName} • {notification.userEmail}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await deleteNotification(notification.id);
                    }}
                    className="text-gray-500 hover:text-red-600 transition-colors p-1 flex-shrink-0"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Startups Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 p-4" style={{ paddingTop: '120px' }}>
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--text)]">{getModalTitle()}</h2>
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
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
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
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Sector</label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="all">All Sectors</option>
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Stage</label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
                <p className="text-[var(--text-muted)]">
                  Showing {getFilteredStartups().length} of {startups.length} startup{startups.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Startup Name</th>
                      <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Founder</th>
                      <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Sector</th>
                      <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredStartups().map((startup) => (
                      <tr key={startup.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <span className="text-[var(--text)] font-medium">{startup.name}</span>
                              <div className="text-xs text-[var(--text-muted)]">{startup.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">{startup.founder}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700">{startup.sector}</span>
                        </td>
                        <td className="py-4 px-4">
                          {getTypeBadge(startup.type)}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(startup.status)}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {new Date(startup.submissionDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {getFilteredStartups().length === 0 && (
                  <div className="text-center py-12">
                    <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No startups found</h3>
                    <p className="text-[var(--text-muted)]">Try adjusting your search or filter criteria</p>
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