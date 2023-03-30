import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PrivateRouter from "./components/PrivateRouter";
import PublicRouter from "./components/PublicRouter";
import useAuthCheck from "./hooks/useAuthCheck";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
    const authCheck=useAuthCheck()
    return !authCheck ? <div>CheckAuthtication...........</div> :
    (
        <Router>
            <Routes>
                <Route path="/" element={<PublicRouter><Login /></PublicRouter>} />
                <Route path="/register" element={<PublicRouter><Register /></PublicRouter>} />
                <Route path="/inbox" element={<PrivateRouter><Conversation /></PrivateRouter>} />
                <Route path="/inbox/:id" element={<PrivateRouter><Inbox /></PrivateRouter>} />
            </Routes>
        </Router>
    );
}

export default App;
