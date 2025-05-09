'use client'

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  initializeForm, 
  updateField, 
  resetForm, 
  selectFormState,
  FormState,
  FormFieldValue,
  setFormState
} from '../Redux/Slices/formSlice';

interface UseStateFormProps {
  formId: string;
  initialState?: FormState;
}

export const useStateForm = ({ formId, initialState = {} }: UseStateFormProps) => {
  const dispatch = useDispatch();
  const formState = useSelector(selectFormState(formId)) || {};

  // Inicializar el formulario
  useEffect(() => {
    dispatch(initializeForm({ formId, initialState }));
  }, [dispatch, formId, initialState]);

  // Manejador genérico para cambios
  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | {target: {name: string, value:any ,type?: string}}
  ) => {
    const { name, value, type } = event.target;
    let newValue: FormFieldValue;

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

    dispatch(updateField({
      formId,
      field: name,
      value: newValue
    }));
  }, [dispatch, formId]);

  // Función para actualizar campos programáticamente
  const setField = useCallback((field: string, value: FormFieldValue) => {
    dispatch(updateField({
      formId,
      field,
      value
    }));
  }, [dispatch, formId]);

  // Función para resetear el formulario
  const resetFormState = useCallback((newState?: FormState) => {
    dispatch(resetForm({
      formId,
      newState
    }));
  }, [dispatch, formId]);

  const setForm = useCallback((newState: FormState) => {   
    dispatch(setFormState({
        formId,
        newState    
    }));
  }, [dispatch, formId]);


  return {
    formState,
    handleChange,
    setField,
    resetForm: resetFormState,
    setForm
  };
};
