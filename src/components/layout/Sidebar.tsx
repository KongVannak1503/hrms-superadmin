import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';
import logo from '../../assets/logo.png';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const STORAGE_BASE_URL = API_BASE_URL.replace('/api', '') + '/storage/';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { isPinned, setIsPinned, isHovered, setIsHovered } = useLayout();
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    const getAvatarUrl = () => {
        if (user?.profile_image) {
            return `${STORAGE_BASE_URL}${user.profile_image}`;
        }
        return null;
    };

    const rawRole = user?.role;
    const userRole = typeof rawRole === 'string' ? rawRole : rawRole?.name ?? 'super_admin';

    // Sidebar is expanded if pinned OR hovered
    const isExpanded = isPinned || isHovered;

    const toggleMenu = (label: string) => {
        if (!isExpanded) return;
        setExpandedMenus(prev => 
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        );
    };

    const allMenuItems = [
        { label: 'Dashboard', icon: 'pi pi-objects-column', path: '/', roles: ['super_admin'] },
        { label: 'Companies', icon: 'pi pi-building', path: '/companies', roles: ['super_admin'] },
    ];

    const menuItems = allMenuItems.filter(item => !item.roles || item.roles.includes(userRole));

    const allGroupedItems = [
        {
            label: 'System Management',
            icon: 'pi pi-server',
            roles: ['super_admin'],
            children: [
                { label: 'Global Config', icon: 'pi pi-sliders-h', path: '/settings/global' },
                { label: 'All Users', icon: 'pi pi-users', path: '/settings/users/all' },
                { label: 'Super Admins', icon: 'pi pi-shield', path: '/settings/users' },
                { label: 'Audit Trail', icon: 'pi pi-history', path: '/settings/audit' },
            ]
        }
    ];

    const groupedItems = allGroupedItems.filter(group => !group.roles || group.roles.includes(userRole));

    // Automatically expand parent menus when a child item is active
    useEffect(() => {
        const activeGroups: string[] = [];
        groupedItems.forEach(group => {
            const hasActiveChild = group.children.some(child => 
                location.pathname === child.path || (child.path !== '/' && location.pathname.startsWith(child.path))
            );
            if (hasActiveChild) {
                activeGroups.push(group.label);
            }
        });
        
        setExpandedMenus(prev => Array.from(new Set([...prev, ...activeGroups])));
    }, [location.pathname]);

    const renderItem = (item: any, isChild = false) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        const hasChildren = item.children && item.children.length > 0;
        const isMenuExpanded = expandedMenus.includes(item.label);

        return (
            <div key={item.label} className={isChild ? "mb-1" : "mb-2"}>
                <div 
                    onClick={() => hasChildren ? toggleMenu(item.label) : item.action ? item.action() : navigate(item.path)}
                    className={`flex align-items-center justify-content-between cursor-pointer transition-colors transition-duration-200 border-round-xl px-3 py-2 ${
                        isActive 
                            ? 'bg-blue-50 text-blue-600 font-bold shadow-1' 
                            : 'text-700 hover:bg-gray-100 font-medium'
                    }`}
                    style={{ 
                        marginLeft: isChild ? '1rem' : '0',
                        color: isActive ? '#3B82F6' : '#64748B'
                    }}
                >
                    <div className="flex align-items-center">
                        {item.icon && <i className={`${item.icon} ${isChild ? 'text-sm' : 'text-lg'} mr-3`} style={{ color: isActive ? '#3B82F6' : '#64748B' }}></i>}
                        <span className="text-sm">{item.label}</span>
                    </div>
                    {hasChildren && (
                        <i className={`pi pi-chevron-${isMenuExpanded ? 'down' : 'right'} text-xs ${isActive ? 'text-blue-700' : 'text-400'}`}></i>
                    )}
                </div>
                
                {hasChildren && isMenuExpanded && (
                    <div className="flex flex-column mt-2">
                        {item.children.map((child: any) => renderItem(child, true))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div 
            className="h-full transition-all transition-duration-300 flex-shrink-0 relative" 
            style={{ width: isExpanded ? '16rem' : '0', zIndex: 90 }}
            onMouseEnter={() => !isPinned && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                className={`bg-white flex flex-column transition-all transition-duration-300 ${!isPinned && isHovered ? 'shadow-8' : ''}`}
                style={{ 
                    width: isExpanded ? '16rem' : '0', 
                    position: 'absolute', // Always absolute relative to the wrapper
                    left: 0,
                    top: 0, 
                    height: '100vh',
                    zIndex: 100,
                    overflow: 'hidden',
                    borderRight: '1px solid #e2e8f0'
                }}
            >
                {/* Content Container */}
                <div className={`flex flex-column h-full transition-opacity transition-duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="h-5rem px-4 flex align-items-center justify-content-between flex-shrink-0" style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <div className="flex align-items-center gap-3">
                            <div className="flex align-items-center justify-content-center !rounded-circle overflow-hidden shadow-1" style={{ width: '40px', height: '40px', backgroundColor: "#000" }}>
                                <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="text-xl font-black text-900 tracking-tight">BAROM.ME</div>
                        </div>
                        {isPinned && (
                            <div 
                                onClick={() => {
                                    setIsPinned(false);
                                    setIsHovered(false);
                                }} 
                                className="p-2 border-round-xl hover:bg-gray-100 cursor-pointer text-600 transition-colors"
                            >
                                <i className="pi pi-align-left"></i>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                        <div className="text-xs font-bold text-500 uppercase tracking-widest mb-3 mt-2 pl-3">Overview</div>
                        {menuItems.map(item => renderItem(item, false))}
                        
                        <div className="mt-5">
                            <div className="text-xs font-bold text-500 uppercase tracking-widest mb-3 pl-3">Administration</div>
                            {groupedItems.map(group => (
                                <div key={group.label}>
                                    {renderItem(group)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom User Area */}
                    <div className="p-4 bg-gray-50" style={{ borderTop: '1px solid #e2e8f0' }}>
                        <div className="flex align-items-center gap-3">
                            <Avatar 
                                image={getAvatarUrl() || undefined} 
                                label={!getAvatarUrl() ? user?.name?.charAt(0).toUpperCase() : undefined} 
                                shape="circle" 
                                className="shadow-1 border-1 border-100"
                                style={{ 
                                    width: '2.5rem', 
                                    height: '2.5rem', 
                                    backgroundColor: !getAvatarUrl() ? '#0F172A' : 'transparent', 
                                    color: '#ffffff',
                                    flexShrink: 0
                                }}
                            />
                            <div className="flex flex-column overflow-hidden">
                                <span className="text-900 font-bold text-sm truncate">{user?.name || 'Super Admin'}</span>
                                <span className="text-500 text-xs truncate">Master Access</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #4b5563; }
                .w-2-5rem { width: 2.5rem; }
                .h-2-5rem { height: 2.5rem; }
            `}</style>
        </div>
    );
};

export default Sidebar;
