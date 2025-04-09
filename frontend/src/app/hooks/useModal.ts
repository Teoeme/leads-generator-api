'use client'

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal, closeModal, clearModal, removeModal, selectModalByUid } from '../Redux/Slices/modalSlice';

interface UseModalProps {
    uid: string;
    title?: string;
}

export const useModal = ({ uid,title }: UseModalProps) => {
    const dispatch = useDispatch();
    const modal = useSelector(selectModalByUid(uid));

    const open = useCallback((options: {
        data?: unknown;
        title: string;
        type: 'add' | 'edit' | 'view';
        preserveState?: boolean;
    }) => {
        dispatch(openModal({
            uid,
            ...options,
            title:title || options?.title
        }));
    }, [dispatch, uid,title]);

    const openPreservingState = useCallback(() => {
        dispatch(openModal({
            uid,
            preserveState: true
        }));
    }, [dispatch, uid]);

    const close = useCallback(() => {
        dispatch(closeModal({ uid }));
    }, [dispatch, uid]);

    const clear = useCallback(() => {
        dispatch(clearModal({ uid }));
    }, [dispatch, uid]);

    const remove = useCallback(() => {
        dispatch(removeModal({ uid }));
    }, [dispatch, uid]);

    const closeAndCleanModal = useCallback(() => {
        close();
        clear();
    }, [close, clear]);

    return {
        isOpen: modal?.isOpen || false,
        data: modal?.data,
        title: modal?.title,
        type: modal?.type as 'add' | 'edit' | 'view',
        open,
        openPreservingState,
        close,
        clear,
        remove,
        closeAndCleanModal
    };
};