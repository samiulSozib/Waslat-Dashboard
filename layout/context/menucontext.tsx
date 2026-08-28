// context/menucontext.tsx
import { ChildContainerProps, MenuContextProps } from '@/types';
import { usePathname } from 'next/navigation';
import { createContext, useEffect, useState } from 'react';

export const MenuContext = createContext({} as MenuContextProps);

export const MenuProvider = ({ children }: ChildContainerProps) => {
    const [activeMenu, setActiveMenu] = useState('');
    const [isNavigating, setIsNavigating] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Clear navigating flag when the route actually changes
        if (isNavigating) {
            setIsNavigating(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    useEffect(() => {
        // remove global body lock when navigation finished
        if (!isNavigating) {
            try {
                document.body.classList.remove('menu-navigating');
            } catch (err) { }
        }
    }, [isNavigating]);

    const value = {
        activeMenu,
        setActiveMenu,
        isNavigating,
        setIsNavigating
    };

    return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};
