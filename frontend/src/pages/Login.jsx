import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MuiAlert from '@mui/material/Alert';

import { BACKEND_PORT } from '../config.json';
import { UserContext } from '../UserContext';

const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { setUser } = useContext(UserContext);

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    fetch(`http://localhost:${BACKEND_PORT}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setUser(data);
        navigate('/dashboard');
      })
      .catch(err => {
        setError(err);
      });
  }

  return (
    <form onSubmit={handleLogin}>
      <FormControl variant="outlined">
        <h1>Login</h1>
        <TextField
          error={error !== null}
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <TextField
          error={error !== null}
          label="Password"
          margin="normal"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" type="submit">
        Login
      </Button>
      {error !== null && (
        <Alert severity="error">{error.message}</Alert>
      )}
      </FormControl>
    </form>
  )
}

export default Login;
