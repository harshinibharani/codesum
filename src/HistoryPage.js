// HistoryPage.js
import {React,useContext} from 'react';
import { UserContext } from './UserContext';
import { useEffect, useState} from 'react';
function HistoryPage() {
  const { user } = useContext(UserContext);
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>History Page {user ? user.username : 'Guest'}!!</h1>
            {history.length > 0 ? (
                <ul>
                    {history.map((item, index) => (
                        <li key={index}>
                            {item.inputCode} - {item.selectedSummary} - Feedback: {item.feedback} - usefulness {item.usefulness} - naturalness {item.naturalness} - consistency {item.consistency}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No history found.</p>
            )}
        </div>
    );
}

export default HistoryPage;
