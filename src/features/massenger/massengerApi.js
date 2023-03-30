
import { apiSlice } from "../api/apiSlice";

export const massengerApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: (id) =>
                `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
        }),
        addmessage: builder.mutation({
            query: (data) =>({
                url: '/messages',
                method: "POST",
                body: data
            })
        
        }),
    }),
});

export const {useGetMessagesQuery, useAddmessageMutation}=massengerApi;