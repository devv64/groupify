import { posts, users, comments } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as validate from './validation.js';
import * as lastfm from '../api/lastfm.js';

import {findTrackByName, findArtistByName} from "../api/lastfm.js"
import { getUserById } from './users.js';
import * as userData from './users.js';


// create post
export async function createPost(body, userId, lastfmSong, lastfmArtist) {
  body = validate.validString(body);
  userId = validate.validId(userId);
  lastfmSong = validate.validFmString(lastfmSong);
  lastfmArtist = validate.validFmString(lastfmArtist);

  const postCollection = await posts();
  const userCollection = await users();

  const lastfmSong_ = lastfmSong ? await findTrackByName(lastfmSong) : null;
  const lastfmArtist_ = lastfmArtist ? await findArtistByName(lastfmArtist) : null;

  const user = await getUserById(userId);
  if (!user) throw "User not found";

  const username = user.username

  const newPost = {
    userId,
    username,
    pfp: user.pfp,
    body,
    comments: [],
    track: lastfmSong_ || null,
    artist: lastfmArtist_ || null,
    likes: [], 
    createdAt: new Date(),
  };
  const insertInfo = await postCollection.insertOne(newPost);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add post";  
  const newId = insertInfo.insertedId.toString();
  const post = await getPostById(newId);
  if (!post) throw "Post not found";

  let newUser = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $push: {createdPosts: newId} },
    { returnDocument: 'after' }
    )

  if(!newUser) throw "User not found"

  for (let i = 0; i < user.followers.length; i++) {
    await userData.addNotification(user.followers[i], `${user.username} created a post: "${post.body}" at ${post.createdAt.toLocaleString()}`, newId)
  }

  return post;
}

// get post by id
export async function getPostById(id) {
  id = validate.validId(id);
  const postCollection = await posts();
  const post = await postCollection.findOne({ _id: new ObjectId(id) });
  if (!post) throw "Post not found";
  post._id = post._id.toString();
  return post;
}

// get all posts by user
export async function getPostsByUser(id) {
  id = validate.validId(id);
  const postCollection = await posts();
  const userPosts = await postCollection.find({ userId: id }).toArray();
  if (!userPosts) throw "Post not found";
  userPosts.forEach(post => post._id = post._id.toString());
  return userPosts;
}

// get all posts by artist
export async function getPostsByArtist(name) {
  name = validate.validString(name);
  const postCollection = await posts();
  const lastfmArtist_ = await lastfm.findArtistByName(name);
  if (!lastfmArtist_) throw "Artist not found";
  const artistPosts = await postCollection.find({ artist: lastfmArtist_ }).toArray();
  if (!artistPosts) throw "Post not found";
  artistPosts.forEach(post => post._id = post._id.toString());
  return artistPosts;
}

// get some posts
// this is for the feed, so we can get the most recent posts
export async function getSomePosts(n=25) {
  const postCollection = await posts();
  const _posts = await postCollection.find().sort({ createdAt: -1}).limit(n).toArray();
  if (!_posts || _posts.length === 0) throw "Posts not found";
  _posts.forEach(post => post._id = post._id.toString());
  return _posts;
}

// get all posts
export async function getAllPosts() {
  const postCollection = await posts();
  const _posts = await postCollection.find().sort({ createAt: -1}).toArray();
  if (!_posts || _posts.length === 0) throw "Posts not found";
  _posts.forEach(post => post._id = post._id.toString());
  return _posts;
}

// remove post by id
export async function removePostById(id, userId) {
  id = validate.validId(id);
  userId = validate.validId(userId);

  const postCollection = await posts();
  const userCollection = await users();
  const commentCollection = await comments();
  const user = await userCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) throw "User not found";
  const post = await getPostById(id);
  if (!post) throw "Post not found";

  if (user._id.toString() !== post.userId) throw "User does not own post"; 

  for (let i = 0; i < post.likes.length; i++) {
    let user = await userCollection.findOneAndUpdate( //removes post from likedPosts from that user
      { _id: new ObjectId(post.likes[i]) },
      { $pull: {likedPosts: id} },
      { returnDocument: 'after' }
    )

    if(!user) throw "User not found"
  }

  for (let i = 0; i < post.comments.length; i++) {
    let comment = await commentCollection.findOneAndDelete( //deletes all comments on that post
      { _id: new ObjectId(post.comments[i]) }
    )

    if(!comment) throw "Comment not found"
  }

  let updateUser = await userCollection.findOneAndUpdate( //removes post from createdPosts from that user
    { username: user.username },
    { $pull: {createdPosts: id} },
    { returnDocument: 'after' }
  )

    if(!updateUser) throw "User not found"

    // ! error check

  const deletionInfo = await postCollection.deleteOne({ _id: new ObjectId(id) });
  if (!deletionInfo.acknowledged || deletionInfo.deletedCount === 0) throw `Could not delete post with id of ${id}`;
  return post;
}

// add like to post
export async function addLikeToPost(postId, userId) {
  postId = validate.validId(postId);
  userId = validate.validId(userId);
  const postCollection = await posts();
  const userCollection = await users();
  const updateInfo = await postCollection.updateOne(
    { _id: new ObjectId(postId) },
    { $addToSet: { likes: userId } }
  );

  if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw "Could not update post";

  let user = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $addToSet: {likedPosts: postId} },
    { returnDocument: 'after' }
    )

  if (!user) throw "User not found"

  if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw "Could not update post";
  const post = await getPostById(postId);
  if (!post) throw "Post not found";

  const username = user.username
  await userData.addNotification(post.userId, `${username} liked your post: "${post.body}" at ${new Date().toLocaleString()}`, postId)

  return post;
}

// remove like from post
export async function removeLikeFromPost(postId, userId) {
  postId = validate.validId(postId);
  userId = validate.validId(userId);
  const postCollection = await posts();
  const userCollection = await users();
  const updateInfo = await postCollection.updateOne(
    { _id: new ObjectId(postId) },
    { $pull: { likes: userId } }
  );
  if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw "Could not update post";
  let user = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $pull: {likedPosts: postId} },
    { returnDocument: 'after' }
    )

  if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw "Could not update post";
  const post = await getPostById(postId);
  if (!post) throw "Post not found";
  return post;
}

export async function isLiked(postId, userId) {
  postId = validate.validId(postId);
  userId = validate.validId(userId);
  const postCollection = await posts();
  const post = await postCollection.findOne({ _id: new ObjectId(postId) });
  if (!post) throw "Post not found";
  post._id = post._id.toString();
  return post.likes.includes(userId);
}