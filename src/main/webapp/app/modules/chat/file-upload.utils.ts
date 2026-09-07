import axios from 'axios';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('/api/files/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.fileUrl || getFileUrl(response.data.filePath);
};

export const uploadVoiceMessage = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'voice-message.webm');

  const response = await axios.post('/api/files/upload/voice', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.fileUrl || getFileUrl(response.data.filePath);
};

export const getFileUrl = (filePath: string): string => {
  if (!filePath) {
    return '';
  }
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('/api/')) {
    return filePath;
  }
  return `/api/files/download?filePath=${encodeURIComponent(filePath)}`;
};
