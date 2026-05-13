import React, { useState, useEffect, useCallback} from 'react';
import QuestionsList from './QuestionsList';
import QuestionPage from './QuestionPage';
import QuestionForm from './QuestionForm';
import { apiUrl } from './api';

function MainView({ selectedChannelId }) {
  const [activeView, setActiveView] = useState('questions');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [searchResults, setSearchResults] = useState([]); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);


  const fetchQuestions = useCallback(() => {
    setLoading(true);
    setError('');
    let url = apiUrl('/getquestions');
    if (selectedChannelId) {
      url += `?channelId=${selectedChannelId}`;
    }
  
    if (searchQuery) {
      url = apiUrl(`/searchquestions?query=${searchQuery}`);
    }
  
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (searchQuery) {
          setSearchResults(data);
        } else {
          setQuestions(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching questions:', err);
        setError('We could not load questions right now.');
        setLoading(false);
      });
  }, [selectedChannelId, searchQuery]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleQuestionClick = (questionId) => {
    setSelectedQuestion(questionId);
    setActiveView('question');
  };

  const handleAskQuestionClick = () => {
    setActiveView('askQuestionForm');
  };

  const handleBackToQuestions = () => {
    setActiveView('questions');
    setSelectedQuestion(null);
  };

  const handleQuestionCreated = () => {
    fetchQuestions();
    setActiveView('questions');
  };

  const visibleQuestions = searchQuery ? searchResults : questions;

  return (
    <main className="main-panel">
      {activeView === 'questions' && (
      <>
        <div className="toolbar">
          <div className="toolbar-copy">
            <h2 className="section-title">Questions</h2>
            <p className="helper-text">
              {selectedChannelId
                ? 'You are browsing a single channel. Ask a question here or search across its threads.'
                : 'Select a channel to narrow the discussion, or browse everything as a guest.'}
            </p>
          </div>
          <div className="toolbar-actions">
            <input
              className="search-input"
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <button className="primary-button" onClick={handleAskQuestionClick} disabled={!selectedChannelId}>Ask Question</button>
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        {loading ? <p>Loading questions...</p> : null}
        {!loading && !error && visibleQuestions.length === 0 ? <p>No questions found yet.</p> : null}
        <QuestionsList
          onQuestionClick={handleQuestionClick}
          questions={visibleQuestions}
        />
      </>
    )}

      {activeView === 'question' && (
        <>
          <div className="detail-actions">
            <button className="ghost-button" onClick={handleBackToQuestions}>Back to Questions</button>
          </div>
          <QuestionPage questionId={selectedQuestion} />
        </>
      )}

      {activeView === 'askQuestionForm' && selectedChannelId && (
        <>
          <div className="detail-actions">
            <button className="ghost-button" onClick={handleBackToQuestions}>Back to Questions</button>
          </div>
          <QuestionForm onQuestionCreated={handleQuestionCreated} channelId={selectedChannelId}/>
        </>
      )}
    </main>
  );
}

export default MainView;
