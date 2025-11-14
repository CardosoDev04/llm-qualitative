import { useEffect, useState } from "react";
import { getAllQuestionData } from "../../services/data";
import type { QuestionData } from "../../@types/QuestionData";

export default function Questions() {
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAllQuestionData()
      .then((data) => {
        if (!isMounted) return;
        setQuestionsData(data);
        if (data.length > 0) {
          setSelectedQuestionId(data[0].question.questionId);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (!isMounted) return;
        setError("Failed to load question data.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500 animate-pulse">Loading questions…</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (questionsData.length === 0) {
    return <div className="text-slate-500">No question data available.</div>;
  }

  const selectedQuestion = questionsData.find(
    (q) => q.question.questionId === selectedQuestionId
  );

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      {/* Sidebar: Question list */}
      <aside className="w-80 border-r border-slate-200 pr-4 overflow-y-auto">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          Questions
        </h2>
        <div className="space-y-1">
          {questionsData.map((q) => (
            <button
              key={q.question.questionId}
              onClick={() => setSelectedQuestionId(q.question.questionId)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                ${
                  q.question.questionId === selectedQuestionId
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-800 hover:bg-slate-100"
                }`}
            >
              <div className="font-medium truncate">
                {q.question.questionId}
              </div>
              <div className="text-xs text-slate-500 line-clamp-2">
                {q.question.questionText}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main content: Selected question details */}
      <main className="flex-1 overflow-y-auto">
        {selectedQuestion ? (
          <QuestionDetail questionData={selectedQuestion} />
        ) : (
          <div className="text-slate-500">Select a question to view details.</div>
        )}
      </main>
    </div>
  );
}

// ---- Detail + visualization components ----

type QuestionDetailProps = {
  questionData: QuestionData;
};

function QuestionDetail({ questionData }: QuestionDetailProps) {
  const {
    question,
    totalResponses,
    avgDescriptiveCodesPerResponse,
    responsesWithoutDescriptiveCodes,
    descriptiveCodeUsage,
    mostUsedDescriptiveCode,
    topInvivoCodes,
    participantBreakdown,
  } = questionData;

  return (
    <div className="space-y-6">
      {/* Question header */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="text-xs font-semibold text-slate-500 mb-1">
          {question.questionId}
        </div>
        <h1 className="text-lg font-semibold text-slate-900">
          {question.questionText}
        </h1>
      </section>

      {/* Top-level metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Responses"
          value={totalResponses}
        />
        <StatCard
          label="Avg. descriptive codes / response"
          value={avgDescriptiveCodesPerResponse.toFixed(2)}
        />
        <StatCard
          label="Responses w/o codes"
          value={responsesWithoutDescriptiveCodes}
        />
        <StatCard
          label="Most used code"
          value={
            mostUsedDescriptiveCode
              ? `${mostUsedDescriptiveCode.code.categoryPlainText} (${mostUsedDescriptiveCode.responseCount})`
              : "—"
          }
        />
      </section>

      {/* Descriptive code usage */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Descriptive code usage
          </h2>
          <span className="text-xs text-slate-500">
            Responses with each descriptive code
          </span>
        </div>
        {descriptiveCodeUsage.length === 0 ? (
          <div className="text-sm text-slate-500">
            No descriptive codes for this question.
          </div>
        ) : (
          <BarList
            items={descriptiveCodeUsage.map((d) => ({
              label: d.code.categoryPlainText,
              sublabel: d.code.categoryDescription,
              value: d.responseCount,
              percentage: d.responsePercentage * 100,
            }))}
          />
        )}
      </section>

      {/* In-vivo codes */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Top in-vivo codes
          </h2>
          <span className="text-xs text-slate-500">
            Showing up to 5 most frequent
          </span>
        </div>
        {topInvivoCodes.length === 0 ? (
          <div className="text-sm text-slate-500">No in-vivo codes.</div>
        ) : (
          <BarList
            items={topInvivoCodes.map((c) => ({
              label: c.codeText,
              value: c.responseCount,
              percentage: c.responsePercentage * 100,
            }))}
          />
        )}
      </section>

      {/* Participant breakdown */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">
          Participant breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <BreakdownBlock
            title="By country"
            data={participantBreakdown.byCountry}
          />
          <BreakdownBlock
            title="By position"
            data={participantBreakdown.byPosition}
          />
          <BreakdownBlock
            title="By experience"
            data={participantBreakdown.byExperience}
          />
        </div>
      </section>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

// Generic bar list for both descriptive & in-vivo codes
type BarListItem = {
  label: string;
  sublabel?: string;
  value: number;
  percentage: number; // 0–100
};

type BarListProps = {
  items: BarListItem[];
};

function BarList({ items }: BarListProps) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-xs">
            <div className="font-medium text-slate-800 truncate">
              {item.label}
            </div>
            <div className="text-slate-500">
              {item.value} · {Math.round(item.percentage)}%
            </div>
          </div>
          {item.sublabel && (
            <div className="text-[11px] text-slate-400 truncate">
              {item.sublabel}
            </div>
          )}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{
                width: `${(item.value / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

type BreakdownBlockProps = {
  title: string;
  data: Record<string, number>;
};

function BreakdownBlock({ title, data }: BreakdownBlockProps) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return (
      <div>
        <div className="text-xs font-semibold text-slate-600 mb-1">
          {title}
        </div>
        <div className="text-sm text-slate-500">No data.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs font-semibold text-slate-600 mb-1">
        {title}
      </div>
      <ul className="space-y-1">
        {entries.map(([key, count]) => (
          <li key={key} className="flex justify-between text-xs">
            <span className="text-slate-700 truncate">
              {key || <span className="italic text-slate-400">Unknown</span>}
            </span>
            <span className="text-slate-500">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
