import React, { useState,useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate hook
import { UserContext } from './UserContext';
import styles from './styles/LoginStyles.module.css';


function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // For programmatic navigation

    const { setUser } = useContext(UserContext);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        try {
            const response = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            
            if (response.ok) {
                console.log('Login successful:', data);
                setUser(data.user);  // Set user data in context
                // Redirect based on role
                if (data.user.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setErrorMessage(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('Network error');
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h3 className={styles.title}>Login Here</h3>
                <input className={styles.input} type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                <input className={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button className={styles.button} type="submit">Log In</button>
                {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                <div className="text-center mt-4">
                    <p>No account?  <Link to="/register"  className={styles.link}>Register</Link> </p>
                </div>
            </form>
        </div>
    );
}

export default LoginPage;
