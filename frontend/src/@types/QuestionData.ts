import type { CodedResponse } from "./CodedResponse";
import type { DescriptiveCode } from "./DescriptiveCode";
import type { Participant } from "./Participant";
import type { Question } from "./Question";

export type DescriptiveCodeUsage = {
  code: DescriptiveCode;
  /** How many responses for this question used this code at least once */
  responseCount: number;
  /** Total occurrences across all responses (if you treat duplicates separately) */
  occurrenceCount: number;
  /** responseCount / totalResponses for this question */
  responsePercentage: number;
};

export type InVivoCodeUsage = {
  codeText: string;
  /** How many responses for this question used this in-vivo code */
  responseCount: number;
  occurrenceCount: number;
  responsePercentage: number;
};

export type ParticipantBreakdown = {
  byCountry: Record<string, number>;
  byPosition: Record<string, number>;
  byExperience: Record<string, number>;
};

export type QuestionTopCode = {
  code: DescriptiveCode;
  responseCount: number;
  occurrenceCount: number;
  responsePercentage: number;
};

export type QuestionData = {
  question: Question;

  /** All coded responses for this question (with descriptiveCodes already resolved) */
  codedResponses: CodedResponse[];

  /** Total number of responses for this question */
  totalResponses: number;

  /** How many responses have no descriptive codes at all */
  responsesWithoutDescriptiveCodes: number;

  /** Average number of descriptive codes per response (for this question) */
  avgDescriptiveCodesPerResponse: number;

  /** Per-code stats for this question */
  descriptiveCodeUsage: DescriptiveCodeUsage[];

  /** Most used descriptive code for this question (by responseCount) */
  mostUsedDescriptiveCode: QuestionTopCode | null;

  /** In-vivo / open codes stats extracted from `invivoCodes` */
  invivoCodeUsage: InVivoCodeUsage[];
  /** Top N in-vivo codes for quick display, e.g. N = 5 */
  topInvivoCodes: InVivoCodeUsage[];

  /** All participants who answered this question */
  participants: Participant[];

  /** Aggregated view over who answered */
  participantBreakdown: ParticipantBreakdown;
};
