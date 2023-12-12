import { ObjectId } from "mongodb";
import {posts, comments, users} from '../config/mongoCollections';
import {getPostById} from "./posts.js";
import { validId } from "./validation.js";


//Returns post with new comment ID added to comments array
export const createComment = async (postId, userId, commentBody) => {
    
    postId = validId(postId);
    userId = validId(userId);
    if(!commentBody || !(typeof commentBody === "string") || commentBody.trim().length === 0) throw {status: 400, errMsg: "Comment cannot be empty or all spaces"};
    // if(!dateCreated || !(typeof dateCreated === "string")) throw {status: 400, errMsg: "Comment creation date must be provided"}

    
    const commentsCollection = await comments();
    const userCollection = await users();
    const postCollection = await posts();


    //Get User for userid
    const commenter = await userCollection.findOne({ _id: new ObjectId(userId) });

    //Check if userId of commenter exists
    if(commenter === null) throw {status: 404, errMsg:`No user with id ${userId}`};

    let newComment = {
        _id : new ObjectId(),
        userId : userId,
        postId : postId,
        body : commentBody,
        // Date Format: Fri Dec 08 2023 12:07:55 GMT-0500 (Eastern Standard Time)
        dateCreated : new Date()
    }

    const insertComment = await commentsCollection.insertOne(newComment);
    if (!insertComment.acknowledged || !insertComment.insertedId) throw {status:400, errMsg: "Could not add new comment"};
   
    const newCommentId = insertComment.insertedId.toString();
    const comment = await getCommentById(newCommentId);
    // return comment;
    
    const updatedPost = await postCollection.updateOne(
        { _id: ObjectId(postId) },
        { $addToSet: { comments: newCommentId } }
    );
    if (!updatedPost.acknowledged || updatedPost.modifiedCount === 0) throw {status:400, errMsg: "Could not add comment to post"};

    return await getPostById(postId);
};

//Gets comment by comment Id
export const getCommentById = async (commentId) => {

    commentId = validId(commentId);
    const commentsCollection = await comments();

    const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    if (comment === null) throw {status:404, errMsg:"Comment not found"};
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
        // .project({ _id: 1, body: 1, dateCreated:1 })
        .toArray();

    if (!commentList) throw {status:404, errMsg:"Could not get all events"};
    
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
    if(!deletionInfo) throw {status: 400, errMsg:`Could not delete comment with id of ${commentId}`};

    //Removes comment from it's post collection
    const updatedPost = await postCollection.updateOne(
        { _id: ObjectId(comment.postId) },
        { $pull: { comments: commentId } }
    );
    if (!updatedPost.acknowledged || updatedPost.modifiedCount === 0) throw {status:400, errMsg: "Could not remove comment from post"};

    return updatedPost;
};

