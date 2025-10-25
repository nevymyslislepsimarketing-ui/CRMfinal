import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FolderOpen, File, FileText, FileImage, FileVideo, Upload, FolderPlus, Download, Trash2, Search, Home, ChevronRight, Link as LinkIcon, RefreshCw } from 'lucide-react';

const GoogleDrive = () => {
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [folderPath, setFolderPath] = useState([{ id: 'root', name: 'Můj disk' }]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    // Zkontrolovat jestli je uživatel připojený
    const accessToken = localStorage.getItem('google_access_token');
    if (accessToken) {
      setIsConnected(true);
      fetchFiles();
    }
  }, [currentFolder]);

  const connectGoogleDrive = async () => {
    try {
      const response = await api.get('/google-drive/auth-url');
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Chyba při připojování Google Drive:', error);
      alert('Nepodařilo se připojit Google Drive');
    }
  };

  const disconnect = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    setIsConnected(false);
    setFiles([]);
  };

  const fetchFiles = async (folderId = currentFolder) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('google_access_token');
      const response = await api.get('/google-drive/files', {
        params: { folderId, accessToken }
      });

      setFiles(response.data.files);
    } catch (error) {
      console.error('Chyba při načítání souborů:', error);

      // Pokud token vypršel, zkusit refresh
      if (error.response?.data?.needsRefresh) {
        await refreshToken();
        fetchFiles(folderId);
      } else {
        alert('Nepodařilo se načíst soubory');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('google_refresh_token');
      const response = await api.post('/google-drive/refresh-token', {
        refresh_token: refreshToken
      });

      localStorage.setItem('google_access_token', response.data.access_token);
    } catch (error) {
      console.error('Chyba při refresh tokenu:', error);
      disconnect();
      alert('Přihlášení vypršelo. Prosím připojte se znovu.');
    }
  };

  const handleFileClick = (file) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      // Otevřít složku
      setCurrentFolder(file.id);
      setFolderPath([...folderPath, { id: file.id, name: file.name }]);
    } else {
      // Otevřít soubor v novém okně
      window.open(file.webViewLink, '_blank');
    }
  };

  const navigateToFolder = (folderId, index) => {
    setCurrentFolder(folderId);
    setFolderPath(folderPath.slice(0, index + 1));
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const accessToken = localStorage.getItem('google_access_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', currentFolder);
      formData.append('accessToken', accessToken);

      await api.post('/google-drive/upload', formData);

      fetchFiles();
      alert('Soubor nahrán!');
    } catch (error) {
      console.error('Chyba při nahrávání:', error);
      alert('Nepodařilo se nahrát soubor');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const accessToken = localStorage.getItem('google_access_token');
      await api.post('/google-drive/create-folder', {
        name: newFolderName,
        parentId: currentFolder,
        accessToken
      });

      fetchFiles();
      setShowCreateFolder(false);
      setNewFolderName('');
    } catch (error) {
      console.error('Chyba při vytváření složky:', error);
      alert('Nepodařilo se vytvořit složku');
    }
  };

  const handleDownload = async (file) => {
    try {
      const accessToken = localStorage.getItem('google_access_token');
      const response = await api.get(`/google-drive/download/${file.id}`, {
        params: { accessToken },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Chyba při stahování:', error);
      alert('Nepodařilo se stáhnout soubor');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchFiles();
      return;
    }

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('google_access_token');
      const response = await api.get('/google-drive/search', {
        params: { query: searchQuery, accessToken }
      });

      setFiles(response.data.files);
    } catch (error) {
      console.error('Chyba při vyhledávání:', error);
      alert('Nepodařilo se vyhledat soubory');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <FolderOpen className="text-yellow-500" size={48} />;
    } else if (mimeType.startsWith('image/')) {
      return <FileImage className="text-blue-500" size={48} />;
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="text-purple-500" size={48} />;
    } else {
      return <FileText className="text-gray-500" size={48} />;
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FolderOpen size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Google Drive</h2>
          <p className="text-gray-600 mb-6">Připojte svůj Google Drive účet pro přístup k souborům</p>
          <button onClick={connectGoogleDrive} className="btn-primary inline-flex items-center space-x-2">
            <LinkIcon size={18} />
            <span>Připojit Google Drive</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <FolderOpen size={32} />
          <span>Google Drive</span>
        </h1>
        <div className="flex space-x-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="btn-secondary inline-flex items-center space-x-2 cursor-pointer"
          >
            {uploading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Nahrávání...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Nahrát soubor</span>
              </>
            )}
          </label>
          <button
            onClick={() => setShowCreateFolder(true)}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <FolderPlus size={18} />
            <span>Nová složka</span>
          </button>
          <button onClick={disconnect} className="btn-secondary">
            Odpojit
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-2 text-sm">
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              {index > 0 && <ChevronRight size={16} className="text-gray-400" />}
              <button
                onClick={() => navigateToFolder(folder.id, index)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {index === 0 ? <Home size={16} /> : folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Vyhledat soubory..."
            className="input-field flex-1"
          />
          <button onClick={handleSearch} className="btn-primary inline-flex items-center space-x-2">
            <Search size={18} />
            <span>Hledat</span>
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                fetchFiles();
              }}
              className="btn-secondary"
            >
              Zrušit
            </button>
          )}
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={32} className="animate-spin text-primary-600" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <File size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Složka je prázdná</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => handleFileClick(file)}
            >
              <div className="flex flex-col items-center">
                {file.thumbnailLink ? (
                  <img
                    src={file.thumbnailLink}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="mb-2">{getFileIcon(file.mimeType)}</div>
                )}
                <p className="text-sm font-medium text-gray-900 text-center line-clamp-2 mb-2">
                  {file.name}
                </p>
                {file.size && (
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
                {file.mimeType !== 'application/vnd.google-apps.folder' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    className="mt-2 text-primary-600 hover:text-primary-700 text-xs flex items-center space-x-1"
                  >
                    <Download size={14} />
                    <span>Stáhnout</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Nová složka</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Název složky"
              className="input-field mb-4"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex space-x-2">
              <button onClick={handleCreateFolder} className="flex-1 btn-primary">
                Vytvořit
              </button>
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                }}
                className="flex-1 btn-secondary"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDrive;
