import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ProgressSpinner } from 'primereact/progressspinner';

const AuthLayout = () => {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
            </div>
        );
    }

    return (
        <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
            <Outlet />
        </div>
    );
};

export default AuthLayout;
