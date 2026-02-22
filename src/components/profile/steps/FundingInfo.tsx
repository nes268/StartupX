import React, { useState } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Profile } from '../../../types';
import { DollarSign } from 'lucide-react';

interface FundingInfoProps {
  data: Partial<Profile>;
  updateData: (data: Partial<Profile>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const fundingStages = [
  'Idea', 'MVP', 'Seed', 'Series A', 'Growth', 'Scale'
];

const FundingInfo: React.FC<FundingInfoProps> = ({ data, updateData, onNext, onPrev }) => {
  const [formData, setFormData] = useState({
    fundingStage: data.fundingStage || '',
    alreadyFunded: data.alreadyFunded || false,
    fundingAmount: data.fundingAmount || '',
    fundingSource: data.fundingSource || '',
    fundingDate: data.fundingDate || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.fundingStage) {
      newErrors.fundingStage = 'Funding stage is required';
    }

    if (formData.alreadyFunded) {
      if (!formData.fundingAmount) newErrors.fundingAmount = 'Funding amount is required';
      if (!formData.fundingSource) newErrors.fundingSource = 'Funding source is required';
      if (!formData.fundingDate) newErrors.fundingDate = 'Funding date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalData = {
      ...formData,
      fundingAmount: formData.fundingAmount ? Number(formData.fundingAmount) : undefined,
    };
    
    updateData(finalData);
    onNext();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[var(--accent-muted)] rounded-lg">
          <DollarSign className="h-6 w-6 text-[var(--accent)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">Funding Information</h2>
          <p className="text-[var(--text-muted)]">Tell us about your funding status and requirements</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Funding Stage */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--text-muted)]">Current Funding Stage</label>
          <select
            name="fundingStage"
            value={formData.fundingStage}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="">Select funding stage</option>
            {fundingStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          {errors.fundingStage && <p className="text-sm text-red-600">{errors.fundingStage}</p>}
        </div>

        {/* Already Funded */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--text-muted)]">
            Have you been funded already?
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="alreadyFunded"
                value="true"
                checked={formData.alreadyFunded === true}
                onChange={() => setFormData({ ...formData, alreadyFunded: true })}
                className="mr-2 text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-[var(--text)]">Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="alreadyFunded"
                value="false"
                checked={formData.alreadyFunded === false}
                onChange={() => setFormData({ ...formData, alreadyFunded: false })}
                className="mr-2 text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-[var(--text)]">No</span>
            </label>
          </div>
        </div>

        {/* Funding Details (if already funded) */}
        {formData.alreadyFunded && (
          <div className="space-y-6 p-6 bg-[var(--bg-muted)] rounded-lg border border-[var(--border)]">
            <h3 className="text-lg font-medium text-[var(--text)]">Funding Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Funding Amount (in USD)"
                name="fundingAmount"
                type="number"
                value={formData.fundingAmount}
                onChange={handleChange}
                error={errors.fundingAmount}
                placeholder="e.g., 100000"
              />

              <Input
                label="Funding Date"
                name="fundingDate"
                type="date"
                value={formData.fundingDate}
                onChange={handleChange}
                error={errors.fundingDate}
              />
            </div>

            <Input
              label="Funding Source"
              name="fundingSource"
              type="text"
              value={formData.fundingSource}
              onChange={handleChange}
              error={errors.fundingSource}
              placeholder="e.g., Angel Investor, VC Firm, Government Grant"
            />
          </div>
        )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrev}>
            Previous
          </Button>
          <Button type="submit" variant="primary">
            Complete Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FundingInfo;