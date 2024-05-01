import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate hook

import styles from './styles/LoginStyles.module.css';


function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Define state for confirmPassword
  const [errorMessage] = useState(''); // For navigation after successful registration
  const navigate = useNavigate(); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.text();
    console.log(data);
    alert(data);
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
          onChange={(e) => setPassword(e.target.value)}
          required
        />
       
        <button className={styles.button} type="submit">Register</button>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <div className="text-center mt-4">
          <p>Already have an account? <Link to="/login" className={styles.link}>Login</Link></p>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
