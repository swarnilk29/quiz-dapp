import { MdVerified } from "react-icons/md";
import React, { useEffect, useContext, useState } from "react";
import { RiSendPlaneFill } from "react-icons/ri";
import Image from "next/image";

import { QuizContext } from "@/context/QuizApp";
import Style from "@/styles/index.module.css";

const QuizDapp = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const {
    checkIfWalletIsConnect,
    connectWallet,
    currentAccount,
    error,
    startQuiz,
    submitAnswer,
    getQuestions,
    questions,
    userScore,
    userQuizData
  } = useContext(QuizContext);

  useEffect(() => {
    checkIfWalletIsConnect().then((account) => {
      if (account) {
        getQuestions();
      }
    });
    console.log("err: ", error);
  }, []);

  const handleStartQuiz = () => {
    startQuiz();
  };

  const handleSubmitAnswer = () => {
    if (selectedOption !== null) {
      submitAnswer(currentQuestionIndex, selectedOption);
      setSelectedOption(null);
      
      // Move to next question or reset if all questions answered
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  };

  return (
    <div className={Style.home}>
      {/* NavBar */}
      <div className= {Style.navBar}>
        {/* <Image src={img} alt="Logo" width={50} height={50} /> */}
        <div></div>

        <div className={Style.connect}>
          {!currentAccount ? (
            <button onClick={() => connectWallet()}>Connect Wallet</button>
          ) : (
            <button onClick={() => connectWallet()}>
              {currentAccount.slice(0, 20)}..
            </button>
          )}
        </div>
      </div>

      {/* Quiz Container */}
      <div className={Style.home_box}>
        {/* Quiz Results/History */}
        <div className={Style.home_completed}>
          <div>
            <h2>Quiz Results</h2>
            {userQuizData && (
              <div className={Style.home_completed_list}>
                <MdVerified className={Style.iconColor} />
                <h3>Score: {userScore}/5</h3>
                <h3>Passed: {userScore >= 3 ? "Yes" : "No"}</h3>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Area */}
        <div className={Style.home_create}>
          <div className={Style.home_create_box}>
            <h2>Blockchain Quiz</h2>

            {/* Quiz Start Button */}
            {!userQuizData && (
              <button 
                onClick={handleStartQuiz} 
                className={Style.start_quiz_button}
              >
                Start Quiz (0.1 ETH)
              </button>
            )}

            {/* Questions */}
            {userQuizData && questions.length > 0 && (
              <div className={Style.quiz_question_container}>
                <h3>Question {currentQuestionIndex + 1}</h3>
                <p>{questions[currentQuestionIndex].questionText}</p>

                {/* Options */}
                <div className={Style.quiz_options}>
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(index)}
                      className={
                        selectedOption === index 
                        ? Style.selected_option 
                        : Style.quiz_option
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {/* Submit Answer */}
                <button 
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className={Style.submit_answer_button}
                >
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDapp;