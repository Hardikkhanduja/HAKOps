import { useEffect, useState } from "react";
import { useParams, Outlet, Navigate } from "react-router-dom";
import { getCarePlan } from "../data/carePlanApi.js";
import { CarePlanContext } from "../context/CarePlanContext.js";
import AppShell       from "../components/AppShell.jsx";
import TopBar         from "../components/TopBar.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorMessage   from "../components/ErrorMessage.jsx";

function normalizeCarePlan(data) {
  if (!data) return data;

  const plan = data.carePlan ?? {};

  const followUps = Array.isArray(plan.followUps)
    ? plan.followUps.map((f) => ({
        ...f,
        date: f.date || null,
        description: f.description || f.instructions || f.when || "Follow-up",
        type: f.type || "follow-up",
      }))
    : [];

  return {
    ...data,
    carePlan: {
      ...plan,
      medications: Array.isArray(plan.medications) ? plan.medications : [],
      followUps,
      dailyTasks: Array.isArray(plan.dailyTasks) ? plan.dailyTasks : [],
      warningSigns: Array.isArray(plan.warningSigns) ? plan.warningSigns : [],
      dietActivityRestrictions: Array.isArray(plan.dietActivityRestrictions)
        ? plan.dietActivityRestrictions
        : [],
    },
  };
}

export default function PlanLayout() {
  const { id }   = useParams();
  const [carePlan, setCarePlan] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (!id) return;
    getCarePlan(id)
      .then(data => {
        setCarePlan(normalizeCarePlan(data));
        if (data?.patient?.preferredLanguage) setLanguage(data.patient.preferredLanguage);
        // Persist the last-used plan id so the sidebar can link to it from any screen
        sessionStorage.setItem('caresetu_last_plan_id', id);
        setLoading(false);
      })
      .catch(err => { setError(err.message || "Failed to load care plan."); setLoading(false); });
  }, [id]);

  if (!id) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <AppShell id={id}>
        <div className="flex items-center justify-center h-full py-24">
          <LoadingSpinner label="Loading your care plan…" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell id={id}>
        <div className="flex items-center justify-center h-full px-4 py-24">
          <div className="max-w-sm w-full">
            <ErrorMessage message="Could not load the care plan. Please try again."
              actionLabel="Back to Upload" onAction={() => window.location.replace("/")} />
          </div>
        </div>
      </AppShell>
    );
  }

  const patientName = carePlan?.patient?.name ?? "";

  return (
    <CarePlanContext.Provider value={{ carePlan, id }}>
      <AppShell
        id={id}
        patientName={patientName}
        topBar={
          <TopBar
            patientName={patientName}
            language={language}
            onLanguageChange={setLanguage}
          />
        }
      >
        <Outlet />
      </AppShell>
    </CarePlanContext.Provider>
  );
}
