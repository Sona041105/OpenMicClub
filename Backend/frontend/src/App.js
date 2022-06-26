import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Navigation from './components/shared/Navigation/Navigation';
import Authenticate from './pages/Authenticate/Authenticate';
import Activate from './pages/Activate/Activate';
import Rooms from './pages/Rooms/Rooms';
import Room from './pages/Room/Room';
import { useSelector } from 'react-redux';
import { useLoadingWithRefresh } from './hooks/useLoadingWithReferesh';
import Loader from './components/shared/Loader/Loader';


function App() {
    // call refresh endpoint
    const { loading } = useLoadingWithRefresh();

   

     return loading ? (
        <Loader message="Loading, please wait.." />
    ) :(
        <BrowserRouter>
            <Navigation />
            <Routes>
            <Route path='/' element={<GuestRoute><Home/></GuestRoute>} />
            <Route path='/authenticate' element={<GuestRoute><Authenticate/></GuestRoute>} />
            <Route path='/activate' element={<SemiProtectedRoute><Activate/></SemiProtectedRoute>} />
            <Route path='/rooms' element={<ProtectedRoute><Rooms/></ProtectedRoute>} />
            <Route path='/room/:id' element={<ProtectedRoute><Room/></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

const GuestRoute = ({ children, ...rest }) => {
    const { isAuth } = useSelector((state) => state.auth);
    return (
      
         isAuth ? (
                    <Navigate
                       to="/rooms"
                    />
                ) : (
                    children
                )
    );
};

const SemiProtectedRoute = ({ children, ...rest }) => {
    const { user, isAuth } = useSelector((state) => state.auth);
    return (
                 !isAuth ? (
                    <Navigate
                        to='/'
                    />
                ) : isAuth && !user.activated ? (
                    children
                ) : (
                    <Navigate
                       to='/rooms'
                    />
                )
    );   
};

const ProtectedRoute = ({ children, ...rest }) => {
    const { user, isAuth } = useSelector((state) => state.auth);
    return (
        !isAuth ? (
                    <Navigate
                        to='/'
                    />
                ) : isAuth && !user.activated ? (
                    <Navigate
                        to="/activate"
                    />
                ) : (
                    children
                )
        
    );
};

export default App;