import { useState } from 'react';
import type { Participant } from '../../../@types/Participant';
import type { CodedResponse } from '../../../@types/CodedResponse';
import ResponseCard from './ResponseCard';

type ParticipantResponsesCardProps = {
  participant: Participant;
  responses: CodedResponse[];
};

export default function ParticipantResponsesCard({ participant, responses }: ParticipantResponsesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="participant-responses-card border border-gray-100 rounded-lg shadow-md bg-white p-4">
      {/* Card Header */}
      <div
        className="card-header flex justify-between w-full items-center cursor-pointer bg-gray-100 p-3 rounded-md hover:bg-gray-200"
        onClick={toggleExpand}
      >
        <strong className="text-lg">Participant ID: {participant.participantId}</strong>
        <span className="text-sm text-gray-500">{isExpanded ? 'Collapse' : 'Expand'}</span>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="card-content mt-4">
          {/* Participant Info */}
          <div className="participant-info mb-4">
            <p className="text-sm">
              <strong>Country:</strong> {participant.participantCountry}
            </p>
            <p className="text-sm">
              <strong>Position:</strong> {participant.participantPosition}
            </p>
            <p className="text-sm">
              <strong>Experience:</strong> {participant.participantExperience}
            </p>
          </div>

          {/* Responses */}
          <div className="flex flex-col gap-4 w-full h-1/2 overflow-y-auto">
            {responses.map((response) => (
              <ResponseCard key={response.questionId} response={response} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}