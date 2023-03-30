import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { conversationsApi, useAddConversationMutation, useEditConversationMutation } from "../../features/conversation/conversationApi";
import { useGetUserQuery } from "../../features/user/userApi";
import isValidateEmail from "../../ulits/isValidEmail";
import Error from "../ui/Error"
export default function Modal({ open, control }) {
    const [to, setTo] = useState('');
    const [message, setMessage] = useState('');
    const [userCheck, setuserCheck] = useState(false)
    const [conversation, setConversation] = useState(undefined)

    const { user: logInUser } = useSelector(state => state.auth) || {}

    const { data: participent, error } = useGetUserQuery(to, {
        skip: !userCheck
    })
    const [addConversation, { isSuccess: isAddConversationSuccess }] =
        useAddConversationMutation();
    const [editConversation, { isSuccess: isEditConversationSuccess }] =
        useEditConversationMutation();

    const dispatch = useDispatch()
    useEffect(() => {
        if (participent?.length > 0 && participent[0].email !== logInUser.email) {
            dispatch(conversationsApi.endpoints.getConversation.initiate({
                userEmail: logInUser.email,
                participantEmail: to
            })
            ).unwrap().then((data) => {
                console.log(data)
                setConversation(data)
            }).catch(err => console.log(err))
        }
    }, [participent, dispatch, logInUser.email, to])
    useEffect(() => {
        if (isAddConversationSuccess || isEditConversationSuccess) {
            control();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAddConversationSuccess, isEditConversationSuccess]);
    const debouncerHander = (fn, delay) => {
        let timeOutId
        return (...args) => {
            clearTimeout(timeOutId)
            timeOutId = setTimeout(() => {
                fn(...args)
            }, delay);
        }
    }
    const doSearch = (value) => {
        if (isValidateEmail(value)) {
            setuserCheck(true)
            setTo(value)
        }


    }
    const handleSearch = debouncerHander(doSearch, 500)

    const handlerSubmit = (e) => {
        e.preventDefault()

        if (conversation?.length > 0) {
            // edit conversation
            editConversation({
                id: conversation[0].id,
                data: {
                    participants: `${logInUser.email}-${participent[0].email}`,
                    users: [logInUser, participent[0]],
                    message,
                    timestamp: new Date().getTime(),
                },
            });
        }
        else if (conversation?.length === 0) {
            addConversation({
                participants: `${logInUser.email}-${participent[0].email}`,
                users: [logInUser, participent[0]],
                message,
                timestamp: new Date().getTime(),
            })
        }
    }
    return (
        open && (
            <>
                <div
                    onClick={control}
                    className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
                ></div>
                <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Send message
                    </h2>
                    <form className="mt-8 space-y-6" onSubmit={handlerSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="to" className="sr-only">
                                    To
                                </label>
                                <input
                                    id="to"
                                    name="to"
                                    type="to"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Send to"
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    type="message"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                                disabled={conversation === undefined || (participent?.length === 0 && participent[0].email === logInUser.email)}
                            >
                                Send Message
                            </button>
                        </div>

                        {participent?.length === 0 && <Error message={error} />}
                        {participent?.length > 0 && participent[0].email === logInUser.email && <Error message="you cant not sent" />}
                    </form>
                </div>
            </>
        )
    );
}
