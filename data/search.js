import { posts, users } from '../config/mongoCollections.js';
import * as validate from './validation.js';

//the idea of validations is just to check if its a string and its alphanumeric
//this is because the user can search for anything since
//there is so much variety in song names

//returns profile of user with given username
export async function searchUsername(username) {
    username = validate.validsearch(username);

    const userCollection = await users();
    const similarUsers = await userCollection.find({ username: new RegExp(username, 'i') }).toArray();
    return similarUsers;
}


//return posts related to given song name
export async function searchSongPosts(songName) {
    songName = validate.validsearch(songName);

    const postCollection = await posts();
    const songposts = await postCollection.find({ 'track.name' : new RegExp(songName, 'i') }).toArray();
    return songposts;
}

//return posts related to given artist name
export async function searchArtistPosts(artistName) {
    artistName = validate.validsearch(artistName);
    
    const postCollection = await posts();
    const artistposts = await postCollection.find({ 'artist.name' : new RegExp(artistName, 'i') }).toArray();
    return artistposts;
}