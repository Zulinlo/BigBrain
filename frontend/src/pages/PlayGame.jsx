import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';

import { BACKEND_PORT } from '../config.json';

const PlayGame = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const playerId = searchParams.get('playerId');
  const [quiz, setQuiz] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);
  // const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:${BACKEND_PORT}/play/${playerId}/status`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        setHasStarted(data.started);
      })
      .catch(err => {
        alert(err.message);
      });

    fetch(`http://localhost:${BACKEND_PORT}/play/${playerId}/question`, {
      headers: {
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
      .catch(error => {
        console.error(error.message);
      });
  }, []);

  return (
    <Box p={3}>
      <h4>Playing Game {sessionId} as user {searchParams.get('playerId')}</h4>
      {hasStarted && quiz && quiz.question
        ? (<>
            <h1>Question: {quiz.question.question}</h1>
            {quiz.question.media && (
              <img src={quiz.question.media} width={250} />
            )}
          </>)
        : <h2>Game has not started yet</h2>
      }
      {console.log(quiz)}
    </Box>
  )
}

export default PlayGame;
