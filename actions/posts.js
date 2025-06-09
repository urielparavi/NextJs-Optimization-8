'use server';

// Since the file has a top-level `'use server'` directive, all exported functions here are automatically
// treated as Server Actions.
//
// Therefore, there's **no need to add `'use server'` inside individual functions**.
// If you wanted more granular control (i.e., only some functions should be Server Actions),
// you would remove the top-level directive and instead add `'use server'` inside each relevant function.

import { storePost, updatePostLikeStatus } from '@/lib/posts';
import { redirect } from 'next/navigation';
import { uploadImage } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';

// This is a Server Action used with `useActionState`.
// It must accept two arguments:
// 1. prevState – the state returned from the previous execution (or initialState).
// 2. formData – the data submitted from the client-side form.
// When using useActionState, both parameters are required to handle form submissions and preserve state.
// Therefore, both arguments must be included in the Server Action function, like `createPost`.
export async function createPost(prevState, formData) {
  // This function is a Server Action:
  // It's defined in a Server Component, but it's meant to be triggered by the client
  // (e.g. through a form submission or a button click).
  // The `'use server'` directive tells Next.js:
  // "This function should run on the server when the client sends a request to it."
  // 'use server';

  const title = formData.get('title');
  const image = formData.get('image');
  const content = formData.get('content');

  let errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required.');
  }

  if (!content || content.trim().length === 0) {
    errors.push('Content is required.');
  }

  if (!image || image.size === 0) {
    errors.push('Image is required.');
  }

  if (errors.length > 0) {
    return { errors };
  }

  let imageUrl;

  try {
    imageUrl = await uploadImage(image);
  } catch (error) {
    // console.error('Cloudinary upload error:', error);
    throw new Error(
      'Image upload failed, post was not created. Please try again later.'
    );
  }

  await storePost({
    imageUrl,
    title,
    content,
    userId: 1,
  });

  // After creating a new post, we revalidate the layout of the main route ('/').
  // This ensures that the latest post appears in the UI by triggering a server-side rebuild
  // of the layout segment on the next request.
  revalidatePath('/', 'layout');
  redirect('/feed');
}

export async function togglePostLikeStatus(postId) {
  await updatePostLikeStatus(postId, 2);

  // Revalidates the server cache for the '/' route's layout segment.
  // When this function is called (e.g., when liking or unliking a post),
  // Next.js will rebuild the layout with updated data on the next request,
  // enabling the UI to reflect the latest changes without a full client-side reload.
  revalidatePath('/', 'layout');
  // revalidatePath('/feed');
}
