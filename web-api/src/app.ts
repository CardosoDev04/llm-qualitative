import express from "express";
import { DataRepository } from "./repositories/data-repository";

const app = express();

const repository = new DataRepository();

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

app.get("/data/by-question/:questionId", async (req: express.Request, res: express.Response) => {
  const questionId = req.params.questionId;
  try {
    const data = await repository.getCodedResponsesByQuestion(questionId);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching data for question ${questionId}:`, error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/data/descriptive-codes", async (req: express.Request, res: express.Response) => {
  try {
    const data = await repository.getAllDescriptiveCodes();
    res.json(data);
  } catch (error) {
    console.error("Error fetching descriptive codes:", error);
    res.status(500).json({ error: "Failed to fetch descriptive codes" });
  }
});

