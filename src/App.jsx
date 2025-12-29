import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import './App.css'
import SubjectHub from './components/SubjectHub'
import BlitzMode from './components/BlitzMode'
import PracticeMode from './components/PracticeMode'
import Leaderboard from './components/Leaderboard'

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
  const [timeLeft, setTimeLeft] = useState(15) // seconds per question
  const [durations, setDurations] = useState([]) // per-question durations
  const [userAnswers, setUserAnswers] = useState([])
  const timerRef = useRef(null)
  const questionStartRef = useRef(null)
  const [flow, setFlow] = useState(null)

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
      // initialize durations
      setDurations(new Array(formattedQuestions.length).fill(0))
      setUserAnswers(new Array(formattedQuestions.length).fill(null))
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

    // stop timer and calculate duration for this question
    clearInterval(timerRef.current)
    const now = Date.now()
    const duration = Math.round((now - (questionStartRef.current || now)) / 1000)
    setDurations(prev => {
      const copy = [...prev]
      copy[currentQuestion] = duration
      return copy
    })
    // record user's answer
    setUserAnswers(prev => {
      const copy = [...prev]
      copy[currentQuestion] = answer === '__time_up__' ? 'Time Up' : answer
      return copy
    })

    // Check if answer is correct
    if (answer === questions[currentQuestion].correctAnswer) {
      playSound(true)
      setScore(prevScore => prevScore + 1) // Functional setState
    } else {
      playSound(false)
    }

    // Move to next question after short delay
    setTimeout(() => {
      const nextQuestion = currentQuestion + 1
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion)
        setSelectedAnswer(null)
        setIsAnswered(false)
        setTimeLeft(15)
      } else {
        setShowScore(true)
      }
    }, 900)
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
    setTimeLeft(15)
    setDurations([])
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

  // WebAudio-based success/error sounds (no external files required)
  const playSound = (success = true) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g)
      g.connect(ctx.destination)
      o.type = success ? 'sine' : 'triangle'
      o.frequency.value = success ? 880 : 220
      g.gain.setValueAtTime(0.001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
      o.start()
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      o.stop(ctx.currentTime + 0.36)
    } catch (e) {
      // ignore if audio isn't available
    }
  }

  // Timer effect per question
  useEffect(() => {
    if (!quizStarted || showScore || questions.length === 0) return
    // start timer for current question
    clearInterval(timerRef.current)
    setTimeLeft(15)
    questionStartRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current)
          // mark as answered incorrectly and advance
          handleAnswerClick('__time_up__')
          return 0
        }
        return +(prev - 0.1).toFixed(1)
      })
    }, 100)
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, quizStarted, questions])

  // Aggregate analytics
  const totalTimeSpent = durations.reduce((a, b) => a + (Number(b) || 0), 0)
  const accuracy = questions.length ? Math.round((score / questions.length) * 100) : 0

  return (
    <div className="app">
      <div className="quiz-container">
        {!quizStarted && (
          <SubjectHub onSelectMode={(mode, subject, difficulty) => {
            setCategory(subject)
            setDifficulty(difficulty || 'medium')
            setFlow({mode, subject, difficulty: difficulty || 'medium'})
            setQuizStarted(true)
            setShowScore(false)
          }} />
        )}

        {quizStarted && flow?.mode === 'compete' && !showScore && (
          <BlitzMode subject={flow.subject} difficulty={flow.difficulty} onFinish={(res)=>{ setScore(res.score); setShowScore(true); setQuizStarted(false)}} />
        )}

        {quizStarted && flow?.mode === 'practice' && !showScore && (
          <PracticeMode subject={flow.subject} difficulty={flow.difficulty} onFinish={(res)=>{ setScore(res.score); setShowScore(true); setQuizStarted(false)}} />
        )}

        {showScore && (
          <div>
            <div className="score-screen">
              <h2>Quiz Completed! 🎉</h2>
              <div className="score-display">
                <div className="score-circle">
                  <span className="score-number">{score}</span>
                  <span className="score-total">/ 10</span>
                </div>
              </div>
              <div style={{display: 'flex', gap: 12, justifyContent: 'center'}}>
                <button className="restart-button" onClick={()=>{ setShowScore(false); setQuizStarted(false); setFlow(null); }}>Back to Hub</button>
              </div>
            </div>
            <div style={{marginTop: 20}}>
              <Leaderboard />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
