"use client";

import { useMemo } from "react";
import { useAppDispatch } from "./hooks";
import * as authActions from "./authSlice";

export const useAuthDispatch = () => {
    const dispatch = useAppDispatch();

    return useMemo(
        () => ({
            ...authActions,
            dispatch,
        }),
        [dispatch]
    );
};
