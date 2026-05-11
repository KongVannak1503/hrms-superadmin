import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
    isPinned: boolean;
    setIsPinned: (value: boolean) => void;
    isHovered: boolean;
    setIsHovered: (value: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPinned, setIsPinned] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <LayoutContext.Provider value={{ isPinned, setIsPinned, isHovered, setIsHovered }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};
