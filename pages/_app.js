import "@/styles/globals.css";

// INTERNAL IMPORT
import { QuizProvider } from "@/context/QuizApp";
// require("dotenv").config();

const App = ({ Component, pageProps }) => {
  return (
    <QuizProvider>
      <div>
        <Component {...pageProps} />;
      </div>
    </QuizProvider>
  );
};

export default App;
