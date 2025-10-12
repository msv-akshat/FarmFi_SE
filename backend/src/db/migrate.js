import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
    try {
        // Read schema file
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        
        // Execute schema
        await sql.unsafe(schema);
        
        console.log('Database migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

migrate();