import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UploadScreen   from "./pages/UploadScreen.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import StatusScreen   from "./pages/StatusScreen.jsx";
import PlanLayout     from "./pages/PlanLayout.jsx";
import Dashboard      from "./pages/Dashboard.jsx";
import CarePlan       from "./pages/CarePlan.jsx";
import Medicines      from "./pages/Medicines.jsx";
import DailyTasks     from "./pages/DailyTasks.jsx";
import FollowUps      from "./pages/FollowUps.jsx";
import WarningSigns   from "./pages/WarningSigns.jsx";
import DietActivity   from "./pages/DietActivity.jsx";
import DocumentView   from "./pages/DocumentView.jsx";
import PharmacyScreen from "./pages/PharmacyScreen.jsx";
import RemindersPage  from "./pages/RemindersPage.jsx";

/**
 * App — router root.
 *
 * New dedicated pages replace the old generic DetailSection routes.
 * All routes inside /plan/:id share CarePlanContext via PlanLayout.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/"           element={<UploadScreen />} />
        <Route path="/status/:id" element={<StatusScreen />} />

        <Route path="/plan/:id" element={<PlanLayout />}>
          <Route index               element={<Dashboard />} />
          <Route path="careplan"     element={<CarePlan />} />
          <Route path="medications"  element={<Medicines />} />
          <Route path="tasks"        element={<DailyTasks />} />
          <Route path="followups"    element={<FollowUps />} />
          <Route path="warnings"     element={<WarningSigns />} />
          <Route path="diet"         element={<DietActivity />} />
          <Route path="document"     element={<DocumentView />} />
          <Route path="pharmacy"     element={<PharmacyScreen />} />
          <Route path="reminders"    element={<RemindersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}