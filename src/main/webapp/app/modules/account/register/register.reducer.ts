import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { serializeAxiosError } from 'app/shared/reducers/reducer.utils';

const initialState: {
  loading: boolean;
  registrationSuccess: boolean;
  registrationFailure: boolean;
  errorMessage: string | null;
  successMessage: string | null;
} = {
  loading: false,
  registrationSuccess: false,
  registrationFailure: false,
  errorMessage: null,
  successMessage: null,
};

export type RegisterState = Readonly<typeof initialState>;

// Actions

export type RegisterPayload = {
  login: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  role: 'CLIENT' | 'ENTREPRISE' | 'ADMIN';
  langKey?: string;
};

export type EntrepriseRegisterPayload = {
  idEntreprise: string;
  nomEntreprise: string;
  secteur?: string;
  adresseEntreprise: string;
  tel?: string;
  emailEntreprise?: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  adminLogin?: string;
};

export const handleRegister = createAsyncThunk(
  'register/create_account',
  async (data: RegisterPayload) => {
    return axios.post<any>('api/signup', data);
  },
  { serializeError: serializeAxiosError },
);

export const handleEntrepriseRegister = createAsyncThunk(
  'register/create_entreprise_account',
  async (data: EntrepriseRegisterPayload) => {
    return axios.post<any>('api/signup/entreprise', data);
  },
  { serializeError: serializeAxiosError },
);

export const RegisterSlice = createSlice({
  name: 'register',
  initialState: initialState as RegisterState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(handleRegister.pending, state => {
        state.loading = true;
      })
      .addCase(handleRegister.rejected, (state, action) => ({
        ...initialState,
        registrationFailure: true,
        errorMessage: action.error.message ?? null,
      }))
      .addCase(handleRegister.fulfilled, () => ({
        ...initialState,
        registrationSuccess: true,
        successMessage: 'Inscription enregistrée ! Merci de vérifier votre email pour activer votre compte.',
      }))
      .addCase(handleEntrepriseRegister.pending, state => {
        state.loading = true;
      })
      .addCase(handleEntrepriseRegister.rejected, (state, action) => ({
        ...initialState,
        registrationFailure: true,
        errorMessage: action.error.message ?? null,
      }))
      .addCase(handleEntrepriseRegister.fulfilled, () => ({
        ...initialState,
        registrationSuccess: true,
        successMessage: "Inscription entreprise enregistrée ! Merci de vérifier l'email administrateur pour activer le compte.",
      }));
  },
});

export const { reset } = RegisterSlice.actions;

// Reducer
export default RegisterSlice.reducer;
