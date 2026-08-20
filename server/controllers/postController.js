import Post from '../models/Post.js';
import { eventLoopLogger } from '../utils/eventLoopLogger.js';

// Helper: create an error with an HTTP status attached
const createError = (message, status) => {
    const err = new Error(message);
    err.status = status;
    return err;
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
// io — optional Socket.io server instance (passed from postRoutes)
export const createPost = async (req, res, next, io) => {
    try {
        const { title, content, category, status, coverImage } = req.body;

        // Validate required fields
        if (!title || !content) {
            return next(createError('Please provide a title and content', 400));
        }

        // Create post — link to authenticated user via req.user (set by protect middleware)
        const post = await Post.create({
            title,
            content,
            category,
            status,
            coverImage: coverImage || null, // Cloudinary URL or null for text-only posts
            author: req.user._id,
        });

        // Emit real-time event to ALL connected authenticated clients
        if (io) {
            io.emit('newPost', {
                message: `New post created by ${req.user.name}`,
                post: {
                    _id: post._id,
                    title: post.title,
                    createdBy: req.user.name,
                },
            });
        }

        // ── Event Loop Demonstration ──
        // This offloads heavy analytics to the Macrotask queue so we don't delay the 201 response.
        eventLoopLogger(`New post created by user ${req.user.name}`);

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: post,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get posts for the logged-in user with pagination
// @route   GET /api/posts?page=1&limit=10
// @access  Private
export const getPosts = async (req, res, next) => {
    try {
        // Parse page & limit from query string (with safe defaults)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Number of documents to skip
        const skip = (page - 1) * limit;

        // Run data query and count in PARALLEL — saves ~30ms per request
        const [posts, total] = await Promise.all([
            Post.find({ author: req.user._id })
                .select('title content category status coverImage createdAt author') // Only what the frontend needs
                .populate('author', 'name email') // Resolve ObjectId → { name, email }
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(), // Skip Mongoose hydration — 30-50% faster for read-only results
            Post.countDocuments({ author: req.user._id }),
        ]);

        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single post by ID (owner only)
// @route   GET /api/posts/:id
// @access  Private
export const getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name email');

        if (!post) {
            return next(createError('Post not found', 404));
        }

        // Ownership check
        if (post.author._id.toString() !== req.user._id.toString()) {
            return next(createError('Not authorized to view this post', 403));
        }

        res.status(200).json({
            success: true,
            data: post,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update post (owner only)
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return next(createError('Post not found', 404));
        }

        // Ownership check
        if (post.author.toString() !== req.user._id.toString()) {
            return next(createError('Not authorized to update this post', 403));
        }

        // Only update fields that were sent
        const { title, content, category, status } = req.body;
        if (title) post.title = title;
        if (content) post.content = content;
        if (category) post.category = category;
        if (status) post.status = status;

        const updatedPost = await post.save();

        res.status(200).json({
            success: true,
            message: 'Post updated successfully',
            data: updatedPost,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete post (owner only)
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return next(createError('Post not found', 404));
        }

        // Ownership check
        if (post.author.toString() !== req.user._id.toString()) {
            return next(createError('Not authorized to delete this post', 403));
        }

        await post.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully',
            data: { id: req.params.id },
        });
    } catch (error) {
        next(error);
    }
};
