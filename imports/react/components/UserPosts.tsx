import * as React from 'react';
import Posts from '../../api/collections/posts';
import { IUser } from '../../api/collections/users';

export interface IProps {
  user: {
    id: string;
    firstname: string;
  };
  posts: {
    id: string;
    content: string;
  }[];
  remove: (id) => void;
  createRandom: () => void;
}

export const UserPosts = ({
  user,
  posts,
  remove,
  createRandom,
}: IProps) => {
  return <div>
    <button onClick={createRandom}>createRandom</button> for {user && user.firstname}
    <ul>
      {posts && posts.map(post => <li key={post.id}>
        {post.content}
        <button onClick={() => remove(post.id)}>remove</button>
      </li>)}
    </ul>
  </div>;
};
