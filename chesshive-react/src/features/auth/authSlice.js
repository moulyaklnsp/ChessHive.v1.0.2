import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk: send login OTP
export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
	try {
		const backendBase = 'http://localhost:3000';
		const res = await fetch(`${backendBase}/api/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(credentials),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) return thunkAPI.rejectWithValue(data);
		return data; // { success: true, message: 'OTP sent...' }
	} catch (err) {
		return thunkAPI.rejectWithValue({ message: err.message || 'Network error' });
	}
});

// Thunk: verify login OTP
export const verifyLoginOtp = createAsyncThunk('auth/verifyLoginOtp', async ({ email, otp }, thunkAPI) => {
	try {
		const res = await fetch('/api/verify-login-otp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, otp }),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) return thunkAPI.rejectWithValue(data);
		
		// Store user info in BOTH sessionStorage (per-tab) AND localStorage (persistent backup)
		// sessionStorage: Allows different users per tab
		// localStorage: Remembers last login when tab is reopened
		if (data.user) {
			sessionStorage.setItem('chesshive_user', JSON.stringify(data.user));
			localStorage.setItem('chesshive_user_backup', JSON.stringify(data.user));
		}
		// Store JWT token for players (both storages)
		if (data.token) {
			sessionStorage.setItem('chesshive_token', data.token);
			localStorage.setItem('chesshive_token_backup', data.token);
		}
		
		return data; // { success: true, redirectUrl, user, token? }
	} catch (err) {
		return thunkAPI.rejectWithValue({ message: err.message || 'Network error' });
	}
});

// Thunk: send signup OTP
export const signup = createAsyncThunk('auth/signup', async (signupData, thunkAPI) => {
	try {
		const res = await fetch('/api/signup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(signupData),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) return thunkAPI.rejectWithValue(data);
		return data; // { success: true, message: 'OTP sent...' }
	} catch (err) {
		return thunkAPI.rejectWithValue({ message: err.message || 'Network error' });
	}
});

// Thunk: verify signup OTP
export const verifySignupOtp = createAsyncThunk('auth/verifySignupOtp', async ({ email, otp }, thunkAPI) => {
	try {
		const res = await fetch('/api/verify-signup-otp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, otp }),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) return thunkAPI.rejectWithValue(data);
		return data; // { success: true, redirectUrl }
	} catch (err) {
		return thunkAPI.rejectWithValue({ message: err.message || 'Network error' });
	}
});

// Thunk: request forgot password OTP
export const forgotPassword = createAsyncThunk('auth/forgotPassword', async ({ email }, thunkAPI) => {
	try {
		const res = await fetch('/api/forgot-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) return thunkAPI.rejectWithValue(data);
		return data; // { success: true, message: 'OTP sent...' }
	} catch (err) {
		return thunkAPI.rejectWithValue({ message: err.message || 'Network error' });
	}
});

// Thunk: verify forgot password OTP
export const verifyForgotPasswordOtp = createAsyncThunk('auth/verifyForgotPasswordOtp', async ({ email, otp }, thunkAPI) => {
	try {
		const res = await fetch('/api/verify-forgot-password-otp', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, otp }),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) return thunkAPI.rejectWithValue(data);
		return data; // { success: true, resetToken }
	} catch (err) {
		return thunkAPI.rejectWithValue({ message: err.message || 'Network error' });
	}
});

// Thunk: reset password
export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ email, resetToken, newPassword, confirmPassword }, thunkAPI) => {
	try {
		const res = await fetch('/api/reset-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, resetToken, newPassword, confirmPassword }),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) return thunkAPI.rejectWithValue(data);
		return data; // { success: true, message: 'Password reset successful' }
	} catch (err) {
		return thunkAPI.rejectWithValue({ message: err.message || 'Network error' });
	}
});

// Thunk: fetch current session from server to rehydrate store on app start
export const fetchSession = createAsyncThunk('auth/fetchSession', async (_, thunkAPI) => {
	try {
		const res = await fetch('/api/session');
		const data = await res.json().catch(() => ({}));
		if (!res.ok) return thunkAPI.rejectWithValue(data);
		return data; // expected { userEmail, userRole, username }
	} catch (err) {
		return thunkAPI.rejectWithValue({ message: err.message || 'Network error' });
	}
});

// Thunk: restore deleted account
export const restoreAccount = createAsyncThunk('auth/restoreAccount', async ({ id, email, password }, thunkAPI) => {
	try {
		const res = await fetch('/api/restore-account', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, email, password }),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) return thunkAPI.rejectWithValue(data);
		return data; // { success: true, message, redirectUrl }
	} catch (err) {
		return thunkAPI.rejectWithValue({ message: err.message || 'Network error' });
	}
});

const initialState = {
	user: null,
	loading: false,
	otpSent: false,
	previewUrl: null,
	redirectUrl: null,
	error: null,
	restoreInfo: null,
	// Forgot password state
	forgotPasswordStep: 'email', // 'email' | 'otp' | 'reset' | 'success'
	resetToken: null,
	forgotPasswordEmail: null,
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setUser(state, action) {
			state.user = action.payload;
		},
		logout(state) {
			state.user = null;
			// Clear all stored auth data on logout
			try {
				sessionStorage.removeItem('chesshive_user');
				sessionStorage.removeItem('chesshive_token');
				localStorage.removeItem('chesshive_user_backup');
				localStorage.removeItem('chesshive_token_backup');
			} catch (e) {
				console.warn('Failed to clear auth storage:', e);
			}
		},
		clearError(state) {
			state.error = null;
		},
		resetForgotPassword(state) {
			state.forgotPasswordStep = 'email';
			state.resetToken = null;
			state.forgotPasswordEmail = null;
			state.error = null;
		},
		clearRestoreInfo(state) {
			state.restoreInfo = null;
			state.error = null;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(login.pending, (s) => { s.loading = true; s.error = null; })
			.addCase(login.fulfilled, (s, a) => {
				s.loading = false;
				if (a.payload && a.payload.success) {
					s.otpSent = true;
					s.previewUrl = a.payload.previewUrl || null;
				}
			})
			.addCase(login.rejected, (s, a) => {
				s.loading = false;
				s.error = a.payload?.message || a.error?.message;
				if (a.payload && a.payload.restoreRequired) {
					s.restoreInfo = {
						userId: a.payload.deletedUserId,
						role: a.payload.deletedUserRole,
						message: a.payload.message || 'Account deleted'
					};
				} else {
					s.restoreInfo = null;
				}
			})

			.addCase(verifyLoginOtp.pending, (s) => { s.loading = true; s.error = null; })
			.addCase(verifyLoginOtp.fulfilled, (s, a) => {
				s.loading = false;
				s.otpSent = false;
				s.previewUrl = null;
				s.redirectUrl = a.payload?.redirectUrl || null;
				// User will be redirected, no need to set user here
			})
			.addCase(verifyLoginOtp.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || a.error?.message; })

			.addCase(signup.pending, (s) => { s.loading = true; s.error = null; })
			.addCase(signup.fulfilled, (s, a) => {
				s.loading = false;
				if (a.payload && a.payload.success) {
					s.otpSent = true;
					s.previewUrl = a.payload.previewUrl || null;
				}
			})
			.addCase(signup.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || a.error?.message; })

			.addCase(verifySignupOtp.pending, (s) => { s.loading = true; s.error = null; })
			.addCase(verifySignupOtp.fulfilled, (s, a) => {
				s.loading = false;
				s.otpSent = false;
				s.previewUrl = null;
				s.redirectUrl = a.payload?.redirectUrl || null;
			})
			.addCase(verifySignupOtp.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || a.error?.message; })

			// session rehydrate
			.addCase(fetchSession.pending, (s) => { s.loading = true; s.error = null; })
			.addCase(fetchSession.fulfilled, (s, a) => {
				s.loading = false;
				if (a.payload && a.payload.userEmail) {
					s.user = { email: a.payload.userEmail, role: a.payload.userRole, username: a.payload.username };
				} else {
					s.user = null;
				}
			})
			.addCase(fetchSession.rejected, (s, a) => { s.loading = false; /* ignore fetch errors for now */ })

			// Forgot Password flow
			.addCase(forgotPassword.pending, (s) => { s.loading = true; s.error = null; })
			.addCase(forgotPassword.fulfilled, (s, a) => {
				s.loading = false;
				if (a.payload && a.payload.success) {
					s.forgotPasswordStep = 'otp';
					s.forgotPasswordEmail = a.meta?.arg?.email || null;
				}
			})
			.addCase(forgotPassword.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || a.error?.message; })

			.addCase(verifyForgotPasswordOtp.pending, (s) => { s.loading = true; s.error = null; })
			.addCase(verifyForgotPasswordOtp.fulfilled, (s, a) => {
				s.loading = false;
				if (a.payload && a.payload.success) {
					s.forgotPasswordStep = 'reset';
					s.resetToken = a.payload.resetToken || null;
				}
			})
			.addCase(verifyForgotPasswordOtp.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || a.error?.message; })

			.addCase(resetPassword.pending, (s) => { s.loading = true; s.error = null; })
			.addCase(resetPassword.fulfilled, (s, a) => {
				s.loading = false;
				if (a.payload && a.payload.success) {
					s.forgotPasswordStep = 'success';
				}
			})
			.addCase(resetPassword.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || a.error?.message; })

			// Restore account flow
			.addCase(restoreAccount.pending, (s) => { s.loading = true; s.error = null; })
			.addCase(restoreAccount.fulfilled, (s, a) => {
				s.loading = false;
				s.restoreInfo = null;
				s.redirectUrl = a.payload?.redirectUrl || null;
			})
			.addCase(restoreAccount.rejected, (s, a) => { s.loading = false; s.error = a.payload?.message || a.error?.message; });
	}
});

export const { setUser, logout, clearError, resetForgotPassword, clearRestoreInfo } = authSlice.actions;
export default authSlice.reducer;