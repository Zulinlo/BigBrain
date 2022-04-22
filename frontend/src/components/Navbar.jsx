import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { BACKEND_PORT } from '../config.json';
import { UserContext } from '../UserContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleLogout = (e) => {
    fetch(`http://localhost:${BACKEND_PORT}/admin/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + user.token,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setUser(null);
        navigate('/login');
      })
      .catch(err => {
        alert(err);
      });
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1 }}
          >
           BigBrain
          </Typography>
          <Button
            color="inherit"
            onClick={() => (
              navigate('/home')
            )}
          >
            Game
          </Button>
          {user === null
            ? <>
                <Button
                  color="inherit"
                  onClick={() => (
                    navigate('/signup')
                  )}
                >
                  Sign Up
                </Button>
                <Button
                  color="inherit"
                  onClick={() => (
                    navigate('/login')
                  )}
                >
                  Login
                </Button>
              </>
            : <>
                <Button
                  color="inherit"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Navbar;
