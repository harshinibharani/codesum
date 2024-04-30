import React, { useState, useContext } from 'react';
import {OpenAI} from 'openai';
// import { useLocation } from 'react-router-dom';
import { UserContext } from './UserContext';
import { useNavigate } from 'react-router-dom';


function Dashboard() {

    // const location = useLocation();
    // const userData = location.state?.userData;
    const [code, setCode] = useState('');
    const [numberOfSummaries, setNumberOfSummaries] = useState('1');
    const [summaries, setSummaries] = useState([]);
    const [selectedSummary, setSelectedSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    // console.log("in dash",userData);

    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [feedback, setFeedback] = useState('');
    const [usefulness, setUsefulness] = useState('');
    const [consistency, setConsistency] = useState('');
    const [naturalness, setNaturalness] = useState('');


    const openai = new OpenAI({
        apiKey: process.env.REACT_APP_API_KEY , dangerouslyAllowBrowser: true // Ensure your API key is stored securely
});
    // const openai = new OpenAI(config);

    const fetchSummaries = async () => {
        console.log("Starting to fetch summaries...");
        setLoading(true);
        const system_prompt = `give ${numberOfSummaries} code summaries for the below code as a paragraph, each paragraph seperated by '$$'`;
        const user_input = `Input - ${code} Output -`;
        console.log(`Generated system prompt: ${system_prompt}`);
        console.log(`User input for API: ${user_input}`);

        
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages : [{"role": "system", "content":system_prompt},
                {"role": "user", "content":user_input}]
            });

            console.log("API response received:", response);
            console.log(response.choices[0].message.content);
            if (response.choices && response.choices.length > 0 && response.choices[0].message) {
                console.log("API response received:", response);
                const summaryText = response.choices[0].message.content;
                console.log("Raw summary text:", summaryText);
                const summariesArray = summaryText.split('$$').map(s => s.trim()).filter(s => s !== "");
                console.log("Summaries array:", summariesArray);
                setSummaries(summariesArray);
            } else {
                throw new Error("No valid summary received.");
            }
            console.log("Summary set in state.");
        } catch (error) {
            console.error('Error fetching summaries:', error);
            setSummaries(['Error fetching summaries']);
            console.log("Error details set in state.");
        }
        setLoading(false);
        console.log("Fetching summaries completed. Loading state updated.");
    };

    const handleSummarySelection = (index) => {
        setSelectedSummary(index);
        console.log(`Selected summary ${index + 1}: ${summaries[index]}`);
    };    

    
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Form submitted with code:", code);
        console.log(`Requested number of summaries: ${numberOfSummaries}`);
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
    };
    
    const saveSelectedSummary = async () => {
        if (!usefulness) {
            alert('Please select a rating for usefulness.');
            return;
        }
        if (!naturalness) {
            alert('Please select a rating for naturalness.');
            return;
        }
        if (!consistency) {
            alert('Please select a rating for consistency.');
            return;
        }
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
                        feedback: feedback,
                        naturalness: naturalness,
                        usefulness: usefulness,
                        consistency: consistency
                    })
                });
                const data = await response.json();
                console.log(data.message);
                alert('Feedback saved successfully!');
            } catch (error) {
                console.error('Error saving feedback:', error);
                alert('Failed to save feedback.');
            }
        } else {
            alert('No summary selected!');
        }
    };
    const handleHistoryClick = () => {
        // Navigate to HistoryPage
        navigate('/history');
    };

    const handleLogout = () => {
        // Clear the user context
        setUser(null);
        // Redirect to the login page
        navigate('/login');
    };

    return (
        <div>
            <h1>Dashboard {user ? user.username : 'Guest'}!!</h1>
            <button onClick={handleHistoryClick}>View History</button>
            <button onClick={handleLogout}>Logout</button>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="codeBox">Code:</label>
                    <textarea
                        id="codeBox"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        style={{ width: '100%', height: '150px' }}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="summaryCount">Number of Summaries:</label>
                    <select
                        id="summaryCount"
                        value={numberOfSummaries}
                        onChange={e => setNumberOfSummaries(e.target.value)}
                        style={{ width: '100px' }}
                    >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(number => (
                            <option key={number} value={number}>
                                {number}
                            </option>
                        ))}
                    </select>
                </div>
               
                <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Submit'}</button>
                <button type="button" onClick={resetForm}>Clear</button>  {/* New button for clearing the form */}
            </form>
            <div>
                <h2>Summaries</h2>
                {loading ? (
                    <p>Loading summaries...</p>
                ) : summaries.length > 0 ? (
                    summaries.map((summary, index) => (
                        <div key={index}>
                            <input
                                type="radio"
                                id={`summary-${index}`}
                                name="summary"
                                value={index}
                                checked={selectedSummary === index}
                                onChange={() => handleSummarySelection(index)}
                            />
                            <label htmlFor={`summary-${index}`}>{summary}</label>
                        </div>
                    ))
                ) : (
                    <p>No summary available.</p>
                )}
            </div>
            {selectedSummary !== null && (
                <div>
                    <h3>You selected:</h3>
                    <p>{summaries[selectedSummary]}</p>
                    <div>
                        <label htmlFor="feedback">Feedback:</label>
                        <textarea
                            id="feedback"
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            placeholder="Enter your feedback here..."
                            style={{ width: '100%', height: '100px' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="usefulness">Usefulness:</label>
                        <select id="usefulness" value={usefulness} onChange={e => setUsefulness(e.target.value) } required>
                            <option value="">Select Rating</option>
                            {[1, 2, 3, 4, 5].map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="consistency">Consistency:</label>
                        <select id="consistency" value={consistency} onChange={e => setConsistency(e.target.value)} required>
                            <option value="">Select Rating</option>
                            {[1, 2, 3, 4, 5].map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="naturalness">Naturalness:</label>
                        <select id="naturalness" value={naturalness} onChange={e => setNaturalness(e.target.value)} required>
                            <option value="">Select Rating</option>
                            {[1, 2, 3, 4, 5].map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={saveSelectedSummary}>Save Feedback</button>
                </div>
            )}
        </div>
    );
    
}

export default Dashboard;
