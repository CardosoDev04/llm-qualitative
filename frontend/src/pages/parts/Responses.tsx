import { useCallback, useEffect, useState } from "react";
import {
  getAllCodedResponses,
  getAllParticipants
} from "../../services/data";
import type { CodedResponse } from "../../@types/CodedResponse";
import type { Participant } from "../../@types/Participant";
import ParticipantResponsesCard from "./sub-parts/ParticipantResponsesCard";

export default function Responses() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayedResponses, setDisplayedResponses] = useState<CodedResponse[]>(
    []
  );
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);

  const [participantIdSearchTerm, setParticipantIdSearchTerm] = useState("");

  const fetchAndDisplayAllResponses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allResponses = await getAllCodedResponses();
      setDisplayedResponses(allResponses.sort((a, b) => a.questionId.localeCompare(b.questionId)));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch responses.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAndDisplayParticipants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const participantsData = await getAllParticipants();
      setParticipants(participantsData);
      setAllParticipants(participantsData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch participants.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // initial load: all participants + all responses
    fetchAndDisplayParticipants();
    fetchAndDisplayAllResponses();
  }, [fetchAndDisplayParticipants, fetchAndDisplayAllResponses]);

  const handleSearch = () => {
    const term = participantIdSearchTerm.trim();

    // empty => reset to full list
    if (!term) {
      setParticipants(allParticipants);
      return;
    }

    const filtered = allParticipants.filter((participant) =>
      String(participant.participantId).toLowerCase() === term.toLowerCase()
    );

    setParticipants(filtered);
  };

  const handleReset = () => {
    setParticipantIdSearchTerm("");
    setParticipants(allParticipants);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header + controls */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Participant responses
          </h1>
          <p className="text-sm text-slate-500">
            Browse coded responses grouped by participant. Use the search to
            jump to a specific participant ID.
          </p>
        </div>

        <div className="flex w-full max-w-md gap-2">
          <input
            value={participantIdSearchTerm}
            onChange={(e) => setParticipantIdSearchTerm(e.target.value)}
            placeholder="Search by participant ID"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <button
            onClick={handleSearch}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Status messages */}
      {isLoading && !error && (
        <div className="mb-3 text-sm text-slate-500">Loading responses…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
        {participants.length === 0 && !isLoading && !error && (
          <p className="text-sm text-slate-500">
            No participants found. Try resetting the search.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {participants.map((participant) => (
            <ParticipantResponsesCard
              key={participant.participantId}
              participant={participant}
              responses={displayedResponses.filter(
                (response) =>
                  // keep loose equality in case of number/string mismatch
                  response.participantId == participant.participantId
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
