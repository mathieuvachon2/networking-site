import { SET_POSTS, LOADING_DATA, LIKE_POST, UNLIKE_POST, DELETE_POST, LOADING_UI, CLEAR_ERRORS, SET_ERRORS, MAKE_POST, SET_POST, STOP_LOADING_UI, SUBMIT_COMMENT } from '../types';
import axios from 'axios';

// Get all Posts
export const getPosts = () => dispatch => {
    dispatch({ type: LOADING_DATA });
    axios.get('/posts')
        .then(res => {
            dispatch({
                type: SET_POSTS,
                payload: res.data
            })
        })
        .catch(err => {
            dispatch({
                type: SET_POSTS,
                payload: []
            })
        })
};

// Get 1 Post
export const getPost = (postId) => dispatch => {
    dispatch({ type: LOADING_UI });
    axios.get(`/post/${postId}`)
        .then(res => {
            dispatch({
                type: SET_POST,
                payload: res.data
            });
            dispatch({ type: STOP_LOADING_UI })
        })
        .catch(err => console.log(err));

};

// Like a Post
export const likePost = (postId) => dispatch => {
    axios.get(`/post/${postId}/like`)
        .then(res => {
            dispatch({
                type: LIKE_POST,
                payload: res.data
            })
        })
        .catch(err => console.log(err));
};

// Unlike a Post
export const unlikePost = (postId) => dispatch => {
    axios.get(`/post/${postId}/unlike`)
        .then(res => {
            dispatch({
                type: UNLIKE_POST,
                payload: res.data
            })
        })
        .catch(err => console.log(err));
};

// Comment on a Post
export const submitComment = (postId, commentData) => dispatch => {
    axios.post(`/post/${postId}/comment`, commentData)
        .then(res => {
            dispatch({
                type: SUBMIT_COMMENT,
                payload: res.data
            });
            dispatch(clearErrors());
        })
        .catch(err => {
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            })
        })
}

// Delete a Post
export const deletePost = (postId) => dispatch => {
    console.log("postID is: " + postId)
    axios.delete(`/post/${postId}`)
        .then(() => {
            dispatch({ type: DELETE_POST, payload: postId })
        })
        .catch(err => console.log(err));
};

// Make a Post
export const makePost = (newPost) => dispatch => {
    dispatch({ type: LOADING_UI })
    axios.post('/post', newPost)
        .then(res => {
            dispatch({
                type: MAKE_POST,
                payload: res.data
            });
            dispatch(clearErrors())
        })
        .catch(err => {
            dispatch({
                type: SET_ERRORS,
                payload: err.response.data
            })
        })
};

// Get Data on the User that is getting viewed
export const getUserData = (userHandle) => dispatch => {
    dispatch({ type: LOADING_DATA });
    axios.get(`/user/${userHandle}`)
        .then(res => {
            dispatch({
                type: SET_POSTS,
                payload: res.data.posts
            });
        })
        .catch(() => {
            dispatch({
                type: SET_POSTS,
                payload: null
            })
        });
} 

// Clear Errors so they do not carry over to next action
export const clearErrors = () => dispatch => {
    dispatch({ type: CLEAR_ERRORS });
}