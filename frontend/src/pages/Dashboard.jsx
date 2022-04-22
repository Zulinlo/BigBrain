import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import MuiAlert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import TouchAppIcon from '@mui/icons-material/TouchApp';

import { BACKEND_PORT } from '../config.json';
import { UserContext } from '../UserContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [quizzes, setQuizzes] = useState([]);
  const [quizName, setQuizName] = useState('');
  const [reloadQuiz, setReloadQuiz] = useState(false);
  const [error, setError] = useState(null);
  const [gamePopup, setGamePopup] = useState(false);
  const [resultsPopup, setResultsPopup] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const Alert = React.forwardRef(function Alert (props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const copyText = (path) => {
    navigator.clipboard.writeText(path);
  }

  const deleteQuiz = (id) => {
    fetch(`http://localhost:${BACKEND_PORT}/admin/quiz/${id}`, {
      method: 'DELETE',
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
        setReloadQuiz(pre => !pre);
      })
      .catch(err => {
        alert(err);
      });
  }

  const createQuiz = (e) => {
    e.preventDefault();
    setError(null);

    fetch(`http://localhost:${BACKEND_PORT}/admin/quiz/new`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + user.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: quizName })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setReloadQuiz(pre => !pre);
        setQuizName('');
      })
      .catch(err => {
        setError(err);
      });
  }

  const editQuiz = (id) => {
    navigate(`/dashboard/edit/${id}`);
  }

  const startQuiz = (id) => {
    fetch(`http://localhost:${BACKEND_PORT}/admin/quiz/${id}/start`, {
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
        setReloadQuiz(pre => !pre);
        fetch(`http://localhost:${BACKEND_PORT}/admin/quiz/${id}`, {
          headers: {
            Authorization: 'Bearer ' + user.token,
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then(sess => {
            if (data.error) {
              throw new Error(data.error);
            }
            setSessionId(sess.active);
            setGamePopup(true);
          })
          .catch(err => {
            alert(err)
          })
      })
      .catch(err => {
        alert(err);
      });
  }

  const stopQuiz = (id, sessionId) => {
    setSessionId(sessionId);
    fetch(`http://localhost:${BACKEND_PORT}/admin/quiz/${id}/end`, {
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
        setReloadQuiz(pre => !pre);
        setResultsPopup(true);
      })
      .catch(err => {
        alert(err);
      });
  }

  const advanceQuiz = (id) => {
    fetch(`http://localhost:${BACKEND_PORT}/admin/quiz/${id}/advance`, {
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
      })
      .catch(err => {
        alert(err.message);
      });
  }

  useEffect(() => {
    if (user === null) {
      return navigate('/login');
    }

    let mounted = true;

    fetch(`http://localhost:${BACKEND_PORT}/admin/quiz`, {
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

        if (mounted) {
          const promises = [];
          for (const quiz of data.quizzes) {
            promises.push(
              fetch(`http://localhost:${BACKEND_PORT}/admin/quiz/${quiz.id}`, {
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
                  return { ...data, id: quiz.id };
                })
                .catch(err => {
                  console.error(err)
                })
            )
          }

          Promise.all(promises)
            .then((res) => {
              setQuizzes(res);
            })
        }
      })
      .catch(err => {
        console.error(err);
      });

    return () => {
      mounted = false;
    }
  }, [reloadQuiz]);

  return (
    <>
      <h1>Dashboard</h1>
      <form onSubmit={createQuiz}>
        <FormControl variant="outlined">
          <h2>Create Game</h2>
          <TextField
            error={error !== null}
            label="Quiz Name"
            margin="normal"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)} />
          <Button variant="contained" type="submit">
            Submit
          </Button>
          {error !== null && (
            <Alert severity="error">{error.message}</Alert>
          )}
        </FormControl>
      </form>
      {quizzes.map((quiz, i) => (
        <div key={quiz.id}>
          <Box mt={3}>
            <Card sx={{ maxWidth: 500 }}>
              <Box p={1}>
                <CardMedia
                  component="img"
                  height="140"
                  image={quiz.thumbnail}
                  alt={`${quiz.name}`}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {quiz.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No. questions: {quiz.questions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total time:&nbsp;
                    {quiz.questions.reduce((acc, curr) => {
                      return acc + parseInt(curr.timeLimit)
                    }, 0)}
                    &nbsp;(seconds)
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => editQuiz(quiz.id)}>Edit</Button>
                  <Button size="small" onClick={() => deleteQuiz(quiz.id)}>Delete</Button>
                  {quiz.active === null
                    ? <Button size="small" onClick={() => startQuiz(quiz.id)}>Start Quiz</Button>
                    : (<>
                        <Button size="small" onClick={() => stopQuiz(quiz.id, quiz.active)}>Stop Quiz</Button>
                        <Button size="small" onClick={() => advanceQuiz(quiz.id)}>Advance Quiz</Button>
                      </>)
                  }
                </CardActions>
              </Box>
            </Card>
          </Box>
          <Dialog
            open={gamePopup}
            onClose={() => setGamePopup(false)}
            aria-labelledby="alert-dialog-game-link"
            aria-describedby="alert-dialog-game-link"
          >
            <DialogTitle style={{ cursor: 'pointer' }} onClick={() => copyText(`http://localhost:3000/home?sessionId=${sessionId}`)}>
              Link to game session {sessionId}&nbsp;
              <TouchAppIcon />
            </DialogTitle>
          </Dialog>
          <Dialog
            open={resultsPopup}
            onClose={() => setResultsPopup(false)}
            aria-labelledby="alert-dialog-game-results"
            aria-describedby="alert-dialog-game-results"
          >
            <DialogTitle>
              Would you like to view the results?
            </DialogTitle>
            <DialogActions>
              <Button onClick={() => setResultsPopup(false)}>No</Button>
              <Button onClick={() => navigate(`/dashboard/results/${sessionId}`)} autoFocus>
                Yes
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      ))}

    </>
  )
}

export default Dashboard;
