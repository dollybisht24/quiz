import React, {useEffect, useState, useRef} from 'react'

export default function BlitzMode({subject='react', difficulty='hard', onFinish}){
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [score, setScore] = useState(0)
  const timerRef = useRef(null)

  useEffect(()=>{
    // fetch 10 questions quickly; for subject mapping use a simple mapping
    const categoryMap = {react: 18, python: 17, dsa: 9, css: 12}
    const cat = categoryMap[subject] || 9
    fetch(`https://opentdb.com/api.php?amount=10&category=${cat}&difficulty=${difficulty}&type=multiple`)
      .then(r=>r.json()).then(data=>{
        const formatted = data.results.map(q=>({
          question: q.question,
          correct: q.correct_answer,
          answers: [...q.incorrect_answers, q.correct_answer].sort(()=>Math.random()-0.5)
        }))
        setQuestions(formatted)
      })
  },[subject,difficulty])

  useEffect(()=>{
    if(questions.length === 0) return
    setTimeLeft(10)
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if(t <= 0.1){
          clearInterval(timerRef.current)
          // auto move as wrong
          nextQuestion(null)
          return 0
        }
        return +(t-0.1).toFixed(1)
      })
    },100)
    return ()=> clearInterval(timerRef.current)
  },[questions,current])

  const nextQuestion = (answer)=>{
    // record score
    const q = questions[current]
    if(answer && answer === q.correct) setScore(s=>s+1)
    const next = current+1
    if(next < questions.length){
      setCurrent(next)
    } else {
      // finish
      const result = {score, total: questions.length, mode: 'Blitz', subject}
      // store to leaderboard
      const raw = localStorage.getItem('vast_leaderboard')
      const arr = raw ? JSON.parse(raw) : []
      arr.push({name: 'Anonymous', score: score, mode: 'Blitz', subject, date: new Date().toLocaleString()})
      localStorage.setItem('vast_leaderboard', JSON.stringify(arr.sort((a,b)=>b.score-a.score).slice(0,50)))
      onFinish && onFinish(result)
    }
  }

  if(questions.length === 0) return <div className="glass-card">Loading Blitz...</div>

  const q = questions[current]

  return (
    <div className="glass-card">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl text-white">Blitz Challenge — {subject}</h3>
        <div className={`px-3 py-1 rounded ${timeLeft < 3 ? 'bg-rose-500 text-white' : 'bg-white/5 text-gray-200'}`}>{timeLeft.toFixed(1)}s</div>
      </div>

      <div className="mt-6">
        <div className="text-white font-semibold">{q.question}</div>
        <div className="mt-4 grid gap-3">
          {q.answers.map((a, i)=>(
            <button key={i} onClick={()=>nextQuestion(a)} className="px-4 py-2 rounded bg-white/5 text-white hover:bg-indigo-600 transition">{a}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
