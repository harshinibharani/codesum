import React, { useState, useContext, useEffect } from 'react';
import { OpenAI } from 'openai';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions
} from '@mui/material';
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

function Dashboard() {
    const [code, setCode] = useState('');
    const [numberOfSummaries, setNumberOfSummaries] = useState('1');
    const [summaries, setSummaries] = useState([]);
    const [selectedSummary, setSelectedSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [feedback, setFeedback] = useState('');
    const [usefulness, setUsefulness] = useState('');
    const [consistency, setConsistency] = useState('');
    const [naturalness, setNaturalness] = useState('');
    const [formValid, setFormValid] = useState(false);

    const openai = new OpenAI({
        apiKey: process.env.REACT_APP_API_KEY, dangerouslyAllowBrowser: true
    });

    const fetchSummaries = async () => {
        setLoading(true);
        const system_prompt = `give ${numberOfSummaries} code summaries for the below code as a paragraph, each paragraph separated by '$$'`;
        const user_input = `Input - ${code} Output -`;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ "role": "system", "content": system_prompt }, { "role": "user", "content": user_input }]
            });

            if (response.choices && response.choices.length > 0 && response.choices[0].message) {
                const summaryText = response.choices[0].message.content;
                const summariesArray = summaryText.split('$$').map(s => s.trim()).filter(s => s !== "");
                setSummaries(summariesArray);
            } else {
                throw new Error("No valid summary received.");
            }
        } catch (error) {
            console.error('Error fetching summaries:', error);
            setSummaries(['Error fetching summaries']);
        }
        setLoading(false);
    };

    const handleSummarySelection = (index) => setSelectedSummary(index);

    const handleSubmit = (event) => {
        event.preventDefault();
        fetchSummaries();
    };

    const resetForm = () => {
        setCode('');
        setSummaries([]);
        setSelectedSummary(null);
        setFeedback('');
        setUsefulness('');
        setConsistency('');
        setNaturalness('');
        setNumberOfSummaries('1'); // Resetting the dropdown value to '1' 
    };


    const saveSelectedSummary = async () => {

        if (selectedSummary !== null) {
            const selectedData = summaries[selectedSummary];
            try {
                const response = await fetch('http://localhost:4000/saveUserHistory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user._id,
                        inputCode: code,
                        selectedSummary: selectedData,
                        feedback,
                        naturalness,
                        usefulness,
                        consistency
                    })
                });
                const data = await response.json();
                resetForm();
            } catch (error) {
                console.error('Error saving feedback:', error);
            }
        } else {
            alert('No summary selected!');
        }
    };

    const handleHistoryClick = () => navigate('/history');
    const handleLogout = () => {
        setUser(null);
        navigate('/login');
    };

    // Validate form fields
    const validateForm = () => {
        setFormValid(usefulness && naturalness && consistency);
    };

    // Update form validity on field change
    useEffect(() => {
        validateForm();
    }, [usefulness, naturalness, consistency]);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ backgroundColor: 'linear-gradient(135deg, #287279, #01b7c1)', minHeight: '100vh' }}>
                <nav className="sticky">
                    <div className="nav-content">
                        <div className="title">
                            <a href="#">Dashboard</a>
                        </div>
                        <ul className="nav-links">
                            <li><a href="#" onClick={handleHistoryClick}>My History</a></li>
                            <li><a href="#" onClick={handleLogout}>Logout</a></li>
                        </ul>
                    </div>
                </nav>
                <Box sx={{ px: 4, py: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Hi, {user ? user.username : 'Guest'} 👋
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            id="codeBox"
                            label="Code"
                            multiline
                            rows={6}
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <FormControl fullWidth margin="normal" variant="outlined">
                            <InputLabel id="summaryCount-label" shrink={true}>Number of Summaries</InputLabel>
                            <Select
                                labelId="summaryCount-label"
                                id="summaryCount"
                                value={numberOfSummaries}
                                onChange={e => setNumberOfSummaries(e.target.value)}
                                label="Number of Summaries"
                            >
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(number => (
                                    <MenuItem key={number} value={number}>
                                        {number}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button type="submit" variant="contained" color="primary" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Submit'}
                        </Button>
                        <Button type="button" onClick={resetForm} variant="outlined" sx={{ ml: 2 }}>
                            Clear
                        </Button>
                    </form>

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Summaries
                        </Typography>
                    </Box>
                    {loading ? (
                        <CircularProgress />
                    ) : summaries.length > 0 ? (
                        <Grid container spacing={2}>
                            {summaries.map((summary, index) => (
                                <Grid key={index} item xs={12} sm={6} md={4}>
                                    <Card
                                        variant="outlined" sx={{ cursor: 'pointer', backgroundColor: '#f8f9fa', border: selectedSummary === index ? '2px solid #01b7c1' : '2px solid transparent' }}
                                        onClick={() => handleSummarySelection(index)}
                                    >
                                        <CardContent>
                                            <Typography variant="body1" gutterBottom sx={{ textAlign: 'justify' }}>
                                                <strong>Summary {index + 1}</strong>
                                                <br />
                                                {summary}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button size="small">Select</Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography>No summary available.</Typography>
                    )}
                    {selectedSummary !== null && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Feedback
                            </Typography>
                            <TextField
                                label="Feedback"
                                multiline
                                rows={4}
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                fullWidth
                                margin="normal"
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth margin="normal" >
                                        <InputLabel id="usefulness-label" >Usefulness</InputLabel>
                                        <Select
                                            labelId="usefulness-label"
                                            value={usefulness}
                                            label="Usefulness"
                                            onChange={e => setUsefulness(e.target.value)}
                                        >
                                            {[1, 2, 3, 4, 5].map(value => (
                                                <MenuItem key={value} value={value}>
                                                    {value}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth margin="normal" >
                                        <InputLabel id="consistency-label">Consistency</InputLabel>
                                        <Select
                                            labelId="consistency-label"
                                            value={consistency}
                                            label="Consistency"
                                            onChange={e => setConsistency(e.target.value)}
                                        >
                                            {[1, 2, 3, 4, 5].map(value => (
                                                <MenuItem key={value} value={value}>
                                                    {value}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="naturalness-label">Naturalness</InputLabel>
                                        <Select
                                            labelId="naturalness-label"
                                            value={naturalness}
                                            label="Naturalness"
                                            onChange={e => setNaturalness(e.target.value)}
                                        >
                                            {[1, 2, 3, 4, 5].map(value => (
                                                <MenuItem key={value} value={value}>
                                                    {value}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Button onClick={saveSelectedSummary} variant="contained" color="secondary" sx={{ mt: 2 }} disabled={!formValid}>
                                Save Feedback
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default Dashboard;
