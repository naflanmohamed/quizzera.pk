import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Send,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";

const mockQuestions = [
  {
    id: 1,
    question: "Which organelle is known as the 'powerhouse of the cell'?",
    options: [
      "Nucleus",
      "Mitochondria",
      "Ribosome",
      "Endoplasmic Reticulum"
    ],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "What is the chemical formula for water?",
    options: [
      "H2O2",
      "CO2",
      "H2O",
      "NaCl"
    ],
    correctAnswer: 2,
  },
  {
    id: 3,
    question: "Which planet is known as the Red Planet?",
    options: [
      "Venus",
      "Jupiter",
      "Mars",
      "Saturn"
    ],
    correctAnswer: 2,
  },
  {
    id: 4,
    question: "What is the largest organ in the human body?",
    options: [
      "Heart",
      "Liver",
      "Brain",
      "Skin"
    ],
    correctAnswer: 3,
  },
  {
    id: 5,
    question: "Which gas is most abundant in Earth's atmosphere?",
    options: [
      "Oxygen",
      "Carbon Dioxide",
      "Nitrogen",
      "Hydrogen"
    ],
    correctAnswer: 2,
  },
];

const Quiz = () => {
  const { id } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [quizEnded, setQuizEnded] = useState(false);

  const totalQuestions = mockQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const markedCount = markedForReview.size;

  // Timer
  useEffect(() => {
    if (quizEnded) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setQuizEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizEnded]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }));
  };

  const handleMarkForReview = () => {
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    setQuizEnded(true);
  };

  const calculateScore = () => {
    let correct = 0;
    mockQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  if (quizEnded) {
    const score = calculateScore();
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              percentage >= 70 ? 'bg-success/10' : percentage >= 50 ? 'bg-warning/10' : 'bg-destructive/10'
            }`}>
              {percentage >= 70 ? (
                <CheckCircle2 className={`w-12 h-12 text-success`} />
              ) : percentage >= 50 ? (
                <AlertCircle className={`w-12 h-12 text-warning`} />
              ) : (
                <XCircle className={`w-12 h-12 text-destructive`} />
              )}
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Completed!</h1>
            <p className="text-muted-foreground mb-8">Here's how you performed</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-foreground">{score}/{totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-foreground">{percentage}%</p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-2xl font-bold text-foreground">{formatTime(30 * 60 - timeLeft)}</p>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
              <Button variant="gradient" className="flex-1" asChild>
                <Link to="/exams">Try Another</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = mockQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <BookOpen className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">MDCAT Practice</span>
              </Link>
            </div>

            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-destructive/10 text-destructive' : 'bg-muted'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>

              <Button variant="gradient" onClick={handleSubmit}>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Progress value={(answeredCount / totalQuestions) * 100} className="flex-1" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {answeredCount}/{totalQuestions} answered
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="category">
                    Question {currentQuestion + 1} of {totalQuestions}
                  </Badge>
                  <Button
                    variant={markedForReview.has(currentQuestion) ? "accent" : "ghost"}
                    size="sm"
                    onClick={handleMarkForReview}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    {markedForReview.has(currentQuestion) ? "Marked" : "Mark for Review"}
                  </Button>
                </div>

                <h2 className="text-xl font-semibold text-foreground mb-8">
                  {question.question}
                </h2>

                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(index)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedAnswers[currentQuestion] === index
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm ${
                          selectedAnswers[currentQuestion] === index
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-foreground">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    disabled={currentQuestion === totalQuestions - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-4">Question Navigator</h3>
                
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {mockQuestions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors relative ${
                        currentQuestion === index
                          ? 'bg-primary text-primary-foreground'
                          : selectedAnswers[index] !== undefined
                          ? 'bg-success/10 text-success border border-success/30'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {index + 1}
                      {markedForReview.has(index) && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-success/10 border border-success/30" />
                    <span className="text-muted-foreground">Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-muted" />
                    <span className="text-muted-foreground">Not Answered ({totalQuestions - answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-warning" />
                    <span className="text-muted-foreground">Marked ({markedCount})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
