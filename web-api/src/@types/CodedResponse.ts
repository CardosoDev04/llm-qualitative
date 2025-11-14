import { DescriptiveCode } from "./DescriptiveCode";

export type CodedResponse = {
  participantId: string;
  questionId: string;
  originalResponse: string;
  invivoCodes: string;
  descriptiveCodes: DescriptiveCode[];
}