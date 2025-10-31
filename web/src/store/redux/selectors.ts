import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export const selectAuthState = (state: RootState) => state.auth;

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (auth) => Boolean(auth.token && auth.user),
);

export const selectAuthStatus = createSelector(
  selectAuthState,
  (auth) => auth.status,
);

export const selectAuthError = createSelector(
  selectAuthState,
  (auth) => auth.error,
);

export const selectCurrentUser = createSelector(
  selectAuthState,
  (auth) => auth.user,
);
