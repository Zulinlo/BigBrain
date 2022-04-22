import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
  ArgumentAxis,
  ValueAxis,
  Chart,
  BarSeries,
} from '@devexpress/dx-react-chart-material-ui';

import { BACKEND_PORT } from '../config.json';
import { UserContext } from '../UserContext';

const AdminResults = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);

  const getTop5 = () => {
    if (quiz === null || results === null) {
      return [];
    }

    const questions = quiz.questions;
    const users = results;
    users.sort((a, b) => b.answers.reduce((acc, curr, i) => {
      return acc + curr.correct ? questions[i].points : 0;
    }, 0) - a.answers.reduce((acc, curr, i) => {
      return acc + curr.correct ? questions[i].points : 0;
    }, 0));

    const res = users.slice(0, 5).map(user => ({
      name: user.name,
      points: user.answers.reduce((acc, curr, i) => {
        return acc + curr.correct ? questions[i].points : 0;
      }, 0)
    }));

    return res;
  }

  const getBreakdownCorrect = () => {
    if (quiz === null || results === null) {
      return [];
    }

    const hash = new Map();
    for (let i = 0; i < results.length; i++) {
      for (let j = 0; j < results[i].length; j++) {
        hash.set(i, (hash.get(i) || 0) + results[i].answers[j].correct ? 1 : 0)
      }
    }
    const res = [];
    hash.forEach((correct, question) => {
      res.push({ question: question.toString(), correct });
    })
    return res;
  }

  const getBreakdownTime = () => {
    if (quiz === null || results === null) {
      return [];
    }

    const hash = new Map();
    for (let i = 0; i < results.length; i++) {
      for (let j = 0; j < results[i].length; j++) {
        hash.set(i, (hash.get(i) || [0, 0]));
        const question = hash.get(i);
        question[0] += new Date(results[i].answers[j].answeredAt).getTime() / 1000 - new Date(results[i].answers[j].answeredAt).getTime() / 1000;
        question[1]++;
      }
    }
    const res = [];
    hash.forEach((time, question) => {
      res.push({ question: question.toString(), time: Math.round(time[0] / time[1]) });
    })
    return res;
  }

  useEffect(() => {
    if (user === null) {
      return navigate('/login');
    }

    fetch(`http://localhost:${BACKEND_PORT}/admin/session/${sessionId}/status`, {
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
        setQuiz(data);
      })
      .catch(err => {
        console.error(err);
      });

    fetch(`http://localhost:${BACKEND_PORT}/admin/session/${sessionId}/results`, {
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
        setResults(data.results);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <Box p={3}>
      <h1>Session: {sessionId} admin results</h1>
      <h2>Top 5 users</h2>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 300 }} aria-label="Top 5 users">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getTop5().map((user, i) => (
              <TableRow
                key={`${user.name} ${i}`}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {user.name}
                </TableCell>
                <TableCell align="right">{user.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <h2>% correct vs question no.</h2>
      <Paper>
        <Chart
          data={getBreakdownCorrect()}
        >
          <ArgumentAxis />
          <ValueAxis />
          <BarSeries valueField="correct" argumentField="question" />
        </Chart>
      </Paper>
      <h2>Average answer time (sec) vs question no.</h2>
      <Paper>
        <Chart
          data={getBreakdownTime()}
        >
          <ArgumentAxis />
          <ValueAxis />
          <BarSeries valueField="time" argumentField="question" />
        </Chart>
      </Paper>
    </Box>
  )
}

export default AdminResults;
