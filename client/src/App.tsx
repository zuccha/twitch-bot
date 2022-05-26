import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./features/auth/pages/HomePage";
import QuizAdminPage from "./features/quiz/pages/QuizAdminPage";
import QuizMainPage from "./features/quiz/pages/QuizMainPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/quiz/admin" element={<QuizAdminPage />} />
        <Route path="/quiz" element={<QuizMainPage />} />

        <Route path="/" element={<HomePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
