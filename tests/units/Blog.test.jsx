/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Blog from '../../src/components/Blog';
import { expect } from 'vitest';

test('renders content', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Adrian Diaz',
    url: 'https://example.com',
    likes: 10
  };

  const updateBlog = vi.fn();
  const removeBlog = vi.fn();

  const { container } = render(<Blog blog={blog} updateBlog={updateBlog} removeBlog={removeBlog} />);
  const div = container.querySelector('.blog');

  expect(div).toHaveTextContent('Component testing is done with react-testing-library - Adrian Diaz');
  expect(div).not.toHaveTextContent('url: https://example.com');
  expect(div).not.toHaveTextContent('likes: 10');
});

test('shows url and likes when click the button', async () => {
  const user = userEvent.setup();
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Adrian Diaz',
    url: 'https://example.com',
    likes: 10
  };

  const updateBlog = vi.fn();
  const removeBlog = vi.fn();

  const { container } = render(<Blog blog={blog} updateBlog={updateBlog} removeBlog={removeBlog} />);
  const div = container.querySelector('.blog');
  const button = container.querySelector('#toggle-details');

  await user.click(button);

  expect(div).toHaveTextContent('Component testing is done with react-testing-library - Adrian Diaz');
  expect(div).toHaveTextContent('author: Adrian Diaz');
  expect(div).toHaveTextContent('url: https://example.com');
  expect(div).toHaveTextContent('likes: 10');
});

test('registers the 2 clicks on the like button', async () => {
  const user = userEvent.setup();
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Adrian Diaz',
    url: 'https://example.com',
    likes: 10
  };

  const updateBlog = vi.fn();
  const removeBlog = vi.fn();

  const { container } = render(<Blog blog={blog} updateBlog={updateBlog} removeBlog={removeBlog} />);
  const div = container.querySelector('.blog');

  const view_button = container.querySelector('#toggle-details');
  await user.click(view_button);

  const like_button = container.querySelector('#like_blog');
  await user.click(like_button);
  await user.click(like_button);

  expect(div).toHaveTextContent('Component testing is done with react-testing-library - Adrian Diaz');
  expect(updateBlog.mock.calls).toHaveLength(2);
  expect(removeBlog.mock.calls).toHaveLength(0);
  expect(updateBlog).toHaveBeenCalledTimes(2);
});