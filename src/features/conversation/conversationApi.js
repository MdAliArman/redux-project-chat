

import { apiSlice } from "../api/apiSlice";
import { massengerApi } from "../massenger/massengerApi";

export const conversationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (email) =>
                `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
        }),

        getConversation: builder.query({
            query: ({ userEmail, participantEmail }) =>
                `/conversations?participants_like=${userEmail}-${participantEmail}&&participants_like=${participantEmail}-${userEmail}`,
        }),
        addConversation: builder.mutation({
            query: ({ data, sender }) => ({
                url: '/conversations',
                method: "POST",
                body: data
            }),

            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                const conversation = await queryFulfilled;
                if (conversation?.data?.id) {
                    // silent entry to message table
                    const users = arg.data.users;
                    const senderUser = users.find(
                        (user) => user.email === arg.sender
                    );
                    const receiverUser = users.find(
                        (user) => user.email !== arg.sender
                    );

                    dispatch(
                        massengerApi.endpoints.addmessage.initiate({
                            conversationId: conversation?.data?.id,
                            sender: senderUser,
                            receiver: receiverUser,
                            message: arg.data.message,
                            timestamp: arg.data.timestamp,
                        })
                    );
                }
            },

        }),
        editConversation: builder.mutation({
            query: ({ data, id, sender }) => ({
                url: `/conversations/${id}`,
                method: "PATCH",
                body: data
            }),

            async onQueryStarted(arg, { queryFulfilled, dispatch }) {

                // optimistic cache update start
                const pathResult1 = dispatch(
                    apiSlice.util.updateQueryData(
                        "getConversations",
                        arg.sender,
                        (draft) => {
                            const draftConversation = draft.find(
                                (c) => c.id == arg.id
                            );
                            draftConversation.message = arg.data.message;
                            draftConversation.timestamp = arg.data.timestamp;
                        }
                    )
                );
                // optimistic cache update end

                try {
                    const conversation = await queryFulfilled;
                    if (conversation?.data?.id) {
                        // silent entry to message table
                        const users = arg.data.users;
                        const senderUser = users.find(
                            (user) => user.email === arg.sender
                        );
                        const receiverUser = users.find(
                            (user) => user.email !== arg.sender
                        );

                        const res = await dispatch(
                            massengerApi.endpoints.addmessage.initiate({
                                conversationId: conversation?.data?.id,
                                sender: senderUser,
                                receiver: receiverUser,
                                message: arg.data.message,
                                timestamp: arg.data.timestamp,
                            })
                        ).unwrap();
                        // update messages cache pessimistically start
                        dispatch(
                            apiSlice.util.updateQueryData(
                                "getMessages",
                                res.conversationId.toString(),
                                (draft) => {
                                    draft.push(res);
                                }
                            )
                        );
                        // update messages cache pessimistically end
                    }
                } catch (err) {
                    pathResult1.undo()
                }
            },

        }),
    }),
});

export const { useGetConversationsQuery, useGetConversationQuery, useAddConversationMutation, useEditConversationMutation } = conversationsApi;