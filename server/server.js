import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from CodeX!",
  });
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    let response = null;
    let retryCount = 0;

    const requestAPI = async () => {
      response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${prompt}`,
        temperature: 0,
        max_tokens: 3000,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0,
      });

      if (
        response.data &&
        response.data.choices &&
        response.data.choices[0].text
      ) {
        res.status(200).send({
          bot: response.data.choices[0].text,
        });
      } else if (retryCount < 3) {
        retryCount++;
        setTimeout(requestAPI, 1000 * retryCount);
      } else {
        res.status(500).send("Failed to generate response.");
      }
    };

    requestAPI();
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "Something went wrong");
  }
});

app.listen(5000, () =>
  console.log("AI server started on https://aicodex-1cz1.onrender.com/")
);
