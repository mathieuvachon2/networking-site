import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_UI, SET_UNAUTHENTICATED } from '../types';
import axios from 'axios';

export const loginUser = (userData, history) => (dispatch) => {
	dispatch({ type: LOADING_UI});

	axios.post('/login', userData)
		.then(res => {
				setAuthorizationHeader(res.data.token);
				dispatch(getUserData());
				dispatch({ type: CLEAR_ERRORS});
				history.push('/');
		})
		.catch(err => {
				dispatch({
					type: SET_ERRORS,
					payload: err.response.data
				})
		});
};

export const signupUser = (newUserData, history) => (dispatch) => {
	dispatch({ type: LOADING_UI});

	axios.post('/signup', newUserData)
		.then(res => {
				setAuthorizationHeader(res.data.token);
				dispatch(getUserData());
				dispatch({ type: CLEAR_ERRORS});
				history.push('/');
		})
		.catch(err => {
				dispatch({
					type: SET_ERRORS,
					payload: err.response.data
				})
		});
};

export const getUserData = () => (dispatch) => {
	axios.get('/user')
		.then(res => {
			dispatch({
				type: SET_USER,
				payload: res.data
			})
		})
		.catch(err => console.log(err))
};

// Action for logging out
export const logoutUser = () => (dispatch) => {
	localStorage.removeItem('FBIdToken');
	delete axios.defaults.headers.common['Authorization']; // Remove Header from Axios
	dispatch({ type: SET_UNAUTHENTICATED });
}

const setAuthorizationHeader = (token) => {
	const FBIdToken = `Bearer ${token}`;

	// Store the Token
	localStorage.setItem('FBIdToken', FBIdToken);

	// Set Default Header provided by Axios which will always have Authorization header
	axios.defaults.headers.common['Authorization'] = FBIdToken;
}