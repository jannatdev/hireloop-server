import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import nodemon from 'nodemon';


const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

 const connectedClient= await connectToMongoDB();
 const db = connectedClient.db("hireloop-db");
 const users = db.collection("user");
 const jobs = db.collection("jobs")

app.get('/',(req,res)=>{
    console.log("Server is running fine")
})



app.get('/users', async(req,res)=>{
    const cursor = users.find({});
    const result = await cursor.toArray();

    res.send(result);
    

})


// Job Related ApIs

app.post('/jobs',async(req,res)=>{
   
    const job = req.body()
    const result =await jobs.insertOne(job)
    res.send(result);
})


app.get('/jobs',async(req,res)=>{
  const query ={};

   console.log("query", req.query)
   if(req.query){
    if(req.query.jobType){
      query.jobType = req.query.jobType

    } 
    if(req.query.category){
      query.category=req.query.category
    }
     if(req.query.search){
      query.$or=[
        {  jobTitle:{$regex:req.query.search,$option:'i'}},
        {location:{$regex:req.query.search,$option:"i"}}
      ]
     }
  
  }
  const cursor = jobs.find(query);
  const result = await cursor.toArray();
  res.send(result)
})

app.delete('/jobs/:id',async(req,res)=>{
  const id = req.params.id
  const query ={_id:new ObjectId(id)}
  const result = await jobs.deleteOne(query)
  res.send(result)
})

app.listen(PORT,()=>{
    console.log(`Server is running at port,${PORT}`)
})