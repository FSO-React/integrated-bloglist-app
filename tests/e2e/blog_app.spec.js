const { test, describe, expect, beforeEach } = require('@playwright/test');
const { loginWith, createBlog, logOut, likeBlog } = require('./helper');
test.describe.configure({ mode: 'serial' });

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset');
    await request.post('/api/users', {
      data: {
        name: 'Playwright',
        username: 'playwright',
        password: '1234'
      }
    });
    await request.post('/api/users', {
      data: {
        name: 'Secondary',
        username: 'secondary',
        password: '1234'
      }
    });
    await page.goto('/');
  });

  test('login form is shown', async ({ page }) => {
    const locator = await page.getByText('blogs');
    expect(locator).not.toBeNull();
    await page.getByRole('button', { name: 'login' }).click();
    expect(page.getByText('Log in to application')).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'playwright', '1234');
      await expect(page.getByText('Playwright logged in')).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'playwright', 'wrong');
      const errorDiv = await page.locator('.error');
      await expect(errorDiv).toContainText('wrong username or password');
    });
  });

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'playwright', '1234');
    });

    test('a blog can be created', async ({ page }) => {
      const blog = {
        title: 'Playwright blog',
        author: 'Playwright',
        url: 'https://playwright.dev'
      };
      await createBlog(page, blog);
      await expect(page.getByText(`${blog.title} - ${blog.author}`)).toBeVisible();
    });

    describe('When a blog exists', () => {
      beforeEach(async ({ page }) => {
        const blog = {
          title: 'Previous Playwright blog',
          author: 'Playwright',
          url: 'https://playwright.dev'
        };
        await createBlog(page, blog);
      });

      test('a blog can be updated (by liking it)', async ({ page }) => {
        const blog = await page.getByText('Previous Playwright blog - Playwright');
        await blog.getByRole('button', { name: 'view' }).click();
        await blog.getByRole('button', { name: 'like' }).click();
        await expect(page.getByText('likes: 1')).toBeVisible();
      });

      test('a blog can be deleted by its author', async ({ page }) => {
        const blog = await page.getByText('Previous Playwright blog - Playwright');
        await blog.getByRole('button', { name: 'view' }).click();
        // confirmar la eliminacion en el window.confirm
        page.on('dialog', async (dialog) => {
          expect(dialog.type()).toBe('confirm');
          await dialog.accept();
        });
        await blog.getByRole('button', { name: 'remove' }).click();
        await expect(page.getByText('Previous Playwright blog - Playwright')).not.toBeVisible();
      });

      // paused to accelerate workflows
      // describe('When a different user sees the blog', () => {
      //   beforeEach(async ({ page }) => {
      //     logOut(page)
      //     await loginWith(page, 'secondary', '1234')
      //   })

      //   test('a blog cant be deleted', async ({ page }) => {
      //     const blog = await page.getByText('Previous Playwright blog - Playwright')
      //     await blog.getByRole('button', { name: 'view' }).click()
      //     // confirmar la eliminacion en el window.confirm
      //     page.on('dialog', async (dialog) => {
      //       expect(dialog.type()).toBe('confirm')
      //       await dialog.accept()
      //     })
      //     await blog.getByRole('button', { name: 'remove' }).click()
      //     await expect(blog).toBeVisible()
      //   })
      // })
    });

    // paused to accelerate workflows
    // describe('When multiple blogs exist', () => {
    //   beforeEach(async ({ page }) => {
    //     const blog1 = {
    //       title: 'Playwright blog 1',
    //       author: 'Playwright',
    //       url: 'https://playwright.dev',
    //     }
    //     const blog2 = {
    //       title: 'Playwright blog 2',
    //       author: 'Playwright',
    //       url: 'https://playwright.dev',
    //     }
    //     const blog3 = {
    //       title: 'Playwright blog 3',
    //       author: 'Playwright',
    //       url: 'https://playwright.dev',
    //     }

    //     await createBlog(page, blog1)
    //     await createBlog(page, blog2)
    //     await createBlog(page, blog3)

    //     await likeBlog(page, blog1, 2)
    //     await likeBlog(page, blog2, 1)
    //     await likeBlog(page, blog3, 3)
    //   })
    // })
  });
});