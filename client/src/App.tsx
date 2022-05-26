import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminRoute from "./routes/quiz/QuizAdminRoute";
import MainRoute from "./routes/MainRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/" element={<MainRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
