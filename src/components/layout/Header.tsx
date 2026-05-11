import { useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const STORAGE_BASE_URL = API_BASE_URL.replace('/api', '') + '/storage/';

const Header = () => {
    const { user, logout } = useAuth();
    const { isPinned, setIsPinned } = useLayout();
    const navigate = useNavigate();
    const menu = useRef<Menu>(null);

    const getAvatarUrl = () => {
        if (user?.profile_image) {
            return `${STORAGE_BASE_URL}${user.profile_image}`;
        }
        return null;
    };

    const menuItems = [
        {
            template: (_item: any) => {
                return (
                    <div className="flex flex-column align-items-center p-4 border-bottom-1 border-100">
                        <Avatar 
                            image={getAvatarUrl() || undefined} 
                            label={!getAvatarUrl() ? user?.name?.charAt(0).toUpperCase() : undefined} 
                            shape="circle" 
                            style={{ width: '64px', height: '64px', backgroundColor: '#0F172A', color: '#ffffff', fontSize: '1.5rem' }} 
                            className="font-bold shadow-2 mb-3 border-2 border-white"
                        />
                        <div className="flex flex-column align-items-center text-center">
                            <span className="font-bold text-900 uppercase tracking-tight" style={{ fontSize: '1.1rem' }}>{user?.name}</span>
                            <span className="text-500 text-sm mt-1">{user?.email}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            label: 'Profile',
            icon: 'pi pi-user',
            className: 'text-sm mt-1'
        },
        {
            label: 'Account settings',
            icon: 'pi pi-cog',
            className: 'text-sm'
        },
        {
            separator: true
        },
        {
            label: 'Log out',
            icon: 'pi pi-sign-out',
            className: 'text-sm mb-1',
            command: () => {
                logout();
                navigate('/login');
            }
        }
    ];

    return (
        <div className="h-5rem bg-white flex align-items-center justify-content-between px-5 sticky top-0 z-5" style={{ borderBottom: '1px solid #e2e8f0' }}>
            <div className="flex align-items-center h-full gap-4">
                {!isPinned && (
                    <Button icon="pi pi-bars" text rounded onClick={() => setIsPinned(true)} className="text-600 hover:bg-gray-100" />
                )}
                
                <h2 className="m-0 text-xl font-bold text-700 hidden md:block">Workspace Configuration</h2>
            </div>
            
            <div className="flex align-items-center gap-4">
                <span className="p-input-icon-left w-full max-w-20rem hidden md:block">
                    <i className="pi pi-search" style={{ color: '#64748B' }} />
                    <InputText 
                        placeholder="Search anywhere..." 
                        className="w-full border-round-2xl border-none px-4 py-2 font-medium" 
                        style={{ height: '2.5rem', backgroundColor: '#F1F5F9', color: '#0F172A', fontSize: '0.85rem' }}
                    />
                </span>

                <div className="flex align-items-center gap-2 pl-4 ml-2" style={{ borderLeft: '1px solid #e2e8f0' }}>
                    <Button icon="pi pi-bell" rounded text className="hover:bg-gray-100 w-2-5rem h-2-5rem relative" style={{ color: '#64748B' }}>
                        <span className="absolute bg-red-500 border-circle w-10px h-10px border-2 border-white" style={{ top: '6px', right: '8px' }}></span>
                    </Button>
                    <Button icon="pi pi-cog" rounded text className="hover:bg-gray-100 w-2-5rem h-2-5rem" style={{ color: '#64748B' }} />
                    
                    <div className="cursor-pointer ml-3 transition-colors" onClick={(e) => menu.current?.toggle(e)}>
                        <Avatar 
                            image={getAvatarUrl() || undefined}
                            label={!getAvatarUrl() ? user?.name?.charAt(0).toUpperCase() : undefined} 
                            shape="circle" 
                            size="large"
                            className="text-white font-bold shadow-1 border-2 border-white" 
                            style={{ backgroundColor: '#0F172A' }}
                        />
                    </div>
                    <Menu model={menuItems} popup ref={menu} className="shadow-4 border-round-2xl mt-2 border-none" style={{ width: '280px' }} />
                </div>
            </div>
            <style>{`
                .w-2-5rem { width: 2.5rem; }
                .h-2-5rem { height: 2.5rem; }
            `}</style>
        </div>
    );
};

export default Header;
