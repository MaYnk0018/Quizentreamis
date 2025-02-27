"use client";
import React, { useEffect, useState } from "react";
import PlayQuizInstructions from "./PlayQuizInstructions";
import { Question } from "@/types/question";

import PlayQuizQuestions from "./PlayQuizQuestions";
import Loading from "../Loading";
import { useQuiz } from "../QuizContext";
import { useRouter } from "next/navigation";
import { IQuizData } from "@/types/quizData";

const PlayQuiz = ({ quizId }: { quizId: string }) => {
  const [quizData, setQuizData] = useState<IQuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [question, setQuestion] = useState<Question>();
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(
    undefined
  );
  const [isAnswered, setIsAnswered] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const { playerName, setPlayerName, setPlayerScore } = useQuiz();
  const router = useRouter();
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    if (playerName) {
      setShowQuiz(true);
    }
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quiz/${quizId}`);
        const data = await response.json();
        if (response.ok) {
          setQuizData(data);
          setQuestion(data.questions[currentQuestion]);
        } else {
          router.push("/quizentreamis");
        }
      } catch (error) {
        console.log("Error fetching quiz data:", error);
      }
    };

    fetchQuiz();
  }, [quizId, router, currentQuestion]);

  useEffect(() => {
    setPlayerScore(0);
  }, [setPlayerScore]);

  const handleOptionSelect = (option: string) => {
    setSelectedAnswer(option);
    const isCorrect = option === question?.answer;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    const isLastQuestion = currentQuestion >= quizData!.questions.length - 1;

    if (isLastQuestion) {
      setPlayerScore(newScore);
      submitScore(newScore);
      setTimeout(() => {
        router.push(`/results/${quizId}`);
      }, 300);
    } else {
      setTimeout(() => {
        setCurrentQuestion((prev) => {
          const nextQuestion = prev + 1;
          if (quizData) {
            setQuestion(quizData.questions[nextQuestion]);
          }
          return nextQuestion;
        });
        setIsAnswered(false);
        setSelectedAnswer(undefined);
      }, 1200);
    }
  };

  const submitScore = async (finalScore: number) => {
    try {
      const response = await fetch("/api/quiz/submit-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quizId, playerName, score: finalScore }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit score");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4 sm:px-8">
      {quizData ? (
        <>
          {showQuiz ? (
            <PlayQuizQuestions
              currentQuestion={currentQuestion}
              question={question}
              onOptionSelect={handleOptionSelect}
              selectedAnswer={selectedAnswer}
              isAnswered={isAnswered}
              setIsAnswered={setIsAnswered}
            />
          ) : (
            <PlayQuizInstructions
              quizCreator={quizData?.quizCreator}
              setPlayerName={setPlayerName}
              onSubmit={handleSubmit}
            />
          )}
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default PlayQuiz;
