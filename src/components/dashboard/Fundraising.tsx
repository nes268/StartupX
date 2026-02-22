import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { TrendingUp, Edit, CheckCircle, Clock } from 'lucide-react';
import { useFunding } from '../../context/FundingContext';

const Fundraising: React.FC = () => {
  const { 
    fundingStages, 
    currentStage, 
    totalTargetAmount, 
    totalRaisedAmount,
    updateStageProgress,
    completeStage,
    setCurrentStage,
    updateFundingAmounts
  } = useFunding();

  const [activeTab, setActiveTab] = useState(currentStage);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    targetAmount: '',
    raisedAmount: ''
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-400" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-[var(--border)]"></div>;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-400';
      case 'current':
        return 'bg-blue-400';
      default:
        return 'bg-[var(--text-subtle)]';
    }
  };

  const handleTabClick = (stageId: string) => {
    setActiveTab(stageId);
    const stage = fundingStages.find(s => s.id === stageId);
    if (stage) {
      setEditData({
        targetAmount: stage.targetAmount?.toString() || '',
        raisedAmount: stage.raisedAmount?.toString() || ''
      });
    }
  };

  const handleEditStage = (stageId: string) => {
    setEditingStage(stageId);
    const stage = fundingStages.find(s => s.id === stageId);
    if (stage) {
      setEditData({
        targetAmount: stage.targetAmount?.toString() || '',
        raisedAmount: stage.raisedAmount?.toString() || ''
      });
    }
    setShowEditForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (editingStage) {
      const targetAmount = parseFloat(editData.targetAmount) || 0;
      const raisedAmount = parseFloat(editData.raisedAmount) || 0;
      
      // Calculate progress automatically from target and raised amounts
      const progress = targetAmount > 0 
        ? Math.min(100, Math.max(0, (raisedAmount / targetAmount) * 100))
        : 0;

      // Update the stage with target amount, raised amount, and calculated progress
      updateStageProgress(editingStage, progress, raisedAmount, targetAmount);
      
      if (progress >= 100) {
        completeStage(editingStage);
      }
    }
    setShowEditForm(false);
    setEditingStage(null);
  };

  const handleCancel = () => {
    setShowEditForm(false);
    setEditingStage(null);
  };

  const currentStageData = fundingStages.find(stage => stage.id === activeTab);
  const progressPercentage = currentStageData ? (currentStageData.raisedAmount || 0) / (currentStageData.targetAmount || 1) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Fundraising Dashboard</h1>
        <p className="text-[var(--text-muted)] mt-1">Track your funding journey and progress across all stages</p>
      </div>

      {/* Funding Stages Tabs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text)] flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[var(--accent)]" />
            Funding Stages
          </h2>
          <div className="text-sm text-[var(--text-muted)]">
            {fundingStages.filter(s => s.status === 'completed').length}/{fundingStages.length} completed
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {fundingStages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => handleTabClick(stage.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === stage.id
                  ? 'bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-muted-border)]'
                  : 'bg-[var(--bg-muted)] text-[var(--text)] hover:bg-[var(--bg-subtle)] border border-[var(--border)]'
              }`}
            >
              {getStatusIcon(stage.status)}
              <span className="font-medium">{stage.name}</span>
              {stage.status === 'current' && <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        {currentStageData && (
          <div className="space-y-6">
            {/* Stage Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-[var(--bg-muted)] rounded-lg">
                <div className="text-2xl font-bold text-[var(--text)] mb-1">
                  ${((currentStageData.raisedAmount || 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-[var(--text-muted)]">Amount Raised</div>
              </div>
              <div className="text-center p-4 bg-[var(--bg-muted)] rounded-lg">
                <div className="text-2xl font-bold text-[var(--accent)] mb-1">
                  ${((currentStageData.targetAmount || 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-[var(--text-muted)]">Target Amount</div>
              </div>
              <div className="text-center p-4 bg-[var(--bg-muted)] rounded-lg">
                <div className="text-2xl font-bold text-emerald-400 mb-1">
                  {currentStageData.progress}%
                </div>
                <div className="text-sm text-[var(--text-muted)]">Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text)]">{currentStageData.name} Stage Progress</span>
                <span className="text-[var(--text-muted)]">
                  ${(currentStageData.raisedAmount || 0).toLocaleString()} / ${(currentStageData.targetAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-[var(--bg-muted)] rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-700 ${getProgressColor(currentStageData.status)}`}
                  style={{ width: `${Math.min(currentStageData.progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Stage Description and Actions */}
            <div className="flex items-center justify-between p-4 bg-[var(--bg-muted)] rounded-lg">
              <div>
                <h3 className="text-lg font-medium text-[var(--text)] mb-1">{currentStageData.name}</h3>
                <p className="text-[var(--text-muted)] text-sm">{currentStageData.description}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleEditStage(currentStageData.id)}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                {currentStageData.status === 'current' && currentStageData.progress >= 100 && (
                  <Button 
                    onClick={() => completeStage(currentStageData.id)}
                    size="sm"
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Form Modal */}
      {showEditForm && editingStage && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4" style={{ paddingTop: '120px' }}>
          <Card className="p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text)]">
                Edit {fundingStages.find(s => s.id === editingStage)?.name} Stage
              </h3>
              <button 
                onClick={handleCancel}
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1 hover:bg-[var(--border)] rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Target Amount ($)</label>
                <input 
                  type="number"
                  name="targetAmount"
                  value={editData.targetAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="Enter target amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Amount Raised ($)</label>
                <input 
                  type="number"
                  name="raisedAmount"
                  value={editData.raisedAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="Enter amount raised"
                />
              </div>

              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Fundraising;