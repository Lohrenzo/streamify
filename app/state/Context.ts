"use client";
import { createContext, Dispatch } from "react";
import { AppState, Action, initialState } from "./Reducer";

export interface AppContextType {
    state: AppState;
    dispatch: Dispatch<Action>;
}

const AppContext = createContext<AppContextType>({
    state: initialState,
    dispatch: () => { },
});

export default AppContext;
