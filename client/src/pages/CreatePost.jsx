import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import './CreatePost.css';

const CATEGORIES = ['Technology', 'Lifestyle', 'Travel', 'Food'];

const CreatePost = () => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Technology',
        status: 'draft',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // ── Image upload state ─────────────────────────────────────────
    const [uploading, setUploading] = useState(false);       // true while POST /api/upload is in flight
    const [coverImageUrl, setCoverImageUrl] = useState(null); // Cloudinary secure_url after upload
    const [uploadError, setUploadError] = useState('');       // inline error message for upload failures

    const navigate = useNavigate();

    // ── handleUpload ───────────────────────────────────────────────
    // Called by <ImageUpload onUpload={handleUpload}> when the user
    // clicks "Upload Image" after selecting a valid file.
    //
    // Two-step pattern:
    //   1. Upload image → GET back a Cloudinary URL
    //   2. Store URL in state → use it in handleSubmit (post creation)
    //
    // Note: We DO NOT set Content-Type manually. The browser sets
    // "multipart/form-data; boundary=…" automatically when it detects
    // FormData, and our axios instance no longer overrides it globally.
    const handleUpload = async (formData) => {
        setUploading(true);
        setUploadError('');

        try {
            const response = await api.post('/api/upload', formData);
            // response.data: { success: true, url: "https://res.cloudinary.com/...", publicId: "..." }

            setCoverImageUrl(response.data.url);
            toast.success('✅ Image uploaded successfully!');
        } catch (error) {
            const message = error.response?.data?.message || 'Image upload failed. Please try again.';
            setUploadError(message);
            toast.error(message);
        } finally {
            // Always reset the spinner — whether the request succeeded or failed.
            // Without finally, an exception would leave uploading === true forever.
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ── AI Generation Logic ────────────────────────────────────────
    const handleAIGenerate = async () => {
        if (!aiTopic.trim()) {
            toast.error('Please enter a topic for the AI to generate content.');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await api.post('/api/ai/generate', { topic: aiTopic });
            if (response.data.success && response.data.data) {
                const { title, content } = response.data.data;
                setFormData(prev => ({ ...prev, title, content }));
                toast.success('✨ AI Content Generated Successfully!');
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to generate AI content.';
            toast.error(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    // ── handleSubmit ───────────────────────────────────────────────
    // Creates the post. coverImageUrl is included as-is:
    //   - Cloudinary URL string if the user uploaded an image
    //   - null if no image was uploaded (text-only post)
    // The backend schema has coverImage: { default: null }, so both are valid.
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.content.length < 10) {
            toast.error('Content must be at least 10 characters.');
            return;
        }

        // Block submit while image is still uploading — the URL isn't ready yet
        if (uploading) {
            toast.error('Please wait for the image to finish uploading.');
            return;
        }

        setIsLoading(true);
        try {
            const postPayload = {
                ...formData,
                coverImage: coverImageUrl, // null if no image; Cloudinary URL otherwise
            };

            const response = await api.post('/api/posts', postPayload);
            if (response.data.success) {
                toast.success('Post created successfully!');
                navigate('/dashboard');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create post. Please try again.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const charCount = formData.content.length;

    // The submit button is disabled while either the image upload or
    // the post creation HTTP request is in flight.
    const isSubmitDisabled = isLoading || uploading;

    return (
        <main className="create-page">
            <div className="create-inner">
                {/* Back link */}
                <Link to="/dashboard" className="back-link">
                    ← Back to Dashboard
                </Link>

                <div className="create-card">
                    {/* Header */}
                    <div className="create-header">
                        <div className="create-header-icon">✍️</div>
                        <h1 className="create-title">New Post</h1>
                        <p className="create-subtitle">Share your ideas with the world</p>
                    </div>

                    {/* AI Generator Section */}
                    <div className="ai-generator-section" style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bbf7d0' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#166534', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ✨ AI Content Generator
                        </h3>
                        <p style={{ color: '#15803d', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            Stuck on what to write? Enter a topic below and let our expert AI generate a title and blog post for you.
                        </p>
                        <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder="e.g. The impact of quantum computing..."
                                className="form-input"
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleAIGenerate}
                                disabled={isGenerating}
                                style={{
                                    backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                {isGenerating ? 'Generating...' : 'Generate 🪄'}
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="create-form">
                        {/* Title */}
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">
                                Title <span className="required">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Give your post a compelling title…"
                                required
                                maxLength={100}
                                className="form-input"
                                autoFocus
                            />
                            <span className="char-hint">{formData.title.length}/100</span>
                        </div>

                        {/* Category + Status row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="category" className="form-label">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="status" className="form-label">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="form-group">
                            <label htmlFor="content" className="form-label">
                                Content <span className="required">*</span>
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Write your post content here… (minimum 10 characters)"
                                rows={12}
                                required
                                className="form-textarea"
                            />
                            <span className={`char-hint ${charCount < 10 && charCount > 0 ? 'char-hint--warn' : ''}`}>
                                {charCount} characters {charCount < 10 ? `(${10 - charCount} more needed)` : '✓'}
                            </span>
                        </div>

                        {/* Cover Image Upload */}
                        <div className="form-group">
                            <ImageUpload onUpload={handleUpload} />

                            {/* Upload loading indicator */}
                            {uploading && (
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                    ⏳ Uploading image to Cloudinary, please wait…
                                </p>
                            )}

                            {/* Upload success confirmation */}
                            {coverImageUrl && !uploading && (
                                <p style={{ color: '#22c55e', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                    ✅ Image ready — will be attached to your post.
                                </p>
                            )}

                            {/* Upload error (inline, persists until user tries again) */}
                            {/* TODO: if the user re-selects an image and uploads again, the old
                                orphaned image still exists in Cloudinary. Deleting it requires
                                calling the Cloudinary destroy API with the publicId — a future improvement. */}
                            {uploadError && (
                                <p
                                    style={{ color: '#f87171', fontSize: '0.875rem', marginTop: '0.5rem' }}
                                    role="alert"
                                >
                                    ⚠️ {uploadError}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="form-actions">
                            <Link to="/dashboard" className="btn-cancel">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="btn-submit"
                                id="create-post-btn"
                            >
                                {uploading ? (
                                    <span className="btn-loading">
                                        <span className="spinner" /> Uploading image…
                                    </span>
                                ) : isLoading ? (
                                    <span className="btn-loading">
                                        <span className="spinner" /> Creating…
                                    </span>
                                ) : (
                                    <>
                                        {formData.status === 'published' ? '🚀 Publish Post' : '💾 Save Draft'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default CreatePost;
