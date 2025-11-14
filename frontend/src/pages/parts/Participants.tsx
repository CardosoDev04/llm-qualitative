import { useEffect, useMemo, useState } from "react";
import { getAllParticipants } from "../../services/data";
import type { Participant } from "../../@types/Participant";

export default function Participants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getAllParticipants();
        setParticipants(data);
        setAllParticipants(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load participants.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // filter by search term: id, country, position, experience
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
  
    if (!term) {
      setParticipants(allParticipants);
      return;
    }
  
    const filtered = allParticipants.filter((p) => {
      const id = String(p.participantId).toLowerCase();
      const country = String(p.participantCountry || "").toLowerCase();
      const position = String(p.participantPosition || "").toLowerCase();
      const experience = String(p.participantExperience || "").toLowerCase();
  
      return (
        id.includes(term) ||
        country.includes(term) ||
        position.includes(term) ||
        experience.includes(term)
      );
    });
  
    setParticipants(filtered);
  }, [searchTerm, allParticipants]);

  const totalParticipants = allParticipants.length;

  const countryCount = useMemo(() => {
    const set = new Set(allParticipants.map((p) => p.participantCountry));
    return set.size;
  }, [allParticipants]);

  const positionCount = useMemo(() => {
    const set = new Set(allParticipants.map((p) => p.participantPosition));
    return set.size;
  }, [allParticipants]);

  const mostCommonCountry = useMemo(() => {
    if (allParticipants.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const p of allParticipants) {
      counts[p.participantCountry] = (counts[p.participantCountry] || 0) + 1;
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { country: sorted[0][0], count: sorted[0][1] };
  }, [allParticipants]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Participants
          </h1>
          <p className="text-sm text-slate-500">
            Overview of all survey participants and their demographic attributes.
          </p>
        </div>

        <div className="flex w-full max-w-md gap-2">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, country, position, or experience"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      {/* Top metrics */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="Total participants" value={totalParticipants} />
        <StatCard label="Countries represented" value={countryCount} />
        <StatCard label="Distinct positions" value={positionCount} />
        <StatCard
          label="Most common country"
          value={
            mostCommonCountry
              ? `${mostCommonCountry.country} (${mostCommonCountry.count})`
              : "—"
          }
        />
      </div>

      {/* Status */}
      {isLoading && !error && (
        <div className="mb-3 text-sm text-slate-500">Loading participants…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white">
        {participants.length === 0 && !isLoading && !error ? (
          <div className="p-4 text-sm text-slate-500">
            No participants found. Try clearing the search.
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Participant ID</th>
                  <th className="px-4 py-2">Country</th>
                  <th className="px-4 py-2">Position</th>
                  <th className="px-4 py-2">Experience</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr
                    key={p.participantId}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-2 align-top font-mono text-xs text-slate-700">
                      {p.participantId}
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-800">
                      {p.participantCountry || (
                        <span className="italic text-slate-400">Unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-800">
                      {p.participantPosition || (
                        <span className="italic text-slate-400">Unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-2 align-top text-xs text-slate-800">
                      {p.participantExperience || (
                        <span className="italic text-slate-400">Unknown</span>
                      )}
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
