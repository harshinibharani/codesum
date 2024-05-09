import React, { createContext, useState, useMemo } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const value = useMemo(() => ({ user, setUser }), [user]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
