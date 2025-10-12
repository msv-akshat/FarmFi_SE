import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');

    if (!token || !user || !userType) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;