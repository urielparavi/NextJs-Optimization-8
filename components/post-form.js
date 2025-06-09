'use client';

import FormSubmit from '@/components/form-submit';
import React, { useActionState } from 'react';

export default function PostForm({ action }) {
  // We're using useActionState to connect our server action (createPost) with the form.
  // This allows us to handle form submissions without client-side validation or state management.
  // All validation logic is done on the server (inside createPost),
  // so we avoid duplicating validation on the client.
  // The returned state can include server-side errors, which we can use to display feedback.
  const [state, formAction] = useActionState(action, {});

  return (
    <>
      <h1>Create a new post</h1>
      {/* 
     This form uses the action returned by useActionState.
     When the user submits the form, the form data is sent to the server-side createPost function.
     We don't handle submission or validation on the client manually — everything is managed through the action.
     If createPost returns any errors, they are available in the `state` variable.
  */}
      <form action={formAction}>
        <p className="form-control">
          <label htmlFor="title">Title</label>
          <input type="text" id="title" name="title" />
        </p>
        <p className="form-control">
          <label htmlFor="image">Image</label>
          <input
            type="file"
            accept="image/png, image/jpeg"
            id="image"
            name="image"
          />
        </p>
        <p className="form-control">
          <label htmlFor="content">Content</label>
          <textarea id="content" name="content" rows="5" />
        </p>
        <div className="form-actions">
          <FormSubmit />
        </div>
        {state.errors && (
          <ul className="form-errors">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </form>
    </>
  );
}
