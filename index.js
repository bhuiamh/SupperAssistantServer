const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express());
app.use(express.json());

const { MongoClient, ServerApiVersion, Db } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.axhfmt5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const categoryQuestionCollection = client
      .db("supperAssistantDB")
      .collection("category");
    const gapQuestionCollection = client
      .db("supperAssistantDB")
      .collection("gap");
    const mcqQuestionCollection = client
      .db("supperAssistantDB")
      .collection("mcq");

    const createCategory = async (question) => {
      const newQuestion = await categoryQuestionCollection.insertOne(question);
      return newQuestion;
    };
    const createGapQuestion = async (question) => {
      const newQuestion = await gapQuestionCollection.insertOne(question);
      return newQuestion;
    };
    const createMcqQuestion = async (question) => {
      const newQuestion = await mcqQuestionCollection.insertOne(question);
      return newQuestion;
    };

    // to create all type question
    app.post("/question/save", async (req, res) => {
      console.log("hitted");
      const { category, gap, mcq } = req.body;
      if (!category && !gap && !mcq) {
        res.json({
          status: false,
          message: "Something went wrong",
        });
      }
      let categoryQuestion;
      let gapQuestion;
      let mcqQuestion;
      if (Boolean(category)) {
        categoryQuestion = await createCategory(category);
      }
      if (Boolean(gap)) {
        gapQuestion = await createGapQuestion(gap);
      }
      if (Boolean(mcq)) {
        mcqQuestion = await createMcqQuestion(mcq);
      }

      res.status(200).json({
        message: "Create Successfull",
        data: {
          categoryQuestion,
          gapQuestion,
          mcqQuestion,
        },
      });
    });

    // to find all type question
    app.get("/question/all", async (req, res) => {
      const categoryQuestions = await categoryQuestionCollection
        .find()
        .toArray();
      const gapQuestions = await gapQuestionCollection.find().toArray();
      const mcqQuestions = await mcqQuestionCollection.find().toArray();

      res.status(200).json({
        message: "Fetched Successfully",
        data: {
          categoryQuestions,
          gapQuestions,
          mcqQuestions,
        },
      });
    });

    app.get("/category", async (req, res) => {
      console.log("hitted");
      const result = await categoryQuestionCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});
app.get("/question", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
