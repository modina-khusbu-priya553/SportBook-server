const express = require('express');
const app = express()
const cors = require("cors");
const dotenv = require('dotenv')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()

// const uri = process.env.MONGODB_URI;
const port = process.env.PORT;
const uri = process.env.MONGODB_URI;
// 1: allow to run in all side
app.use(cors());
// 2: convert json string into json perse
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();

    const db = client.db("SportBook");
    const facilitiesCollection = db.collection("facilitiesCollection");
    const bookingCollection = db.collection("bookingCollection");
    // Send a ping to confirm a successful connection
    // const result = await client.db('admin').command({ ping: 1 });

    // 1: get data from database
    app.get('/facilities', async (req, res) => {
      const cursor = facilitiesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // 2: get data from database by id
    app.get('/facilities/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await facilitiesCollection.findOne(query);
      res.send(result);

    })

    // 3: post api for add facility

    app.post('/facilities', async (req, res) => {
      const doc = req.body;
      delete doc._id;
      const facilityData = {
      ...doc,
      createdAt: new Date(),
    };
      const result = await facilitiesCollection.insertOne(facilityData);
      res.send(result)
    })

    // 4: post api for booking data

    app.post('/bookings', async (req, res) => {
      try {
        const doc = req.body;
        delete doc.status;
        delete doc._id;
        const bookingData = {
          ...doc,
          status: "pending",
          createdAt: new Date(),
        };
        const result = await bookingCollection.insertOne(bookingData);
        res.send(result);
      } catch (error) { res.status(500).json({ message: error.message }); }

    })


    // 5:: get api for booking data

    app.get('/bookings/:userId', async (req, res) => {
      const userId = req.params.userId;
      const cursor = bookingCollection.find({ userId: userId })
      const result = await cursor.toArray();
      res.send(result);

    })

    // 6: delete bookings
    app.delete('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(query)
      const result = await bookingCollection.deleteOne(query)
      console.log(result)
      res.send(result);
      
    }) 

    // 7: get api for manage bookings
    app.get('/my-facilities/:userId', async (req, res) => {
      const userId = req.params.userId;
      const query = { userId: userId };
      const cursor = facilitiesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
    // return result;
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})