import { dbConnection, closeConnection } from './config/mongoConnection.js';
import * as userData from './data/users.js';
import * as postData from './data/posts.js';
import * as commentData from './data/comments.js';


try {
    // Drop the database
    const db = await dbConnection();
    await db.dropDatabase();
    console.log('Database dropped successfully!');
    
    console.log('Seeding database...gimme a sec...');
    // Create dummy users
    let user4 = await userData.createUser('Encirclement', "Password1!", 'johndoe@example.com');
    let user2 = await userData.createUser('Explosion', "Password1!", 'janesmith@example.com');
    let user3 = await userData.createUser('Marathon', "Password1!", 'mikejohnson@example.com');
    let user1 = await userData.createUser('Spelling', "Pass!234", 'd@ste.edu');
    user1._id = user1._id.toString();
    user2._id = user2._id.toString();
    user3._id = user3._id.toString();
    user4._id = user4._id.toString();
    user1 = await userData.updateUserById(user1._id, user1.username, 'Pass!234', 'devv64');
    user1._id = user1._id.toString();
    console.log('Dummy users created successfully!');

    const follow = await userData.followUser(user1._id, user2._id);
    const follow2 = await userData.followUser(user1._id, user3._id);
    const follow3 = await userData.followUser(user2._id, user1._id);

    // Create dummy posts
    const post1 = await postData.createPost('Bohemian Rhapsody is a rock opera', user1._id, 'Queen', 'Freddie Mercury');
    const post2 = await postData.createPost('Hotel California is about the dark side of the American dream', user1._id, 'Eagles', 'Don Henley');
    const post3 = await postData.createPost('Imagine is a peace anthem', user2._id, 'John Lennon', 'John Lennon');
    const post4 = await postData.createPost('Hey Jude is one of the Beatles\' longest songs', user2._id, 'The Beatles', 'Paul McCartney');
    const post5 = await postData.createPost('Bohemian Rhapsody has a complex vocal arrangement', user3._id, 'Queen', 'Freddie Mercury');
    const post6 = await postData.createPost('Hotel California is known for its iconic guitar solo', user3._id, 'Eagles', 'Don Felder');
    const post7 = await postData.createPost('Stairway to Heaven is often considered one of the greatest rock songs', user1._id, 'Led Zeppelin', 'Robert Plant');
    const post8 = await postData.createPost('Smells Like Teen Spirit is considered the anthem of Generation X', user1._id, 'Nirvana', 'Kurt Cobain');
    const post9 = await postData.createPost('Sweet Child o\' Mine features one of the most recognizable guitar riffs', user2._id, 'Guns N\' Roses', 'Slash');
    const post10 = await postData.createPost('Wonderwall is one of Oasis\' most popular songs', user2._id, 'Oasis', 'Noel Gallagher');
    const post11 = await postData.createPost('Back in Black is AC/DC\'s best-selling album', user3._id, 'AC/DC', 'Angus Young');
    const post12 = await postData.createPost('November Rain has one of the longest guitar solos in rock history', user3._id, 'Guns N\' Roses', 'Slash');
    const post13 = await postData.createPost('Like a Rolling Stone is considered one of Bob Dylan\'s greatest songs', user1._id, 'Bob Dylan', 'Bob Dylan');
    const post14 = await postData.createPost('Purple Haze is one of Jimi Hendrix\'s signature songs', user1._id, 'Jimi Hendrix', 'Jimi Hendrix');
    const post15 = await postData.createPost('Bohemian Rhapsody is a timeless masterpiece', user1._id, 'Queen', 'Freddie Mercury');
    const post16 = await postData.createPost('Hotel California is a classic rock anthem', user2._id, 'Eagles', 'Don Henley');
    const post17 = await postData.createPost('Imagine is a song that inspires hope', user3._id, 'John Lennon', 'John Lennon');
    const post18 = await postData.createPost('Hey Jude is a beloved Beatles hit', user4._id, 'The Beatles', 'Paul McCartney');
    const post19 = await postData.createPost('Stairway to Heaven is an epic rock ballad', user1._id, 'Led Zeppelin', 'Robert Plant');
    const post20 = await postData.createPost('Smells Like Teen Spirit is a grunge anthem', user2._id, 'Nirvana', 'Kurt Cobain');

    console.log('Dummy posts created successfully!');
    
    const like = await postData.addLikeToPost(post1._id, user1._id);
    const like2 = await postData.addLikeToPost(post1._id, user2._id);
    const like3 = await postData.addLikeToPost(post1._id, user3._id);
    const like4 = await postData.addLikeToPost(post2._id, user1._id);
    const like5 = await postData.addLikeToPost(post2._id, user2._id);
    const like6 = await postData.addLikeToPost(post2._id, user3._id);
    const like7 = await postData.addLikeToPost(post3._id, user1._id);
    const like8 = await postData.addLikeToPost(post3._id, user2._id);

    console.log('Dummy likes created successfully!');

    const comment = await commentData.createComment(post1._id, user1.username, "COMMENT1")
    const comment2 = await commentData.createComment(post1._id, user2.username, "COMMENT2")
    const comment3 = await commentData.createComment(post1._id, user3.username, "COMMENT3")
    const comment4 = await commentData.createComment(post2._id, user1.username, "COMMENT4")
    const comment5 = await commentData.createComment(post2._id, user2.username, "COMMENT5")


    console.log('Dummy posts created successfully!');
    console.log('Done Seeding the Database!');
} catch (error) {
    console.error('Error creating dummy users or posts:', error);
}
    
await closeConnection();