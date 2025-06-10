import { createPost } from '@/actions/posts';
import PostForm from '@/components/post-form';

export const metadata = {
  title: 'Create New Post',
  description:
    'Start adding your new post. Easily add title, content, images and publish to your blog.',
};

export default function NewPostPage() {
  return <PostForm action={createPost} />;
}
