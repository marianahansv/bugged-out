import React, { useState, useEffect } from 'react';
import ReplyForm from './ReplyForm';
import { formatDistanceToNow } from 'date-fns';

function QuestionPage({ questionId }) {
  const [question, setQuestion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [questionRating, setQuestionRating] = useState(0); 
  const [userRating, setUserRating] = useState(0); 

  useEffect(() => {
    if (questionId) {
      // Fetch the question and replies from the server
      fetch(`http://localhost:5000/getquestions/${questionId}`)
        .then(response => response.json())
        .then(data => setQuestion(data))
        .catch(error => console.error('Error fetching question:', error));
  
      fetch(`http://localhost:5000/getreplies?questionId=${questionId}`)
        .then(response => response.json())
        .then(data => setReplies(data))
        .catch(error => console.error('Error fetching replies:', error));
  
      // Fetch question rating
      fetch(`http://localhost:5000/get_question_rating?question_id=${questionId}`)
        .then(response => response.json())
        .then(data => setQuestionRating(data.total_rating))
        .catch(error => console.error('Error fetching question rating:', error));
    }
  }, [questionId]);

  const handleRateQuestion = async (rating) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/rate_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question_id: questionId,
          rating: rating,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data.message);
  
      // Optimistically update the UI
      setQuestionRating(prevRating => prevRating + rating);
      setUserRating(rating); // Store the user's current rating
  
      // Re-fetch the rating to ensure consistency with the server
      fetch(`http://localhost:5000/get_question_rating?question_id=${questionId}`)
        .then(response => response.json())
        .then(data => setQuestionRating(data.total_rating))
        .catch(error => console.error('Error fetching question rating:', error));
  
    } catch (error) {
      console.error('Error rating question:', error);
    }
  };

  const handleReplySubmit = async (content, parentReplyId = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/addreply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          question_id: questionId,
          content: content,
          parent_reply_id: parentReplyId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReplies(prevReplies => [...prevReplies, data]); // Update state directly with the new reply
      setShowReplyForm(false);
      setReplyingTo(null);

    } catch (error) {
      console.error('Error submitting reply:', error);
    }
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
        {question.title}
      </h2>
      <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
        Asked {formatDistanceToNow(new Date(question.timestamp), { addSuffix: true })} by {question.author}
      </div>
      {question.image_url && (
        <img src={`http://localhost:5000${question.image_url}`} alt={question.title} style={{ maxWidth: '100%', marginBottom: '10px' }} />
      )}
      <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
        {question.content}
      </p>

      {/* Rating Display and Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <button onClick={() => handleRateQuestion(1)} style={{ fontSize: '20px', padding: '5px 10px', marginRight: '5px' }}>
          👍
        </button>
        <button onClick={() => handleRateQuestion(-1)} style={{ fontSize: '20px', padding: '5px 10px', marginRight: '10px' }}>
          👎
        </button>
        <span style={{ fontSize: '16px' }}>Rating: {questionRating}</span>
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
        {replies.length} Answers
      </h3>
      {replies.map((reply) => (
        <div
          key={reply.id}
          style={{
            borderLeft: reply.parent_reply_id ? '4px solid #ccc' : 'none',
            paddingLeft: reply.parent_reply_id ? '10px' : '0',
            marginBottom: '10px',
          }}
        >
          <p style={{ fontSize: '14px', lineHeight: '1.4' }}>{reply.content}</p>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
            {reply.author} - {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
          </div>
          <button onClick={() => { setShowReplyForm(true); setReplyingTo(reply.id); }} style={{ padding: '5px 10px', fontSize: '12px', marginTop: '5px' }}>Reply</button>
          {showReplyForm && replyingTo === reply.id && <ReplyForm onSubmit={handleReplySubmit} parentReplyId={reply.id} />}
        </div>
      ))}

      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
        Your Answer
      </h3>
      <button onClick={() => { setShowReplyForm(true); setReplyingTo(null); }} style={{ padding: '8px 16px', fontSize: '14px' }}>Answer Question</button>
      {showReplyForm && replyingTo === null && <ReplyForm onSubmit={handleReplySubmit} />}
    </div>
  );
}

export default QuestionPage;