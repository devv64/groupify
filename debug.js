import * as search from './data/search.js';

export async function test() {
    // console.log(await search.searchUsername("John"));
    // console.log(await search.searchUsername("J"));
    // console.log(await search.searchUsername(""));

    console.log(await search.searchSongPosts("ian "));
    // console.log(await search.searchSongPosts("Bohemian Rhapsody"));
    // console.log(await search.searchSongPosts("Bohemian Rhapsody"));
    // console.log(await search.searchSongPosts("Bohemian Rhapsody"));
    // console.log(await search.searchSongPosts("Bohemian Rhapsody"));

}