import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles/LoginStyles.module.css';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const navigate = useNavigate();

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

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validatePassword(password)) {
      return;
    }
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.text();
    console.log(data);
    // alert(data);
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h3 className={styles.title}>Register</h3>
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
          onChange={handlePasswordChange}
          required
        />
        {passwordErrors.length > 0 && (
          <ul style={{ color: 'white', fontSize: '12px', marginTop: '8px' }}>
            {passwordErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
        <button
          className={styles.button}
          type="submit"
          disabled={passwordErrors.length > 0}
        >
          Register
        </button>
        <div className="text-center mt-4">
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
