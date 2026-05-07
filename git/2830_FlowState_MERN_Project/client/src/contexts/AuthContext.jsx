import { createContext, useEffect, useContext, useCallback, useMemo, useState } from "react";
import { clearStoredAuth, getStoredUser, setStoredAuth } from "../api";
import api from "../api";

const AuthContext = createContext();

function AuthProvider({ children }) {
	const [user, setUser] = useState(getStoredUser());

	const login = useCallback((userData, token) => {
		setStoredAuth(token, userData);
		setUser(userData);
	}, []);

	const logout = useCallback(() => {
		clearStoredAuth();
		setUser(null);
	}, []);

	const refreshUser = useCallback(async () => {
		if (!user || !user._id) return;
		try {
			const { data } = await api.get(`/users/${user._id}`);
			const token = localStorage.getItem('userToken');
			if (data) {
				setStoredAuth(token, data);
				setUser(data);
			}
		} catch (err) {
			console.error('Error refreshing user', err);
		}
	}, [user]);

	useEffect(() => {
		window.addEventListener('logout', logout);
		return () => window.removeEventListener('logout', logout);
	}, [logout]);

	const value = useMemo(() => ({
		user,
		isAuthenticated: !!user,
		login,
		logout,
		refreshUser,
	}), [user, login, logout, refreshUser]);

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}

function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

/* eslint-disable react-refresh/only-export-components */
export { AuthProvider, useAuth };