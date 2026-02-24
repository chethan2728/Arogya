import React from 'react'

const IntroSplash = () => {
  const letters = ['A', 'R', 'O', 'G', 'Y', 'A']

  return (
    <div className="intro-overlay">
      <div className="flex flex-col items-center gap-4">
        <div className="intro-title hero-gradient-text">AROGYA</div>
        <div className="alphabet-wall">
          {letters.map((letter, idx) => (
            <div key={letter + idx} className="alpha-cube" style={{ animationDelay: `${idx * 0.06}s` }}>
              {letter}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IntroSplash
