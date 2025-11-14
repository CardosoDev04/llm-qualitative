import { useEffect, useMemo, useState } from "react";
import { getAllDescriptiveCodes, getAllCodedResponses } from "../../services/data";
import type { DescriptiveCode } from "../../@types/DescriptiveCode";
import type { CodedResponse } from "../../@types/CodedResponse";

type DescriptiveCodeWithStats = DescriptiveCode & {
  responseCount: number;
  questionCount: number;
};

export default function DescriptiveCodes() {
  const [codes, setCodes] = useState<DescriptiveCodeWithStats[]>([]);
  const [allCodes, setAllCodes] = useState<DescriptiveCodeWithStats[]>([]);
  const [codedResponses, setCodedResponses] = useState<CodedResponse[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch codes + responses, then compute stats per code
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [rawCodes, responses] = await Promise.all([
          getAllDescriptiveCodes(),
          getAllCodedResponses(),
        ]);

        setCodedResponses(responses);

        // Build a lookup for stats: codeId -> { responseIds, questionIds }
        const statsMap: Record<
          string,
          { responseIds: Set<string | number>; questionIds: Set<string> }
        > = {};

        for (const resp of responses) {
          if (!resp.descriptiveCodes) continue;

          const ids = resp.descriptiveCodes
            .map((x) => x.categoryId.trim())
            .filter(Boolean);

          for (const id of ids) {
            if (!statsMap[id]) {
              statsMap[id] = {
                responseIds: new Set(),
                questionIds: new Set(),
              };
            }
            statsMap[id].responseIds.add(resp.participantId);
            statsMap[id].questionIds.add(resp.questionId);
          }
        }

        const enriched: DescriptiveCodeWithStats[] = rawCodes.map((code) => {
          const stats = statsMap[code.categoryId] ?? {
            responseIds: new Set(),
            questionIds: new Set(),
          };

          return {
            ...code,
            responseCount: stats.responseIds.size,
            questionCount: stats.questionIds.size,
          };
        });

        // Sort by responseCount desc by default
        enriched.sort((a, b) => b.responseCount - a.responseCount);

        setAllCodes(enriched);
        setCodes(enriched);
      } catch (err) {
        console.error(err);
        setError("Failed to load descriptive codes.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter by search term
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      setCodes(allCodes);
      return;
    }

    const filtered = allCodes.filter((code) => {
      return (
        code.categoryId.toLowerCase().includes(term) ||
        code.categoryPlainText.toLowerCase().includes(term) ||
        (code.categoryDescription || "").toLowerCase().includes(term)
      );
    });

    setCodes(filtered);
  }, [searchTerm, allCodes]);

  const totalCodes = allCodes.length;
  const totalResponsesUsingAnyCode = useMemo(() => {
    const used = new Set<string | number>();
    for (const r of codedResponses) {
      if (!r.descriptiveCodes) continue;
      used.add(r.participantId);
    }
    return used.size;
  }, [codedResponses]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Descriptive codes
          </h1>
          <p className="text-sm text-slate-500">
            Overview of all descriptive codes and how often they are used in
            coded responses across questions.
          </p>
        </div>

        <div className="flex w-full max-w-md gap-2">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, label, or description"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      {/* Top metrics */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        <StatCard label="Total descriptive codes" value={totalCodes} />
        <StatCard
          label="Participants with at least one code"
          value={totalResponsesUsingAnyCode}
        />
        <StatCard
          label="Most used code"
          value={
            allCodes[0]
              ? `${allCodes[0].categoryPlainText} (${allCodes[0].responseCount} participants)`
              : "—"
          }
        />
      </div>

      {/* Status messages */}
      {isLoading && !error && (
        <div className="mb-3 text-sm text-slate-500">Loading descriptive codes…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Codes table */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        {codes.length === 0 && !isLoading && !error ? (
          <div className="p-4 text-sm text-slate-500">
            No descriptive codes found. Try clearing the search.
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Label</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2 text-right"># Participants</th>
                  <th className="px-4 py-2 text-right"># Questions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr
                    key={code.categoryId}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-2 align-top font-mono text-xs text-slate-600">
                      {code.categoryId}
                    </td>
                    <td className="px-4 py-2 align-top font-medium text-slate-900">
                      {code.categoryPlainText}
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-600 max-w-xl">
                      {code.categoryDescription || (
                        <span className="italic text-slate-400">No description</span>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top text-right text-xs text-slate-700">
                      {code.responseCount}
                    </td>
                    <td className="px-4 py-2 align-top text-right text-xs text-slate-700">
                      {code.questionCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-1 text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}
