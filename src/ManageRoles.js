
import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from './UserContext'; // Assuming UserContext is set up to provide user data

function ManageRoles() {
    const { user } = useContext(UserContext); // Accessing user from context

    // return (
    //     <div>
    //         <h1>Hello, {user ? user.username : 'Guest'}!</h1>
    //     </div>
    // );

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const response = await fetch('http://localhost:4000/getAllUsers');
        const data = await response.json();
        setUsers(data.users.map(user => ({ ...user, isLoading: false }))); // Add an isLoading property for UI feedback
        setLoading(false);
    };

    const handleChangeRole = async (user, newRole) => {
        setUsers(users => users.map(u => u._id === user._id ? { ...u, isLoading: true } : u)); // Set loading state for specific user
        const response = await fetch(`http://localhost:4000/changeUserRole`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id, role: newRole })
        });
        const result = await response.json();
        if (result.success) {
            fetchUsers(); // Refresh the user list after role change
        } else {
            alert('Failed to change role');
            setUsers(users => users.map(u => ({ ...u, isLoading: false }))); // Reset loading state
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1>Manage User Roles {user ? user.username : 'Guest'}!!</h1>
            <ul>
                {users.map(user => (
                    <li key={user._id}>
                        {user.username} - Current Role: {user.role}
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={user.role === 'admin'}
                                onChange={() => handleChangeRole(user, user.role === 'admin' ? 'user' : 'admin')}
                                disabled={user.isLoading}
                            />
                            <span className="slider round"></span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );

}

export default ManageRoles;
