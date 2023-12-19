import { ObjectId } from "mongodb";
import {posts, comments, users} from '../config/mongoCollections.js';
import { validId, validUsername } from "./validation.js";

import * as userData from './users.js';

//Returns post with new comment ID added to comments array
export const createComment = async (postId, username, commentBody) => {
    
    postId = validId(postId);

    if(!commentBody || !(typeof commentBody === "string") || commentBody.trim().length === 0) throw  "Comment cannot be empty or all spaces";    
    
    const commentsCollection = await comments();
    const postCollection = await posts();

    let newComment = {
        _id : new ObjectId(),
        username : username,
        postId : postId,
        body : commentBody,
        dateCreated : new Date()
    }
    const insertComment = await commentsCollection.insertOne(newComment);
    if (!insertComment.acknowledged || !insertComment.insertedId) throw  "Could not add new comment";
   
    const newCommentId = insertComment.insertedId.toString();
    const comment = await getCommentById(newCommentId);

    const updatedPost = await postCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $addToSet: { comments: newCommentId } }
    );
    if (!updatedPost.acknowledged || updatedPost.modifiedCount === 0) throw  "Could not add comment to post";

    const post = await getPostById(postId);

    await userData.addNotification(post.userId, `${username} commented on your post: "${post.body}" at ${new Date().toLocaleString()}`, postId);

    return comment;
};

//Gets comment by comment Id
export const getCommentById = async (commentId) => {

    commentId = validId(commentId);
    const commentsCollection = await comments();

    const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    if (comment === null) throw "Comment not found";
    comment._id = comment._id.toString();
    return comment;

};

//Get all comments for a post
//Returns array of comment objs
export const getAllCommentsByPostId = async (postId) => {
    postId = validId(postId);
    
    const commentsCollection = await comments();

    let commentList = await commentsCollection
        .find({ postId: postId })
        .toArray();

    if (!commentList) throw "Could not get all comments";
    
    commentList.forEach(comment => {
        comment._id = comment._id.toString();
    });
    return commentList;
} 

//Deletes comment from comment Collection and removes commentId from respective post.comments
//Returns updated post
export const removeComment = async (commentId) =>{
    commentId = validId(commentId);

    const commentsCollection = await comments();
    const postCollection = await posts();

    const comment = await getCommentById(commentId);

    //Delete comment from the Comments Collection
    const deletionInfo = await commentsCollection.findOneAndDelete({ _id: new ObjectId(commentId) });
    if(!deletionInfo) throw `Could not delete comment with id of ${commentId}`;

    //Removes comment from it's post collection
    const updatedPost = await postCollection.updateOne(
        { _id: new ObjectId(comment.postId) },
        { $pull: { comments: commentId } }
    );
    if (!updatedPost.acknowledged || updatedPost.modifiedCount === 0) throw  "Could not remove comment from post";

    return updatedPost;
};

export const getCommentByUsername = async (username) => {
    username = validUsername(username);
    const commentsCollection = await comments();
    const commentList = await commentsCollection.find({
        username: username
    }).toArray();
    if (!commentList) throw "Could not get all comments";
    commentList.forEach(comment => {
        comment._id = comment._id.toString();
    });
    return commentList;
}