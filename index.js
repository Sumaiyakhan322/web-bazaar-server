const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
var cookieParser = require("cookie-parser");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
//middle ware
app.use(cors())
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ej2tmfe.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    //make a db collection
    const jobsCollection = client.db("JobsDb").collection("Jobs");
    const userBidsCollection = client.db("JobsDb").collection("usersBid");
    const toTextCollection=client.db('JobsDb').collection('toTest')

    //auth route
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1000h",
      });
      console.log(token);
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });
    app.post("/logout", async (req, res) => {
      const user = req.body;
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
    });

    //add jobs to mongodb
    app.post("/addJobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    });
    //get all the jobs
    app.get("/addJobs", async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //get a job
    app.get("/addJobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });
    //delete a job
    app.delete("/addJobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });
    //update a job
    app.put("/addJobs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upset: true };
      const updateJob = req.body;
      const job = {
        $set: {
          email: updateJob.email,
          jobTile: updateJob.jobTile,
          img: updateJob.img,
          deadline: updateJob.deadline,
          category: updateJob.category,
          minimum: updateJob.minimum,
          maximum: updateJob.maximum,
          des: updateJob.des,
        },
      };
      const result = await jobsCollection.updateOne(filter, job, options);
      res.send(result);
    });

    //post user bid data to mongo
    app.post("/usersBids", async (req, res) => {
      const newBids = req.body;
      const result = await userBidsCollection.insertOne(newBids);
      res.send(result);
    });

    //get bid
    app.get("/usersBids", async (req, res) => {
      const user = req.query;
   
      var [keys] = Object.keys(user);

      if (keys == "userEmail") {
        const email = req.query.userEmail;
        const query = { userEmail: email };
        const cursor = userBidsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } else if (keys == "buyerEmail") {
        const email = req.query.buyerEmail;
        const query = { buyerEmail: email };
        const cursor = userBidsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } else {
        const cursor = userBidsCollection.find().sort({status:1});

        const result = await cursor.toArray();

        res.send(result);
      }
    });
    //get a bid by id
    app.get("/usersBids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userBidsCollection.findOne(query);
      console.log(result);
      res.send(result);
    });
    app.patch("/usersBids/:id", async (req, res) => {
      const updatedBids = req.body;
      const id = req.params.id;
      console.log(id);

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updatedBids.status,
          disable:updatedBids.disable
        },
      };
      const result = await userBidsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.get("/toTest", async (req, res) => {
      const cursor = toTextCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/toTest", async (req, res) => {
      const toTest = req.body;
      const result = await toTextCollection.insertOne(toTest);
      res.send(result);
    });
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Web-bazaar is running");
});
app.listen(port, () => {
  console.log("Server is running");
});
