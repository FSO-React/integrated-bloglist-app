const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const middleware = require('../utils/middleware');

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 });
  response.status(200).json(blogs);
});

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1, id: 1 });
  if (!blog) {
    response.status(404).end();
  }
  response.status(200).json(blog);
});

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const user = request.user;
  const body = request.body;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user.id,
  });
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog.id);
  await user.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user;
  const blog = await Blog.findById(request.params.id);

  if (!blog) {
    return response.status(404).end();
  }
  if (user.id !== blog.user.toString()) {
    return response.status(401).json({ error: 'token invalid' });
  }

  await Blog.findByIdAndDelete(request.params.id);
  user.blogs = user.blogs.filter(b => b.id !== request.params.id);
  await user.save();
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response, next) => {
  const originalBlog = await Blog.findById(request.params.id);
  if (!originalBlog) {
    return response.status(404).end();
  }

  const body = request.body;
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true });
  response.status(200).json(updatedBlog);
});

module.exports = blogsRouter;