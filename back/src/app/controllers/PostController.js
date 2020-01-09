const Post = require('./../models/Post');
const User = require('./../models/User');

class PostController {
	async index(req, res) {
		try {
			let posts = await Post.find().populate('author', [ '_id', 'name', 'gender' ]);

			const user = await User.findById(req.userId).select([ 'following' ]);

			user.following.push(req.userId);

			posts = posts.filter((post) => user.following.includes(post.author.id));

			return res.status(200).json(posts);
		} catch (err) {
			return res.status(500).json({ message: 'Internal server error', status: false });
		}
	}

	async get(req, res) {
		try {
			const { id } = req.params;

			const post = await Post.findById({ _id: id }).populate('author');

			if (!post) return res.status(404).json({ message: 'Not found', status: false });

			return res.status(200).json(post);
		} catch (err) {
			return res.status(500).json({ message: 'Internal server error', status: false });
		}
	}

	async store(req, res) {
		try {
			const { content, image } = req.body;

			const post = await Post.create({ content, image, author: req.userId });

			if (!post) return res.status(500).json({ message: 'Internal server error', status: false });

			return res.status(201).json(post);
		} catch (err) {
			return res.status(500).json({ message: 'Internal server error', status: false });
		}
	}

	async update(req, res) {
		try {
			const { id } = req.params;

			const post = await Post.findById(id);
			if (!post) return res.status(404).json({ message: 'Not found', status: false });

			const { author } = post;

			if (author._id.toString() !== req.userId)
				return res.status(403).json({ message: 'Forbidden', status: false });

			await post.update(req.body);

			post.save();

			return res.status(200).json(post);
		} catch (err) {
			return res.status(500).json({ message: 'Internal server error', status: false });
		}
	}

	async destroy(req, res) {
		try {
			const { id } = req.params;

			const post = await Post.findOne({ _id: id });

			const { author } = post;

			if (author._id.toString() !== req.userId)
				return res.status(403).json({ message: 'Impossível excluir este post', status: false });

			await post.remove();

			res.status(200).json({ message: 'Post excluído', status: true });
		} catch (err) {
			if (err.name === 'CastError') {
				return res.status(404).json({ message: 'Post Não encontrado', status: false });
			}
			return res.status(500).json({ message: 'Internal server error', status: false });
		}
	}
}

module.exports = new PostController();
