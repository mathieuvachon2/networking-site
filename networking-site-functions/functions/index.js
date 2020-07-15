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
				if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
			.catch(err => {
				console.error(err);
				return;
			})
	});

	exports.deleteNotificationOnUnLike = functions.firestore.document('likes/{id}')
		.onDelete((snapshot) => {
			return db.doc(`/notifications/${snapshot.id}`)
				.delete()
				.catch(err => {
					console.error(err);
					return;
				})
	});

	exports.createNotificationOnComment = functions.firestore.document('comments/{id}')
		.onCreate((snapshot) => {
			return db.doc(`/posts/${snapshot.data().postId}`).get()
			.then(doc => {
				if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
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
			.catch(err => {
				console.error(err);
				return;
			})
	});

	// If user Image is modified, make sure to update it on all posts
	exports.onUserImageChange = functions.firestore.document('/users/{userId}')
		.onUpdate((change) => {
			if(change.before.data().imageUrl !== change.after.data().imageUrl) {
				const batch = db.batch();
				return db.collection('posts').where('userHandle', '==', change.before.data().handle).get()
					.then(data => {
						data.forEach(doc => {
							const post = db.doc(`posts/${doc.id}`);
							batch.update(post, { userImage: change.after.data().imageUrl });
						})
						return batch.commit();
					})
			} else return true;
	});

	// On delete of a post, make sure to remove related notifications, likes and comments
	exports.onPostDelete = functions.firestore.document('/posts/{postID}')
		.onDelete((snapshot, context) => { // need context as it has parameters in URL
			const postId = context.params.postID;
			const batch = db.batch();
			return db.collection('comments').where('postId', '==', postId).get()
				.then(data => {
					data.forEach(doc => {
						batch.delete(db.doc(`comments/${doc.id}`));
					});
					return db.collection('likes').where('postId', '==', postId).get()
						.then(data => {
							data.forEach(doc => {
								batch.delete(db.doc(`posts/${doc.id}`));
							});
							return db.collection('notifications').where('postId', '==', postId).get()
								.then(data => {
									data.forEach(doc => {
										batch.delete(db.doc(`notifications/${doc.id}`));
									});
									return batch.commit();
								})
						})
				})
				.catch(err => console.error(err));
		})