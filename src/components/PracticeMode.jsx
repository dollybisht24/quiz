import React, {useEffect, useState} from 'react'

export default function PracticeMode({subject='react', difficulty='easy', onFinish}){
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)

  useEffect(()=>{
    const categoryMap = {react: 18, python: 17, dsa: 9, css: 12}
    const cat = categoryMap[subject] || 9
    fetch(`https://opentdb.com/api.php?amount=10&category=${cat}&difficulty=${difficulty}&type=multiple`)
      .then(r=>r.json()).then(data=>{
        const formatted = data.results.map(q=>({
          question: q.question,
          correct: q.correct_answer,
          explanation: 'Explanation placeholder — add curated explanations per topic.',
          answers: [...q.incorrect_answers, q.correct_answer].sort(()=>Math.random()-0.5)
        }))
        setQuestions(formatted)
      })
  },[subject,difficulty])

  const answer = (a)=>{
    const q = questions[current]
    const correct = a === q.correct
    if(correct) setScore(s=>s+1)
    // show explanation then advance
    alert((correct? 'Correct!\n' : 'Incorrect.\n') + q.explanation)
    const next = current+1
    if(next < questions.length) setCurrent(next)
    else onFinish && onFinish({score, total: questions.length, mode: 'Practice', subject})
  }

  if(questions.length === 0) return <div className="glass-card">Loading Practice...</div>

  const q = questions[current]
  return (
    <div className="glass-card">
      <h3 className="text-2xl text-white">Practice — {subject}</h3>
      <div className="mt-4 text-white font-semibold">{q.question}</div>
      <div className="mt-4 grid gap-3">
        {q.answers.map((a,i)=>(
          <button key={i} onClick={()=>answer(a)} className="px-4 py-2 rounded bg-white/5 text-white hover:bg-indigo-600 transition">{a}</button>
        ))}
      </div>
    </div>
  )
}
