const express = require('express')
require('dotenv').config()

const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = 5000;


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iz1nfji.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();
        const productsCollection = client.db("amazonStore").collection("products");
        const ordersCollection = client.db("amazonStore").collection("orders");

        //POST
        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            console.log(product);
            await productsCollection.insertOne(product)
                .then(result => {
                    console.log(result.insertedCount);
                    res.send(result.insertedCount);
                })
        })

        //Get all product
        app.get('/products', (req, res) => {
            productsCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
        })

        //Get clicked product
        app.get('/product/:key', (req, res) => {
            productsCollection.find({ key: req.params.key })
                .toArray((err, documents) => {
                    res.send(documents[0]);
                })
        })

        //For review products
        app.post('/productsByKeys', (req, res) => {
            const productKeys = req.body;
            productsCollection.find({ key: { $in: productKeys } })
                .toArray((err, documents) => {
                    res.send(documents);
                })
        })

        //Place Orders
        app.post('/addOrder', async (req, res) => {
            const order = req.body;
            await ordersCollection.insertOne(order)
                .then(result => {
                    // console.log(result.insertedCount);
                    res.send(result);
                })
        })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

app.listen(port)