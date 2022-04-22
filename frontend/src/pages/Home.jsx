import React, { useState } from 'react';
import { useNavigate, useOutlet, useSearchParams } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MuiAlert from '@mui/material/Alert';

import { BACKEND_PORT } from '../config.json';
import Navbar from '../components/Navbar.jsx';

const Alert = React.forwardRef(function Alert (props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Home = () => {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [sessionId, setSessionId] = useState(searchParams.get('sessionId') || '');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!sessionId.length) {
      return alert('Session Id cannot be empty');
    }

    fetch(`http://localhost:${BACKEND_PORT}/play/join/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        navigate(`/game/${sessionId}?playerId=${data.playerId}`);
      })
      .catch(err => {
        setError(err);
      });
  }
  return (
    <>
      <Navbar />
      <main style={{ padding: '20px' }}>
        {outlet || (
          <form onSubmit={handleSubmit}>
            <FormControl variant="outlined">
              <h1>Join a game</h1>
              <TextField
                error={error !== null}
                label="Name"
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)} />
              <TextField
                error={error !== null}
                label="Session Id"
                margin="normal"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)} />
            <Button variant="contained" type="submit">
              Submit
            </Button>
            {error !== null && (
              <Alert severity="error">{error.message}</Alert>
            )}
            </FormControl>
          </form>
        )}
      </main>
    </>
  )
}

export default Home;
