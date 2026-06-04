// displays the list of forum questions.
// this file renders clickable question cards with metadata, excerpts, and images.

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

function QuestionsList({ onQuestionClick, onQuestionDelete, questions, isAdmin }) {
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
            <div className="question-actions">
              <span className="question-tag">thread</span>
              {isAdmin && (
                <button
                  className="ghost-button reply-link danger-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onQuestionDelete(question.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
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
