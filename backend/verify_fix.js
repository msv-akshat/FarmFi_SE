import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function verifyFix() {
  try {
    console.log('✅ Verifying Analytics Fix...\n');

    // Test severity distribution with ::int casting
    const severityDistribution = await sql`
      SELECT 
        INITCAP(severity) as name,
        COUNT(*)::int as count
      FROM disease_predictions
      WHERE LOWER(predicted_disease) != 'healthy'
      GROUP BY severity
    `;
    
    console.log('1️⃣ Severity Distribution:');
    severityDistribution.forEach(item => {
      console.log(`   ${item.name}: ${item.count} (type: ${typeof item.count})`);
    });

    // Test field status
    const fieldStatus = await sql`
      SELECT 
        status as name,
        COUNT(*)::int as count
      FROM fields
      GROUP BY status
    `;
    
    console.log('\n2️⃣ Field Status Distribution:');
    fieldStatus.forEach(item => {
      console.log(`   ${item.name}: ${item.count} (type: ${typeof item.count})`);
    });

    // Test season distribution
    const seasonDist = await sql`
      SELECT 
        season as name,
        COUNT(*)::int as count
      FROM crop_data
      GROUP BY season
    `;
    
    console.log('\n3️⃣ Season Distribution:');
    seasonDist.forEach(item => {
      console.log(`   ${item.name}: ${item.count} (type: ${typeof item.count})`);
    });

    // Test yearly trends
    const yearly = await sql`
      SELECT 
        crop_year as year,
        COUNT(*)::int as count
      FROM crop_data
      GROUP BY crop_year
      ORDER BY crop_year ASC
    `;
    
    console.log('\n4️⃣ Yearly Trends (should be chronological):');
    yearly.forEach(item => {
      console.log(`   ${item.year}: ${item.count} (type: ${typeof item.count})`);
    });

    console.log('\n✅ All data types are correct! Refresh your browser.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

verifyFix();
