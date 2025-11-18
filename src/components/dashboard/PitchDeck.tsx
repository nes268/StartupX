import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Presentation as PresentationChart, Upload, FileText, CheckCircle } from 'lucide-react';

const PitchDeck: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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

  const processFile = (file: File, templateId?: string) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid file format (PDF, PPT, PPTX)');
      return;
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    const templateName = templateId ? templates.find(t => t.id === templateId)?.name : 'Custom Upload';
    
    // Here you would typically upload to backend
    console.log('Uploading file:', file.name, 'Template:', templateName);
    
    setShowUploadForm(false);
    setSelectedTemplate(null);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, selectedTemplate || undefined);
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
      processFile(e.dataTransfer.files[0], selectedTemplate || undefined);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowUploadForm(true);
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
          <h1 className="text-3xl font-bold text-white">Pitch Deck</h1>
          <p className="text-gray-400 mt-1">Choose a template or upload your own deck</p>
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
        <h2 className="text-xl font-semibold text-white mb-4">Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="p-6 hover:border-cyan-500/50 transition-colors">
              <div className="text-center">
                <div className={`w-20 h-20 ${template.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <PresentationChart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                <div className="flex items-center justify-center text-sm text-gray-300 mb-6">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{template.slides} slides</span>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleUseTemplate(template.id)}
                >
                  Use This Template
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUploadForm(false);
              setSelectedTemplate(null);
            }
          }}
        >
          <Card className="p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedTemplate 
                  ? `Upload Deck - ${templates.find(t => t.id === selectedTemplate)?.name} Template`
                  : 'Upload Your Deck'
                }
              </h3>
              <button 
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedTemplate(null);
                }} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {selectedTemplate && (
              <div className="mb-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-300 mb-2">
                  You can either:
                </p>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>Edit the template and upload your customized version</li>
                  <li>Upload your own deck</li>
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-cyan-400 bg-cyan-900/20' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-300 mb-2 font-medium">
                  {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                </p>
                <p className="text-sm text-gray-400 mb-4">or</p>
                <label className="inline-block">
                  <input 
                    type="file" 
                    accept=".pdf,.pptx,.ppt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="cursor-pointer">
                    Browse Files
                  </Button>
                </label>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Supported formats: PDF, PPTX, PPT (Max 50MB)
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedTemplate(null);
                }} 
                className="w-full"
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