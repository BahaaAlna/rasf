import { useEffect, useState } from 'react';
import { listPosts, type Post } from '../../lib/posts';

/**
 * All posts, loaded once per screen; `posts` stays null until they arrive.
 * A new `version` loads them again, after something changed them.
 */
export function usePosts(version = 0) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    listPosts()
      .then((list) => live && setPosts(list))
      .catch(() => live && setError('Couldn’t load the posts. Check the connection and the Firestore rules.'));
    return () => {
      live = false;
    };
  }, [version]);

  return { posts, error };
}
