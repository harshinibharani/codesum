import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from './UserContext';
import styles from './styles/LoginStyles.module.css';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [changePasswordError, setChangePasswordError] = useState('');
    const navigate = useNavigate();
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
                setUser(data.user);

                // If the password is 'default', show the password change dialog
                if (password === 'default') {
                    setShowChangePasswordDialog(true);
                } else {
                    // Redirect based on role
                    if (data.user.role === 'admin') {
                        navigate('/admin-dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }
            } else {
                setErrorMessage(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('Network error');
        }
    };

    const validatePassword = (password) => {
        const errors = [];
        if (password.length < 8) {
            errors.push('At least 8 characters long');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Lowercase letter');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Uppercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Digit');
        }
        if (!/[\W_]/.test(password)) {
            errors.push('Special character');
        }
        setPasswordErrors(errors);
        return errors.length === 0;
    };

    const handlePasswordChangeSubmit = async () => {
        setPasswordErrors([]);
        if (!validatePassword(newPassword)) {
            setChangePasswordError('Please fix the errors and try again.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setChangePasswordError("Passwords don't match");
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/updatePassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, newPassword })
            });
            const data = await response.json();

            if (response.ok) {
                setShowChangePasswordDialog(false);
                // Redirect based on role after updating password
                if (data.user.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setChangePasswordError(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Password change error:', error);
            setChangePasswordError('Network error');
        }
    };

    // Function to clear sensitive fields
    const clearFields = () => {
        setPassword('');
        setNewPassword('');
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h3 className={styles.title}>Login</h3>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    className={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className={styles.button} type="submit">Log In</button>
                {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                <div className="text-center mt-4">
                    <p>No account? <Link to="/register" className={styles.link}>Register</Link></p>
                </div>
            </form>

            {/* Change Password Dialog */}
            <Dialog
                open={showChangePasswordDialog}
                onClose={() => setShowChangePasswordDialog(false)}
            >
                <DialogTitle>Change Your Password</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {passwordErrors.length > 0 && (
                        <ul style={{ color: 'red' }}>
                            {passwordErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    )}
                    {changePasswordError && <p style={{ color: 'red' }}>{changePasswordError}</p>}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowChangePasswordDialog(false);
                            clearFields();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={async () => {
                            await handlePasswordChangeSubmit();
                            clearFields();
                            setShowChangePasswordDialog(false);
                        }}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default LoginPage;