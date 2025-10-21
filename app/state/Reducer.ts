export interface AppState {
    uploadOpen: boolean;
    refreshGridKey: number;
}

export type Action =
    | { type: "CLOSE_UPLOAD" }
    | { type: "OPEN_UPLOAD" }
    | { type: "INCREMENT_REFRESH" };

export const initialState: AppState = {
    uploadOpen: false,
    refreshGridKey: 0,
};

export function appReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "CLOSE_UPLOAD":
            return { ...state, uploadOpen: false };
        case "OPEN_UPLOAD":
            return { ...state, uploadOpen: true };
        case "INCREMENT_REFRESH":
            return { ...state, refreshGridKey: state.refreshGridKey + 1 };
        default:
            return state;
    }
}
