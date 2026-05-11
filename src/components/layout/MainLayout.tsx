import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';
import { ProgressSpinner } from 'primereact/progressspinner';

const MainLayout = () => {
    const { loading } = useAuth();
    const { isPinned } = useLayout();

    if (loading) {
        return (
            <div className="flex align-items-center justify-content-center min-h-screen bg-gray-50">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex flex-column flex-1 min-w-0 h-screen relative bg-white" style={{ marginLeft: isPinned ? '0' : '0' }}>
                <Header />
                <main className="flex-1 py-4 px-0 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
