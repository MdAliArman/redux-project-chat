import { useSelector } from "react-redux";
import Message from "./Message";

export default function Messages({messages =[]}) {
const auth=useSelector(state=>state.auth)
const {user}=auth || {}

    return (
        <div className="relative w-full h-[calc(100vh_-_197px)] p-6 overflow-y-auto flex flex-col-reverse">
            <ul className="space-y-2">
               
               {
                messages
                .slice()
                .sort((a, b)=> a.timestamp - b.timestamp)
                .map(message=>{
                    const {message:lastMessage ,sender,  id}= message || {}
                    const justify= sender.email !==user.email ? "start" : "end"

                    return( <Message justify={justify} message= {lastMessage} key={id}/>)
                })
               }
            </ul>
        </div>
    );
}
