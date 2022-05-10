const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Running Bazar Server')
});


//user: dbuser1
//pass: 65gQvRWjbO3TPgNz


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xo2cy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db("bazarShodai").collection("items");

        //GET all users API
        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        //GET single order API
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id)
            };
            const item = await itemsCollection.findOne(query);
            res.send(item);
        })


        //post
        app.post('/item', async (req, res) => {
            const newItem = req.body;
            const result = await itemsCollection.insertOne(newItem);
            res.send(result);
        })

        //Delete
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            res.send(result);

        });

        //Reduce//update
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            console.log('updating order', id)
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "Delivered"
                },
            };
            const result = await itemsCollection.updateOne(query, updateDoc, options);
            console.log('approving to deliver the order', result);

            res.json(result);
        });

    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir)


app.listen(port, () => {
    console.log('Listening to port', port);
})