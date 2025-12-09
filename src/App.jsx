import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // State Management using ES6+ features
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [category, setCategory] = useState('9')
  const [difficulty, setDifficulty] = useState('medium')

  // Categories from Open Trivia Database
  const categories = [
    { id: '9', name: 'General Knowledge' },
    { id: '21', name: 'Sports' },
    { id: '23', name: 'History' },
    { id: '18', name: 'Science: Computers' },
    { id: '17', name: 'Science & Nature' },
    { id: '22', name: 'Geography' },
    { id: '27', name: 'Animals' },
    { id: '11', name: 'Film' },
    { id: '12', name: 'Music' },
  ]

  // Fetch questions from API using async/await (ES8)
  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`
      )
      const data = await response.json()
      
      // Process questions using map and spread operator (ES6+)
      const formattedQuestions = data.results.map(question => ({
        question: decodeHTML(question.question),
        correctAnswer: decodeHTML(question.correct_answer),
        // Combine and shuffle answers using spread operator
        answers: shuffleArray([
          ...question.incorrect_answers.map(decodeHTML),
          decodeHTML(question.correct_answer)
        ])
      }))
      
      setQuestions(formattedQuestions)
      setQuizStarted(true)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching questions:', error)
      setLoading(false)
    }
  }

  // Helper function to decode HTML entities
  const decodeHTML = (html) => {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]] // Array destructuring (ES6)
    }
    return newArray
  }

  // Handle answer selection
  const handleAnswerClick = (answer) => {
    if (isAnswered) return
    
    setSelectedAnswer(answer)
    setIsAnswered(true)

    // Check if answer is correct
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(prevScore => prevScore + 1) // Functional setState
    }

    // Move to next question after delay
    setTimeout(() => {
      const nextQuestion = currentQuestion + 1
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion)
        setSelectedAnswer(null)
        setIsAnswered(false)
      } else {
        setShowScore(true)
      }
    }, 1500)
  }

  // Reset quiz
  const resetQuiz = () => {
    setQuestions([])
    setCurrentQuestion(0)
    setScore(0)
    setShowScore(false)
    setQuizStarted(false)
    setSelectedAnswer(null)
    setIsAnswered(false)
  }

  // Get button class based on answer state
  const getButtonClass = (answer) => {
    if (!isAnswered) return 'answer-button'
    if (answer === questions[currentQuestion].correctAnswer) {
      return 'answer-button correct'
    }
    if (answer === selectedAnswer && answer !== questions[currentQuestion].correctAnswer) {
      return 'answer-button incorrect'
    }
    return 'answer-button disabled'
  }

  return (
    <div className="app">
      <div className="quiz-container">
        {!quizStarted ? (
          // Quiz Setup Screen
          <div className="setup-screen">
            <h1>🎯 Interactive Quiz</h1>
            <p className="subtitle">Test your knowledge across various topics!</p>
            
            <div className="setup-form">
              <div className="form-group">
                <label htmlFor="category">Select Category:</label>
                <select 
                  id="category"
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="select-input"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Select Difficulty:</label>
                <select 
                  id="difficulty"
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="select-input"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <button 
                className="start-button" 
                onClick={fetchQuestions}
                disabled={loading}
              >
                {loading ? 'Loading Questions...' : 'Start Quiz 🚀'}
              </button>
            </div>

            <div className="features">
              <div className="feature">
                <span className="feature-icon">📚</span>
                <span>10 Questions</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🌐</span>
                <span>Real API Data</span>
              </div>
              <div className="feature">
                <span className="feature-icon">⚡</span>
                <span>Instant Feedback</span>
              </div>
            </div>
          </div>
        ) : showScore ? (
          // Score Screen
          <div className="score-screen">
            <h2>Quiz Completed! 🎉</h2>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-number">{score}</span>
                <span className="score-total">/ {questions.length}</span>
              </div>
            </div>
            <p className="score-message">
              {score === questions.length 
                ? "Perfect Score! You're amazing! 🌟"
                : score >= questions.length * 0.7
                ? "Great job! Well done! 👏"
                : score >= questions.length * 0.5
                ? "Good effort! Keep practicing! 💪"
                : "Don't give up! Try again! 🎯"}
            </p>
            <div className="score-percentage">
              {Math.round((score / questions.length) * 100)}% Correct
            </div>
            <button className="restart-button" onClick={resetQuiz}>
              Try Another Quiz 🔄
            </button>
          </div>
        ) : (
          // Quiz Question Screen
          <div className="question-screen">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
            
            <div className="question-header">
              <span className="question-count">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="score-badge">Score: {score}</span>
            </div>

            <h2 className="question-text">
              {questions[currentQuestion]?.question}
            </h2>

            <div className="answers-grid">
              {questions[currentQuestion]?.answers.map((answer, index) => (
                <button
                  key={index}
                  className={getButtonClass(answer)}
                  onClick={() => handleAnswerClick(answer)}
                  disabled={isAnswered}
                >
                  {answer}
                </button>
              ))}
            </div>

            {isAnswered && (
              <div className={`feedback ${selectedAnswer === questions[currentQuestion].correctAnswer ? 'correct-feedback' : 'incorrect-feedback'}`}>
                {selectedAnswer === questions[currentQuestion].correctAnswer 
                  ? '✓ Correct!' 
                  : `✗ Wrong! Correct answer: ${questions[currentQuestion].correctAnswer}`
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
