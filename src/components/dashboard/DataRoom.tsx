import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Search, Upload, Download, Eye, Trash2, FileText, AlertCircle, Loader2, X } from 'lucide-react';
import { CreateDocumentData } from '../../types';
import { useDocuments } from '../../hooks/useDocuments';
import { useAuth } from '../../context/AuthContext';
import { documentsApi } from '../../services/documentsApi';

const DataRoom: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    refreshDocuments
  } = useDocuments();

  // Fetch documents filtered by userId for regular users
  useEffect(() => {
    if (user) {
      if (user.role === 'user' && user.id) {
        refreshDocuments(user.id);
      } else if (user.role === 'admin') {
        refreshDocuments();
      }
    }
  }, [user, refreshDocuments]);

  const filteredDocuments = documents.filter(doc => {
    // For regular users (startup users), strictly filter to only show their own documents
    if (user?.role === 'user' && user.id) {
      // Strictly enforce: only show documents that belong to the current user
      // If userId is missing or doesn't match, exclude the document
      if (!doc.userId || doc.userId !== user.id) {
        return false;
      }
    }
    
    // Apply search filter
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.owner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getFileIcon = (_type: string) => {
    return <FileText className="h-5 w-5 text-[var(--accent)]" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return extension;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      alert('Please log in to upload files');
      return;
    }

    if (!user.id) {
      console.error('User object:', user);
      alert('User ID is missing. Please log out and log back in.');
      return;
    }

    console.log('Uploading file with userId:', user.id, 'User object:', user);

    setIsUploading(true);

    try {
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 50MB.`);
          continue;
        }

        // Validate file type
        const allowedTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'jpg', 'jpeg', 'png', 'doc', 'xls', 'ppt'];
        const fileType = getFileType(file.name);
        
        if (!allowedTypes.includes(fileType)) {
          alert(`File type ${fileType} is not supported.`);
          continue;
        }

        // Upload the file
        console.log('Calling uploadDocument with userId:', user.id);
        await uploadDocument(file, user.id);
      }

      // Refresh documents list
      if (user.role === 'user') {
        await refreshDocuments(user.id);
      } else {
        await refreshDocuments();
      }

      alert('Files uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error?.message || 'Error uploading files. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    fileInput?.click();
  };

  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    if (window.confirm(`Are you sure you want to delete "${documentName}"?`)) {
      try {
        await deleteDocument(documentId);
        // Refresh documents list to ensure only user's documents are shown
        if (user?.role === 'user' && user.id) {
          await refreshDocuments(user.id);
        } else if (user?.role === 'admin') {
          await refreshDocuments();
        }
        alert('Document deleted successfully!');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting document. Please try again.');
      }
    }
  };

  const handleDownloadDocument = async (doc: any) => {
    try {
      const blob = await documentsApi.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger download
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedDocument(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text)]">Data Room</h1>
            <p className="text-[var(--text-muted)] mt-1">Manage your startup documents and files</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
            <span className="text-[var(--text-muted)]">Loading documents...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)]">Data Room</h1>
          <p className="text-[var(--text-muted)] mt-1">Manage your startup documents and files</p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.pptx,.txt,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
        <Button 
          variant="primary" 
          className="flex items-center space-x-2"
            onClick={handleUploadClick}
            disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
            <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
        </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-900/20 border-red-500/50">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-red-600 font-medium">Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshDocuments}
                className="mt-2 text-red-600 hover:text-red-600"
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}


      {/* Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Documents Table */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Documents</h3>
          <p className="text-sm text-[var(--text-muted)]">Manage and organize your startup documents</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Document Name</th>
                <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Location</th>
                <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Owner</th>
                <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">File Size</th>
                <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Upload Date</th>
                <th className="text-left py-3 px-4 text-[var(--text-muted)] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-muted)] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(doc.type)}
                      <div>
                        <span className="text-[var(--text)] font-medium">{doc.name}</span>
                        <div className="text-xs text-[var(--text-muted)] uppercase">{doc.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[var(--text-muted)]">{doc.location}</td>
                  <td className="py-4 px-4 text-[var(--text-muted)]">{doc.owner}</td>
                  <td className="py-4 px-4 text-[var(--text-muted)]">{doc.fileSize}</td>
                  <td className="py-4 px-4 text-[var(--text-muted)]">{doc.uploadDate}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-muted)] rounded-lg transition-colors"
                        title="View document"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-muted)] rounded-lg transition-colors"
                        title="Download document"
                        onClick={() => handleDownloadDocument(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete document"
                        onClick={() => handleDeleteDocument(doc.id, doc.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">
                {searchTerm ? 'No documents found' : 'No documents available'}
              </h3>
              <p className="text-[var(--text-muted)] mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria' 
                  : 'Upload your first document to get started'
                }
              </p>
              {!searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload First Document'}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* View Document Modal */}
      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4" style={{ paddingTop: '120px' }}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--text)]">Document Details</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={closeViewModal}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Document Icon and Name */}
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                    <FileText className="h-8 w-8 text-[var(--text-inverse)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text)]">{selectedDocument.name}</h3>
                    <p className="text-[var(--text-muted)] text-sm uppercase">{selectedDocument.type}</p>
                  </div>
                </div>

                {/* Document Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-[var(--text-muted)]">Location</label>
                      <p className="text-[var(--text)]">{selectedDocument.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--text-muted)]">Owner</label>
                      <p className="text-[var(--text)]">{selectedDocument.owner}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--text-muted)]">File Size</label>
                      <p className="text-[var(--text)]">{selectedDocument.fileSize}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-[var(--text-muted)]">Upload Date</label>
                      <p className="text-[var(--text)]">{selectedDocument.uploadDate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--text-muted)]">File Type</label>
                      <p className="text-[var(--text)] uppercase">{selectedDocument.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--text-muted)]">Document ID</label>
                      <p className="text-[var(--text)] font-mono text-sm">{selectedDocument.id}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t border-[var(--border)]">
                  <Button 
                    variant="outline" 
                    onClick={() => handleDownloadDocument(selectedDocument)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      closeViewModal();
                      handleDeleteDocument(selectedDocument.id, selectedDocument.name);
                    }}
                    className="flex-1 text-red-600 border-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DataRoom;