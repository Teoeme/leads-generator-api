import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type FormFieldValue = string | number | boolean | FileList | null | undefined;

export interface FormState {
  [key: string]: FormFieldValue | any;
}

interface FormsState {
  forms: {
    [formId: string]: FormState;
  };
}

const initialState: FormsState = {
  forms: {}
};

export const formSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {
    initializeForm: (state, action: PayloadAction<{
      formId: string;
      initialState: FormState;
    }>) => {
      if (!state.forms[action.payload.formId]) {
        state.forms[action.payload.formId] = action.payload.initialState;
      }
    },
    updateField: (state, action: PayloadAction<{
      formId: string;
      field: string;
      value: FormFieldValue;
    }>) => {
      if (state.forms[action.payload.formId]) {
        state.forms[action.payload.formId][action.payload.field] = action.payload.value;
      }
    },
    resetForm: (state, action: PayloadAction<{
      formId: string;
      newState?: FormState;
    }>) => {
      if (action.payload.newState) {
        state.forms[action.payload.formId] = action.payload.newState;
      } else {
        delete state.forms[action.payload.formId];
      }
    }
  ,
  setFormState: (state, action: PayloadAction<{
    formId: string;
    newState: FormState;
  }>) => {
    state.forms[action.payload.formId] = action.payload.newState;
  }
}
});

export const { initializeForm, updateField, resetForm, setFormState } = formSlice.actions;

// Selectores
export const selectFormState = (formId: string) => 
  (state: { forms: FormsState }) => state.forms.forms[formId];

export default formSlice.reducer; 