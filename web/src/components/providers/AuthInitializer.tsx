"use client";

import {useEffect} from "react";
import {useAuthDispatch, useAppSelector} from "@/store/redux/hooks";

export default function AuthInitializer() {
    const auth = useAuthDispatch();
    const initialized = useAppSelector((state) => state.auth.initialized);

    useEffect(() => {
        if (!initialized) {
            void auth.dispatch(auth.restoreSession());
        }
    }, [auth, initialized]);

    return null;
}
