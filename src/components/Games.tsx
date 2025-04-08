import React, { useState, useEffect } from "react"
import { Gamepad, X, Trophy, Award, Brain, Zap, Puzzle, Dices } from "lucide-react"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"

interface Game {
  id: number
  name: string
  description: string
  image: string
  component: React.FC
  icon: React.ReactNode
}

interface Level {
  id: number
  name: string
  difficulty: string
}

// Memory Game Component
const MemoryGame: React.FC = () => {
  const [level, setLevel] = useState<number>(1)
  const [cards, setCards] = useState<number[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState<number>(0)
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  const levels = [
    { id: 1, name: "Beginner", pairs: 4, maxMoves: 12 },
    { id: 2, name: "Intermediate", pairs: 6, maxMoves: 16 },
    { id: 3, name: "Expert", pairs: 8, maxMoves: 20 },
  ]

  useEffect(() => {
    initializeGame()
  }, [level])

  const initializeGame = () => {
    const currentLevel = levels.find((l) => l.id === level) || levels[0]
    const pairs = currentLevel.pairs
    const newCards = Array.from({ length: pairs * 2 }, (_, i) => Math.floor(i / 2))
    setCards(newCards.sort(() => Math.random() - 0.5))
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameStatus("playing")
    setShowConfetti(false)
  }

  const handleCardClick = (index: number) => {
    if (gameStatus !== "playing" || flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(moves + 1)

      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        const newMatched = [...matched, ...newFlipped]
        setMatched(newMatched)
        setFlipped([])

        // Check if all cards are matched
        if (newMatched.length === cards.length) {
          const currentLevel = levels.find((l) => l.id === level) || levels[0]
          if (moves < currentLevel.maxMoves) {
            setGameStatus("won")
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 5000)
          } else {
            setGameStatus("lost")
          }
        }
      } else {
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  const handleNextLevel = () => {
    if (level < levels.length) {
      setLevel(level + 1)
    }
  }

  const handleRestart = () => {
    initializeGame()
  }

  const currentLevel = levels.find((l) => l.id === level) || levels[0]
  const gridCols = level === 1 ? "grid-cols-4" : level === 2 ? "grid-cols-4" : "grid-cols-4"

  return (
    <div className="space-y-4">
      {showConfetti && <Confetti />}

      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-gray-300">Level: </span>
          <span className="text-red-500">{currentLevel.name}</span>
        </div>
        <div>
          <span className="text-gray-300">Moves: </span>
          <span className="text-red-500">
            {moves}/{currentLevel.maxMoves}
          </span>
        </div>
      </div>

      {gameStatus === "playing" && (
        <div className={`grid ${gridCols} gap-2 sm:gap-4`}>
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(index)}
              className={`aspect-square rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                flipped.includes(index) || matched.includes(index) ? "bg-primary text-white" : "bg-gray-700"
              }`}
            >
              {(flipped.includes(index) || matched.includes(index)) && (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {["🍎", "🍌", "🍇", "🍊", "🍓", "🍉", "🍒", "🥝"][card]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {gameStatus === "won" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
          <p className="text-gray-300 mb-4">
            You completed level {level} in {moves} moves!
          </p>
          {level < levels.length ? (
            <button
              onClick={handleNextLevel}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 mr-2"
            >
              Next Level
            </button>
          ) : (
            <p className="text-green-400 mb-4">You've completed all levels!</p>
          )}
          <button onClick={handleRestart} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            Play Again
          </button>
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <X className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Game Over</h3>
          <p className="text-gray-300 mb-4">You used too many moves. Try again!</p>
          <button onClick={handleRestart} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

// Word Puzzle Component
const WordPuzzle: React.FC = () => {
  const [level, setLevel] = useState<number>(1)
  const [currentWord, setCurrentWord] = useState<string>("")
  const [scrambledWord, setScrambledWord] = useState<string>("")
  const [guess, setGuess] = useState<string>("")
  const [attempts, setAttempts] = useState<number>(0)
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  const levels = [
    { id: 1, name: "Beginner", words: ["REACT", "GAME", "CODE", "PLAY"], maxAttempts: 3 },
    { id: 2, name: "Intermediate", words: ["JAVASCRIPT", "DEVELOPER", "FUNCTION", "VARIABLE"], maxAttempts: 3 },
    {
      id: 3,
      name: "Expert",
      words: ["ASYNCHRONOUS", "IMPLEMENTATION", "OPTIMIZATION", "ARCHITECTURE"],
      maxAttempts: 3,
    },
  ]

  useEffect(() => {
    initializeGame()
  }, [level])

  const initializeGame = () => {
    const currentLevel = levels.find((l) => l.id === level) || levels[0]
    const word = currentLevel.words[Math.floor(Math.random() * currentLevel.words.length)]
    setCurrentWord(word)
    setScrambledWord(
      word
        .split("")
        .sort(() => Math.random() - 0.5)
        .join(""),
    )
    setGuess("")
    setAttempts(0)
    setGameStatus("playing")
    setShowConfetti(false)
  }

  const handleGuess = () => {
    if (guess.toUpperCase() === currentWord) {
      setGameStatus("won")
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      const currentLevel = levels.find((l) => l.id === level) || levels[0]
      if (newAttempts >= currentLevel.maxAttempts) {
        setGameStatus("lost")
      }

      setGuess("")
    }
  }

  const handleNextLevel = () => {
    if (level < levels.length) {
      setLevel(level + 1)
    }
  }

  const handleRestart = () => {
    initializeGame()
  }

  const currentLevel = levels.find((l) => l.id === level) || levels[0]

  return (
    <div className="space-y-4">
      {showConfetti && <Confetti />}

      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-gray-300">Level: </span>
          <span className="text-red-500">{currentLevel.name}</span>
        </div>
        <div>
          <span className="text-gray-300">Attempts: </span>
          <span className="text-red-500">
            {attempts}/{currentLevel.maxAttempts}
          </span>
        </div>
      </div>

      {gameStatus === "playing" && (
        <>
          <p className="text-gray-300">Unscramble this word:</p>
          <p className="text-2xl font-bold text-primary text-center p-4 bg-gray-800 rounded-lg">{scrambledWord}</p>
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            placeholder="Enter your guess"
          />
          <button onClick={handleGuess} className="w-full bg-primary text-white p-2 rounded hover:bg-primary/80">
            Check Answer
          </button>
        </>
      )}

      {gameStatus === "won" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
          <p className="text-gray-300 mb-4">You unscrambled the word: {currentWord}</p>
          {level < levels.length ? (
            <button
              onClick={handleNextLevel}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 mr-2"
            >
              Next Level
            </button>
          ) : (
            <p className="text-green-400 mb-4">You've completed all levels!</p>
          )}
          <button onClick={handleRestart} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            Play Again
          </button>
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <X className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Game Over</h3>
          <p className="text-gray-300 mb-4">The word was: {currentWord}</p>
          <button onClick={handleRestart} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

// Math Challenge Component
const MathChallenge: React.FC = () => {
  const [level, setLevel] = useState<number>(1)
  const [score, setScore] = useState<number>(0)
  const [problem, setProblem] = useState<{ num1: number; num2: number; operator: string }>({
    num1: 0,
    num2: 0,
    operator: "+",
  })
  const [answer, setAnswer] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  const levels = [
    { id: 1, name: "Beginner", operators: ["+", "-"], maxNum: 10
      , targetScore: 5, timeLimit: 60 },
    { id: 2, name: "Intermediate", operators: ["+", "-", "*"], maxNum: 12, targetScore: 8, timeLimit: 60 },
    { id: 3, name: "Expert", operators: ["+", "-", "*", "/"], maxNum: 20, targetScore: 10, timeLimit: 60 },
  ]

  useEffect(() => {
    initializeGame()
  }, [level])

  useEffect(() => {
    if (gameStatus === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStatus === "playing") {
      setGameStatus("lost")
    }
  }, [timeLeft, gameStatus])

  const initializeGame = () => {
    generateProblem()
    const currentLevel = levels.find((l) => l.id === level) || levels[0]
    setScore(0)
    setTimeLeft(currentLevel.timeLimit)
    setGameStatus("playing")
    setShowConfetti(false)
  }

  const generateProblem = () => {
    const currentLevel = levels.find((l) => l.id === level) || levels[0]
    const operators = currentLevel.operators
    const maxNum = currentLevel.maxNum

    let num1 = Math.floor(Math.random() * maxNum) + 1
    let num2 = Math.floor(Math.random() * maxNum) + 1
    const operator = operators[Math.floor(Math.random() * operators.length)]

    // Ensure division problems have clean answers
    if (operator === "/") {
      num2 = Math.floor(Math.random() * 9) + 1
      num1 = num2 * (Math.floor(Math.random() * 10) + 1)
    }

    // Ensure subtraction doesn't give negative answers for beginners
    if (operator === "-" && level === 1) {
      if (num1 < num2) {
        ;[num1, num2] = [num2, num1]
      }
    }

    setProblem({ num1, num2, operator })
    setAnswer("")
  }

  const checkAnswer = () => {
    if (!answer) return

    let correct = false
    let expectedAnswer = 0

    switch (problem.operator) {
      case "+":
        expectedAnswer = problem.num1 + problem.num2
        break
      case "-":
        expectedAnswer = problem.num1 - problem.num2
        break
      case "*":
        expectedAnswer = problem.num1 * problem.num2
        break
      case "/":
        expectedAnswer = problem.num1 / problem.num2
        break
    }

    correct = expectedAnswer === Number.parseFloat(answer)

    if (correct) {
      const newScore = score + 1
      setScore(newScore)

      const currentLevel = levels.find((l) => l.id === level) || levels[0]
      if (newScore >= currentLevel.targetScore) {
        setGameStatus("won")
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      } else {
        generateProblem()
      }
    } else {
      setAnswer("")
    }
  }

  const handleNextLevel = () => {
    if (level < levels.length) {
      setLevel(level + 1)
    }
  }

  const handleRestart = () => {
    initializeGame()
  }

  const currentLevel = levels.find((l) => l.id === level) || levels[0]

  return (
    <div className="space-y-4">
      {showConfetti && <Confetti />}

      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-gray-300">Level: </span>
          <span className="text-red-500">{currentLevel.name}</span>
        </div>
        <div>
          <span className="text-gray-300">Score: </span>
          <span className="text-red-500">
            {score}/{currentLevel.targetScore}
          </span>
        </div>
        <div>
          <span className="text-gray-300">Time: </span>
          <span className={`font-bold ${timeLeft < 10 ? "text-red-500" : "text-blue-500"}`}>{timeLeft}s</span>
        </div>
      </div>

      {gameStatus === "playing" && (
        <>
          <div className="text-center p-6 bg-gray-800 rounded-lg mb-4">
            <p className="text-3xl font-bold text-primary">
              {problem.num1} {problem.operator} {problem.num2} = ?
            </p>
          </div>
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            placeholder="Enter your answer"
          />
          <button onClick={checkAnswer} className="w-full bg-primary text-white p-2 rounded hover:bg-primary/80">
            Submit Answer
          </button>
        </>
      )}

      {gameStatus === "won" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
          <p className="text-gray-300 mb-4">
            You completed level {level} with a score of {score}!
          </p>
          {level < levels.length ? (
            <button
              onClick={handleNextLevel}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 mr-2"
            >
              Next Level
            </button>
          ) : (
            <p className="text-green-400 mb-4">You've completed all levels!</p>
          )}
          <button onClick={handleRestart} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            Play Again
          </button>
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <X className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Time's Up!</h3>
          <p className="text-gray-300 mb-4">
            You scored {score} out of {currentLevel.targetScore}
          </p>
          <button onClick={handleRestart} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

// Whack-a-Mole Game Component
const WhackAMole: React.FC = () => {
  const [level, setLevel] = useState<number>(1)
  const [score, setScore] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState<number>(30)
  const [activeMole, setActiveMole] = useState<number | null>(null)
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  const levels = [
    { id: 1, name: "Beginner", moles: 9, interval: 1500, targetScore: 10, timeLimit: 30 },
    { id: 2, name: "Intermediate", moles: 9, interval: 1200, targetScore: 15, timeLimit: 30 },
    { id: 3, name: "Expert", moles: 9, interval: 800, targetScore: 20, timeLimit: 30 },
  ]

  useEffect(() => {
    initializeGame()
    return () => {
      clearInterval(moleInterval.current)
    }
  }, [level])

  const moleInterval = React.useRef<NodeJS.Timeout | null>(null)

  const initializeGame = () => {
    setScore(0)
    const currentLevel = levels.find((l) => l.id === level) || levels[0]
    setTimeLeft(currentLevel.timeLimit)
    setGameStatus("playing")
    setShowConfetti(false)

    if (moleInterval.current) {
      clearInterval(moleInterval.current)
    }

    moleInterval.current = setInterval(() => {
      const currentLevel = levels.find((l) => l.id === level) || levels[0]
      setActiveMole(Math.floor(Math.random() * currentLevel.moles))

      // Hide mole after a short time
      setTimeout(() => {
        setActiveMole(null)
      }, currentLevel.interval * 0.8)
    }, currentLevel.interval)
  }

  useEffect(() => {
    if (gameStatus === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStatus === "playing") {
      clearInterval(moleInterval.current!)

      const currentLevel = levels.find((l) => l.id === level) || levels[0]
      if (score >= currentLevel.targetScore) {
        setGameStatus("won")
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      } else {
        setGameStatus("lost")
      }
    }
  }, [timeLeft, gameStatus, score, level])

  const handleMoleClick = (index: number) => {
    if (index === activeMole && gameStatus === "playing") {
      setScore(score + 1)
      setActiveMole(null)
    }
  }

  const handleNextLevel = () => {
    if (level < levels.length) {
      setLevel(level + 1)
    }
  }

  const handleRestart = () => {
    initializeGame()
  }

  const currentLevel = levels.find((l) => l.id === level) || levels[0]

  return (
    <div className="space-y-4">
      {showConfetti && <Confetti />}

      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-gray-300">Level: </span>
          <span className="text-red-500">{currentLevel.name}</span>
        </div>
        <div>
          <span className="text-gray-300">Score: </span>
          <span className="text-red-500">
            {score}/{currentLevel.targetScore}
          </span>
        </div>
        <div>
          <span className="text-gray-300">Time: </span>
          <span className={`font-bold ${timeLeft < 10 ? "text-red-500" : "text-blue-500"}`}>{timeLeft}s</span>
        </div>
      </div>

      {gameStatus === "playing" && (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: currentLevel.moles }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleMoleClick(index)}
              className={`aspect-square rounded-full ${
                activeMole === index ? "bg-primary" : "bg-gray-700"
              } transition-all`}
            >
              {activeMole === index && (
                <div className="w-full h-full flex items-center justify-center text-2xl">🐹</div>
              )}
            </button>
          ))}
        </div>
      )}

      {gameStatus === "won" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
          <p className="text-gray-300 mb-4">
            You completed level {level} with a score of {score}!
          </p>
          {level < levels.length ? (
            <button
              onClick={handleNextLevel}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 mr-2"
            >
              Next Level
            </button>
          ) : (
            <p className="text-green-400 mb-4">You've completed all levels!</p>
          )}
          <button onClick={handleRestart} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            Play Again
          </button>
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <X className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Time's Up!</h3>
          <p className="text-gray-300 mb-4">
            You scored {score} out of {currentLevel.targetScore}
          </p>
          <button onClick={handleRestart} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

// Simon Says Game Component
const SimonSays: React.FC = () => {
  const [level, setLevel] = useState<number>(1)
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [isShowingSequence, setIsShowingSequence] = useState<boolean>(false)
  const [activeButton, setActiveButton] = useState<number | null>(null)
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  const levels = [
    { id: 1, name: "Beginner", sequenceLength: 3 },
    { id: 2, name: "Intermediate", sequenceLength: 5 },
    { id: 3, name: "Expert", sequenceLength: 7 },
  ]

  const colors = [
    { id: 0, color: "bg-red-500", activeColor: "bg-red-300" },
    { id: 1, color: "bg-green-500", activeColor: "bg-green-300" },
    { id: 2, color: "bg-blue-500", activeColor: "bg-blue-300" },
    { id: 3, color: "bg-yellow-500", activeColor: "bg-yellow-300" },
  ]

  useEffect(() => {
    initializeGame()
  }, [level])

  const initializeGame = () => {
    const currentLevel = levels.find((l) => l.id === level) || levels[0]
    const newSequence = Array.from({ length: currentLevel.sequenceLength }, () => Math.floor(Math.random() * 4))
    setSequence(newSequence)
    setPlayerSequence([])
    setGameStatus("playing")
    setShowConfetti(false)

    // Start showing the sequence after a short delay
    setTimeout(() => {
      showSequence()
    }, 1000)
  }

  const showSequence = async () => {
    setIsShowingSequence(true)

    for (let i = 0; i < sequence.length; i++) {
      await new Promise((resolve) => {
        setTimeout(() => {
          setActiveButton(sequence[i])
          setTimeout(() => {
            setActiveButton(null)
            resolve(null)
          }, 500)
        }, 800)
      })
    }

    setIsShowingSequence(false)
  }

  const handleButtonClick = (buttonId: number) => {
    if (isShowingSequence || gameStatus !== "playing") return

    const newPlayerSequence = [...playerSequence, buttonId]
    setPlayerSequence(newPlayerSequence)

    // Flash the button
    setActiveButton(buttonId)
    setTimeout(() => setActiveButton(null), 300)

    // Check if the player's sequence matches the game sequence so far
    for (let i = 0; i < newPlayerSequence.length; i++) {
      if (newPlayerSequence[i] !== sequence[i]) {
        setGameStatus("lost")
        return
      }
    }

    // Check if the player has completed the sequence
    if (newPlayerSequence.length === sequence.length) {
      setGameStatus("won")
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }

  const handleNextLevel = () => {
    if (level < levels.length) {
      setLevel(level + 1)
    }
  }

  const handleRestart = () => {
    initializeGame()
  }

  const currentLevel = levels.find((l) => l.id === level) || levels[0]

  return (
    <div className="space-y-4">
      {showConfetti && <Confetti />}

      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-gray-300">Level: </span>
          <span className="text-red-500">{currentLevel.name}</span>
        </div>
        <div>
          <span className="text-gray-300">Progress: </span>
          <span className="text-red-500">
            {playerSequence.length}/{sequence.length}
          </span>
        </div>
      </div>

      {gameStatus === "playing" && (
        <>
          <p className="text-center text-gray-300 mb-4">
            {isShowingSequence ? "Watch the sequence..." : "Repeat the sequence!"}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {colors.map((color) => (
              <button
                key={color.id}
                disabled={isShowingSequence}
                onClick={() => handleButtonClick(color.id)}
                className={`aspect-square rounded-lg ${
                  activeButton === color.id ? color.activeColor : color.color
                } transition-all`}
              />
            ))}
          </div>
        </>
      )}

      {gameStatus === "won" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
          <p className="text-gray-300 mb-4">You completed the sequence for level {level}!</p>
          {level < levels.length ? (
            <button
              onClick={handleNextLevel}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 mr-2"
            >
              Next Level
            </button>
          ) : (
            <p className="text-green-400 mb-4">You've completed all levels!</p>
          )}
          <button onClick={handleRestart} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            Play Again
          </button>
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <X className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Wrong Sequence!</h3>
          <p className="text-gray-300 mb-4">Try again to complete the pattern</p>
          <button onClick={handleRestart} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

// Typing Speed Game Component
const TypingSpeed: React.FC = () => {
  const [level, setLevel] = useState<number>(1)
  const [text, setText] = useState<string>("")
  const [input, setInput] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [wordsPerMinute, setWordsPerMinute] = useState<number>(0)
  const [accuracy, setAccuracy] = useState<number>(0)
  const [gameStatus, setGameStatus] = useState<"ready" | "playing" | "won" | "lost">("ready")
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  const levels = [
    {
      id: 1,
      name: "Beginner",
      texts: [
        "The quick brown fox jumps over the lazy dog.",
        "A journey of a thousand miles begins with a single step.",
        "All that glitters is not gold.",
      ],
      timeLimit: 60,
      targetWPM: 20,
    },
    {
      id: 2,
      name: "Intermediate",
      texts: [
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "The only limit to our realization of tomorrow will be our doubts of today.",
        "Life is what happens when you're busy making other plans.",
      ],
      timeLimit: 60,
      targetWPM: 30,
    },
    {
      id: 3,
      name: "Expert",
      texts: [
        "I am not a product of my circumstances. I am a product of my decisions. Every challenge you face today makes you stronger tomorrow. The challenge of life is intended to make you better, not bitter.",
        "The future belongs to those who believe in the beauty of their dreams. What you get by achieving your goals is not as important as what you become by achieving your goals.",
        "Your time is limited, don't waste it living someone else's life. Don't be trapped by dogma, which is living the result of other people's thinking.",
      ],
      timeLimit: 60,
      targetWPM: 40,
    },
  ]

  useEffect(() => {
    initializeGame()
  }, [level])

  useEffect(() => {
    if (gameStatus === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStatus === "playing") {
      endGame()
    }
  }, [timeLeft, gameStatus])

  const initializeGame = () => {
    const currentLevel = levels.find((l) => l.id === level) || levels[0]
    const randomText = currentLevel.texts[Math.floor(Math.random() * currentLevel.texts.length)]
    setText(randomText)
    setInput("")
    setTimeLeft(currentLevel.timeLimit)
    setIsPlaying(false)
    setWordsPerMinute(0)
    setAccuracy(0)
    setGameStatus("ready")
    setShowConfetti(false)
  }

  const startGame = () => {
    setGameStatus("playing")
    setIsPlaying(true)
  }

  const endGame = () => {
    setIsPlaying(false)

    // Calculate WPM
    const words = input.trim().split(/\s+/).length
    const minutes = (levels.find((l) => l.id === level)?.timeLimit || 60) / 60 - timeLeft / 60
    const wpm = Math.round(words / Math.max(minutes, 0.01))
    setWordsPerMinute(wpm)

    // Calculate accuracy
    const correctChars = text.split("").filter((char, index) => input[index] === char).length
    const acc = Math.round((correctChars / Math.max(input.length, 1)) * 100)
    setAccuracy(acc)

    const currentLevel = levels.find((l) => l.id === level) || levels[0]
    if (wpm >= currentLevel.targetWPM) {
      setGameStatus("won")
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    } else {
      setGameStatus("lost")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPlaying) {
      startGame()
    }
    setInput(e.target.value)

    // Check if the text is completed
    if (e.target.value.length >= text.length) {
      endGame()
    }
  }

  const handleNextLevel = () => {
    if (level < levels.length) {
      setLevel(level + 1)
    }
  }

  const handleRestart = () => {
    initializeGame()
  }

  const currentLevel = levels.find((l) => l.id === level) || levels[0]

  return (
    <div className="space-y-4">
      {showConfetti && <Confetti />}

      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-gray-300">Level: </span>
          <span className="text-red-500">{currentLevel.name}</span>
        </div>
        {gameStatus === "playing" && (
          <div>
            <span className="text-gray-300">Time: </span>
            <span className={`font-bold ${timeLeft < 10 ? "text-red-500" : "text-blue-500"}`}>{timeLeft}s</span>
          </div>
        )}
        {(gameStatus === "won" || gameStatus === "lost") && (
          <div>
            <span className="text-gray-300">WPM: </span>
            <span className="text-red-500">{wordsPerMinute}</span>
          </div>
        )}
      </div>

      {(gameStatus === "ready" || gameStatus === "playing") && (
        <>
          <div className="p-4 bg-gray-800 rounded-lg mb-4">
            <p className="text-gray-300 whitespace-pre-wrap">{text}</p>
          </div>
          <textarea
            value={input}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 min-h-[100px]"
            placeholder="Start typing here..."
          />
          {gameStatus === "ready" && (
            <button onClick={startGame} className="w-full bg-primary text-white p-2 rounded hover:bg-primary/80">
              Start Typing
            </button>
          )}
        </>
      )}

      {gameStatus === "won" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Congratulations!</h3>
          <p className="text-gray-300 mb-2">Your typing speed: {wordsPerMinute} WPM</p>
          <p className="text-gray-300 mb-4">Accuracy: {accuracy}%</p>
          {level < levels.length ? (
            <button
              onClick={handleNextLevel}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 mr-2"
            >
              Next Level
            </button>
          ) : (
            <p className="text-green-400 mb-4">You've completed all levels!</p>
          )}
          <button onClick={handleRestart} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            Play Again
          </button>
        </div>
      )}

      {gameStatus === "lost" && (
        <div className="text-center p-6 bg-gray-800 rounded-lg">
          <X className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Time's Up!</h3>
          <p className="text-gray-300 mb-2">Your typing speed: {wordsPerMinute} WPM</p>
          <p className="text-gray-300 mb-4">Accuracy: {accuracy}%</p>
          <p className="text-gray-300 mb-4">Target: {currentLevel.targetWPM} WPM</p>
          <button onClick={handleRestart} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80">
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

// Main Games Component
const GamesCollection: React.FC = () => {
  const { width, height } = useWindowSize()
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)

  const games: Game[] = [
    {
      id: 1,
      name: "Memory Match",
      description: "Test your memory by matching pairs of cards",
      image: "/placeholder.svg?height=200&width=400",
      component: MemoryGame,
      icon: <Brain className="w-8 h-8 text-primary" />,
    },
    {
      id: 2,
      name: "Word Puzzle",
      description: "Unscramble words to test your vocabulary",
      image: "/placeholder.svg?height=200&width=400",
      component: WordPuzzle,
      icon: <Puzzle className="w-8 h-8 text-primary" />,
    },
    {
      id: 3,
      name: "Math Challenge",
      description: "Solve math problems against the clock",
      image: "/placeholder.svg?height=200&width=400",
      component: MathChallenge,
      icon: <Zap className="w-8 h-8 text-primary" />,
    },
    {
      id: 4,
      name: "Whack-a-Mole",
      description: "Test your reflexes by clicking on moles",
      image: "/placeholder.svg?height=200&width=400",
      component: WhackAMole,
      icon: <Dices className="w-8 h-8 text-primary" />,
    },
    {
      id: 5,
      name: "Simon Says",
      description: "Remember and repeat the pattern sequence",
      image: "/placeholder.svg?height=200&width=400",
      component: SimonSays,
      icon: <Award className="w-8 h-8 text-primary" />,
    },
    {
      id: 6,
      name: "Typing Speed",
      description: "Test how fast you can type accurately",
      image: "/placeholder.svg?height=200&width=400",
      component: TypingSpeed,
      icon: <Trophy className="w-8 h-8 text-primary" />,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-gray-100">
      <div className="flex items-center mb-8">
        <Gamepad size={32} className="text-primary mr-3" />
        <h1 className="text-3xl font-bold">Game Collection</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105 border border-gray-700"
            onClick={() => setSelectedGame(game)}
          >
            <div className="relative h-48 bg-gray-700">
              <div className="absolute inset-0 flex items-center justify-center">{game.icon}</div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-100">{game.name}</h3>
              <p className="text-gray-400 mt-2">{game.description}</p>
              <button className="mt-4 w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors">
                Play Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Game Modal */}
      {selectedGame && (
        <div className="fixed inset-0 bg-blue bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-100">{selectedGame.name}</h2>
              <button
                onClick={() => setSelectedGame(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <selectedGame.component />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GamesCollection

