import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import MuiAlert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

import { BACKEND_PORT } from '../config.json';
import { UserContext } from '../UserContext';

const EditGame = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [quiz, setQuiz] = useState(null);
  const [editName, setEditName] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editQuestions, setEditQuestions] = useState([]);
  const [editAnswers, setEditAnswers] = useState([]);
  const [errorEdit, setErrorEdit] = useState(null);

  const Alert = React.forwardRef(function Alert (props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const removeQuestion = (i) => {
    setEditQuestions(pre => [...pre.slice(0, i), ...pre.slice(i + 1)]);
  }

  const removeAnswer = (i, aId) => {
    setEditAnswers(pre => [...pre.slice(0, i), [...pre[i].slice(0, aId), ...pre[i].slice(aId + 1)], ...pre.slice(i + 1)]);
  }

  const addQuestion = () => {
    setEditQuestions(pre => [...pre, { question: '', timeLimit: '', questionType: 'single', points: '', media: '', answers: [] }]);
  }

  const addAnswer = (i) => {
    setEditAnswers(pre => [...pre.slice(0, i), [...pre[i] ? pre[i] : [], { answer: '', isAnswer: false }], ...pre.slice(i + 1)]);
  }

  const clearAnswerCheck = (i) => {
    setEditAnswers(pre => pre.map((ans, cId) => cId === i ? [...ans.map(cur => ({ ...cur, isAnswer: false }))] : ans));
  }

  const handleQuestionType = (e, i) => {
    if (e.target.value === 'single') {
      clearAnswerCheck(i);
    }

    setEditQuestions(pre => pre.map((curr, idx) => idx === i ? { ...curr, questionType: e.target.value } : curr))
  }

  const handleAnswerCheck = (e, i, idx) => {
    if (editQuestions[i].questionType === 'single') {
      clearAnswerCheck(i);
    }

    setEditAnswers(pre => pre.map((curr, cId) => cId === i ? [...curr.slice(0, idx), { ...curr[idx], isAnswer: e.target.checked }, ...curr.slice(idx + 1)] : curr));
  }

  const handleEditQuiz = (e) => {
    e.preventDefault();
    setErrorEdit(null);

    const questions = editQuestions;
    for (let i = 0; i < questions.length; i++) {
      if (!editAnswers[i] || editAnswers[i].length > 6 || editAnswers[i].length < 2) {
        return alert('Must have 2-6 answers for each question');
      }
      questions[i].answers = editAnswers[i];
    }

    fetch(`http://localhost:${BACKEND_PORT}/admin/quiz/${gameId}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + user.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ questions, name: editName, thumbnail: editThumbnail })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        navigate('/dashboard');
      })
      .catch(err => {
        setErrorEdit(err);
      });
  }

  const deleteQuiz = () => {
    fetch(`http://localhost:${BACKEND_PORT}/admin/quiz/${gameId}`, {
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
        navigate('/dashboard');
      })
      .catch(err => {
        alert(err);
      });
  }

  useEffect(() => {
    if (user === null) {
      return navigate('/login');
    }

    fetch(`http://localhost:${BACKEND_PORT}/admin/quiz/${gameId}`, {
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
        setEditName(data.name || '');
        setEditThumbnail(data.thumbnail || '');
        setEditQuestions(data.questions || []);
        const answers = [];
        for (const question of data.questions) {
          answers.push(question.answers);
        }
        setEditAnswers(answers);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  return (
    <Box p={3}>
      <h1>Edit Game - {quiz && quiz.name}</h1>
      <form onSubmit={handleEditQuiz}>
        <FormControl variant="outlined">
          <TextField
            error={errorEdit !== null}
            label="New Name"
            margin="normal"
            value={editName}
            onChange={(e) => setEditName(e.target.value)} />
          <TextField
            error={errorEdit !== null}
            label="New Thumbnail (base64)"
            margin="normal"
            value={editThumbnail}
            onChange={(e) => setEditThumbnail(e.target.value)} />
          <h3>Questions</h3>
          {editQuestions.map((question, i) =>
            <FormControl key={`question ${i}`}>
              <Box m={1}>
                <h4>Q{i + 1}</h4>
                <TextField
                  error={errorEdit !== null}
                  label="Question"
                  margin="normal"
                  value={editQuestions[i].question}
                  onChange={(e) => setEditQuestions(pre => pre.map((curr, idx) => idx === i ? { ...curr, question: e.target.value } : curr))} />
                <TextField
                  error={errorEdit !== null}
                  label="Time Limit (seconds)"
                  margin="normal"
                  value={editQuestions[i].timeLimit}
                  onChange={(e) => setEditQuestions(pre => pre.map((curr, idx) => idx === i ? { ...curr, timeLimit: e.target.value } : curr))} />
                <Select
                  labelId="question-type-label"
                  id="question-type"
                  value={editQuestions[i].questionType}
                  label="Question type"
                  onChange={(e) => handleQuestionType(e, i)}>
                  <MenuItem value={'single'}>Single choice</MenuItem>
                  <MenuItem value={'multiple'}>Multiple choice</MenuItem>
                </Select>
                <TextField
                  error={errorEdit !== null}
                  label="Media (url, img)"
                  margin="normal"
                  value={editQuestions[i].media}
                  onChange={(e) => setEditQuestions(pre => pre.map((curr, idx) => idx === i ? { ...curr, media: e.target.value } : curr))} />
                <TextField
                  error={errorEdit !== null}
                  label="Points"
                  margin="normal"
                  type="number"
                  value={editQuestions[i].points}
                  onChange={(e) => setEditQuestions(pre => pre.map((curr, idx) => idx === i ? { ...curr, points: e.target.value } : curr))} />
                <IconButton onClick={() => removeQuestion(i)}>
                  <h4>Remove question</h4> <RemoveIcon />
                </IconButton>
                <h5>Answer choices</h5>
                {editAnswers[i] && editAnswers[i].map((answer, idx) => (
                  <Box key={`answer ${i} ${idx}`}>
                    <TextField
                      label="Answer"
                      margin="normal"
                      value={editAnswers[i][idx].answer}
                      onChange={(e) => setEditAnswers(pre => pre.map((curr, cId) => cId === i ? [...curr.slice(0, idx), { ...curr[idx], answer: e.target.value }, ...curr.slice(idx + 1)] : curr))} />
                    <Checkbox
                      checked={editAnswers[i][idx].isAnswer}
                      onChange={(e) => handleAnswerCheck(e, i, idx)}/>
                    <IconButton onClick={() => removeAnswer(i, idx)}>
                      <RemoveIcon/>
                    </IconButton>
                    <br />
                  </Box>
                ))}
                <IconButton onClick={() => addAnswer(i)}>
                  <h6>Add an answer</h6> <AddIcon />
                </IconButton>
              </Box>
            </FormControl>
          )}
            <IconButton onClick={addQuestion}>
              <h4>Add a question</h4> <AddIcon />
            </IconButton>
          <Button variant="contained" type="submit">
            Edit
          </Button>
          {errorEdit !== null && (
            <Alert severity="error">{errorEdit.message}</Alert>
          )}
        </FormControl>
      </form>
      <Button variant="contained" color="secondary" onClick={deleteQuiz}>
        Delete this game
      </Button>
    </Box>
  )
}

export default EditGame;
