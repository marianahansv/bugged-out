import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { apiUrl } from './api';

function QuestionsList({ onQuestionClick, questions }) {
  return (
    <div className="question-list">
      {questions.map((question) => (
        <div
          key={question.id}
          className="question-card"
          onClick={() => onQuestionClick(question.id)}
        >
          <div className="question-card-head">
            <h3 className="question-title">
              {question.title}
            </h3>
            <span className="question-tag">thread</span>
          </div>
          {question.image_url && ( // Display image if available
            <img className="question-image" src={apiUrl(question.image_url)} alt={question.title} />
          )}
          <p className="question-excerpt">
            {question.content}
          </p>
          <div className="meta-text">
            Asked {formatDistanceToNow(new Date(question.timestamp), { addSuffix: true })} by {question.author}
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuestionsList;
