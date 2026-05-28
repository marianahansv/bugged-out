// renders a single question thread.
// this file loads question details, builds nested replies, submits answers,
// and handles authenticated voting for the selected question.

import React, { useState, useEffect } from 'react';
import ReplyForm from './ReplyForm';
import { formatDistanceToNow } from 'date-fns';
import { apiUrl } from './api';

function buildReplyTree(replyItems) {
  const replyMap = new Map(
    replyItems.map((reply) => [reply.id, { ...reply, children: [] }])
  );
  const roots = [];

  replyMap.forEach((reply) => {
    if (reply.parent_reply_id && replyMap.has(reply.parent_reply_id)) {
      replyMap.get(reply.parent_reply_id).children.push(reply);
      return;
    }

    roots.push(reply);
  });

  return roots;
}

function QuestionPage({ questionId }) {
  const [question, setQuestion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [questionRating, setQuestionRating] = useState(0); 
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    if (questionId) {
      setPageError('');
      fetch(apiUrl(`/getquestions/${questionId}`))
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load question');
          }
          return response.json();
        })
        .then(data => setQuestion(data))
        .catch(error => {
          console.error('Error fetching question:', error);
          setPageError('We could not load this question.');
        });
  
      fetch(apiUrl(`/getreplies?questionId=${questionId}`))
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load replies');
          }
          return response.json();
        })
        .then(data => setReplies(data))
        .catch(error => console.error('Error fetching replies:', error));
  
      fetch(apiUrl(`/get_question_rating?question_id=${questionId}`))
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to load rating');
          }
          return response.json();
        })
        .then(data => setQuestionRating(data.total_rating))
        .catch(error => console.error('Error fetching question rating:', error));
    }
  }, [questionId]);

  const handleRateQuestion = async (rating) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(apiUrl('/rate_question'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question_id: questionId,
          rating: rating,
        }),
      });
  
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
  
      await response.json();
      setQuestionRating(prevRating => prevRating + rating);
  
      fetch(apiUrl(`/get_question_rating?question_id=${questionId}`))
        .then(response => response.json())
        .then(data => setQuestionRating(data.total_rating))
        .catch(error => console.error('Error fetching question rating:', error));
  
    } catch (error) {
      console.error('Error rating question:', error);
      setPageError(error.message);
    }
  };

  const handleReplySubmit = async (content, parentReplyId = null) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(apiUrl('/addreply'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question_id: questionId,
          content: content,
          parent_reply_id: parentReplyId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setReplies(prevReplies => [...prevReplies, data]); // Update state directly with the new reply
      setShowReplyForm(false);
      setReplyingTo(null);

    } catch (error) {
      console.error('Error submitting reply:', error);
      setPageError(error.message);
    }
  };

  const replyTree = buildReplyTree(replies);

  const renderReplies = (items, depth = 0) =>
    items.map((reply) => (
      <div
        key={reply.id}
        className={`reply-card ${depth > 0 ? 'is-nested' : ''}`}
        style={{ marginLeft: depth === 0 ? 0 : `${Math.min(depth, 4) * 14}px` }}
      >
        <div className="reply-meta-row">
          <div className="meta-text">
            {reply.author} - {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
          </div>
          <button
            className="ghost-button reply-link"
            onClick={() => {
              setShowReplyForm(true);
              setReplyingTo(reply.id);
            }}
          >
            Reply
          </button>
        </div>
        <p className="detail-content reply-content">{reply.content}</p>
        {showReplyForm && replyingTo === reply.id && (
          <ReplyForm onSubmit={handleReplySubmit} parentReplyId={reply.id} />
        )}
        {reply.children.length > 0 ? renderReplies(reply.children, depth + 1) : null}
      </div>
    ));

  if (pageError && !question) {
    return <div className="error-text">{pageError}</div>;
  }

  if (!question) {
    return <div>Loading...</div>;
  }

  return (
    <div className="detail-view">
      {pageError && <p className="error-text">{pageError}</p>}
      <div className="detail-head">
        <span className="question-tag">question</span>
      </div>
      <h2 className="detail-title">
        {question.title}
      </h2>
      <div className="meta-text">
        Asked {formatDistanceToNow(new Date(question.timestamp), { addSuffix: true })} by {question.author}
      </div>
      {question.image_url && (
        <img className="detail-image" src={apiUrl(question.image_url)} alt={question.title} />
      )}
      <p className="detail-content">
        {question.content}
      </p>

      <div className="vote-row">
        <button onClick={() => handleRateQuestion(1)}>
          👍
        </button>
        <button onClick={() => handleRateQuestion(-1)}>
          👎
        </button>
        <span className="vote-chip">Rating: {questionRating}</span>
      </div>
      <p className="muted-note">
        Voting is optional-auth only. Guests can still read, ask, and reply.
      </p>

      <h3 className="section-title">
        {replies.length} Answers
      </h3>
      <div className="reply-list threaded-replies">
        {renderReplies(replyTree)}
      </div>

      <h3 className="section-title">
        Your Answer
      </h3>
      <button className="primary-button" onClick={() => { setShowReplyForm(true); setReplyingTo(null); }}>Answer Question</button>
      {showReplyForm && replyingTo === null && <ReplyForm onSubmit={handleReplySubmit} />}
    </div>
  );
}

export default QuestionPage;
