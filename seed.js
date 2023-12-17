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
    const user4 = await createUser('David', "Pass!234", 'd@ste.edu')
    console.log('Dummy users created successfully!');

    // Create dummy posts
    const post1 = await createPost('Bohemian Rhapsody is a rock opera', user1._id, 'Queen', 'Freddie Mercury');
    const post2 = await createPost('Hotel California is about the dark side of the American dream', user1._id, 'Eagles', 'Don Henley');
    const post3 = await createPost('Imagine is a peace anthem', user2._id, 'John Lennon', 'John Lennon');
    const post4 = await createPost('Hey Jude is one of the Beatles\' longest songs', user2._id, 'The Beatles', 'Paul McCartney');
    const post5 = await createPost('Bohemian Rhapsody has a complex vocal arrangement', user3._id, 'Queen', 'Freddie Mercury');
    const post6 = await createPost('Hotel California is known for its iconic guitar solo', user3._id, 'Eagles', 'Don Felder');
    const post7 = await createPost('Stairway to Heaven is often considered one of the greatest rock songs', user1._id, 'Led Zeppelin', 'Robert Plant');
    const post8 = await createPost('Smells Like Teen Spirit is considered the anthem of Generation X', user1._id, 'Nirvana', 'Kurt Cobain');
    const post9 = await createPost('Sweet Child o\' Mine features one of the most recognizable guitar riffs', user2._id, 'Guns N\' Roses', 'Slash');
    const post10 = await createPost('Wonderwall is one of Oasis\' most popular songs', user2._id, 'Oasis', 'Noel Gallagher');
    const post11 = await createPost('Back in Black is AC/DC\'s best-selling album', user3._id, 'AC/DC', 'Angus Young');
    const post12 = await createPost('November Rain has one of the longest guitar solos in rock history', user3._id, 'Guns N\' Roses', 'Slash');
    const post13 = await createPost('Like a Rolling Stone is considered one of Bob Dylan\'s greatest songs', user1._id, 'Bob Dylan', 'Bob Dylan');
    const post14 = await createPost('Purple Haze is one of Jimi Hendrix\'s signature songs', user1._id, 'Jimi Hendrix', 'Jimi Hendrix');
    const post15 = await createPost('Smells Like Teen Spirit is considered the anthem of Generation X', user2._id, 'Nirvana', 'Kurt Cobain');
    const post16 = await createPost('Bohemian Rhapsody has a complex vocal arrangement', user2._id, 'Queen', 'Freddie Mercury');
    const post17 = await createPost('Hotel California is known for its iconic guitar solo', user4._id, 'Eagles', 'Don Felder');
    const post18 = await createPost('Imagine is a peace anthem', user3._id, 'John Lennon', 'John Lennon');
    const post19 = await createPost('Hey Jude is one of the Beatles\' longest songs', user1._id, 'The Beatles', 'Paul McCartney');
    const post20 = await createPost('Bohemian Rhapsody has a complex vocal arrangement', user4._id, 'Queen', 'Freddie Mercury');

    console.log('Dummy posts created successfully!');
    console.log('Done Seeding the Database!');
} catch (error) {
    console.error('Error creating dummy users or posts:', error);
}
    
await closeConnection();