import express from "express";
import { DataRepository } from "./repositories/data-repository";
import cors from "cors";

const app = express();

const repository = new DataRepository();

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true, // Allow cookies and credentials if needed
  })
);

app.get("/status", (req: express.Request, res: express.Response) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

app.get("/data/all", async (req: express.Request, res: express.Response) => {
  try {
    const data = await repository.getCodedResponses();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get(
  "/data/by-question/:questionId",
  async (req: express.Request, res: express.Response) => {
    const questionId = req.params.questionId;
    try {
      const data = await repository.getCodedResponsesByQuestion(questionId);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching data for question ${questionId}:`, error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  }
);

app.get(
  "/data/descriptive-codes",
  async (req: express.Request, res: express.Response) => {
    try {
      const data = await repository.getAllDescriptiveCodes();
      res.json(data);
    } catch (error) {
      console.error("Error fetching descriptive codes:", error);
      res.status(500).json({ error: "Failed to fetch descriptive codes" });
    }
  }
);

app.get(
  "/data/participants",
  async (req: express.Request, res: express.Response) => {
    try {
      const data = await repository.getAllParticipants();
      res.json(data);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  }
);

app.get(
  "/data/questions",
  async (req: express.Request, res: express.Response) => {
    try {
      const data = await repository.getAllQuestions();
      res.json(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  }
);

app.get(
  "/data/question/:questionId",
  async (req: express.Request, res: express.Response) => {
    const questionId = req.params.questionId;
    try {
      const data = await repository.getQuestionById(questionId);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching question ${questionId}:`, error);
      res.status(500).json({ error: "Failed to fetch question" });
    }
  }
);

app.get("/data/question-data", async (req: express.Request, res: express.Response) => {
  try {
    const data = await repository.getAllQuestionData();
    res.json(data);
  } catch (error) {
    console.error("Error fetching question data:", error);
    res.status(500).json({ error: "Failed to fetch question data" });
  }
});
