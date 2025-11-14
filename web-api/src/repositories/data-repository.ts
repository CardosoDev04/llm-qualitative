import { CodedResponse } from "../@types/CodedResponse";
import { CodedResponseRaw } from "../@types/CodedResponseRaw";
import { DescriptiveCode } from "../@types/DescriptiveCode";
import { query } from "./db";

export class DataRepository {
  async getCodedResponses(): Promise<CodedResponse[]> {
    const descriptiveCodes = query<DescriptiveCode>(
      `
        SELECT category_id as "categoryId",
               category_plain_text as "categoryPlainText",
               category_description as "categoryDescription"
        FROM descriptive_codes
      `
    );
    const codedResponseRaw = query<CodedResponseRaw>(
      `
        SELECT participant_id as "participantId",
               question_id as "questionId",
               original_response as "originalResponse",
               invivo_codes as "invivoCodes",
               descriptive_ids as "descriptiveIds"
        FROM response_descriptive_coding
      `
    );
    const codedResponses = (await codedResponseRaw).map(async (raw) => {
      const descriptiveIds = raw.descriptiveIds
        ? raw.descriptiveIds.replace(/\s+/g, "").split(",")
        : [];

      const descriptiveCodesResolved = await descriptiveCodes;

      const descriptiveCodesForResponse = descriptiveIds
        .map((id) =>
          descriptiveCodesResolved.find((code) => code.categoryId === id)
        )
        .filter((code): code is DescriptiveCode => code !== undefined);

      return {
        ...raw,
        descriptiveCodes: descriptiveCodesForResponse,
      };
    });
    const resolvedCodedResponses = await Promise.all(codedResponses);
    return resolvedCodedResponses;
  }

  async getCodedResponsesByQuestion(questionId: string): Promise<CodedResponse[]> {
    const responses = query<CodedResponse>(
      `
        SELECT participant_id as "participantId",
               question_id as "questionId",
               original_response as "originalResponse",
               invivo_codes as "invivoCodes",
               descriptive_ids as "descriptiveIds"
        FROM response_descriptive_coding
        WHERE question_id = $1
      `,
      [questionId]
    );
    return responses;
  }

  async getAllDescriptiveCodes(): Promise<DescriptiveCode[]> {
    const codes = query<DescriptiveCode>(
      `
        SELECT category_id as "categoryId",
               category_plain_text as "categoryPlainText",
               category_description as "categoryDescription"
        FROM descriptive_codes
      `
    );
    return codes;
  }
}
