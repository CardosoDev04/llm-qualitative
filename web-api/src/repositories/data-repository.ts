import { CodedResponse } from "../@types/CodedResponse";
import { CodedResponseRaw } from "../@types/CodedResponseRaw";
import { DescriptiveCode } from "../@types/DescriptiveCode";
import { Participant } from "../@types/Participant";
import { Question } from "../@types/Question";
import { DescriptiveCodeUsage, InVivoCodeUsage, QuestionData } from "../@types/QuestionData";
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

  async getCodedResponsesByQuestion(
    questionId: string
  ): Promise<CodedResponse[]> {
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

  async getAllParticipants(): Promise<Participant[]> {
    const participants = query<Participant>(
      `
        SELECT participant_id as "participantId",
               participant_country as "participantCountry",
               participant_position as "participantPosition",
               participant_experience as "participantExperience"
        FROM participants
      `
    );
    return participants;
  }

  async getAllQuestions(): Promise<Question[]> {
    const questions = query<Question>(
      `
        SELECT question_id as "questionId",
               question_text as "questionText"
        FROM questions
      `
    );
    return questions;
  }

  async getQuestionById(questionId: string): Promise<Question | null> {
    const questions = query<Question>(
      `
        SELECT question_id as "questionId",
               question_text as "questionText"
        FROM questions
        WHERE question_id = $1
      `,
      [questionId]
    );
    const results = await questions;
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Aggregates all useful analytics per question,
   * returning QuestionData[].
   */
  async getAllQuestionData(): Promise<QuestionData[]> {
    const [questions, codedResponses, participants] = await Promise.all([
      this.getAllQuestions(),
      this.getCodedResponses(),
      this.getAllParticipants()
    ]);

    const result: QuestionData[] = [];

    for (const question of questions) {
      const responsesForQuestion = codedResponses.filter(
        (cr) => cr.questionId === question.questionId
      );

      const totalResponses = responsesForQuestion.length;

      // -------------------------
      // DESCRIPTIVE CODE ANALYSIS
      // -------------------------
      const descriptiveUsageMap: Record<string, {
        code: any,
        responseCount: number,
        occurrenceCount: number
      }> = {};

      for (const r of responsesForQuestion) {
        if (!r.descriptiveCodes || r.descriptiveCodes.length === 0) continue;

        for (const dc of r.descriptiveCodes) {
          if (!descriptiveUsageMap[dc.categoryId]) {
            descriptiveUsageMap[dc.categoryId] = {
              code: dc,
              responseCount: 0,
              occurrenceCount: 0
            };
          }
          descriptiveUsageMap[dc.categoryId].responseCount += 1;
          descriptiveUsageMap[dc.categoryId].occurrenceCount += 1;
        }
      }

      const descriptiveCodeUsage: DescriptiveCodeUsage[] = Object.values(descriptiveUsageMap)
        .map((entry) => ({
          code: entry.code,
          responseCount: entry.responseCount,
          occurrenceCount: entry.occurrenceCount,
          responsePercentage: totalResponses > 0
            ? entry.responseCount / totalResponses
            : 0
        }))
        .sort((a, b) => b.responseCount - a.responseCount);


      const mostUsedDescriptiveCode =
        descriptiveCodeUsage.length > 0
          ? descriptiveCodeUsage[0]
          : null;


      // -------------------------
      // INVIVO CODE ANALYSIS
      // -------------------------
      const invivoUsageMap: Record<string, { responseCount: number, occurrenceCount: number }> = {};

      for (const r of responsesForQuestion) {
        if (!r.invivoCodes) continue;

        const invivoList = r.invivoCodes
          .split(",")
          .map((x) => x.trim())
          .filter((x) => x.length > 0);

        const seen = new Set<string>();

        for (const code of invivoList) {
          if (!invivoUsageMap[code]) {
            invivoUsageMap[code] = { responseCount: 0, occurrenceCount: 0 };
          }

          // increment occurrence always
          invivoUsageMap[code].occurrenceCount += 1;

          // responseCount should increment only once per response
          if (!seen.has(code)) {
            invivoUsageMap[code].responseCount += 1;
            seen.add(code);
          }
        }
      }

      const invivoCodeUsage: InVivoCodeUsage[] = Object.entries(invivoUsageMap)
        .map(([codeText, stats]) => ({
          codeText,
          responseCount: stats.responseCount,
          occurrenceCount: stats.occurrenceCount,
          responsePercentage:
            totalResponses > 0 ? stats.responseCount / totalResponses : 0
        }))
        .sort((a, b) => b.responseCount - a.responseCount);

      const topInvivoCodes = invivoCodeUsage.slice(0, 5);

      // -------------------------
      // PARTICIPANT BREAKDOWN
      // -------------------------

      const participantIds = new Set(
        responsesForQuestion.map((r) => r.participantId)
      );

      const participantsForQuestion = participants.filter((p) =>
        participantIds.has(p.participantId)
      );

      const participantBreakdown = {
        byCountry: {} as Record<string, number>,
        byPosition: {} as Record<string, number>,
        byExperience: {} as Record<string, number>
      };

      for (const p of participantsForQuestion) {
        participantBreakdown.byCountry[p.participantCountry] =
          (participantBreakdown.byCountry[p.participantCountry] || 0) + 1;

        participantBreakdown.byPosition[p.participantPosition] =
          (participantBreakdown.byPosition[p.participantPosition] || 0) + 1;

        participantBreakdown.byExperience[p.participantExperience] =
          (participantBreakdown.byExperience[p.participantExperience] || 0) + 1;
      }

      // -------------------------
      // FINAL STRUCTURE
      // -------------------------
      result.push({
        question,
        codedResponses: responsesForQuestion,
        totalResponses,
        responsesWithoutDescriptiveCodes:
          responsesForQuestion.filter((r) => !r.descriptiveCodes || r.descriptiveCodes.length === 0)
            .length,
        avgDescriptiveCodesPerResponse:
          totalResponses > 0
            ? responsesForQuestion.reduce(
                (sum, r) => sum + (r.descriptiveCodes?.length ?? 0),
                0
              ) / totalResponses
            : 0,
        descriptiveCodeUsage,
        mostUsedDescriptiveCode,
        invivoCodeUsage,
        topInvivoCodes,
        participants: participantsForQuestion,
        participantBreakdown
      });
    }

    return result;
  }
}
