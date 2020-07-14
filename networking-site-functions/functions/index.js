const functions = require('firebase-functions');

const express = require('express');
const app = express();

const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin');

const { getAllPosts, createPost, getPost, commentOnPost, likePost, unlikePost, deletePost } = require('./handlers/posts');
const { signup, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead } = require('./handlers/users');

// Post routes
app.get('/posts', getAllPosts);
app.post('/post', FBAuth, createPost);
app.get('/post/:postID', getPost);
app.delete('/post/:postID/', FBAuth, deletePost)
app.get('/post/:postID/like', FBAuth, likePost);	
app.get('/post/:postID/unlike', FBAuth, unlikePost);
app.post('/post/:postID/comment', FBAuth, commentOnPost);

// Users routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth ,uploadImage)
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead)

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore.document('likes/{id}')
	.onCreate((snapshot) => {
		return db.doc(`/posts/${snapshot.data().postId}`).get()
			.then(doc => {
				if(doc.exists) {
					return db.doc(`/notifications/${snapshot.id}`).set({
						createdAt: new Date().toISOString(),
						recipient: doc.data().userHandle,
						sender: snapshot.data().userHandle,
						type: 'like',
						read: false,
						postId: doc.id
					});
				}
			})
			.then(() => {
				return;
			})
			.catch(err => {
				console.error(err);
				return;
			})
	});

	exports.deleteNotificationOnUnLike = functions.firestore.document('likes/{id}')
		.onDelete((snapshot) => {
			return db.doc(`/notifications/${snapshot.id}`)
				.delete()
				.then(() => {
					return;
				})
				.catch(err => {
					console.error(err);
					return;
				})
	});

	exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
		.onCreate((snapshot) => {
			return db.doc(`/posts/${snapshot.data().postId}`).get()
			.then(doc => {
				if(doc.exists) {
					return db.doc(`/notifications/${snapshot.id}`).set({
						createdAt: new Date().toISOString(),
						recipient: doc.data().userHandle,
						sender: snapshot.data().userHandle,
						type: 'comment',
						read: false,
						postId: doc.id
					});
				}
			})
			.then(() => {
				return;
			})
			.catch(err => {
				console.error(err);
				return;
			})
	});