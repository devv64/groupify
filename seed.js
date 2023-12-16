
import { createUser } from './data/users.js';
import { createPost } from './data/posts.js';

try {
// Create dummy users
const user1 = await createUser('JohnDoe', "Password1!", 'johndoe@example.com');
const user2 = await createUser('JaneSmith', "Password1!", 'janesmith@example.com');
const user3 = await createUser('MikeJohnson', "Password1!", 'mikejohnson@example.com');

// Create dummy posts
const post1 = await createPost('First Post', user1._id);
const post2 = await createPost('Second Post', user2._id);
const post3 = await createPost('Third Post', user3._id);

console.log('Dummy users and posts created successfully!');
} catch (error) {
console.error('Error creating dummy users and posts:', error);
}