import React, { useState, useRef } from 'react';
import Button from '../../ui/Button';
import { Profile } from '../../../types';
import { BarChart3, Upload, Check, Plus, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { documentsApi } from '../../../services/documentsApi';

interface PitchDeckTractionProps {
  data: Partial<Profile>;
  updateData: (data: Partial<Profile>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PitchDeckTraction: React.FC<PitchDeckTractionProps> = ({ data, updateData, onNext, onPrev }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    businessDocuments: data.businessDocuments || [],
    tractionDetails: data.tractionDetails || [],
    balanceSheet: data.balanceSheet || '',
  });
  // Initialize document names from existing data
  const getFileName = (url: string): string => {
    if (!url) return '';
    return url.includes('/') ? url.split('/').pop() || url : url;
  };

  const [documentNames, setDocumentNames] = useState<{
    business: string[];
    traction: string[];
    balance: string;
  }>({
    business: (data.businessDocuments || []).map(getFileName),
    traction: (data.tractionDetails || []).map(getFileName),
    balance: data.balanceSheet ? getFileName(data.balanceSheet) : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  
  // Refs for file inputs
  const businessInputRef = useRef<HTMLInputElement>(null);
  const tractionInputRef = useRef<HTMLInputElement>(null);
  const balanceInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    onNext();
  };

  const validateFile = (file: File): string | null => {
    // Validate file type
    const allowedTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'doc', 'xls', 'ppt'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return `File type .${fileExtension} is not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'File size exceeds 10MB limit';
    }

    return null;
  };

  const handleFileSelect = async (
    type: 'business' | 'traction' | 'balance',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      setErrors({ [type]: 'User not found. Please login again.' });
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setErrors({ [type]: validationError });
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[type];
      return newErrors;
    });

    try {
      const uploadedDocument = await documentsApi.uploadDocument(file, user.id);
      const fileUrl = uploadedDocument.fileUrl || uploadedDocument.id || file.name;
      const documentName = uploadedDocument.name || file.name;

      if (type === 'balance') {
        setFormData(prev => {
          const updated = {
            ...prev,
            balanceSheet: fileUrl,
          };
          updateData(updated);
          return updated;
        });
        setDocumentNames(prev => ({ ...prev, balance: documentName }));
      } else if (type === 'business') {
        setFormData(prev => {
          const updated = {
            ...prev,
            businessDocuments: [...(prev.businessDocuments || []), fileUrl],
          };
          updateData(updated);
          return updated;
        });
        setDocumentNames(prev => ({
          ...prev,
          business: [...prev.business, documentName],
        }));
      } else {
        setFormData(prev => {
          const updated = {
            ...prev,
            tractionDetails: [...(prev.tractionDetails || []), fileUrl],
          };
          updateData(updated);
          return updated;
        });
        setDocumentNames(prev => ({
          ...prev,
          traction: [...prev.traction, documentName],
        }));
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setErrors({ [type]: error.message || 'Failed to upload file. Please try again.' });
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
      // Reset file input
      event.target.value = '';
    }
  };

  const handleUploadClick = (type: 'business' | 'traction' | 'balance') => {
    if (type === 'business') {
      businessInputRef.current?.click();
    } else if (type === 'traction') {
      tractionInputRef.current?.click();
    } else {
      balanceInputRef.current?.click();
    }
  };

  const removeFile = (type: 'business' | 'traction', index: number) => {
    if (type === 'business') {
      const updated = formData.businessDocuments?.filter((_, i) => i !== index) || [];
      const updatedNames = documentNames.business.filter((_, i) => i !== index);
      setFormData(prev => {
        const newData = { ...prev, businessDocuments: updated };
        updateData(newData);
        return newData;
      });
      setDocumentNames(prev => ({ ...prev, business: updatedNames }));
    } else {
      const updated = formData.tractionDetails?.filter((_, i) => i !== index) || [];
      const updatedNames = documentNames.traction.filter((_, i) => i !== index);
      setFormData(prev => {
        const newData = { ...prev, tractionDetails: updated };
        updateData(newData);
        return newData;
      });
      setDocumentNames(prev => ({ ...prev, traction: updatedNames }));
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[var(--accent-muted)] rounded-lg">
          <BarChart3 className="h-6 w-6 text-[var(--accent)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">Pitch Deck & Traction</h2>
          <p className="text-[var(--text-muted)]">Upload your business documents and traction data</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Documents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text)]">Business Documents / Pitch Deck</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleUploadClick('business')}
              disabled={uploading.business}
              className="flex items-center space-x-2"
            >
              {uploading.business ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add Document</span>
                </>
              )}
            </Button>
          </div>
          
          <input
            type="file"
            ref={businessInputRef}
            onChange={(e) => handleFileSelect('business', e)}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            className="hidden"
            id="file-input-business"
          />
          
          {formData.businessDocuments && formData.businessDocuments.length > 0 ? (
            <div className="space-y-2">
              {formData.businessDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-[var(--bg-muted)] p-3 rounded-lg border border-[var(--border)]">
                  <div className="flex items-center space-x-2 text-[var(--text)]">
                    <Check className="h-4 w-4 text-[var(--accent)]" />
                    <span>{documentNames.business[index] || (doc.includes('/') ? doc.split('/').pop() : doc)}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('business', index)}
                    disabled={uploading.business}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center bg-[var(--bg-subtle)]">
              <Upload className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-muted)]">No business documents uploaded yet</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleUploadClick('business')}
                disabled={uploading.business}
                className="mt-2"
              >
                {uploading.business ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Upload First Document'
                )}
              </Button>
            </div>
          )}
          {errors.business && (
            <p className="text-sm text-red-600 mt-2">{errors.business}</p>
          )}
        </div>

        {/* Traction Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text)]">Traction Details</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleUploadClick('traction')}
              disabled={uploading.traction}
              className="flex items-center space-x-2"
            >
              {uploading.traction ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add Traction Document</span>
                </>
              )}
            </Button>
          </div>
          
          <input
            type="file"
            ref={tractionInputRef}
            onChange={(e) => handleFileSelect('traction', e)}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            className="hidden"
            id="file-input-traction"
          />
          
          {formData.tractionDetails && formData.tractionDetails.length > 0 ? (
            <div className="space-y-2">
              {formData.tractionDetails.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-[var(--bg-muted)] p-3 rounded-lg border border-[var(--border)]">
                  <div className="flex items-center space-x-2 text-[var(--text)]">
                    <Check className="h-4 w-4 text-[var(--accent)]" />
                    <span>{documentNames.traction[index] || (doc.includes('/') ? doc.split('/').pop() : doc)}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile('traction', index)}
                    disabled={uploading.traction}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center bg-[var(--bg-subtle)]">
              <Upload className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-muted)]">No traction documents uploaded yet</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleUploadClick('traction')}
                disabled={uploading.traction}
                className="mt-2"
              >
                {uploading.traction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Upload Traction Data'
                )}
              </Button>
            </div>
          )}
          {errors.traction && (
            <p className="text-sm text-red-600 mt-2">{errors.traction}</p>
          )}
        </div>

        {/* Balance Sheet */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--text)]">Balance Sheet</h3>
          <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--bg-subtle)]">
            <input
              type="file"
              ref={balanceInputRef}
              onChange={(e) => handleFileSelect('balance', e)}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
              className="hidden"
              id="file-input-balance"
            />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text)]">Upload your latest balance sheet</p>
                <p className="text-sm text-[var(--text-muted)]">Financial statements for the current year</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant={formData.balanceSheet ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleUploadClick('balance')}
                  disabled={uploading.balance}
                  className="flex items-center space-x-2"
                >
                  {uploading.balance ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>{formData.balanceSheet ? 'Replace' : 'Upload'}</span>
                    </>
                  )}
                </Button>
                {formData.balanceSheet && !uploading.balance && (
                  <div className="flex items-center text-[var(--accent)] text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    <span>{documentNames.balance || (formData.balanceSheet.includes('/') ? formData.balanceSheet.split('/').pop() : formData.balanceSheet)}</span>
                  </div>
                )}
              </div>
            </div>
            {errors.balance && (
              <p className="text-sm text-red-600 mt-2">{errors.balance}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrev}>
            Previous
          </Button>
          <Button type="submit" variant="primary">
            Next Step
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PitchDeckTraction;