import React, { useState, useRef } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Presentation as PresentationChart, Upload, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { documentsApi } from '../../services/documentsApi';

const PitchDeck: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const templates = [
    {
      id: 'msme',
      name: 'MSME Format',
      description: 'Standardized format for MSME registration',
      slides: 12,
      color: 'bg-blue-500'
    },
    {
      id: 'ivp',
      name: 'IVP Format',
      description: 'Investor-focused presentation template',
      slides: 15,
      color: 'bg-emerald-500'
    },
    {
      id: 'readiness',
      name: 'Investment Readiness',
      description: 'Comprehensive template for fundraising',
      slides: 20,
      color: 'bg-purple-500'
    }
  ];

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return extension;
  };

  const processFile = async (file: File) => {
    console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    if (!user) {
      const errorMsg = 'Please log in to upload files';
      console.error(errorMsg);
      alert(errorMsg);
      setUploadError(errorMsg);
      return;
    }

    if (!user.id) {
      const errorMsg = 'User ID is missing. Please log out and log back in.';
      console.error(errorMsg, 'User object:', user);
      alert(errorMsg);
      setUploadError(errorMsg);
      return;
    }

    // Validate file type
    const allowedTypes = ['pdf', 'ppt', 'pptx'];
    const fileType = getFileType(file.name);
    console.log('File type detected:', fileType);
    
    if (!allowedTypes.includes(fileType)) {
      const errorMsg = 'Please upload a valid file format (PDF, PPT, PPTX)';
      console.error(errorMsg, 'Received type:', fileType);
      setUploadError(errorMsg);
      return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = 'File size must be less than 50MB';
      console.error(errorMsg, 'File size:', file.size, 'Max size:', maxSize);
      setUploadError(errorMsg);
      return;
    }

    console.log('File validation passed. Starting upload...');
    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload the file using documentsApi
      console.log('Calling documentsApi.uploadDocument with userId:', user.id);
      const uploadedDocument = await documentsApi.uploadDocument(file, user.id, 'Pitch Deck');
      
      console.log('Pitch deck uploaded successfully:', uploadedDocument);
      
      setShowUploadForm(false);
      setSelectedTemplate(null);
      setUploadError(null);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || 'Error uploading file. Please try again.';
      console.error('Error message:', errorMessage);
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file?.name, file?.size, file?.type);
    if (file) {
      processFile(file);
    } else {
      console.warn('No file selected');
    }
    // Reset the input so the same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    // Static button - show message that templates are coming soon
    alert('Template feature coming soon! Please use "Upload Deck" to upload your pitch deck.');
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-300">Pitch deck uploaded successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)]">Pitch Deck</h1>
          <p className="text-[var(--text-muted)] mt-1">Choose a template or upload your own deck</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedTemplate(null);
            setShowUploadForm(true);
          }} 
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Deck</span>
        </Button>
      </div>

      {/* Templates */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="p-6 hover:border-[var(--accent)]/50 transition-colors">
              <div className="text-center">
                <div className={`w-20 h-20 ${template.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <PresentationChart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">{template.name}</h3>
                <p className="text-[var(--text-muted)] text-sm mb-4">{template.description}</p>
                <div className="flex items-center justify-center text-sm text-[var(--text)] mb-6">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{template.slides} slides</span>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleUseTemplate(template.id)}
                  disabled
                  variant="outline"
                >
                  Use This Template (Coming Soon)
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4"
          style={{ paddingTop: '120px' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUploadForm(false);
              setSelectedTemplate(null);
            }
          }}
        >
          <Card className="p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text)]">
                Upload Your Pitch Deck
              </h3>
              <button 
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedTemplate(null);
                }} 
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Error Display */}
            {uploadError && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-600 text-sm">{uploadError}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-[var(--accent)] bg-[var(--accent-muted)]' 
                    : 'border-[var(--border)] hover:border-[var(--accent-muted-border)]'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-[var(--text)] mb-2 font-medium">
                  {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                </p>
                <p className="text-sm text-[var(--text-muted)] mb-4">or</p>
                <div className="inline-block">
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".pdf,.pptx,.ppt"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    className="cursor-pointer"
                    disabled={isUploading}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Browse Files'
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] text-center">
                Supported formats: PDF, PPTX, PPT (Max 50MB)
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedTemplate(null);
                  setUploadError(null);
                }} 
                className="w-full"
                disabled={isUploading}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PitchDeck;