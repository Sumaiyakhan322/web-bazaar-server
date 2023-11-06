const express = require('express');
const cors = require('cors');
const app=express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port =process.env.PORT  || 5000
//middle ware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ej2tmfe.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    //make a db collection
    const jobsCollection=client.db('JobsDb').collection("Jobs");
    const userBidsCollection=client.db('JobsDb').collection('usersBid');
    

    //add jobs to mongodb
    app.post('/addJobs',async(req,res)=>{
      const newJob=req.body;
      const result=await jobsCollection.insertOne(newJob);
      res.send(result);
    })
    //get all the jobs
    app.get('/addJobs',async(req,res)=>{
      const cursor=jobsCollection.find();
      const result=await cursor.toArray();
      res.send(result)
    })
    //get a job
    app.get('/addJobs/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id:new ObjectId(id)}
      const result =await jobsCollection.findOne(query);
     
     res.send(result)

    })
    //delete a job
    app.delete('/addJobs/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await jobsCollection.deleteOne(query)
      res.send(result)
    })
    

    //post user bid data to mongo
    app.post('/usersBids',async(req,res)=>{
      const newBids=req.body;
      const result =await userBidsCollection.insertOne(newBids)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("Web-bazaar is running")

})
app.listen(port, ()=>{
    console.log("Server is running");
})