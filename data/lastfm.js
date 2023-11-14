import axios from 'axios';
import 'dotenv/config.js'

const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY;
const base = 'https://ws.audioscrobbler.com';

const urlGen = (query) => {
  return base + query + '&api_key=' + LAST_FM_API_KEY + '&format=json'; 
}

export const searchArtistByName = async (name, results) => {
  // name = validateString(name) // ! maybe
  const queryUrl = '/2.0/?method=artist.search&artist=' + name + '&limit=' + results;
  const url = urlGen(queryUrl);
  console.log(`searchArtistByName: ${name} -`, url)

  const { data } = await axios.get(url);
  // ? what do we want to return here, this is probably for search bar
  return data.results.artistmatches.artist;
}
