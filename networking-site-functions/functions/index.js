const functions = require('firebase-functions');

const express = require('express');
const app = express();

const FBAuth = require('./util/fbAuth');

const { getAllPosts, createPost, getPost, commentOnPost } = require('./handlers/posts');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users');

// Post routes
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, createPost);
app.get('/post/:postID', getPost);
// TODO: Delete post
// TODO: Like a post	
// TODO: Unike a post	
app.post('/post/:postID/comment', FBAuth, commentOnPost);

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth ,uploadImage)
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);