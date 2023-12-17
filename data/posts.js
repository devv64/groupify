import { posts, users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as validate from './validation.js';
import * as lastfm from '../api/lastfm.js';

// import validation functions
// validatePost, handleId, etc.

// import api functions
// this is needed to attach lastfm song/artist data to post object
import {searchTrackByName, searchArtistByName, findTrackByName, findArtistByName} from "../api/lastfm.js"
import { getUserById } from './users.js';


// create post
// how should we design this, would lastfmSong and lastfmArtist be params like this? seems fine to me
export async function createPost(body, userId, lastfmSong, lastfmArtist) {
  // validatePost(body, username, lastfmSong, lastfmArtist);
  body = validate.validString(body);
  // username = validate.validString(username);

  // TODO: Need to figure out how this should work
  // lastfmSong = validate.validString(lastfmSong);
  // lastfmArtist = validate.validString(lastfmArtist);  

  body = validate.validString(body);
  userId = validate.validId(userId);
  lastfmSong = validate.validFmString(lastfmSong);
  lastfmArtist = validate.validFmString(lastfmArtist);

  const postCollection = await posts();
  const userCollection = await users();

  // Need to decide how to handle picking a song/artist, this might be fine
  // why is it saying await is unnecessary here
  // TODO: probably some error handling needed here
  const lastfmSong_ = lastfmSong ? await findTrackByName(lastfmSong) : null;
  const lastfmArtist_ = lastfmArtist ? await findArtistByName(lastfmArtist) : null;

  const user = await getUserById(userId);
  if (!user) throw "User not found";

  const username = user.username

  // ? Should we have tags on posts.. need to check the doc if this was required or extra
  const newPost = {
    // need to also give username, pfp, etc. to post
    userId,
    username,
    body,
    comments: [], // ? comment objects or ids to comment objects
    track: lastfmSong_ || null,
    artist: lastfmArtist_ || null,
    likes: [], 
    createdAt: new Date(),
    // updatedAt: new Date()
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
    // ! error check newUser

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

// get all posts
// ? do we even want this

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
// ? take in name or id
export async function getPostsByArtist(name) {
  name = validate.validString(name);
  const postCollection = await posts();
  const lastfmArtist_ = await lastfm.searchArtistByName(name, 1);
  if (!lastfmArtist_) throw "Artist not found";
  // only trying to find lastfmArtist_ object because idk what we're actually gonna be storing
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

// remove post by id
export async function removePostById(id) {
  id = validate.validId(id);
  const postCollection = await posts();
  const userCollection = await users();
  const user = await userCollection.findOne({ createdPosts : {$in: [id]}}) //finds user that created post by checking createdPosts for the id
  if (!user) throw "User not found";
  const post = await getPostById(id);
  if (!post) throw "Post not found";

  let updateUser = await userCollection.findOneAndUpdate( //removes post from createdPosts from that user
    { username: user.username },
    { $pull: {createdPosts: id} },
    { returnDocument: 'after' }
    )

    if(!updateUser) throw "User not found"

    // ! error check

    // ? maybe remove from everyone that liekd thsi post

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
    { $push: {likedPosts: postId} },
    { returnDocument: 'after' }
    )

  if (!user) throw "User not found"

  if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw "Could not update post";
  const post = await getPostById(postId);
  if (!post) throw "Post not found";
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
    // not sure if this works, from stackoverflow
    { $pull: { likes: userId } }
  );

  if (!updateInfo.acknowledged || updateInfo.modifiedCount === 0) throw "Could not update post";

  let user = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    // { $pull: {likedPosts: newId} },
    { $pull: {likedPosts: new ObjectId(newId)} },
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