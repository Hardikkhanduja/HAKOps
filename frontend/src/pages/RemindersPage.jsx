import { useState } from "react";

import {
  Bell,
  Plus,
  Clock,
  Pill,
  FlaskConical,
  CheckSquare,
  Heart,
} from "lucide-react";

import { format, parseISO } from "date-fns";

import { useCarePlan } from "../context/CarePlanContext.js";
import { getAuthSession } from "../utils/session";

import PageHeader from "../components/PageHeader.jsx";
import TabbedFilter from "../components/TabbedFilter.jsx";

/**
 * Reminder type icons and colours.
 */
const TYPE_STYLE = {
  medicine: {
    icon: Pill,
    color: "#059669",
    bg: "#D1FAE5",
  },
  test: {
    icon: FlaskConical,
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  task: {
    icon: CheckSquare,
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
  other: {
    icon: Bell,
    color: "#0F6B5C",
    bg: "#E8F5F2",
  },
};

function guessType(relatedTo) {
  const r = (relatedTo || "").toLowerCase();

  if (
    r.includes("medic") ||
    r.includes("tablet") ||
    r.includes("dose")
  ) {
    return "medicine";
  }

  if (
    r.includes("test") ||
    r.includes("lab") ||
    r.includes("blood")
  ) {
    return "test";
  }

  if (
    r.includes("task") ||
    r.includes("dress") ||
    r.includes("temp")
  ) {
    return "task";
  }

  return "other";
}

/**
 * Build reminder list from:
 * - backend reminders
 * - daily tasks
 * - medications
 * - follow-ups
 */
function buildReminderList(carePlan) {
  const items = [];
  const cp = carePlan?.carePlan || {};

  // Real reminders saved by the backend
  (carePlan?.reminders || []).forEach((r, index) => {
    items.push({
      id: r.reminderId || r.relatedTo || `backend-${index}`,
      label: r.subject || r.relatedTo || "Reminder",
      sublabel:
        r.channel === "email"
          ? "Email reminder"
          : r.channel || "Email reminder",
      time: r.dateTime
        ? format(parseISO(r.dateTime), "dd MMM yyyy, hh:mm a")
        : r.sendAt
          ? format(parseISO(r.sendAt), "dd MMM yyyy, hh:mm a")
          : "Scheduled",
      frequency: null,
      type: guessType(r.subject || r.relatedTo),
      source: "backend",
    });
  });

  // Daily tasks
  (cp.dailyTasks || []).forEach((t, i) => {
    items.push({
      id: `task-${i}`,
      label: t.description || "Care task",
      sublabel: "Check and record",
      time: "Today, 9:00 PM",
      frequency: t.frequency,
      type: "task",
      source: "derived",
    });
  });

  // Medications
  (cp.medications || []).forEach((m, i) => {
    items.push({
      id: `med-${i}`,
      label: m.name || "Medicine",
      sublabel: m.dosage || m.dose || "",
      time: "Today, 8:00 PM",
      frequency: m.timing || m.frequency,
      type: "medicine",
      source: "derived",
    });
  });

  // Follow-ups
  (cp.followUps || []).forEach((f, i) => {
    items.push({
      id: `fu-${i}`,
      label: f.description || "Follow-up",
      sublabel: "Follow-up reminder",
      time: f.date
        ? format(parseISO(f.date), "dd MMM yyyy, hh:mm a")
        : "Upcoming",
      frequency: "One time",
      type: "test",
      source: "derived",
    });
  });

  return items;
}

export default function RemindersPage() {
  const { carePlan, id } = useCarePlan();
  const { patient } = carePlan || {};

  const allReminders = buildReminderList(carePlan);

  const [activeTab, setActiveTab] = useState(0);

  const [enabled, setEnabled] = useState(() =>
    Object.fromEntries(
      allReminders.map((r) => [r.id, true])
    )
  );

  const [extras, setExtras] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState("");

  const all = [...allReminders, ...extras];

  const medicines = all.filter(
    (r) => r.type === "medicine"
  );

  const tests = all.filter(
    (r) => r.type === "test"
  );

  const tasks = all.filter(
    (r) => r.type === "task"
  );

  const tabs = [
    {
      label: "All",
      count: all.length,
    },
    {
      label: "Medicines",
      count: medicines.length,
    },
    {
      label: "Tests",
      count: tests.length,
    },
    {
      label: "Tasks",
      count: tasks.length,
    },
  ];

  const visible = [
    all,
    medicines,
    tests,
    tasks,
  ][activeTab];

  function toggle(id) {
    setEnabled((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  async function addReminder() {
    const label = window.prompt("Reminder title:");

    if (!label) {
      return;
    }

    const dateTimeInput = window.prompt(
      "Enter reminder date and time:\n\nExample:\n2026-09-21T20:00"
    );

    if (!dateTimeInput) {
      return;
    }

    const reminderDate = new Date(dateTimeInput);

    if (Number.isNaN(reminderDate.getTime())) {
      window.alert("Please enter a valid date and time.");
      return;
    }

    if (reminderDate.getTime() <= Date.now()) {
      window.alert("Please choose a future date and time.");
      return;
    }

    const authSession = getAuthSession();

    if (!authSession?.sessionId) {
      window.alert(
        "Your session has expired. Please login again."
      );
      return;
    }

    /*
     * We will verify the exact care-plan ID field after
     * the frontend builds successfully.
     */
    const patientId = id;    
    if (!patientId) {
      window.alert(
        "Care plan ID is missing. Please reload the care plan."
      );
      return;
    }

    setIsAdding(true);
    setMessage("");

    try {
        const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL || "/api"}/reminders`,
  {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": authSession.sessionId,
        },
        body: JSON.stringify({
          patientId,
          dateTime: reminderDate.toISOString(),
          subject: label,
          message: `CareSetu reminder: ${label}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create reminder"
        );
      }

      const savedReminder = data.reminder;

      const newReminder = {
        id: savedReminder.reminderId,
        label: savedReminder.subject,
        sublabel: "Email reminder",
        time: format(
          parseISO(savedReminder.dateTime),
          "dd MMM yyyy, hh:mm a"
        ),
        frequency: "One time",
        type: "other",
        source: "backend",
      };

      setExtras((prev) => [
        ...prev,
        newReminder,
      ]);

      setEnabled((prev) => ({
        ...prev,
        [newReminder.id]: true,
      }));

      setMessage(
        "Reminder scheduled successfully. You will receive an email at the scheduled time."
      );
    } catch (error) {
      console.error(
        "Reminder creation failed:",
        error
      );

      window.alert(
        error.message ||
          "Failed to create reminder."
      );
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="min-h-full pb-8">

      <PageHeader
        breadcrumb="Reminders"
        patientName={patient?.name || "Patient"}
      />

      {/* Title + Add button */}
      <div className="flex items-center justify-between px-6 pb-4">

        <div className="flex items-center gap-3">

          <div
            className="rounded-2xl p-2.5"
            style={{
              background: "var(--brand)",
            }}
          >
            <Bell
              className="h-5 w-5 text-white"
              aria-hidden="true"
            />
          </div>

          <div>

            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Reminders
            </h2>

            <p
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              Set reminders so you never miss your
              medicines, tests or care tasks.
            </p>

          </div>

        </div>

        <button
          onClick={addReminder}
          disabled={isAdding}
          className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-sm transition-all active:scale-95"
          style={{
            background: "var(--brand)",
            color: "#ffffff",
            border: "none",
            opacity: isAdding ? 0.7 : 1,
            cursor: isAdding
              ? "not-allowed"
              : "pointer",
          }}
          aria-label="Add a new reminder"
        >
          <Plus
            className="h-4 w-4"
            aria-hidden="true"
          />

          {isAdding
            ? "Scheduling..."
            : "Add Reminder"}
        </button>

      </div>

      {/* Success message */}
      {message && (
        <div
          className="mx-6 mb-4 rounded-xl px-4 py-3"
          style={{
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 pb-4">
        <TabbedFilter
          tabs={tabs}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Sort label */}
      <div className="px-6 pb-2 flex items-center justify-between">

        <span
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
          }}
        >
          {visible.length} reminder
          {visible.length !== 1 ? "s" : ""}
        </span>

        <span
          style={{
            fontSize: "12px",
            color: "var(--text-secondary)",
            fontWeight: 600,
          }}
        >
          Sort by: Next Reminder
        </span>

      </div>

      {/* Reminder list */}
      <div className="px-6 space-y-2 mb-6">

        {visible.length === 0 ? (

          <div
            className="text-center py-16 rounded-2xl"
            style={{
              background: "var(--muted-fill)",
              border: "2px dashed var(--border)",
            }}
          >

            <Bell
              className="h-10 w-10 mx-auto mb-3"
              style={{
                color: "var(--text-secondary)",
              }}
            />

            <p
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--text-secondary)",
              }}
            >
              No reminders in this category
            </p>

          </div>

        ) : (

          visible.map((r) => {

            const style =
              TYPE_STYLE[r.type] ||
              TYPE_STYLE.other;

            const Icon = style.icon;

            const isOn =
              enabled[r.id] !== false;

            return (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: "var(--card)",
                  border:
                    "1.5px solid var(--border)",
                  boxShadow:
                    "0 1px 4px rgba(0,0,0,0.04)",
                  opacity: isOn ? 1 : 0.55,
                }}
              >

                {/* Type icon */}
                <div
                  className="rounded-xl p-2 shrink-0"
                  style={{
                    background: style.bg,
                  }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{
                      color: style.color,
                    }}
                    aria-hidden="true"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">

                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {r.label}
                  </p>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {r.sublabel}
                  </p>

                </div>

                {/* Time + frequency */}
                <div className="text-right shrink-0 mr-2">

                  <div className="flex items-center gap-1 justify-end">

                    <Clock
                      className="h-3 w-3"
                      style={{
                        color:
                          "var(--text-secondary)",
                      }}
                      aria-hidden="true"
                    />

                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text-primary)",
                        fontWeight: 600,
                      }}
                    >
                      {r.time}
                    </span>

                  </div>

                  {r.frequency && (
                    <p
                      style={{
                        fontSize: "11px",
                        color:
                          "var(--text-secondary)",
                      }}
                    >
                      ↻ {r.frequency}
                    </p>
                  )}

                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggle(r.id)}
                  className="relative shrink-0 rounded-full transition-colors"
                  style={{
                    width: 40,
                    height: 22,
                    background: isOn
                      ? "var(--brand)"
                      : "var(--muted-fill)",
                    border: `1.5px solid ${
                      isOn
                        ? "var(--brand)"
                        : "var(--border)"
                    }`,
                  }}
                  aria-label={`${
                    isOn ? "Disable" : "Enable"
                  } reminder for ${r.label}`}
                  aria-checked={isOn}
                  role="switch"
                >

                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: isOn
                        ? "calc(100% - 20px)"
                        : 2,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#ffffff",
                      transition:
                        "left 0.2s ease",
                      display: "block",
                    }}
                  />

                </button>

              </div>
            );
          })
        )}

      </div>

      {/* Stay on track banner */}
      <div
        className="mx-6 rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
        style={{
          background: "var(--brand-tint)",
          border:
            "1.5px solid var(--brand-tint-mid)",
        }}
      >

        <div className="flex items-center gap-3">

          <Heart
            className="h-5 w-5"
            style={{
              color: "var(--brand)",
            }}
            aria-hidden="true"
          />

          <div>

            <p
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--brand)",
              }}
            >
              Stay on track
            </p>

            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              Timely reminders help you follow your
              care plan and recover better.
            </p>

          </div>

        </div>

        <p
          style={{
            fontSize: "11px",
            color: "var(--brand)",
            fontWeight: 600,
            textAlign: "right",
            lineHeight: 1.4,
          }}
        >
          Small
          <br />
          reminders.
          <br />
          Big progress.
        </p>

      </div>

    </div>
  );
}
