import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PrivateRouter = ({children}) => {
    const isLoggedIn=useAuth()
    return isLoggedIn ? children : <Navigate to="/"/>
};

export default PrivateRouter;