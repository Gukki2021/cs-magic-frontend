import { BACKEND_ENDPOINT } from '@/lib/env'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react' // 要从react内导入，否则没hook，ref: https://redux-toolkit.js.org/rtk-query/usage/code-splitting

export const baseApi = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: BACKEND_ENDPOINT,
	}),
	reducerPath: 'baseApi',
	endpoints: () => ({}),
})

export const {} = baseApi