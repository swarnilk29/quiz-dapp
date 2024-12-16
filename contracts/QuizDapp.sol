// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title QuizDapp
 * @dev A simple quiz contract with ETH payments
 */
contract QuizDapp is ReentrancyGuard, Pausable {
    struct Question {
        string questionText;
        string[] options;
        uint8 correctOption;
        bool isActive;
    }

    struct UserQuizData {
        bool hasParticipated;
        uint256 score;
        uint256 quizStartTime;
        mapping(uint256 => bool) answeredQuestions;
    }

    // State variables
    address public owner;
    uint256 public participationFee;
    uint256 public quizTimeLimit;
    uint256 public minimumPassingScore;
    uint256 public totalParticipants;
    
    Question[] public questions;
    mapping(address => UserQuizData) public userQuizData;
    
    // Events
    event QuizStarted(address indexed participant, uint256 timestamp);
    event AnswerSubmitted(
        address indexed participant, 
        uint256 questionIndex, 
        uint8 selectedOption,
        bool isCorrect
    );
    event QuizCompleted(
        address indexed participant, 
        uint256 finalScore, 
        bool passed
    );
    event QuestionAdded(uint256 indexed questionIndex);
    event QuestionUpdated(uint256 indexed questionIndex);
    event QuestionDeactivated(uint256 indexed questionIndex);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier hasNotParticipated() {
        require(
            !userQuizData[msg.sender].hasParticipated,
            "Already participated in quiz"
        );
        _;
    }

    modifier hasParticipated() {
        require(
            userQuizData[msg.sender].hasParticipated,
            "Must join quiz first"
        );
        _;
    }

    modifier questionExists(uint256 _questionIndex) {
        require(_questionIndex < questions.length, "Question does not exist");
        require(questions[_questionIndex].isActive, "Question is not active");
        _;
    }

    modifier withinTimeLimit() {
        require(
            block.timestamp - userQuizData[msg.sender].quizStartTime <= quizTimeLimit,
            "Quiz time limit exceeded"
        );
        _;
    }

    /**
     * @dev Contract constructor
     * @param _participationFee Fee in ETH required to participate
     * @param _quizTimeLimit Time limit for quiz completion in seconds
     * @param _minimumPassingScore Minimum score required to pass the quiz
     */
    constructor(
        uint256 _participationFee,
        uint256 _quizTimeLimit,
        uint256 _minimumPassingScore
    ) {
        owner = msg.sender;
        participationFee = _participationFee;
        quizTimeLimit = _quizTimeLimit;
        minimumPassingScore = _minimumPassingScore;
    }

    /**
     * @dev Start the quiz by paying participation fee
     */
    function startQuiz() external payable hasNotParticipated nonReentrant whenNotPaused {
        require(msg.value == participationFee, "Incorrect participation fee");
        require(questions.length > 0, "No questions available");

        // Initialize user quiz data
        UserQuizData storage userData = userQuizData[msg.sender];
        userData.hasParticipated = true;
        userData.quizStartTime = block.timestamp;
        userData.score = 0;

        totalParticipants++;

        emit QuizStarted(msg.sender, block.timestamp);
    }

    /**
     * @dev Submit answer for a question
     * @param _questionIndex Index of the question
     * @param _selectedOption Selected option index
     */
    function submitAnswer(uint256 _questionIndex, uint8 _selectedOption) 
        external
        hasParticipated
        questionExists(_questionIndex)
        withinTimeLimit
        whenNotPaused
    {
        UserQuizData storage userData = userQuizData[msg.sender];
        require(
            !userData.answeredQuestions[_questionIndex],
            "Question already answered"
        );

        Question memory question = questions[_questionIndex];
        require(
            _selectedOption < question.options.length,
            "Invalid option selected"
        );

        bool isCorrect = (question.correctOption == _selectedOption);
        if (isCorrect) {
            userData.score += 1;
        }

        userData.answeredQuestions[_questionIndex] = true;

        emit AnswerSubmitted(msg.sender, _questionIndex, _selectedOption, isCorrect);

        // Check if all questions are answered
        bool allAnswered = true;
        for (uint256 i = 0; i < questions.length; i++) {
            if (!userData.answeredQuestions[i] && questions[i].isActive) {
                allAnswered = false;
                break;
            }
        }

        if (allAnswered) {
            bool passed = userData.score >= minimumPassingScore;
            emit QuizCompleted(msg.sender, userData.score, passed);
        }
    }

    /**
     * @dev Add a new question to the quiz
     * @param _questionText Question text
     * @param _options Array of options
     * @param _correctOption Index of correct option
     */
    function addQuestion(
        string memory _questionText,
        string[] memory _options,
        uint8 _correctOption
    ) external onlyOwner {
        require(_options.length >= 2, "Minimum 2 options required");
        require(_correctOption < _options.length, "Invalid correct option");

        questions.push(Question({
            questionText: _questionText,
            options: _options,
            correctOption: _correctOption,
            isActive: true
        }));

        emit QuestionAdded(questions.length - 1);
    }

    /**
     * @dev Update an existing question
     * @param _questionIndex Index of question to update
     * @param _questionText New question text
     * @param _options New options array
     * @param _correctOption New correct option index
     */
    function updateQuestion(
        uint256 _questionIndex,
        string memory _questionText,
        string[] memory _options,
        uint8 _correctOption
    ) external onlyOwner questionExists(_questionIndex) {
        require(_options.length >= 2, "Minimum 2 options required");
        require(_correctOption < _options.length, "Invalid correct option");

        Question storage question = questions[_questionIndex];
        question.questionText = _questionText;
        question.options = _options;
        question.correctOption = _correctOption;

        emit QuestionUpdated(_questionIndex);
    }

    /**
     * @dev Deactivate a question
     * @param _questionIndex Index of question to deactivate
     */
    function deactivateQuestion(uint256 _questionIndex) 
        external 
        onlyOwner 
        questionExists(_questionIndex) 
    {
        questions[_questionIndex].isActive = false;
        emit QuestionDeactivated(_questionIndex);
    }

    /**
     * @dev Get user's quiz score
     * @param _user Address of user
     */
    function getUserScore(address _user) external view returns (uint256) {
        return userQuizData[_user].score;
    }

    /**
     * @dev Get total number of questions
     */
    function getQuestionCount() external view returns (uint256) {
        return questions.length;
    }

    /**
     * @dev Get question details
     * @param _questionIndex Index of question
     */
    function getQuestion(uint256 _questionIndex) 
        external 
        view 
        returns (
            string memory questionText,
            string[] memory options,
            bool isActive
        ) 
    {
        require(_questionIndex < questions.length, "Question does not exist");
        Question memory question = questions[_questionIndex];
        return (
            question.questionText,
            question.options,
            question.isActive
        );
    }

    /**
     * @dev Update participation fee
     * @param _newFee New participation fee in ETH
     */
    function updateParticipationFee(uint256 _newFee) external onlyOwner {
        participationFee = _newFee;
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw contract balance
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}