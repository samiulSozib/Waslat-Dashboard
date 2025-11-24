// context/menucontext.tsx
import React, { useState, createContext } from 'react';
import { ChildContainerProps, MenuContextProps } from '@/types';

export const MenuContext = createContext({} as MenuContextProps);

export const MenuProvider = ({ children }: ChildContainerProps) => {
    const [activeMenu, setActiveMenu] = useState('');
    const [isNavigating, setIsNavigating] = useState(false);

    const value = {
        activeMenu,
        setActiveMenu,
        isNavigating,
        setIsNavigating
    };

    return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};