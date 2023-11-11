import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      console.log('her')
      const db = await dbConnection();
      console.log('him')
      _col = await db.collection(collection);
    }

    return _col;
  };
};

console.log('mongoCollections.js: getCollectionFn()');
export const users = getCollectionFn('users');
export const posts = getCollectionFn('posts');
export const comments = getCollectionFn('comments');
