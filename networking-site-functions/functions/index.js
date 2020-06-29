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

// Making sure authentication has been granted
const FBAuth = (req, res, next) => {
	let idToken;
	if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
		idToken = req.headers.authorization.split('Bearer ')[1];
	}
	else {
		return res.status(403).json({ error: 'Unauthorized'});
	}

	admin.auth().verifyIdToken(idToken)
		.then(decodedToken => {
			req.user = decodedToken;
			return db.collection('users')
				.where('userId', '==', req.user.uid)
				.limit(1)
				.get();
		})
		.then(data => {
			req.user.handle = data.docs[0].data().handle;
			return next(); // allows request to proceed
		})
		.catch(err => {
			console.error('Error while verifying token', err);
			return res.status(403).json(err);
		})
}

// Create post
app.post('/post', FBAuth, (req, res) => {
	const newPost = {
		body: req.body.body,
		user: req.user.handle,
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

// signup validation
const isEmpty = (string) => {
	if(string.trim() === '') return true;
	return false;
}

const isEmail = (email) => {
	// Regular expression that verifies for pattern of an email
	const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if(email.match(regEx)) return true;
	return false;
}

// Sign up route
app.post('/signup', (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
	};

	let errors = {};

	if(isEmpty(newUser.email)) {
		errors.email = 'Must not be empty';
	} else if(!isEmail(newUser.email)) {
		errors.email = 'Must be valid email address';
	}

	if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
	if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
	if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

	if(Object.keys(errors).length > 0) return res.status(400).json(errors);

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

// Login
app.post('/login', (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
	};

	let errors = {};

	if(isEmpty(user.email)) errors.email = 'Must not be empty';
	if(isEmpty(user.password)) errors.password = 'Must not be empty';
	
	if(Object.keys(errors).length > 0) return res.status(400).json(errors);

	// log user in
	firebase.auth().signInWithEmailAndPassword(user.email, user.password)
		.then(data => {
			return data.user.getIdToken();
		})
		.then(token => {
			return res.json({ token });
		})
		.catch(err => {
			console.error(err);
			if(err.code === 'auth/wrong-password') {
				return res.status(403).json({ general: "wrong credentials, please try again"});
			}
			return res.status(500).json({error: err.code});
		})

})

exports.api = functions.https.onRequest(app);