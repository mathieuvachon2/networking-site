const functions = require('firebase-functions');

const express = require('express');
const app = express();

const FBAuth = require('./util/fbAuth');

const { getAllPosts, createPost } = require('./handlers/posts');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users');

// Post routes
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, createPost);

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth ,uploadImage)
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);