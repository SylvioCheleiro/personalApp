const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log('🎯 Conectado ao MongoDB!');
        const db = client.db('test');
        const collections = await db.collections();
        console.log('📂 Collections:', collections.map(c => c.collectionName));
    } catch (error) {
        console.error('❌ Erro ao conectar:', error);
    } finally {
        await client.close();
    }
}

run();