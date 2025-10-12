import sql from '../config/db.js';

const mandalVillageMap = {
    "Allagadda": ["Battaluru", "Kotakandukur", "Obulampalle", "R.Krishnapuram", "Yadawada"],
    "Atmakur": ["Atmakur", "Indireshwaram", "Karivena", "Kurukunda", "Pinnapuram"],
    // ... (all other mandals and villages)
};

async function seed() {
    try {
        // Insert admin user
        const adminPassword = '$2a$10$XF1Tz7kEY4GhPX8YMF9Tz.ChXRSwq3Al1iynJ6nxZfX9P9JXu5e6W'; // "admin123"
        await sql`
            INSERT INTO employees (username, name, password, role)
            VALUES ('admin', 'Administrator', ${adminPassword}, 'admin')
            ON CONFLICT (username) DO NOTHING
        `;

        // Insert mandals and villages
        for (const [mandalName, villages] of Object.entries(mandalVillageMap)) {
            // Insert mandal
            const mandal = await sql`
                INSERT INTO mandals (name)
                VALUES (${mandalName})
                ON CONFLICT (name) DO UPDATE SET name = ${mandalName}
                RETURNING id
            `;

            const mandalId = mandal[0].id;

            // Insert villages
            for (const villageName of villages) {
                await sql`
                    INSERT INTO villages (name, mandal_id)
                    VALUES (${villageName}, ${mandalId})
                    ON CONFLICT (mandal_id, name) DO NOTHING
                `;
            }
        }

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

seed();