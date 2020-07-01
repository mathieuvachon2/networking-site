const { db } = require('../util/admin');

const firebaseConfig = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const { validateSignUpData, validateLoginData } = require('../util/validators');

exports.signup = (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
    };

	const { valid, errors } = validateSignUpData(newUser);

    if(!valid) return res.status(400).json(errors);

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
}

exports.login = (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
	};

    const { valid, errors } = validateLoginData(user);

    if(!valid) return res.status(400).json(errors);

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

}