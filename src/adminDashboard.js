import { React, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import MyChart from './MyChart';
import './styles/Navbar.css';

import './styles/UserCard.css';
import './styles/AdminTable.css';
import CardContent from '@mui/material/CardContent';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
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

function AdminDashboard() {
    const { user, setUser } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [userHistories, setUserHistories] = useState([]);
    const [displayMessage, setDisplayMessage] = useState('No user selected');

    const [totalVisits, setTotalVisits] = useState(0); // Placeholder for total visits


    const [averages, setAverages] = useState({ naturalness: 0, consistency: 0, usefulness: 0 });

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await fetch('http://localhost:4000/getAllUsers');
            const data = await response.json();
            // Filter out the logged-in user from the list
            const filteredUsers = data.users
                .filter(u => u._id !== user._id) // Ensure the current user is not in the list
                .map(u => ({ ...u, isLoading: false })); // Add an isLoading property for UI feedback
            setUsers(filteredUsers);
        };

        const fetchTotalVisits = async () => {
            // Placeholder fetch function
            const response = await fetch('http://localhost:4000/getTotalVisits');
            const data = await response.json();
            setTotalVisits(data.totalVisits);
        };

        fetchUsers();
        fetchTotalVisits();
    }, [user._id]);

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
                const user1 = users.find(u => u._id === userId);
                if (!data.history || data.history.length === 0) {
                    // Properly handle the case where there is no history
                    return { username: user1.username, history: [], message: 'No history to display' };
                }
                return { username: user1.username, history: data.history };
            })
        );
        setUserHistories(histories);
    };
    const goToManageRoles = () => {
        navigate('/manage-roles');
    };

    const selectAllUsers = () => {
        const allUserIds = new Set(users.map(user => user._id));
        setSelectedUsers(allUserIds);
        computeAveragesForAllUsers();
    };

    const clearAllSelections = () => {
        setSelectedUsers(new Set());
        setUserHistories([]);  // Clear user histories
        setAverages({ naturalness: 0, consistency: 0, usefulness: 0 });  // Reset averages
        setDisplayMessage('No user selected or no histories available');
    };



    // Function to fetch histories and compute averages for all users
    const computeAveragesForAllUsers = async () => {
        const response = await fetch(`http://localhost:4000/getAllUserHistories`);
        const data = await response.json();
        calculateAverages(data.histories);
    };

    // Function to fetch histories and compute averages for selected users
    const computeAveragesForSelectedUsers = async () => {
        const promises = Array.from(selectedUsers).map(userId =>
            fetch(`http://localhost:4000/getUserHistory?userId=${userId}`).then(res => res.json())
        );
        const results = await Promise.all(promises);
        let histories = results.flatMap(result => result.history);
        calculateAverages(histories);
    };

    // Helper function to calculate averages
    const calculateAverages = (histories) => {

        if (histories.length === 0) {
            setAverages({ naturalness: 0, consistency: 0, usefulness: 0 });
            setDisplayMessage('No user selected or no histories available');
            return;
        }
        let totalNaturalness = 0, totalConsistency = 0, totalUsefulness = 0, count = 0;
        histories.forEach(history => {
            totalNaturalness += parseFloat(history.naturalness);
            totalConsistency += parseFloat(history.consistency);
            totalUsefulness += parseFloat(history.usefulness);
            count++;
        });
        if (count === 0) {
            setDisplayMessage('No user selected or no histories available');
            return;
        }
        const avgNaturalness = totalNaturalness / count;
        const avgConsistency = totalConsistency / count;
        const avgUsefulness = totalUsefulness / count;

        setAverages({
            naturalness: avgNaturalness.toFixed(2),
            consistency: avgConsistency.toFixed(2),
            usefulness: avgUsefulness.toFixed(2)
        });
        setDisplayMessage('');
    };

    return (
        <ThemeProvider theme={theme}>
            <div>
                <nav className="sticky">
                    <div className="nav-content">
                        <div className="title">
                            <a href="#">Admin Dashboard</a>
                        </div>
                        <ul className="nav-links">
                            <li><a href="#" onClick={goToManageRoles}>Manage Roles</a></li>
                            <li><a href="#" onClick={handleLogout}>Logout</a></li>
                        </ul>
                    </div>
                </nav>
                <div style={{ padding: '20px' }}> {/* Adds padding around the entire content */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h4" gutterBottom>
                                Hi, {user ? user.username : 'Guest'} 👋
                            </Typography>
                            <div className="dashboard">
                                <div className="card">
                                    <img src='/images/account.png' style={{ width: 100, height: 100 }}></img> {/* Example: Emoji as an icon */}
                                    <div className="users">{users.length + 1}</div>
                                    <div className="label">New Users</div>
                                </div>

                                <div className="card">
                                    <img src='/images/login.png' style={{ width: 100, height: 100 }}></img> {/* Example: Emoji as an icon */}
                                    <div className="users">{totalVisits}</div>
                                    <div className="label">Total Visits</div>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div style={{ paddingTop: '55px' }}>
                                <div className="card-chart">
                                    <MyChart />
                                </div>
                            </div>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <div>
                                <div class="tbl-header">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th >Select</th>
                                                <th >Username</th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                                <div class="tbl-content">
                                    <table>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user._id}>
                                                    <td >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.has(user._id)}
                                                            onChange={() => handleCheckboxChange(user._id)}
                                                        />
                                                    </td>
                                                    <td >
                                                        {user.username}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ paddingTop: '45px' }}>
                                    <Button variant="contained" onClick={fetchSelectedUsersHistory} color='primary' sx={{ mr: 4, ml: 30 }}>Show History</Button>
                                    <Button variant="outlined" color='secondary' onClick={clearAllSelections}>Clear</Button>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box>

                            </Box>

                            {/* <Typography variant="h6" sx={{ mt: 2 }}>Averages</Typography> */}
                            <div className="card-average">
                                <Typography variant="h4" gutterBottom>
                                    Code Rating Averages
                                </Typography>
                                <div style={{ paddingTop: '35px' }}></div>
                                <img src='/images/code.png' style={{ width: 100, height: 100 }} alt="Analytics Icon" />
                                <div className="content">
                                    {displayMessage ? (
                                        <div className="stats-container"> {/* Flex container for each stat */}
                                            <div className="stat">
                                                <div className="number">-</div>
                                                <div className="label">Naturalness</div>
                                            </div>
                                            <div className="stat">
                                                <div className="number">-</div>
                                                <div className="label">Consistency</div>
                                            </div>
                                            <div className="stat">
                                                <div className="number">-</div>
                                                <div className="label">Usefulness</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="stats-container"> {/* Flex container for each stat */}
                                            <div className="stat">
                                                <div className="number">{averages.naturalness}</div>
                                                <div className="label">Naturalness</div>
                                            </div>
                                            <div className="stat">
                                                <div className="number">{averages.consistency}</div>
                                                <div className="label">Consistency</div>
                                            </div>
                                            <div className="stat">
                                                <div className="number">{averages.usefulness}</div>
                                                <div className="label">Usefulness</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ paddingTop: '35px' }}>
                                <Button variant="contained" onClick={selectAllUsers} sx={{ mr: 10, ml: 15 }}>All User's Average</Button>
                                <Button variant="contained" onClick={computeAveragesForSelectedUsers}>Compute Average</Button>
                            </div>

                        </Grid>
                    </Grid>
                    {userHistories.map(u => (
                        <Box key={u.username} sx={{ mt: 2 }}>
                            {/* <Typography variant="h4" sx={{ mb: 2 }}> */}
                            <Typography variant="h4" gutterBottom>
                                {u.username}'s History
                            </Typography>
                            {u.history && u.history.length > 0 ? (
                                <Grid container spacing={2}>
                                    {u.history.map((item, index) => (
                                        <Grid item key={index} xs={12} sm={6} md={4}>
                                            <Card variant="outlined" sx={{
                                                height: 350, cursor: 'pointer', backgroundColor: '#f8f9fa'
                                            }}>
                                                <CardContent sx={{ maxHeight: 300, overflowY: 'auto' }}>
                                                    <Typography variant="h6" component="div">
                                                        Input Code
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify' }}>
                                                        {item.inputCode}
                                                    </Typography>
                                                    <Typography variant="h6" component="div">
                                                        Summary
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify' }}>
                                                        {item.selectedSummary}
                                                    </Typography>
                                                    <Typography variant="h6" component="div">
                                                        Feedback
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify' }}>
                                                        {item.feedback}
                                                    </Typography>
                                                    <Typography variant="h6" component="div">
                                                        Usefulness
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify' }}>
                                                        {item.usefulness}
                                                    </Typography>
                                                    <Typography variant="h6" component="div">
                                                        Naturalness
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify' }}>
                                                        {item.naturalness}
                                                    </Typography>
                                                    <Typography variant="h6" component="div">
                                                        Consistency
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify' }}>
                                                        {item.consistency}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography>{u.message || "No history found."}</Typography>
                            )}

                        </Box>
                    ))}


                </div>
            </div>
        </ThemeProvider>
    );


}

export default AdminDashboard;