import api from './axios';

// Export upload video functions
export const uploadVideo = (file, onProgress) => {
    const form = new FormData();
    form.append('video', file);
    return api.post(
        '/upload/video', 
        form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / e.total)),
        }
    );
}

// Export delete video function
export const deleteVideo = videoKey =>
    api.delete('/upload', { data: { videoKey } });