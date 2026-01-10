import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_DATABASE_URL || process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function check() {
    await client.connect();
    const db = client.db();
    const products = await db.collection('Product').find({}).toArray();
    console.log(`Total products: ${products.length}`);
    products.forEach(p => {
        console.log(`- ${p.name}: ${p.image || 'NO IMAGE'}`);
    });
    await client.close();
}

check();
