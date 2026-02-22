import React, { useState, useRef } from 'react';
import Button from '../../ui/Button';
import { Profile } from '../../../types';
import { FileText, Upload, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { documentsApi } from '../../../services/documentsApi';

interface DocumentationProps {
  data: Partial<Profile>;
  updateData: (data: Partial<Profile>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const Documentation: React.FC<DocumentationProps> = ({ data, updateData, onNext, onPrev }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    aadhaarDoc: data.aadhaarDoc || '',
    incorporationCert: data.incorporationCert || '',
    msmeCert: data.msmeCert || '',
    dpiitCert: data.dpiitCert || '',
    mouPartnership: data.mouPartnership || '',
  });
  const [documentNames, setDocumentNames] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  
  // Refs for file inputs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.aadhaarDoc) {
      setErrors({ aadhaarDoc: 'Aadhaar document is mandatory' });
      return;
    }

    updateData(formData);
    onNext();
  };

  const handleFileSelect = async (field: keyof typeof formData, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      setErrors({ [field]: 'User not found. Please login again.' });
      return;
    }

    // Validate file type
    const allowedTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'doc', 'xls', 'ppt'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      setErrors({ [field]: `File type .${fileExtension} is not supported. Allowed types: ${allowedTypes.join(', ')}` });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors({ [field]: 'File size exceeds 10MB limit' });
      return;
    }

    setUploading(prev => ({ ...prev, [field]: true }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    try {
      const uploadedDocument = await documentsApi.uploadDocument(file, user.id);
      
      const fileUrl = uploadedDocument.fileUrl || uploadedDocument.id || file.name;
      const documentName = uploadedDocument.name || file.name;
      
      // Store the file URL or document ID in formData
      setFormData(prev => {
        const updated = {
          ...prev,
          [field]: fileUrl,
        };
        
        // Update profile data immediately
        updateData(updated);
        
        return updated;
      });
      
      // Store document name for display
      setDocumentNames(prev => ({
        ...prev,
        [field]: documentName,
      }));
    } catch (error: any) {
      console.error('Upload error:', error);
      setErrors({ [field]: error.message || 'Failed to upload file. Please try again.' });
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
      // Reset file input
      if (fileInputRefs.current[field]) {
        fileInputRefs.current[field]!.value = '';
      }
    }
  };

  const handleUploadClick = (field: keyof typeof formData) => {
    fileInputRefs.current[field]?.click();
  };

  const documents = [
    {
      key: 'aadhaarDoc' as const,
      label: 'Aadhaar Card',
      required: true,
      description: 'Upload your Aadhaar card (PDF or Image)',
    },
    {
      key: 'incorporationCert' as const,
      label: 'Incorporation Certificate',
      required: false,
      description: 'Company incorporation certificate',
    },
    {
      key: 'msmeCert' as const,
      label: 'MSME Certificate',
      required: false,
      description: 'MSME registration certificate',
    },
    {
      key: 'dpiitCert' as const,
      label: 'DPIIT Certificate',
      required: false,
      description: 'DPIIT recognition certificate',
    },
    {
      key: 'mouPartnership' as const,
      label: 'MoU/Partnership',
      required: false,
      description: 'Partnership agreements or MoUs',
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[var(--accent-muted)] rounded-lg">
          <FileText className="h-6 w-6 text-[var(--accent)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">Documentation Upload</h2>
          <p className="text-[var(--text-muted)]">Upload your required documents</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.key} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--bg-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-[var(--text)]">{doc.label}</h3>
                  {doc.required && <span className="text-red-600 text-sm">*Required</span>}
                </div>
                {formData[doc.key] && (
                  <div className="flex items-center text-[var(--accent)] text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    Uploaded
                  </div>
                )}
              </div>
              
              <p className="text-sm text-[var(--text-muted)] mb-3">{doc.description}</p>
              
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[doc.key] = el)}
                onChange={(e) => handleFileSelect(doc.key, e)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                className="hidden"
                id={`file-input-${doc.key}`}
              />
              
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant={formData[doc.key] ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleUploadClick(doc.key)}
                  disabled={uploading[doc.key]}
                  className="flex items-center space-x-2"
                >
                  {uploading[doc.key] ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>{formData[doc.key] ? 'Replace File' : 'Upload File'}</span>
                    </>
                  )}
                </Button>
                
                {formData[doc.key] && !uploading[doc.key] && (
                  <span className="text-sm text-[var(--text-muted)]">
                    {documentNames[doc.key] || (formData[doc.key].includes('/') 
                      ? formData[doc.key].split('/').pop() 
                      : formData[doc.key])}
                  </span>
                )}
              </div>
              
              {errors[doc.key] && (
                <p className="text-sm text-red-600 mt-2">{errors[doc.key]}</p>
              )}
            </div>
          ))}
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

export default Documentation;