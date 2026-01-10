import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGODB_DATABASE_URL || process.env.MONGODB_URI;

if (!uri) {
    console.error("MONGODB_DATABASE_URL or MONGODB_URI is not defined in .env");
    process.exit(1);
}

async function check() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();

        const productsCount = await db.collection("Product").countDocuments();
        console.log(`Total Products: ${productsCount}`);

        const categories = await db.collection("Category").find().toArray();
        for (const cat of categories) {
            const count = await db.collection("Product").countDocuments({ categoryId: cat._id });
            console.log(`Category: ${cat.name} (${cat.slug}) - Count: ${count}`);
        }

        const uncategorized = await db.collection("Product").countDocuments({ categoryId: null });
        console.log(`Uncategorized Products: ${uncategorized}`);

    } finally {
        await client.close();
    }
}

check();
