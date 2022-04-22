import React, { useState, useMemo } from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { UserContext } from './UserContext';
import { darkTheme } from './components/darkTheme.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EditGame from './pages/EditGame.jsx';
import AdminResults from './pages/AdminResults.jsx';
import PlayGame from './pages/PlayGame.jsx';

const App = () => {
  const [user, setUser] = useState(null);

  const providerValue = useMemo(() => ({ user, setUser }), [user, setUser]);

  return (
    <UserContext.Provider value={providerValue}>
      <BrowserRouter>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<Home />}>
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="dashboard/edit/:gameId" element={<EditGame />} />
              <Route path="dashboard/results/:sessionId" element={<AdminResults />} />
              <Route path="game/:sessionId" element={<PlayGame />} />
            </Route>
            <Route path="/home" element={<Home />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
