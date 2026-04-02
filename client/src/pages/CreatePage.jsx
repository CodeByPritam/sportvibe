import { useState } from 'react';
import { uploadVideo } from '../api/upload.api';
import { createReel }  from '../api/reels.api';
import toast from 'react-hot-toast';
import './CreatePage.css';

// Predefined sports categories
const SPORTS = ['football', 'basketball', 'tennis', 'cricket', 'formula1', 'boxing', 'swimming', 'athletics', 'general'];

// Create page component
export default function CreatePage() {
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({ title:'', caption:'', location:'', tags:'', sport:'general', videoType:'general' });

    // Handle form field changes
    const onChange = e => {
        const { name, value } = e.target;
        setForm(p => {
            const updated = { ...p, [name]: value };
            if (name === 'sport') {
                updated.videoType = value !== 'general' ? 'sports' : 'general';
            }
            return updated;
        });
    }

    // Handle file selection
    const handleFile = e => setFile(e.target.files[0]);

    // Handle drag-and-drop file upload
    const handleDrop = e => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f?.type.startsWith('video/')) setFile(f);
    }

    // Handle form submission and video upload
    const handleSubmit = async e => {
        e.preventDefault();
        if (!file) return toast.error('Please select a video');
        setUploading(true);
        try {
            const { data: upData } = await uploadVideo(file, setProgress);
            const { videoUrl, videoKey } = upData.data;
            await createReel({ ...form, videoUrl, videoKey });
            toast.success('Reel published! 🎉');
            setFile(null);
            setProgress(0);
            setForm({ title:'', caption:'', location:'', tags:'', sport:'general', videoType:'general' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally { setUploading(false); }
    }

    // Render
    return (
        <div className="create-page">

            <h2>Upload a Reel</h2>
            <p className="create-subtitle">Share your sports moment with the SportVibe community</p>

            {!file
            ? <div className="upload-zone" onDragOver={e => e.preventDefault()} onDrop={handleDrop} onClick={() => document.getElementById('file-input').click()}>
                <input id="file-input" type="file" accept="video/*" onChange={handleFile} style={{display:'none'}} />
                <div className="upload-icon">🎬</div>
                <h3>Drag & Drop your video here</h3>
                <p>Supports MP4, MOV, AVI · Max 500MB</p>
                <div className="upload-browse-btn">Browse Files</div>
            </div>
            : <form className="create-form" onSubmit={handleSubmit}>
                <div className="upload-preview">
                    <span>🎬</span>
                    <div>
                        <p className="preview-name">{file.name}</p>
                        <p className="preview-size">{(file.size/1024/1024).toFixed(1)} MB</p>
                    </div>
                    <button type="button" className="change-btn" onClick={() => setFile(null)}>Change</button>
                </div>
            {uploading && (
                <div className="progress-wrap">
                    <div className="progress-bar" style={{width: `${progress}%`}} />
                    <span>{progress}%</span>
                </div>
            )}

                <div className="form-group">
                    <label>Title</label>
                    <input name="title" value={form.title} onChange={onChange} placeholder="Give your reel a title" required />
                </div>
                <div className="form-group">
                    <label>Caption</label>
                    <textarea name="caption" value={form.caption} onChange={onChange} rows={3} placeholder="Write something about this video…" />
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input name="location" value={form.location} onChange={onChange} placeholder="e.g. Mumbai, India" />
                </div>
                <div className="form-group">
                    <label>Tags</label>
                    <input name="tags" value={form.tags} onChange={onChange} placeholder="#football, #goals" />
                </div>
                <div className="form-group">
                    <label>Sport Category</label>
                    <select name="sport" value={form.sport} onChange={onChange}>
                        {SPORTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label>Video Type</label>
                    <div className="video-type-toggle">
                        <label className={`type-option ${form.videoType==='sports' ? 'selected':''}`}>
                            <input type="radio" name="videoType" value="sports" 
                            checked={form.videoType==='sports'} 
                            onChange={onChange} 
                            disabled={form.sport !== 'general'} /> Sports Video
                        </label>
                        <label className={`type-option ${form.videoType==='general' ? 'selected':''} ${form.sport !== 'general' ? 'disabled':''}`}>
                            <input type="radio" name="videoType" value="general"
                            checked={form.videoType==='general'}
                            onChange={onChange}
                            disabled={form.sport !== 'general'} /> General Video
                        </label>
                    </div>
                </div>

                <div className="create-actions">
                    <button type="button" className="create-cancel-btn" onClick={() => setFile(null)}>Cancel</button>
                    <button type="submit" className="create-submit-btn" disabled={uploading}>
                        {uploading ? `Uploading ${progress}%…` : '🚀 Publish Reel'}
                    </button>
                </div>

            </form>}

        </div>
    );
}