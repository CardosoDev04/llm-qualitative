"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_repository_1 = require("./repositories/data-repository");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const repository = new data_repository_1.DataRepository();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies and credentials if needed
}));
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
app.get("/data/participants", async (req, res) => {
    try {
        const data = await repository.getAllParticipants();
        res.json(data);
    }
    catch (error) {
        console.error("Error fetching participants:", error);
        res.status(500).json({ error: "Failed to fetch participants" });
    }
});
app.get("/data/questions", async (req, res) => {
    try {
        const data = await repository.getAllQuestions();
        res.json(data);
    }
    catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ error: "Failed to fetch questions" });
    }
});
app.get("/data/question/:questionId", async (req, res) => {
    const questionId = req.params.questionId;
    try {
        const data = await repository.getQuestionById(questionId);
        res.json(data);
    }
    catch (error) {
        console.error(`Error fetching question ${questionId}:`, error);
        res.status(500).json({ error: "Failed to fetch question" });
    }
});
app.get("/data/question-data", async (req, res) => {
    try {
        const data = await repository.getAllQuestionData();
        res.json(data);
    }
    catch (error) {
        console.error("Error fetching question data:", error);
        res.status(500).json({ error: "Failed to fetch question data" });
    }
});
