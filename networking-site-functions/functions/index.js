const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

// Firebase config
var firebaseConfig = {
	apiKey: "AIzaSyBTjj8-g78qLE_xpsMkpQpgHl5Csr1Vr9g",
	authDomain: "socialmediaapp-c10ad.firebaseapp.com",
	databaseURL: "https://socialmediaapp-c10ad.firebaseio.com",
	projectId: "socialmediaapp-c10ad",
	storageBucket: "socialmediaapp-c10ad.appspot.com",
	messagingSenderId: "1094213758494",
	appId: "1:1094213758494:web:4a460cac0ccb938fc2080f",
	measurementId: "G-PXZNCQP5NH"
};
// Set up authentication
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// Get all posts
app.get('/posts', (req, res) => {
	db.collection('posts')
	.orderBy('createdAt', 'desc')
	.get()
		.then(data => {
			let posts = [];
			data.forEach(doc => {
				posts.push({
					postID: doc.id,
					body: doc.data().body,
					userHandle: doc.data().userHandle,
					createdAt: doc.data().createdAt
				});
			});
			return res.json(posts)
		})
		.catch(err => console.error(err));
});

// Create post
app.post('/post', (req, res) => {
	const newPost = {
		body: req.body.body,
		user: req.body.userHandle,
		createdAt: new Date().toISOString()
	};

	db.collection('posts').add(newPost)
		.then(doc => {
			res.json({message: `document ${doc.id} created successfully`});
		})
		.catch(err => {
			res.status(500).json({error: 'something went wrong'});
			console.error(err);
		})
});

// Sign up route
app.post('/signup', (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};

	// Validate user
	let token, userId;
	db.doc(`/users/${newUser.handle}`).get()
		.then(doc => {
			if(doc.exists) return res.status(400).json({ handle: 'this handle is already taken'});
			else return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
		})
		.then(data => {
			userId = data.user.uid;	
			return data.user.getIdToken()
		})
		.then(idToken => {
			token = idToken;
			// Create user document
			const userCredentials = {
				handle: newUser.handle,
				email: newUser.email,
				createdAt: new Date().toISOString(),
				userId
			};
			return db.doc(`/users/${newUser.handle}`).set(userCredentials);
		})
		.then(() => {
			return res.status(201).json({ token });
		})
		.catch(err => {
			console.error(err);
			if(err.code === 'auth/email-already-in-use') {
				return res.status(400).json({ email: 'this email is already in use'});
			}
			return res.status(500).json({ error: err.code});
		})
})

exports.api = functions.https.onRequest(app);