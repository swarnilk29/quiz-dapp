import QuizDapp from "../artifacts/contracts/QuizDapp.sol/QuizDapp.json";
import contract_address from "@/contract_address.json"

// export const TODO_LIST_CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
export const QUIZ_CONTRACT_ADDRESS = contract_address.address;
export const QUIZ_CONTRACT_ABI = QuizDapp.abi;