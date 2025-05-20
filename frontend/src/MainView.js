import React, { useState, useEffect, useCallback} from 'react';
import QuestionsList from './QuestionsList';
import QuestionPage from './QuestionPage';
import QuestionForm from './QuestionForm';

function MainView({ selectedChannelId }) {
  const [activeView, setActiveView] = useState('questions'); // 'questions' | 'question' | 'askQuestionForm'
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [searchResults, setSearchResults] = useState([]); 


  const fetchQuestions = useCallback(() => {
    let url = 'http://localhost:5000/getquestions';
    if (selectedChannelId) {
      url += `?channelId=${selectedChannelId}`;
    }
  
    if (searchQuery) {
      url = `http://localhost:5000/searchquestions?query=${searchQuery}`;
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
      })
      .catch((err) => console.error('Error fetching questions:', err));
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
    fetchQuestions(); // Refresh questions after creation
    setActiveView('questions'); // Go back to the question list
  };

  return (
    <main style={{ flex: 1, backgroundColor: 'white', padding: '10px' }}>
      {activeView === 'questions' && (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            Questions
          </h2>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={handleSearch}
            style={{ padding: '8px', fontSize: '16px', marginRight: '10px' }}
          />
          <button onClick={handleAskQuestionClick}>Ask Question</button>
        </div>
        <QuestionsList
          onQuestionClick={handleQuestionClick}
          questions={searchQuery ? searchResults : questions}
        />
      </>
    )}

      {activeView === 'question' && (
        <>
          <button onClick={handleBackToQuestions}>Back to Questions</button>
          <QuestionPage questionId={selectedQuestion} />
        </>
      )}

      {activeView === 'askQuestionForm' && selectedChannelId && (
        <>
          <button onClick={handleBackToQuestions}>Back to Questions</button>
          {console.log('MainView: selectedChannelId = ', selectedChannelId)} 
          <QuestionForm onQuestionCreated={handleQuestionCreated} channelId={selectedChannelId}/> {/* Callback for question creation */}
        </>
      )}
    </main>
  );
}

export default MainView;