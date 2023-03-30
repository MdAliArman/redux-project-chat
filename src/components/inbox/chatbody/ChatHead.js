import { useSelector } from "react-redux";
import getAvater from 'gravatar-url'
export default function ChatHead({ messages }) {
    const { user } = useSelector(state => state.auth)

    const { sender, receiver } = messages || {}
    const panterEmail = sender.email === user.email ? receiver.email : sender.email;
    const panterName = sender.email === user.email ? receiver.name : sender.name;
    return (
        <div className="relative flex items-center p-3 border-b border-gray-300">
            <img
                className="object-cover w-10 h-10 rounded-full"
                alt={panterName}
                src={getAvater(panterEmail, {
                    size: 80
                })}
            />
            <span className="block ml-2 font-bold text-gray-600">{panterName}</span>
        </div>
    );
}
