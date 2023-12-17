import { dbConnection, closeConnection } from './config/mongoConnection.js';
import { createUser } from './data/users.js';
import { createPost } from './data/posts.js';


try {
    // Drop the database
    const db = await dbConnection();
    await db.dropDatabase();
    console.log('Database dropped successfully!');
    
    console.log('Seeding database...gimme a sec...');
    // Create dummy users
    const user1 = await createUser('JohnDoe', "Password1!", 'johndoe@example.com');
    const user2 = await createUser('JaneSmith', "Password1!", 'janesmith@example.com');
    const user3 = await createUser('MikeJohnson', "Password1!", 'mikejohnson@example.com');
    console.log('Dummy users created successfully!');

    // Create dummy posts
    const post1 = await createPost('First Post', user1._id, 'Bohemian Rhapsody', 'Queen');
    const post2 = await createPost('Second Post', user1._id, 'Hotel California', 'Eagles');
    const post3 = await createPost('Third Post', user2._id, 'Imagine', 'John Lennon');
    const post4 = await createPost('Fourth Post', user2._id, 'Hey Jude', 'The Beatles');
    const post5 = await createPost('Fifth Post', user3._id, 'Bohemian Rhapsody', 'Queen');
    const post6 = await createPost('Sixth Post', user3._id, 'Hotel California', 'Eagles');
    const post7 = await createPost('Seventh Post', user1._id, 'Stairway to Heaven', 'Led Zeppelin');
    const post8 = await createPost('Eighth Post', user1._id, 'Smells Like Teen Spirit', 'Nirvana');
    const post9 = await createPost('Ninth Post', user2._id, 'Sweet Child o\' Mine', 'Guns N\' Roses');
    const post10 = await createPost('Tenth Post', user2._id, 'Wonderwall', 'Oasis');
    const post11 = await createPost('Eleventh Post', user3._id, 'Back in Black', 'AC/DC');
    const post12 = await createPost('Twelfth Post', user3._id, 'November Rain', 'Guns N\' Roses');
    const post13 = await createPost('Thirteenth Post', user1._id, 'Like a Rolling Stone', 'Bob Dylan');
    const post14 = await createPost('Fourteenth Post', user1._id, 'Purple Haze', 'Jimi Hendrix');
    const post15 = await createPost('Fifteenth Post', user2._id, 'Smells Like Teen Spirit', 'Nirvana');
    const post16 = await createPost('Sixteenth Post', user2._id, 'Bohemian Rhapsody', 'Queen');
    const post17 = await createPost('Seventeenth Post', user3._id, 'Hotel California', 'Eagles');
    const post18 = await createPost('Eighteenth Post', user3._id, 'Imagine', 'John Lennon');
    const post19 = await createPost('Nineteenth Post', user1._id, 'Hey Jude', 'The Beatles');
    const post20 = await createPost('Twentieth Post', user1._id, 'Bohemian Rhapsody', 'Queen');

    console.log('Dummy posts created successfully!');
    console.log('Done Seeding the Database!');
} catch (error) {
    console.error('Error creating dummy users or posts:', error);
}
    
await closeConnection();