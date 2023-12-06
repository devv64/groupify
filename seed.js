
import usersData from './data/users.js';
import postsData from './data/posts.js';


try {
// Create dummy users
const user1 = await usersData.create('John Doe', 'johndoe@example.com');
const user2 = await usersData.create('Jane Smith', 'janesmith@example.com');
const user3 = await usersData.create('Mike Johnson', 'mikejohnson@example.com');

// Create dummy posts
const post1 = await postsData.create('First Post', 'idk random first post', user1._id);
const post2 = await postsData.create('Second Post', 'second post whatever', user2._id);
const post3 = await postsData.create('Third Post', 'random third post', user3._id);

console.log('Dummy users and posts created successfully!');
} catch (error) {
console.error('Error creating dummy users and posts:', error);
}