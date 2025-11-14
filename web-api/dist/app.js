"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_repository_1 = require("./repositories/data-repository");
const app = (0, express_1.default)();
const repository = new data_repository_1.DataRepository();
app.get("/status", (req, res) => {
    res.send("Hello World!");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});
app.get("/data/all", async (req, res) => {
    try {
        const data = await repository.getCodedResponses();
        res.json(data);
    }
    catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});
app.get("/data/by-question/:questionId", async (req, res) => {
    const questionId = req.params.questionId;
    try {
        const data = await repository.getCodedResponsesByQuestion(questionId);
        res.json(data);
    }
    catch (error) {
        console.error(`Error fetching data for question ${questionId}:`, error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});
app.get("/data/descriptive-codes", async (req, res) => {
    try {
        const data = await repository.getAllDescriptiveCodes();
        res.json(data);
    }
    catch (error) {
        console.error("Error fetching descriptive codes:", error);
        res.status(500).json({ error: "Failed to fetch descriptive codes" });
    }
});
