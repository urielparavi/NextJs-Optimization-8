'use client';

import { useOptimistic } from 'react';
import Image from 'next/image';

import { formatDate } from '@/lib/format';
import LikeButton from './like-icon';
import { togglePostLikeStatus } from '@/actions/posts';

/**
 * Custom Cloudinary image loader for Next.js <Image> component.
 *
 * Builds a Cloudinary URL with width and quality params (e.g. w_200, q_50)
 * so the image is served already optimized — smaller and faster to load.
 *
 * Example:
 * Original:   https://res.cloudinary.com/.../upload/v12345/folder/image.jpg
 * Transformed: https://res.cloudinary.com/.../upload/w_200,q_50/v12345/folder/image.jpg
 *
 * Usage:
 * <Image loader={cloudinaryLoader} src="..." width={200} quality={50} ... />
 *
 * Props:
 * - src:     Image path
 * - width:   Desired width
 * - quality: Desired quality (1–100)
 */

function imageLoader(config) {
  // console.log(config);
  // {
  //   src: 'https://res.cloudinary.com/dlwm02l1u/image/upload/v1749298486/nextjs/pqanxkasnj5yaoutkf8h.jpg',
  //   quality: undefined,
  //   width: 3840
  // }

  const urlStart = config.src.split('upload/')[0]; // Output: https://res.cloudinary.com/dlwm02l1u/image/

  const urlEnd = config.src.split('upload/')[1]; // Output: v1749298486/nextjs/pqanxkasnj5yaoutkf8h.jpg

  const transformations = `w_200,q_${config.quality}`; // Output: w_200,q_50

  return `${urlStart}upload/${transformations}/${urlEnd}`;
  // https://res.cloudinary.com/dlwm02l1u/image/upload/w_200,q_50/v1749298486/nextjs/pqanxkasnj5yaoutkf8h.jpg
}

function Post({ post, action }) {
  return (
    <article className="post">
      <div className="post-image">
        {/*
         Use 'fill' to make the image automatically stretch to fill the size of its parent container.
         Requires the parent element to have position: relative and explicit width and height.
     */}
        <Image
          loader={imageLoader}
          src={post.image}
          width={200}
          height={120}
          alt={post.title}
          quality={50}
        />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{' '}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form
              // bind allows us to create a new instance of a function with pre-set values.
              // If there is a `this`, it will be relative to the object the function is bound to.
              // If `this` is not needed – just pass null and move on.
              // action={togglePostLikeStatus.bind(null, post.id)}
              action={action.bind(null, post.id)}
              className={post.isLiked ? 'liked' : ''}
            >
              <LikeButton />
            </form>
          </div>
        </header>
        <p>{post.content}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {
  // useOptimistic is used to manage optimistic UI updates.
  // This allows us to immediately update the UI (e.g., like/unlike a post)
  // before the actual server action completes.
  // It takes the current posts and a function that returns a new posts array
  // with the updated post based on its ID.
  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(
    // optimisticPosts: the current state of posts shown in the UI (possibly updated optimistically)
    // updateOptimisticPosts: function to update the optimisticPosts state
    posts,
    (prevPosts, updatedPostId) => {
      // Find the index of the post that matches the given ID (the one that was clicked)
      // This allows us to locate and update the correct post in the array
      const updatedPostIndex = prevPosts.findIndex(
        (post) => post.id === updatedPostId
      );

      // If the post with the given ID is not found (findIndex returns -1),
      // return the previous posts array unchanged
      if (updatedPostIndex === -1) {
        return prevPosts;
      }

      // Create a new copy of the post object at the found index
      // This avoids mutating the original post directly
      const updatedPost = { ...prevPosts[updatedPostIndex] }; // Output: { id: 2, title: 'Second post', likes: 5 }

      // Update the likes count:
      // If the post is already liked, decrement likes by 1
      // Otherwise, increment likes by 1
      updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? -1 : 1);

      // Toggle the isLiked boolean value
      // If it was true, set to false; if false, set to true
      updatedPost.isLiked = !updatedPost.isLiked;

      // Create a shallow copy of the posts array
      // This keeps the original array immutable
      const newPosts = [...prevPosts];

      // Replace the post at the updated index with the modified copy
      newPosts[updatedPostIndex] = updatedPost;

      // Return the new posts array with the updated post
      return newPosts;
    }
  );

  if (!optimisticPosts || optimisticPosts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }

  // This async function handles updating the like status of a post.
  // It first updates the UI optimistically to provide instant feedback to the user,
  // then sends the actual request to the server to update the like status in the database.
  async function updatePost(postId) {
    // *Sidenote:* The post ID originates from here (via `post.id`), is passed to `updatePost` as `postId`,
    // then forwarded to `updateOptimisticPosts` for optimistic UI update, and also to `togglePostLikeStatus`
    // to update the database on the server.
    // This flow starts from `action={action.bind(null, post.id)}` in the Post component.

    // Immediately update the UI optimistically without waiting for the server
    updateOptimisticPosts(postId);

    // Send the actual like status toggle request to the server
    // Wait for the server response before proceeding
    // This is also responsible for updating the database accordingly
    await togglePostLikeStatus(postId);
  }

  return (
    <ul className="posts">
      {optimisticPosts.map((post) => (
        <li key={post.id}>
          <Post post={post} action={updatePost} />
        </li>
      ))}
    </ul>
  );
}
