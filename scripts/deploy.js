const hre = require("hardhat");

async function main() {
  // Define deployment parameters
  const participationFee = hre.ethers.parseEther("0.1"); // 0.1 ETH participation fee
  const quizTimeLimit = 3600; // 1 hour time limit
  const minimumPassingScore = 3; // Minimum 3 correct answers to pass

  // Get the contract factory
  const QuizDapp = await hre.ethers.getContractFactory("QuizDapp");

  // Deploy the contract
  const quizDapp = await QuizDapp.deploy(
    participationFee,
    quizTimeLimit,
    minimumPassingScore
  );

  // Wait for the contract to be deployed
  await quizDapp.waitForDeployment();

  console.log(`QuizDapp deployed to: ${await quizDapp.getAddress()}`);

  // Optional: Add some initial questions
  const addQuestions = async () => {
    const questions = [
      {
        questionText: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctOption: 2
      },
      {
        questionText: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctOption: 1
      }
    ];

    for (const q of questions) {
      const tx = await quizDapp.addQuestion(
        q.questionText, 
        q.options, 
        q.correctOption
      );
      await tx.wait();
      console.log(`Added question: ${q.questionText}`);
    }
  };

  await addQuestions();
}

// Recommended pattern for handling deployment errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });