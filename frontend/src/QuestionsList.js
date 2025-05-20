import React from 'react';
import { formatDistanceToNow } from 'date-fns';

function QuestionsList({ onQuestionClick, questions }) {
  return (
    <div>
      {questions.map((question) => (
        <div
          key={question.id}
          style={{
            borderBottom: '1px solid #ccc',
            padding: '10px 0',
            cursor: 'pointer',
          }}
          onClick={() => onQuestionClick(question.id)}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            {question.title}
          </h3>
          {question.image_url && ( // Display image if available
            <img src={`http://localhost:5000${question.image_url}`} alt={question.title} style={{ maxWidth: '100%', marginBottom: '10px' }} />
          )}
          <p style={{ fontSize: '14px', margin: '5px 0' }}>
            {question.content}
          </p>
          <div style={{ fontSize: '12px', color: '#888' }}>
            Asked {formatDistanceToNow(new Date(question.timestamp), { addSuffix: true })} by {question.author}
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuestionsList;