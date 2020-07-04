const { db, admin } = require('../util/admin');

const firebaseConfig = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const { validateSignUpData, validateLoginData, reduceUserDetails } = require('../util/validators');

exports.signup = (req, res) => {
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		handle: req.body.handle
    };

	const { valid, errors } = validateSignUpData(newUser);

    if(!valid) return res.status(400).json(errors);

    // Assign mystery man image
    const noImg = 'no-img.png';

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
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
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

// adding user details such as bio, website or location
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'Details added successfully'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
};

// Get own user details
exports.getAuthenticatedUser = (req, res) => {
    let userData = {};

    db.doc(`/users/${req.user.handle}`).get()
        .then(doc => {
            if(doc.exists) {
                userData.credentials = doc.data();
                // TODO implement number of likes
                return db.collection('likes').where('userHandle', '==', req.user.handle).get()
            }
        })
        .then(data => {
            userData.likes = [];
            data.forEach(doc => {
                userData.likes.push(doc.data());
            });
            return res.json(userData);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
};

exports.uploadImage = (req, res) => {
    // Package used for File uploading
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({ headers: req.headers });

    let imageFileName;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong file type submitted' });
        }
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random() * 100000000000)}.${imageExtension}`; // large number + extension
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };

        // Use file system library to create file
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
           resumable: false,
           metadata: {
               metadata: {
                   contentType: imageToBeUploaded.mimetype
               }
           } 
        })
        .then(() => {
            // alt=media displays image on the browser 
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`
            return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
        })
        .then(() => {
            return res.json({ message: "Image uploaded successfully"});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
    });

    busboy.end(req.rawBody);
}