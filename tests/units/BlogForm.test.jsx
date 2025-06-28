/* eslint-disable no-undef */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlogForm from '../../src/components/BlogForm';
import { expect, vi } from 'vitest';

test('renders content', async () => {
  const createBlog = vi.fn();
  const user = userEvent.setup();

  const blogExampleData = {
    title: 'Component testing is done with react-testing-library',
    author: 'Adrian Diaz',
    url: 'https://example.com'
  };

  const { container } = render(<BlogForm createBlog={createBlog} />);

  const input_title = container.querySelector('#title-input');
  const input_author = container.querySelector('#author-input');
  const input_url = container.querySelector('#url-input');
  const save_button = container.querySelector('#save-button');

  await user.type(input_title, blogExampleData.title);
  await user.type(input_author, blogExampleData.author);
  await user.type(input_url, blogExampleData.url);
  await user.click(save_button);

  expect(createBlog.mock.calls).toHaveLength(1);
  expect(createBlog.mock.calls[0][0]).toEqual(blogExampleData);
  expect(input_title).toHaveValue('');
  expect(input_author).toHaveValue('');
  expect(input_url).toHaveValue('');
});
