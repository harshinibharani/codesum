import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Button
} from '@mui/material';
import './styles/Navbar.css'; // Import your custom Navbar CSS

function HistoryPage() {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`http://localhost:4000/getUserHistory?userId=${user._id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch history');
                }
                const data = await response.json();
                setHistory(data.history);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (user && user._id) {
            fetchHistory();
        } else {
            setError('No user data available');
            setLoading(false);
        }
    }, [user]);

    if (loading) return <CircularProgress />;
    if (error) return <div>Error: {error}</div>;

    const handleDashboardClick = () => {
        navigate('/dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        navigate('/login');
    };

    return (
        
<Box sx={{ backgroundColor: 'linear-gradient(135deg, #287279, #01b7c1)', minHeight: '100vh' }}>            <nav className="sticky">
                <div className="nav-content">
                    <div className="title">
                        <a href="#">My History</a>
                    </div>
                    <ul className="nav-links">
                        <li><a href="#" onClick={handleDashboardClick}>Dashboard</a></li>
                        <li><a href="#" onClick={handleLogout}>Logout</a></li>
                    </ul>
                </div>
            </nav>
            <div style={{ padding: '50px' }}>
            {history.length > 0 ? (
                <Grid container spacing={2}>
                    {history.map((item, index) => (
                        <Grid key={index} item xs={12} sm={6} md={4}>
                            <Card sx={{ height: 350, backgroundColor: '#f8f9fa' }}>
                                <CardContent sx={{ maxHeight: 300, overflowY: 'auto' }}>
                                    <Typography variant="h6" component="div">
                                        Input Code
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.inputCode}
                                    </Typography>
                                    <Typography variant="h6" component="div">
                                        Summary
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.selectedSummary}
                                    </Typography>
                                    <Typography variant="h6" component="div">
                                        Feedback
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.feedback}
                                    </Typography>
                                    <Typography variant="h6" component="div">
                                        Usefulness
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.usefulness}
                                    </Typography>
                                    <Typography variant="h6" component="div">
                                        Naturalness
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.naturalness}
                                    </Typography>
                                    <Typography variant="h6" component="div">
                                        Consistency
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.consistency}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="body1">No history found.</Typography>
            )}
            </div>
        </Box>
        
    );
}

export default HistoryPage;