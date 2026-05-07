import axios from 'axios';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'user';

const api = axios.create({
	baseURL: 'http://localhost:5000/api',
});

export const getStoredUser = () => {
	const user = localStorage.getItem(USER_KEY);
	return user ? JSON.parse(user) : null;
};

export const setStoredAuth = (token, user) => {
	localStorage.setItem(TOKEN_KEY, token);
	localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
};

// Include JWT token in each request
api.interceptors.request.use((config) => {
	const token = localStorage.getItem(TOKEN_KEY);
	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
}, (error) => Promise.reject(error));

// Handle token expiration
api.interceptors.response.use((res) => res, (error) => {
	if (error.response && error.response.status === 401) {
		clearStoredAuth();
		window.dispatchEvent(new Event('logout'));
	}
	return Promise.reject(error);
})

export default api;