import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Search, Filter, Download, Trash2, FileText, AlertCircle, Loader2, X, Building2, ArrowLeft, FolderOpen } from 'lucide-react';
import { useStartups } from '../../../hooks/useStartups';
import { useDocuments } from '../../../hooks/useDocuments';
import { documentsApi } from '../../../services/documentsApi';
import { Startup, Document } from '../../../types';

const AdminDataRoom: React.FC = () => {
  const { startups, loading: startupsLoading } = useStartups();
  const { getDocumentsByUserId, deleteDocument } = useDocuments();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [startupDocuments, setStartupDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedStartup) {
      console.log('Selected startup:', selectedStartup);
      // Always try to load documents - we have fallback methods in the backend
      const userId = selectedStartup.userId && selectedStartup.userId !== 'null' && selectedStartup.userId !== 'undefined' 
        ? selectedStartup.userId 
        : undefined;
      loadStartupDocuments(userId || '', selectedStartup.id);
    }
  }, [selectedStartup]);

  // Load document counts for all startups
  useEffect(() => {
    const loadDocumentCounts = async () => {
      const counts: Record<string, number> = {};
      for (const startup of startups) {
        if (startup.userId) {
          try {
            const docs = await getDocumentsByUserId(startup.userId);
            counts[startup.id] = docs.length;
          } catch (error) {
            console.error(`Error loading document count for startup ${startup.id}:`, error);
            counts[startup.id] = 0;
          }
        }
      }
      setDocumentCounts(counts);
    };

    if (startups.length > 0) {
      loadDocumentCounts();
    }
  }, [startups, getDocumentsByUserId]);

  const loadStartupDocuments = async (userId: string, startupId?: string) => {
    setLoadingDocuments(true);
    setError(null);
    try {
      console.log('Loading documents for userId:', userId, 'startupId:', startupId);
      
      let docs: Document[] = [];
      
      // Prioritize startupId method as it has better fallback logic (email lookup, owner name matching)
      if (startupId) {
        try {
          docs = await documentsApi.getDocumentsByStartupId(startupId);
          console.log('Documents loaded via startupId:', docs.length, 'documents');
        } catch (startupIdError: any) {
          console.warn('Failed to load via startupId, trying userId as fallback:', startupIdError);
          // If startupId fails, try userId as fallback
          if (userId && userId !== 'null' && userId !== 'undefined') {
            try {
              docs = await getDocumentsByUserId(userId);
              console.log('Documents loaded via userId:', docs.length, 'documents');
            } catch (userIdError: any) {
              console.error('Both methods failed:', { startupIdError, userIdError });
              throw new Error(`Failed to load documents. StartupId method: ${startupIdError?.message || 'unknown error'}. UserId method: ${userIdError?.message || 'unknown error'}`);
            }
          } else {
            throw startupIdError;
          }
        }
      } else if (userId && userId !== 'null' && userId !== 'undefined') {
        // If no startupId, try userId only
        try {
          docs = await getDocumentsByUserId(userId);
          console.log('Documents loaded via userId:', docs.length, 'documents');
        } catch (userIdError: any) {
          throw userIdError;
        }
      } else {
        throw new Error('No valid userId or startupId provided');
      }
      
      setStartupDocuments(docs || []);
      if (docs.length === 0) {
        console.log('No documents found for this startup');
        setError(null); // Don't show error if no documents found, just show empty state
      }
    } catch (error: any) {
      console.error('Error loading documents:', error);
      const errorMessage = error?.message || 'Failed to load documents. Please try again.';
      setError(`Error: ${errorMessage}`);
      setStartupDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleStartupClick = (startup: Startup) => {
    // Allow clicking even without userId - we have fallback methods (email lookup, owner name matching)
    setSelectedStartup(startup);
    setError(null);
  };

  const filteredStartups = startups.filter(startup => {
    // Exclude rejected startups from dataroom
    if (startup.status === 'rejected') {
      return false;
    }
    
    const matchesSearch = 
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.founder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const blob = await documentsApi.downloadDocument(doc.id);
      const url = URL.createObjectURL(blob);
      
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    if (window.confirm(`Are you sure you want to delete "${documentName}"?`)) {
      try {
        await deleteDocument(documentId);
        if (selectedStartup?.userId) {
          await loadStartupDocuments(selectedStartup.userId, selectedStartup.id);
        }
        // Show success message
        setError(null);
      } catch (error) {
        console.error('Delete error:', error);
        setError('Error deleting document. Please try again.');
      }
    }
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedDocument(null);
  };

  const getFileIcon = (_type: string) => {
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  // If a startup is selected, show its documents
  if (selectedStartup) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setSelectedStartup(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Startups
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedStartup.name} - Documents</h1>
            <p className="text-gray-600 mt-1">View and manage all documents for this startup</p>
          </div>
        </div>

        {/* Startup Info */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Founder</label>
              <p className="text-gray-900">{selectedStartup.founder}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{selectedStartup.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Sector</label>
              <p className="text-gray-900">{selectedStartup.sector}</p>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-600">{error}</p>
            </div>
          </Card>
        )}

        {/* Documents List */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents ({startupDocuments.length})</h3>
            <p className="text-sm text-gray-600">All documents uploaded by this startup</p>
          </div>

          {loadingDocuments ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
                <span className="text-gray-600">Loading documents...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Documents</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : startupDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Document Name</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">File Size</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Upload Date</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {startupDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(doc.type)}
                          <div>
                            <span className="text-gray-900 font-medium">{doc.name}</span>
                            <div className="text-xs text-gray-600">{doc.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700 uppercase">{doc.type}</td>
                      <td className="py-4 px-4 text-gray-700">{doc.fileSize}</td>
                      <td className="py-4 px-4 text-gray-700">{doc.uploadDate}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-400/10 rounded-lg transition-colors"
                            title="Download document"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No documents found</h3>
              <p className="text-gray-600">This startup hasn't uploaded any documents yet.</p>
            </div>
          )}
        </Card>

        {/* View Document Modal */}
        {showViewModal && selectedDocument && (
          <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 p-4" style={{ paddingTop: '120px' }}>
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Document Details</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={closeViewModal}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedDocument.name}</h3>
                      <p className="text-gray-600 text-sm uppercase">{selectedDocument.type}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Location</label>
                        <p className="text-gray-900">{selectedDocument.location}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Owner</label>
                        <p className="text-gray-900">{selectedDocument.owner}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">File Size</label>
                        <p className="text-gray-900">{selectedDocument.fileSize}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Upload Date</label>
                        <p className="text-gray-900">{selectedDocument.uploadDate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">File Type</label>
                        <p className="text-gray-900 uppercase">{selectedDocument.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Document ID</label>
                        <p className="text-gray-900 font-mono text-sm">{selectedDocument.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4 border-t border-gray-200">
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
                      className="flex-1 text-red-600 border-red-400 hover:bg-red-400/10"
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
  }

  // Show startups list
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Room</h1>
          <p className="text-gray-600 mt-1">View documents uploaded by startups</p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
          <Input
            type="text"
            placeholder="Search startups by name, founder, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Startups List */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Startups ({filteredStartups.length})</h3>
          <p className="text-sm text-gray-600">Click on a startup name to view their uploaded documents</p>
        </div>

        {startupsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
              <span className="text-gray-600">Loading startups...</span>
            </div>
          </div>
        ) : filteredStartups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStartups.map((startup) => {
              const docCount = documentCounts[startup.id] ?? 0;
              const hasUserId = !!startup.userId && startup.userId !== 'null' && startup.userId !== 'undefined';
              
              return (
                <Card 
                  key={startup.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStartupClick(startup)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="h-12 w-12 bg-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-semibold truncate text-gray-900 hover:text-[var(--accent)] transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartupClick(startup);
                        }}
                      >
                        {startup.name}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">{startup.founder}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{startup.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {(() => {
                          // Normalize status: approved/active/completed -> active, dropout -> dropout
                          const displayStatus = startup.status === 'dropout' ? 'dropout' : 'active';
                          return (
                            <span className={`text-xs px-2 py-1 rounded capitalize ${
                              displayStatus === 'active' ? 'bg-green-100 text-green-700' :
                              displayStatus === 'dropout' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {displayStatus}
                            </span>
                          );
                        })()}
                        <span className="text-xs text-gray-500">{startup.sector}</span>
                        {docCount > 0 && (
                          <span className="text-xs px-2 py-1 rounded bg-[var(--accent-muted)] text-[var(--accent)] flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" />
                            {docCount} docs
                          </span>
                        )}
                      </div>
                    </div>
                    <FolderOpen className="h-5 w-5 text-[var(--accent)] flex-shrink-0" />
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No startups found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'No startups available'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDataRoom;

