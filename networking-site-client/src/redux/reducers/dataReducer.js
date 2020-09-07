import { SET_POSTS, LIKE_POST, UNLIKE_POST, LOADING_DATA, SET_POST, DELETE_POST, MAKE_POST, SUBMIT_COMMENT } from '../types';

const initialState = {
    posts: [],
    post: {},
    loading: false
};

export default function(state = initialState, action) {
    switch(action.type) {
        case LOADING_DATA: 
            return {
                ...state,
                loading: true
            }
        case SET_POSTS: 
            action.payload = JSON.parse(JSON.stringify(action.payload).split('"postId":').join('"postID":'));
            return {
                ...state,
                posts: action.payload,
                loading: false
            }
        case SET_POST: 
            return {
                ...state,
                post: action.payload
            }
        
        case LIKE_POST:
        case UNLIKE_POST:
            let index = state.posts.findIndex((post) => post.postID === action.payload.postId);
            // Rename Key to what Post Object expects
            action.payload = JSON.parse(JSON.stringify(action.payload).split('"postId":').join('"postID":'));

            state.posts[index] = action.payload; 
            if(state.post.postID === action.payload.postID) {
                state.post = action.payload;
            }
            return {
                ...state,
            }
        // TODO issue with delete
        case DELETE_POST:
            console.log("post: " + state.posts[1].postID + " and second " + action.payload)
            let indexToDelete = state.posts.findIndex((post) => post.postID === action.payload);
            state.posts.splice(indexToDelete, 1);
            return {
                ...state
            }
        case MAKE_POST:
            // Rename Key to what Post Object expects
            action.payload = JSON.parse(JSON.stringify(action.payload).split('"postId":').join('"postID":'));
            return {
                ...state,
                posts: [
                    action.payload,
                    ...state.posts
                ]
            }
        case SUBMIT_COMMENT:
            return {
                ...state,
                post: {
                    ...state.post,
                    comments: [action.payload, ...state.post.comments]
                }
            }
        default:
            return state;
    }
}