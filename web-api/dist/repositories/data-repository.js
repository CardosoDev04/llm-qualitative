"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRepository = void 0;
const db_1 = require("./db");
class DataRepository {
    async getCodedResponses() {
        const descriptiveCodes = (0, db_1.query)(`
        SELECT category_id as "categoryId",
               category_plain_text as "categoryPlainText",
               category_description as "categoryDescription"
        FROM descriptive_codes
      `);
        const codedResponseRaw = (0, db_1.query)(`
        SELECT participant_id as "participantId",
               question_id as "questionId",
               original_response as "originalResponse",
               invivo_codes as "invivoCodes",
               descriptive_ids as "descriptiveIds"
        FROM response_descriptive_coding
      `);
        const codedResponses = (await codedResponseRaw).map(async (raw) => {
            const descriptiveIds = raw.descriptiveIds
                ? raw.descriptiveIds.replace(/\s+/g, "").split(",")
                : [];
            const descriptiveCodesResolved = await descriptiveCodes;
            const descriptiveCodesForResponse = descriptiveIds
                .map((id) => descriptiveCodesResolved.find((code) => code.categoryId === id))
                .filter((code) => code !== undefined);
            return {
                ...raw,
                descriptiveCodes: descriptiveCodesForResponse,
            };
        });
        const resolvedCodedResponses = await Promise.all(codedResponses);
        return resolvedCodedResponses;
    }
    async getCodedResponsesByQuestion(questionId) {
        const responses = (0, db_1.query)(`
        SELECT participant_id as "participantId",
               question_id as "questionId",
               original_response as "originalResponse",
               invivo_codes as "invivoCodes",
               descriptive_ids as "descriptiveIds"
        FROM response_descriptive_coding
        WHERE question_id = $1
      `, [questionId]);
        return responses;
    }
    async getAllDescriptiveCodes() {
        const codes = (0, db_1.query)(`
        SELECT category_id as "categoryId",
               category_plain_text as "categoryPlainText",
               category_description as "categoryDescription"
        FROM descriptive_codes
      `);
        return codes;
    }
}
exports.DataRepository = DataRepository;
