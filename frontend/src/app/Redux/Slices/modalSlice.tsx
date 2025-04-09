import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Definir la interfaz para un modal individual
interface Modal {
    uid: string;
    isOpen: boolean;
    data: unknown;
    title: string;
    type: string;
}

// Definir la interfaz para el estado del slice
interface ModalState {
    modals: Modal[];
}

// Estado inicial
const initialState: ModalState = {
    modals: []
};

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
        }>) => {
            const modalIndex = state.modals.findIndex(modal => modal.uid === action.payload.uid);
            if (modalIndex !== -1) {
                if (action.payload.preserveState) {
                    state.modals[modalIndex] = {
                        ...state.modals[modalIndex],
                        isOpen: true
                    };
                } else {
                    state.modals[modalIndex] = {
                        ...state.modals[modalIndex],
                        isOpen: true,
                        data: action.payload.data ?? state.modals[modalIndex].data,
                        title: action.payload.title ?? state.modals[modalIndex].title,
                        type: action.payload.type ?? state.modals[modalIndex].type,
                    };
                }
            } else {
                state.modals.push({
                    uid: action.payload.uid,
                    isOpen: true,
                    data: action.payload.data || {},
                    title: action.payload.title || '',
                    type: action.payload.type || '',
                });
            }
        },
        closeModal: (state, action: PayloadAction<{ uid: string }>) => {
            const modalIndex = state.modals.findIndex(modal => modal.uid === action.payload.uid);
            if (modalIndex !== -1) {
                state.modals[modalIndex] = {
                    ...state.modals[modalIndex],
                    isOpen: false
                };
            }   
        },
        clearModal: (state, action: PayloadAction<{ uid: string }>) => {
            const modalIndex = state.modals.findIndex(modal => modal.uid === action.payload.uid);
            if (modalIndex !== -1) {
                state.modals[modalIndex] = {
                    ...state.modals[modalIndex],
                    data: {},
                    title: '',
                    type: '',
                };
            }
        },
        removeModal: (state, action: PayloadAction<{ uid: string }>) => {
            state.modals = state.modals.filter(modal => modal.uid !== action.payload.uid);
        }
    }
});

export const { openModal, closeModal, clearModal, removeModal } = modalSlice.actions;

// Selectores
export const selectModals = (state: { modals: ModalState }) => state.modals.modals;
export const selectModalByUid = (uid: string) => 
    (state: { modals: ModalState }) => 
    state.modals.modals.find(modal => modal.uid === uid);

export default modalSlice.reducer;