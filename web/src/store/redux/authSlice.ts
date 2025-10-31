"use client";

import {
    createAsyncThunk,
    createListenerMiddleware,
    createSlice,
    isAnyOf,
} from "@reduxjs/toolkit";
import {
    fetchUserRequest,
    loginRequest,
    logoutRequest,
} from "@/lib/api/auth";
import type {AuthSession, LoginCredentials} from "@/lib/api/auth";
import type {User} from "@/types/user";

export interface AuthState {
    user: User | null;
    token: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    initialized: boolean;
}

const AUTH_TOKEN_STORAGE_KEY = "nof0.auth.token";

const initialState: AuthState = {
    user: null,
    token: null,
    status: "idle",
    error: null,
    initialized: false,
};

const parseError = (error: unknown): string =>
    error instanceof Error ? error.message : "Unexpected error";

export const loginUser = createAsyncThunk<
    AuthSession,
    LoginCredentials,
    { rejectValue: string }
>("auth/login", async (credentials, {rejectWithValue}) => {
    try {
        return await loginRequest(credentials);
    } catch (error) {
        return rejectWithValue(parseError(error));
    }
});

export const fetchCurrentUser = createAsyncThunk<
    User,
    void,
    { state: { auth: AuthState }; rejectValue: string }
>("auth/fetchCurrentUser", async (_, {rejectWithValue, getState}) => {
    const token = getState().auth.token;
    if (!token) {
        return rejectWithValue("Missing auth token");
    }
    try {
        return await fetchUserRequest(token);
    } catch (error) {
        return rejectWithValue(parseError(error));
    }
});

export const restoreSession = createAsyncThunk<
    { token: string | null; user: User | null },
    void,
    { rejectValue: string }
>("auth/restoreSession", async (_, {rejectWithValue}) => {
    if (typeof window === "undefined") {
        return {token: null, user: null};
    }

    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token) {
        return {token: null, user: null};
    }

    try {
        const user = await fetchUserRequest(token);
        return {token, user};
    } catch (error) {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        return rejectWithValue(parseError(error));
    }
});

export const logoutUser = createAsyncThunk<
    void,
    void,
    { state: { auth: AuthState }; rejectValue: string }
>("auth/logout", async (_, {getState, rejectWithValue}) => {
    const token = getState().auth.token;
    try {
        await logoutRequest(token);
    } catch (error) {
        return rejectWithValue(parseError(error));
    }
});

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            state.status = "idle";
            state.error = null;
            state.initialized = true;
        },
        clearAuthError(state) {
            state.error = null;
            if (state.status === "failed") {
                state.status = "idle";
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
                state.initialized = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Login failed";
                state.user = null;
                state.token = null;
            })
            .addCase(fetchCurrentUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload;
                state.error = null;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Unable to fetch user";
            })
            .addCase(restoreSession.fulfilled, (state, action) => {
                state.status = "idle";
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
                state.initialized = true;
            })
            .addCase(restoreSession.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Unable to restore session";
                state.user = null;
                state.token = null;
                state.initialized = true;
            })
            .addCase(logoutUser.pending, (state) => {
                state.status = "loading";
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.status = "idle";
                state.error = null;
                state.user = null;
                state.token = null;
                state.initialized = true;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Logout failed";
            });
    },
});

export const {logout, clearAuthError} = authSlice.actions;

export const authListenerMiddleware = createListenerMiddleware();

authListenerMiddleware.startListening({
    matcher: isAnyOf(loginUser.fulfilled, restoreSession.fulfilled),
    effect: async (action) => {
        if (typeof window === "undefined") return;
        const token =
            (action.payload as { token?: string | null })?.token ?? null;
        if (token) {
            window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
        } else {
            window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        }
    },
});

authListenerMiddleware.startListening({
    matcher: isAnyOf(logout, logoutUser.fulfilled),
    effect: async () => {
        if (typeof window === "undefined") return;
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    },
});

export default authSlice.reducer;
