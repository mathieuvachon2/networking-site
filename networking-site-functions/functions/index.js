const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.getScreams = functions.https.onRequest((req, res) => {
	admin.firestore().collection('posts').get()
		.then(data => {
			let posts = [];
			data.forEach(doc => {
				posts.push(doc.data());
			});
			return res.json(posts)
		})
		.catch(err => console.error(err));
})

exports.newPost = functions.https.onRequest((req, res) => {
	const newPost = {
		body: req.body.body,
		user: req.body.userHandle,
		createdAt: admin.firestore.Timestamp.fromDate(new Date())
	};

	admin.firestore().collection('posts').add(newPost)
		.then(doc => {
			res.json({message: `document ${doc.id} created successfully`});
		})
		.catch(err => {
			res.status(500).json({error: 'something went wrong'});
			console.error(err);
		})
})