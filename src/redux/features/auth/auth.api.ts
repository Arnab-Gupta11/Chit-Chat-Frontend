import { apiClient } from '../../apiClient/apiClient';

export const authApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login', 
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
  }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;