import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

export const users = getCollectionFn('users');
export const posts = getCollectionFn('posts');
export const comments = getCollectionFn('comments');
// console.log(users, posts, comments)
// const pst = await posts();
