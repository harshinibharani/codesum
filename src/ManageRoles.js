import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, TextField } from '@mui/material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#01b7c1'
        },
        secondary: {
            main: '#287279'
        }
    },
    typography: {
        fontFamily: 'Poppins, sans-serif',
        h6: {
            fontWeight: 'bold'
        }
    }
});
function ManageRoles() {
    const { user, setUser } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
const [filteredUsers, setFilteredUsers] = useState([]);

const [openDialog, setOpenDialog] = useState(false);
const [newUser, setNewUser] = useState({ username: '', password: '' });


useEffect(() => {
    const fetchUsers = async () => {
        setLoading(true);
        const response = await fetch('http://localhost:4000/getAllUsers');
        const data = await response.json();
        const filteredData = data.users.filter(u => u._id !== user._id);
        setUsers(filteredData);
        setFilteredUsers(filteredData);
        setLoading(false);
    };
    fetchUsers();
}, [user._id]);

useEffect(() => {
    const filtered = users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredUsers(filtered);
}, [searchQuery, users]);


    const fetchUsers = async () => {
        setLoading(true);
        const response = await fetch('http://localhost:4000/getAllUsers');
        const data = await response.json();
        setUsers(data.users.filter(u => u._id !== user._id));
        setLoading(false);
    };

    const handleChangeRole = async (user, newRole) => {
        const updatedUsers = users.map(u => u._id === user._id ? { ...u, isLoading: true } : u);
        setUsers(updatedUsers);

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

    const handleLogout = () => {
        setUser(null);
        navigate('/login');
    };

    if (loading) return <p>Loading...</p>;
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };
    
    const handleCloseDialog = () => {
        setOpenDialog(false);
        // Reset newUser state to clear form fields
    setNewUser({ username: '', password: '' });
    };
    
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewUser(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    
    const handleCreateUser = async () => {
        try{
        const response = await fetch('http://localhost:4000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newUser, role: 'user' })
        });
        const data = await response.json();
        console.log('insside managa role',data);
        fetchUsers();  // Refresh the user list
        handleCloseDialog();
        } catch {
            alert('Failed to create user');
        }
    };
    
    const handleDeleteUser = async (userId) => {
        
        try {
            const response = await fetch(`http://localhost:4000/deleteUser/${userId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                // alert('User deleted successfully.');
                fetchUsers(); // Refresh the list after deletion
            } else {
                alert('Failed to delete user.');
            }
        }catch{
            alert('deletion error!');
        }
    };
    

    return (
        <ThemeProvider theme={theme}>
        <div>
            <nav className="sticky">
                <div className="nav-content">
                    <div className="title">
                        <a href="#">Manage Roles</a>
                    </div>
                    <ul className="nav-links">
                        <li><a href="#" onClick={() => navigate('/admin-dashboard')}>Admin Dashboard</a></li>
                        <li><a href="#" onClick={handleLogout}>Logout</a></li>
                    </ul>
                </div>
            </nav>
            <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ position: 'absolute', right: 20, top: 70 }}>
            Add New User
        </Button>
            <TextField
    label= " Search Users"
    variant="outlined"
    value={searchQuery}
    onChange={handleSearchChange}
    fullWidth={false}
    sx={{
        width: '15%', // Sets the width to 25% of its parent container
        margin: '20px 0',
        margin: '20px',// Adds margin to the top, right, bottom, and 20px to the left
        // Optional: If you need to adjust the entire inner padding including edges
        paddingLeft: '5px'
        
        
    }}
/>
<Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Add New User</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    name="username"
                    label="Username"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={newUser.username}
                    onChange={handleInputChange}
                />
                <TextField
                    margin="dense"
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={newUser.password}
                    onChange={handleInputChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleCreateUser}>Submit</Button>
            </DialogActions>
        </Dialog>

<TableContainer component={Paper} style={{ padding: '20px' }}>
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Username</TableCell>
                <TableCell align="right">Role</TableCell>
                <TableCell align="right">Actions</TableCell>
                <TableCell align="right">Delete</TableCell> {/* Additional header for delete */}
            </TableRow>
        </TableHead>
        <TableBody>
            {filteredUsers.map((user) => (
                <TableRow 
                    key={user._id} 
                    sx={{
                        backgroundColor: user.role === 'admin' ? '#f0f0f0' : '#fff',
                        '&:hover': {
                            backgroundColor: user.role === 'admin' ? '#e0e0e0' : '#f5f5f5'
                        }
                    }}
                >
                    <TableCell>
                        {user.username}
                    </TableCell>
                    <TableCell align="right">{user.role}</TableCell>
                    <TableCell align="right">
                        <Switch
                            checked={user.role === 'admin'}
                            onChange={() => handleChangeRole(user, user.role === 'admin' ? 'user' : 'admin')}
                            disabled={user.isLoading}
                        />
                    </TableCell>
                    <TableCell align="right">
                        <Button 
                             variant="outlined"  // Changed from 'outlined' to 'contained' for solid background
                             onClick={() => handleDeleteUser(user._id)}
                             sx={{
                                 color: 'black', // Ensures the text color is white
                                 borderColor: 'red', // Red border color
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 0, 0, 0.1)', // Light red background on hover
                                    borderColor: 'darkred' // Darker red border on hover
                                }
                             }}
                        >
                            Delete
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</TableContainer>

        </div>
        </ThemeProvider>
    );
    
}

export default ManageRoles;