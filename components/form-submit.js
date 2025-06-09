'use client';

import { useFormStatus } from 'react-dom';

export default function FormSubmit() {
  const status = useFormStatus();

  // The component must be inside a <form> element
  // so that useFormStatus can detect the status
  // of the form submission triggered by the form's action.
  //
  // If placed outside the <form>, useFormStatus won't know
  // which form submission it relates to, and won't work properly.

  if (status.pending) {
    // While the form is submitting, show a loading message
    return <p>Creating post...</p>;
  }

  // When not submitting, show the regular form buttons
  return (
    <>
      <button type="reset">Reset</button>
      <button>Create Post</button>
    </>
  );
}
