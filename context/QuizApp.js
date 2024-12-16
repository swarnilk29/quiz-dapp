import { useState, createContext, useEffect } from 'react';
import { ethers } from 'ethers';

// INTERNAL IMPORT
import { QUIZ_CONTRACT_ADDRESS, QUIZ_CONTRACT_ABI } from '../context/constants';

const fetchContract = (signerOrProvider) => 
    new ethers.Contract(
        QUIZ_CONTRACT_ADDRESS, 
        QUIZ_CONTRACT_ABI, 
        signerOrProvider
    );

export const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [error, setError] = useState("");
    const [questions, setQuestions] = useState([]);
    const [userScore, setUserScore] = useState(0);
    const [participationFee, setParticipationFee] = useState(0);
    const [hasParticipated, setHasParticipated] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if wallet is connected
    const checkIfWalletIsConnect = async () => {
        if (!window.ethereum) {
            setError("Please install MetaMask");
            return false;
        }

        try {
            const accounts = await window.ethereum.request({ 
                method: "eth_accounts" 
            });

            if (accounts.length) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                setCurrentAccount(signer.address);
                return signer.address;
            }
        } catch (error) {
            setError("Please connect the app to MetaMask!");
            console.log("MetaMask is not connected!");
            return false;
        }
    };

    // Connect wallet
    const connectWallet = async () => {
        if (!window.ethereum) return setError("Please install MetaMask");

        try {
            await window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{
                    eth_accounts: {}
                }]
            });

            const accounts = await window.ethereum.request({ 
                method: "eth_requestAccounts" 
            });
            setCurrentAccount(accounts[0]);
            window.location.reload();

        } catch (error) {
            setError("Not able to connect to the account: " + error);
            return;
        }
    };

    const getContract = async () => {
        // Reset your provider/web3 instance when account changes
        window.ethereum.on('accountsChanged', function (accounts) {
            window.location.reload();
        });

        // Connecting with smart contract
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        return fetchContract(signer);
    };

    // Load quiz data
    const loadQuizData = async () => {
        try {
            setLoading(true);
            const contract = await getContract();

            // Get participation fee
            const fee = await contract.participationFee();
            setParticipationFee(ethers.formatEther(fee));

            // Get total questions
            const totalQuestions = await contract.getQuestionCount();
            const questionsList = [];

            // Fetch each question
            for (let i = 0; i < totalQuestions; i++) {
                const question = await contract.getQuestion(i);
                questionsList.push({
                    text: question.questionText,
                    options: question.options,
                    isActive: question.isActive
                });
            }
            setQuestions(questionsList);

            // Check if user has participated
            if (currentAccount) {
                const userData = await contract.userQuizData(currentAccount);
                setHasParticipated(userData.hasParticipated);
                setUserScore(userData.score.toString());
            }

        } catch (error) {
            setError("Error loading quiz data: " + error);
        } finally {
            setLoading(false);
        }
    };

    // Start quiz
    const startQuiz = async () => {
        try {
            setLoading(true);
            const contract = await getContract();
            const tx = await contract.startQuiz({
                value: ethers.parseEther(participationFee)
            });
            await tx.wait();
            setHasParticipated(true);
            window.location.reload();
        } catch (error) {
            setError("Error starting quiz: " + error);
        } finally {
            setLoading(false);
        }
    };

    // Submit answer
    const submitAnswer = async (questionIndex, selectedOption) => {
        try {
            setLoading(true);
            const contract = await getContract();
            const tx = await contract.submitAnswer(questionIndex, selectedOption);
            await tx.wait();
            
            // Update user score
            const newScore = await contract.getUserScore(currentAccount);
            setUserScore(newScore.toString());
        } catch (error) {
            setError("Error submitting answer: " + error);
        } finally {
            setLoading(false);
        }
    };

    // For admin: Add question
    const addQuestion = async (questionText, options, correctOption) => {
        try {
            setLoading(true);
            const contract = await getContract();
            const tx = await contract.addQuestion(questionText, options, correctOption);
            await tx.wait();
            await loadQuizData();
        } catch (error) {
            setError("Error adding question: " + error);
        } finally {
            setLoading(false);
        }
    };

    // For admin: Update question
    const updateQuestion = async (questionIndex, questionText, options, correctOption) => {
        try {
            setLoading(true);
            const contract = await getContract();
            const tx = await contract.updateQuestion(
                questionIndex,
                questionText,
                options,
                correctOption
            );
            await tx.wait();
            await loadQuizData();
        } catch (error) {
            setError("Error updating question: " + error);
        } finally {
            setLoading(false);
        }
    };

    // For admin: Deactivate question
    const deactivateQuestion = async (questionIndex) => {
        try {
            setLoading(true);
            const contract = await getContract();
            const tx = await contract.deactivateQuestion(questionIndex);
            await tx.wait();
            await loadQuizData();
        } catch (error) {
            setError("Error deactivating question: " + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <QuizContext.Provider value={{
            checkIfWalletIsConnect,
            connectWallet,
            loadQuizData,
            startQuiz,
            submitAnswer,
            addQuestion,
            updateQuestion,
            deactivateQuestion,
            currentAccount,
            error,
            questions,
            userScore,
            participationFee,
            hasParticipated,
            loading
        }}>
            {children}
        </QuizContext.Provider>
    );
};
