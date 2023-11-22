import axios from 'axios';
import 'dotenv/config.js'

const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY;
const base = 'https://ws.audioscrobbler.com';

const urlGen = (query) => {
  return base + query + '&api_key=' + LAST_FM_API_KEY + '&format=json'; 
}


// Artist Functions

/**
  * Returns lists of artists based on relevance to name.
  * @param {String} name    Artist name.
  * @param {Number} results Number of fetch results.
  * @return {String[]}      Artists relevant to input name.
  */
export const searchArtistByName = async (name, results) => {
  // name = validateString(name) // ! maybe
  const queryUrl = '/2.0/?method=artist.search&artist=' + name + '&limit=' + results;
  const url = urlGen(queryUrl);
  console.log(`searchArtistByName: ${name} -`, url)

  const { data } = await axios.get(url);
  // ? what do we want to return here, this is probably for search bar
  return data.results.artistmatches.artist;
}


// Track Functions

/**
  * Returns lists of tracks based on relevance to name.
  * @param {String} name    Track name.
  * @param {Number} results Number of fetch results.
  * @return {String[]}      Tracks relevant to input name.
  */
export const searchTrackByName = async (name, results) => {
 // name = validateString(name) // ! maybe
  const queryUrl = '/2.0/?method=track.search&track=' + name + '&limit=' + results;
  const url = urlGen(queryUrl);
  console.log(`searchTrackByName: ${name} -`, url);

  const { data } = await axios.get(url);
  console.log(data.results.trackmatches.track);
  // ? what do we want to return here, this is probably for search bar
  return data.results.trackmatches.track
}



// User Functions

/**
  * Returns information about a user profile.
  * @param {String} name User name.
  * @return {UserInfo}   Information relevant to input name.
  */
export const getInfoByUser = async (name) => {
  const queryUrl = '/2.0/?method=user.getinfo&user=' + name;
  const url = urlGen(queryUrl);
  console.log(`getInfoByUser: ${name} -`, url);

  const { data } = await axios.get(url);
  console.log(data.user)
  // ? what do we want to return here, maybe useful for profile page data
  return data.user;
}


