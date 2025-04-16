'use client'

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal, closeModal, clearModal, removeModal, selectModalByUid, setFormState, updateFormField } from '../Redux/Slices/modalSlice';

interface UseModalProps {
    uid: string;
    title?: string;
}

export const useModal = ({ uid,title }: UseModalProps) => {
    const dispatch = useDispatch();
    const modal = useSelector(selectModalByUid(uid));
    const formState=modal?.formState
    const open = useCallback((options: {
        data?: unknown;
        title: string;
        type: 'add' | 'edit' | 'view';
        preserveState?: boolean;
        formState?: any;
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


    const setModalForm = useCallback((formState: any | ((prevFormState: any) => any)) => {
if(typeof formState === 'function'){
    const newFormState=formState(modal?.formState)
    dispatch(setFormState({ uid, formState:newFormState }));
}else{
    dispatch(setFormState({ uid, formState }));
}

    }, [dispatch, uid,modal?.formState]);

    const handleChange = useCallback((
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | {target: {name: string, value:any ,type?: string}}
      ) => {
        const { name, value, type } = event.target;
        console.log(name,value,type,'event change')
        let newValue: any;
    
        if (type === 'checkbox') {
          newValue = (event.target as HTMLInputElement).checked;
        } else if (type === 'number') {
          newValue = value === '' ? '' : Number(value);
        } else if (type === 'file') {
          const fileInput = event.target as HTMLInputElement;
          newValue = fileInput.files || null;
        } else {
          newValue = value;
        }
    
        dispatch(updateFormField({
          uid,
          field: name,
          value: newValue
        }));
      }, [dispatch, uid]);



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
        closeAndCleanModal,
        setModalForm,
        handleChange,
        formState
    };
};