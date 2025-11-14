import type { CodedResponse } from "../@types/CodedResponse";
import type { DescriptiveCode } from "../@types/DescriptiveCode";
import type { Participant } from "../@types/Participant";
import type { QuestionData } from "../@types/QuestionData";
import { axiosInstance } from "../axios";

export async function getAllDescriptiveCodes(): Promise<DescriptiveCode[]> {
  return axiosInstance.get<DescriptiveCode[]>("/data/descriptive-codes").then(response => response.data);
}

export async function getAllParticipants(): Promise<Participant[]> {
  return axiosInstance.get<Participant[]>("/data/participants").then(response => response.data);
}

export async function getCodedResponsesByQuestion(questionId: string) : Promise<CodedResponse[]> {
  return axiosInstance.get<CodedResponse[]>(`/data/by-question/${questionId}`).then(response => response.data);
}

export async function getAllCodedResponses(): Promise<CodedResponse[]> {
  return axiosInstance.get<CodedResponse[]>("/data/all").then(response => response.data);
}

export async function getAllQuestionData(): Promise<QuestionData[]> {
  return axiosInstance.get<QuestionData[]>("/data/question-data").then(response => response.data);
}