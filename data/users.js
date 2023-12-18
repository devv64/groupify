import { users, posts, comments } from '../config/mongoCollections.js';
import { ObjectId, ReturnDocument } from 'mongodb';
import bcrypt from 'bcrypt';
import * as validate from './validation.js';
import axios from 'axios';
import * as lastfm from '../api/lastfm.js';

export async function checkUsername(username) {
  username = validate.validName(username);

  const userCollection = await users();
  const existingUsername = await userCollection.findOne({ username: username });
  if (existingUsername) throw "Username already exists";
  return true;
}

export async function checkEmail(email) {
  email = validate.validEmail(email);

  const userCollection = await users();
  const existingEmail = await userCollection.findOne({ email: email });
  if (existingEmail) throw "Email already exists";
  return true;
}

// create user
export async function createUser(username, password, email) {
  username = validate.validName(username);
  password = validate.validPassword(password);
  email = validate.validEmail(email);

  const userCollection = await users();

  // check if username or email already exists
  await checkUsername(username);
  await checkEmail(email);

  //encrypt password
  const hash = await bcrypt.hash(password, 4); //remember to change to back to 16 or 12 for all bcrypts

  let pfp = 'https://source.unsplash.com/1600x900/?' + username;

  await axios.head(pfp)
    .then(response => {
      if (response.request.res.responseUrl === 'https://images.unsplash.com/source-404?fit=crop&fm=jpg&h=800&q=60&w=1200') {
        pfp = 'https://source.unsplash.com/1600x900/?'
      }
    })
    .catch(error => {
      console.error('Error fetching:', error);
    });

  const newUser = {
    username: username,
    password: hash,
    email : email,
    pfp : pfp,
    lastfm: null,
    followers: [],
    following: [],
    notifications: [],
    likedPosts: [],
    createdPosts: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) throw "Could not add user";  
  const newId = insertInfo.insertedId.toString();
  const user = await getUserById(newId);
  if (!user) throw "User not found";
  return user;
}

// get user by id
export async function getUserById(id) {
  id = validate.validId(id);
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
  id = validate.validId(id);
  const userCollection = await users();
  const user = await getUserById(id);
  if (!user) throw `Could not find user with id of ${id}`;
  const deletionInfo = await userCollection.deleteOne({ _id: ObjectId(id) });
  if (!deletionInfo.acknowledged || deletionInfo.deletedCount === 0) throw `Could not delete user with id of ${id}`;
  return user;
}

// update user by id
export async function updateUserById(id, username, password, lastfmUsername) {

  id = validate.validId(id);
  username = validate.validEditedUsername(username);
  password = validate.validEditedPassword(password);
  lastfmUsername = validate.validFmString(lastfmUsername);

  const userCollection = await users();
  const user = await getUserById(id);
  if (!user) throw `Could not find user with id of ${id}`;
  const lastfmData = lastfmUsername ? await lastfm.getInfoByUser(lastfmUsername) : null;
  let hash = (password == null) ? null : await bcrypt.hash(password, 4);

  if (username != user.username) {
    await checkUsername(username);
  }

  let pfp = 'https://source.unsplash.com/1600x900/?' + username;

  await axios.head(pfp)
    .then(response => {
      if (response.request.res.responseUrl === 'https://images.unsplash.com/source-404?fit=crop&fm=jpg&h=800&q=60&w=1200') {
        pfp = 'https://source.unsplash.com/1600x900/?'
      }
    })
    .catch(error => {
      console.error('Error fetching:', error);
    });

  const updatedUser = {
    username: username || user.username,
    password: hash || user.password,
    email: user.email,
    pfp: pfp || user.pfp,
    lastfm: lastfmData || user.lastfm,
    followers: user.followers,
    following: user.following,
    notifications: user.notifications,
    likedPosts: user.likedPosts,
    createdPosts: user.createdPosts,
    createdAt: user.createdAt,
    updatedAt: new Date()
  };
  const oldUsername = user.username;
  const updateInfo = await userCollection.findOneAndReplace(
    { _id: new ObjectId(id) }, 
    updatedUser,
    { returnDocument: 'after' }
    );
  if (!updateInfo) throw `Error: Update failed! Could not update user with id of ${id}`;

  const postCollection = await posts();
  for (let i = 0; i < user.createdPosts.length; i++) {
    const post = await postCollection.findOneAndUpdate(
      { _id: new ObjectId(user.createdPosts[i])}, 
      { $set: { username: updatedUser.username}},
      { returnDocument: 'after' }
    );
    if (!post) throw `Error: Update failed! Could not update post with id of ${user.createdPosts[i]}`;
  };

  const commentCollection = await comments();
    const comment = await commentCollection.updateMany(
      { username: oldUsername}, 
      { $set: { username: updatedUser.username}},
    );
    if (!comment) throw `Error: Update failed! Could not update comment`;

  return updateInfo;
}

export const loginUser = async (email, password) => {
  email = validate.validEmail(email);
  password = validate.validPassword(password); 

  const userCollection = await users();
  const user = await userCollection.findOne({ email: email });
  if (!user) throw "Incorrect Email or Password";
  const compare = await bcrypt.compare(password, user.password);
  if (!compare) throw "Incorrect Email or Password";
  user._id = user._id.toString();
  return user;
};

export const followUser = async (userId, profileId) => { //adds profile to user following list and adds user to profile's followers list
  userId = validate.validId(userId);
  profileId = validate.validId(profileId);
  const userCollection = await users();
  const user = await getUserById(userId);
  if (!user) throw "User not found";
  const profile = await getUserById(profileId);
  if (!profile) throw "Profile not found";
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

  return addToFollowers;

}

export const unfollowUser = async (userId, profileId) => { //removes profile form user following list and removes user form profile's followers list
  userId = validate.validId(userId);
  profileId = validate.validId(profileId);
  const userCollection = await users();
  const user = await getUserById(userId);
  if (!user) throw "User not found";
  const profile = await getUserById(profileId);
  if (!profile) throw "Profile not found";
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

  return removeFromFollowers;

}

export const addNotification = async (profileId, notification) => {
  // handleId(userId);
  profileId = validate.validId(profileId);
  notification = validate.validString(notification);
  const userCollection = await users();

  let newNotification = {
    _id: new ObjectId().toString(),
    notification: notification,
    dateCreated: new Date()
  }
  
  const insertNotification = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(profileId) },
    { $push: { notifications: newNotification } },
    { returnDocument: 'after' }
  );
  if (!insertNotification) throw "Error: Update failed! Could not add notification";
  return insertNotification;
}