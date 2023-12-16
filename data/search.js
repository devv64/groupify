import { posts, users } from '../config/mongoCollections.js';
import * as validate from './validation.js';

//returns profile of user with given username
export async function searchUsername(username) {
    username = validate.validsearch(username);

    const userCollection = await users();
    const similarUsers = await userCollection.find({ username: new RegExp(username, 'i') }).toArray();
    if (!similarUsers) return ["No Users Found"];
    return similarUsers;
}


//return posts related to given song name
export async function searchSongPosts(songName) {
    songName = validate.validsearch(songName);

    const postCollection = await posts();
    const songposts = await postCollection.find({ track: new RegExp(songName, 'i') }).toArray();
    if (!songposts) return ["No Posts Found"];
    return songposts;
}

//return posts related to given artist name
export async function searchArtistPosts(artistName) {
    artistName = validate.validsearch(artistName);
    
    const postCollection = await posts();
    const artistposts = await postCollection.find({ artist: new RegExp(artistName, 'i') }).toArray();
    if (!artistposts) return ["No Posts Found"];
    return artistposts;
}