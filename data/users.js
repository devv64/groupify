import { users } from '../config/mongoCollections.js';
import { ObjectId, ReturnDocument } from 'mongodb';
import bycrypt from 'bcrypt';
import * as validate from './validation.js';

// import validation functions
// validateUser, handleId, etc.

// import api functions
// this is needed to attach lastfm user to user object
import * as lastfm from '../api/lastfm.js';


export async function checkUsernameAndEmail(username, email) {
  username = validate.validName(username);
  email = validate.validEmail(email);

  const userCollection = await users();
  const existingEmail = await userCollection.findOne({ email: email });
  if (existingEmail) throw "Email already exists";
  const existingUsername = await userCollection.findOne({ username: username });
  if (existingUsername) throw "Username already exists";
  return true;
}

// create user
export async function createUser(username, password, email) {
  // validateUser(username, password, email, pfp, lastfm);
  username = validate.validName(username);
  password = validate.validPassword(password);
  email = validate.validEmail(email);

  const userCollection = await users();

  // check if username or email already exists
  await checkUsernameAndEmail(username, email);

  //encrypt password
  const hash = await bycrypt.hash(password, 16);

  const pfp = 'https://source.unsplash.com/1600x900/?' + username;

  const newUser = {
    username: username,
    password: hash,
    // * Should I make these default to null in function def instead? also should it be empty string or null 
    email : email,
    pfp : pfp,
    lastfm: null,
    followers: [],
    following: [],
    notifications: [],
    likedPosts: [],
    createdPosts: [],
    createdAt: new Date(),
    // can be useful to have updatedAt to limit how often user can update their profile
    updatedAt: new Date()
  };
  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add user";  
  const newId = insertInfo.insertedId.toString();
  const user = await getUserById(newId);
  return user;
}

// get user by id
export async function getUserById(id) {
  // handleId(id);
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(id) });
  if (!user) throw "User not found";
  user._id = user._id.toString();
  return user;
}

// get user by username
export async function getUserByUsername(username) {
  username = validate.validName(username);
  const userCollection = await users();
  const user = await userCollection.findOne({ username: username });
  if (!user) throw "User not found";
  user._id = user._id.toString();
  return user;  
}

// get user by email
export async function getUserByEmail(email) {
  email = validate.validEmail(email);
  const userCollection = await users();
  const user = await userCollection.findOne({ email: email });
  if (!user) throw "User not found";
  user._id = user._id.toString();
  return user;
}
// get user by lastfm

// get all users
export async function getAllUsers() {
  const userCollection = await users();
  const allUsers = await userCollection.find({}).toArray();
  if (!allUsers) throw "No users found";
  allUsers.forEach(user => user._id = user._id.toString());
  return allUsers;
}

// remove user by id
export async function removeUserById(id) {
  // handleId(id);
  const userCollection = await users();
  const user = await getUserById(id);
  const deletionInfo = await userCollection.deleteOne({ _id: ObjectId(id) });
  if (!deletionInfo.acknowledged || deletionInfo.deletedCount === 0) throw `Could not delete user with id of ${id}`;
  return user;
}

// update user by id
export async function updateUserById(id, username, password, lastfmUsername) {
  // todo
  // handleId(id);
  
  // validateUser(updatedUser);
  const userCollection = await users();
  const user = await getUserById(id);
  const lastfmData = lastfmUsername ? await lastfm.getInfoByUser(lastfmUsername) : null;

  const hash = await bycrypt.hash(password, 16);

  const updatedUser = {
    username: username || user.username,
    password: hash || user.password,
    email: user.email,
    pfp: 'https://source.unsplash.com/1600x900/?' + username || user.pfp,
    lastfm: lastfmData || user.lastfm,
    followers: user.followers,
    following: user.following,
    notifications: user.notifications,
    likedPosts: user.likedPosts,
    createdPosts: user.createdPosts,
    createdAt: user.createdAt,
    updatedAt: new Date()
  };

  // there might be a better way to do this
  const updateInfo = await userCollection.findOneAndReplace(
    { _id: new ObjectId(id) }, 
    updatedUser,
    { returnDocument: 'after' }
    );
  if (!updateInfo) throw `Error: Update failed! Could not update user with id of ${id}`;
  return updateInfo;
}

export const loginUser = async (email, password) => {
  // validateUser(username, password);
  email = validate.validEmail(email);
  password = validate.validPassword(password); 

  const userCollection = await users();
  const user = await userCollection.findOne({ email: email });
  if (!user) throw "Incorrect Email or Password";
  const compare = await bycrypt.compare(password, user.password);
  if (!compare) throw "Incorrect Email or Password";
  user._id = user._id.toString();
  return user;
};

export const followUser = async (userId, profileId) => { //adds profile to user following list and adds user to profile's followers list
  // handleId(followerId); 
  // handleId(followingId);
  const userCollection = await users();
  const user = await getUserById(userId);
  const profile = await getUserById(profileId);
  if(user.following.includes(profileId)) throw "Already following user 1";
  if(profile.followers.includes(userId)) throw "Already following user 2";
  
  let addToFollowing = await userCollection.findOneAndUpdate( //pushes profile to user following list
    { _id: new ObjectId(userId) },
    { $push: { following: profileId } },
    { returnDocument: 'after' }
  );

  if (!addToFollowing) throw "Error: Update failed! Could not follow user 1";

  let addToFollowers = await userCollection.findOneAndUpdate( //pushes user to profile followers list
    { _id: new ObjectId(profileId) },
    { $push: { followers: userId } },
    { returnDocument: 'after' }
  );
  if (!addToFollowers) throw "Error: Update failed! Could not follow user 2";

  return addToFollowing;

}

export const unfollowUser = async (userId, profileId) => { //removes profile form user following list and removes user form profile's followers list
  // handleId(followerId);
  // handleId(followingId);
  const userCollection = await users();
  const user = await getUserById(userId);
  const profile = await getUserById(profileId);
  if (!user.following.includes(profileId)) throw "Not following user 1";
  if (!profile.followers.includes(userId)) throw "Not following user 2";

  let removeFromFollowing = await userCollection.findOneAndUpdate( //pulls profile from user following list
    { _id: new ObjectId(userId) },
    { $pull: { following: profileId } },
    { returnDocument: 'after' }
  );
  if (!removeFromFollowing) throw "Error: Update failed! Could not unfollow user 1";
    
  let removeFromFollowers = await userCollection.findOneAndUpdate( //pulls user from profile followers list
    { _id: new ObjectId(profileId) },
    { $pull: { followers: userId } },
    { returnDocument: 'after' }
  );
  if (!removeFromFollowers) throw "Error: Update failed! Could not unfollow user 2";

  return removeFromFollowing;

}