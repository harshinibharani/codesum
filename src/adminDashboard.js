// In a new file called AdminDashboard.js
import {React, useContext, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';


function AdminDashboard() {
    const { user, setUser } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [userHistories, setUserHistories] = useState([]);
    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch('http://localhost:4000/getAllUsers');
            const data = await response.json();
            setUsers(data.users);
        };

        fetchUsers();
    }, []);

    const navigate = useNavigate();

    const handleLogout = () => {
        setUser(null); // Clear user context
        navigate('/login'); // Redirect to login page
    };

    function handleCheckboxChange(userId) {
        setSelectedUsers(prevSelectedUsers => {
            const newSelectedUsers = new Set(prevSelectedUsers);
            if (newSelectedUsers.has(userId)) {
                newSelectedUsers.delete(userId);
            } else {
                newSelectedUsers.add(userId);
            }
            return newSelectedUsers;
        });
    }
    const fetchSelectedUsersHistory = async () => {
        const histories = await Promise.all(
            Array.from(selectedUsers).map(async (userId) => {
                const response = await fetch(`http://localhost:4000/getUserHistory?userId=${userId}`);
                const data = await response.json();
                return { username: users.find(u => u._id === userId).username, history: data.history };
            })
        );
        setUserHistories(histories);
    };
    const goToManageRoles = () => {
        navigate('/manage-roles'); 
    };

    return (
        <div>
            <h1>Admin Dashboard{user?user.username:'Guest'}</h1>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={goToManageRoles}>Manage Roles</button>

            {users.map(user => (
                <div key={user._id}>
                    <input
                        type="checkbox"
                        checked={selectedUsers.has(user._id)}
                        onChange={() => handleCheckboxChange(user._id)}
                    />
                    {user.username}
                </div>
            ))}
            <button onClick={fetchSelectedUsersHistory}>Show Selected Users' History</button>
            {userHistories.map(u => (
                <div key={u.username}>
                    <h3>History for {u.username}</h3>
                    <ul>
                        {u.history.map((item, index) => (
                            <li key={index}>
                                {item.inputCode} - {item.selectedSummary}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
    
    
    
}

export default AdminDashboard;
