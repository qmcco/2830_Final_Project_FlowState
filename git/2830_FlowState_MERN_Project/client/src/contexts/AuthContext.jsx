import { createContext, useEffect, useContext, useCallback, useMemo, useState } from "react";
import { clearStoredAuth, getStoredUser, setStoredAuth } from "../api";

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

	useEffect(() => {
		window.addEventListener('logout', logout);
		return () => window.removeEventListener('logout', logout);
	}, [logout]);

	const value = useMemo(() => ({
		user,
		isAuthenticated: !!user,
		login,
		logout,
	}), [user, login, logout]);

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