import { posts } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

// import validation functions
// validatePost, handleId, etc.

// import api functions
// this is needed to attach lastfm song/artist data to post object
import * as lastfm from '../api/lastfm.js';


// create post
// how should we design this, would lastfmSong and lastfmArtist be params like this? seems fine to me
export async function createPost(body, userId, lastfmSong, lastfmArtist) {
  // validatePost(body, userId, lastfmSong, lastfmArtist);
  const postCollection = await posts();

  // Need to decide how to handle picking a song/artist, this might be fine
  // why is it saying await is unnecessary here
  const lastfmSong_ = await lastfm.searchTrackByName(lastfmSong, 1);
  const lastfmArtist_ = await lastfm.searchArtistByName(lastfmArtist, 1);

  // ? Should we have tags on posts.. need to check the doc if this was required or extra
  const newPost = {
    userId,
    body,
    comments: [], // ? comment objects or ids to comment objects
    track: lastfmSong_ || null,
    artist: lastfmArtist_ || null,
    likes: [], 
    createdAt: new Date(),
    // can be useful to have updatedAt to limit how often user can update their profile
    // updatedAt: new Date()
  };
  const insertInfo = await postCollection.insertOne(newPost);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add post";  
  const newId = insertInfo.insertedId.toString();
  const post = await getPostById(newId);
  return post;
}

// get post by id
export async function getPostById(id) {
  // handleId(id);
  const postCollection = await posts();
  const post = await postCollection.findOne({ _id: ObjectId(id) });
  if (!post) throw "Post not found";
  post._id = post._id.toString();
  return post;
}

// get all posts
// ? do we even want this

// get all posts by user
export async function getPostsByUser(id) {
  // handleId(id);
  const postCollection = await posts();
  const post = await postCollection.find({ userId: id }).toArray();
  if (!post) throw "Post not found";
  post._id = post._id.toString();
  return post;
}

// get all posts by artist
// ? take in name or id
export async function getPostsByArtist(name) {
  // handleId(id);
  const postCollection = await posts();
  const lastfmArtist_ = await lastfm.searchArtistByName(name, 1);
  // only trying to find lastfmArtist_ object because idk what we're actually gonna be storing
  const post = await postCollection.find({ artist: lastfmArtist_ }).toArray();
  if (!post) throw "Post not found";
  post._id = post._id.toString();
  return post;
}

// remove post by id
export async function removePostById(id) {
  // handleId(id);
  const postCollection = await posts();
  // ! should I just do findOneAndDelete instead
  const post = await getPostById(id);
  const deletionInfo = await postCollection.deleteOne({ _id: ObjectId(id) });
  if (!deletionInfo.acknowledged || deletionInfo.deletedCount === 0) throw `Could not delete post with id of ${id}`;
  return post;
}

// update post by id
// ? should we allow the post to be updated, or just comments and likes


// ! These two should be in comments.js
// add comment to post
export async function addCommentToPost(postId, commentId) {
  // handleId(postId);
  // handleId(commentId);
  const postCollection = await posts();
  const updateInfo = await postCollection.updateOne(
    { _id: ObjectId(postId) },
    { $addToSet: { comments: commentId } }
  );
  if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw "Could not update post";
  return await getPostById(postId);
}

// remove comment from post
export async function removeCommentFromPost(postId, commentId) {
  // handleId(postId);
  // handleId(commentId);
  const postCollection = await posts();
  const updateInfo = await postCollection.updateOne(
    { _id: ObjectId(postId) },
    { $pull: { comments: commentId } }
  );
  if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw "Could not update post";
  return await getPostById(postId);
}

// add like to post
export async function addLikeToPost(postId, userId) {
  // handleId(postId);
  // handleId(userId);
  const postCollection = await posts();
  const updateInfo = await postCollection.updateOne(
    { _id: ObjectId(postId) },
    { $addToSet: { likes: userId } }
  );
  if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw "Could not update post";
  return await getPostById(postId);
}

// remove like from post
export async function removeLikeFromPost(postId, userId) {
  // handleId(postId);
  // handleId(userId);
  const postCollection = await posts();
  const updateInfo = await postCollection.updateOne(
    { _id: ObjectId(postId) },
    // not sure if this works, from stackoverflow
    { $pull: { likes: userId } }
  );
  if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw "Could not update post";
  return await getPostById(postId);
}