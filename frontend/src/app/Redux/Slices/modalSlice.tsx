import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Definir la interfaz para un modal individual
interface Modal {
    uid: string;
    isOpen: boolean;
    data: unknown;
    title: string;
    type: string;
    formState?: any;
}

// Definir la interfaz para el estado del slice
interface ModalState {
    [key: string]: Modal;
}

// Estado inicial
const initialState: ModalState = {};

export const modalSlice = createSlice({
    name: 'modals',
    initialState,
    reducers: {
        openModal: (state, action: PayloadAction<{
            uid: string;
            data?: unknown;
            title?: string;
            type?: string;
            preserveState?: boolean;
            formState?: any;
        }>) => {
            const modalIndex = action.payload.uid;
            if (state[modalIndex]) {
                if (action.payload.preserveState) {
                    state[modalIndex] = {
                        ...state[modalIndex],
                        isOpen: true
                    };
                } else {
                    state[modalIndex] = {
                        ...state[modalIndex],
                        isOpen: true,
                        data: action.payload.data ?? state[modalIndex].data,
                        title: action.payload.title ?? state[modalIndex].title,
                        type: action.payload.type ?? state[modalIndex].type,
                        formState: action.payload.formState ?? state[modalIndex].formState,
                    };
                }
            } else {
                state[action.payload.uid] = {
                    uid: action.payload.uid,
                    isOpen: true,
                    data: action.payload.data || {},
                    title: action.payload.title || '',
                    type: action.payload.type || '',
                    formState: action.payload.formState || {},
                };
            }
        },
        closeModal: (state, action: PayloadAction<{ uid: string }>) => {
            const modalIndex =  action.payload.uid;
            if (state[modalIndex]) {
                state[modalIndex] = {
                    ...state[modalIndex],
                    isOpen: false
                };
            }
        },
        clearModal: (state, action: PayloadAction<{ uid: string }>) => {
            const modalIndex = action.payload.uid;
            if (state[modalIndex]) {
                state[modalIndex] = {
                    ...state[modalIndex],
                    data: {},
                    title: '',
                    type: '',
                    formState: {}
                };
            }
        },
        removeModal: (state, action: PayloadAction<{ uid: string }>) => {
            delete state[action.payload.uid];
        },
        setFormState: (state, action: PayloadAction<{ uid: string; formState: any }>) => {
            const modalIndex = action.payload.uid;
            if (state[modalIndex]) {
                state[modalIndex].formState = action.payload.formState;
            }
        },
        updateFormField: (state, action: PayloadAction<{ uid: string; field: string; value: any }>) => {
            const modalIndex = action.payload.uid;
            if (state[modalIndex]) {
                state[modalIndex].formState[action.payload.field] = action.payload.value;
            }
        }
    }
});

export const { openModal, closeModal, clearModal, removeModal, setFormState, updateFormField } = modalSlice.actions;

// Selectores
export const selectModals = (state: { modals: ModalState }) => state.modals;
export const selectModalByUid = (uid: string) => 
    (state: { modals: ModalState }) => 
    state.modals[uid];

export default modalSlice.reducer;