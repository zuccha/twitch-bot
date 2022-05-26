import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomeRoute from "./routes/HomeRoute";
import QuizAdminRoute from "./routes/quiz/QuizAdminRoute";
import QuizMainRoute from "./routes/quiz/QuizMainRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/quiz/admin" element={<QuizAdminRoute />} />
        <Route path="/quiz" element={<QuizMainRoute />} />

        <Route path="/" element={<HomeRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
