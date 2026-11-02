const { pool } = require("./db");

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      id SERIAL PRIMARY KEY,
      "Username" VARCHAR(100) NOT NULL,
      "password" VARCHAR(255) NOT NULL,
      "Email" VARCHAR(255) NOT NULL UNIQUE,
      "Phone_no" VARCHAR(20)
    );
  `);
  console.log("Migration complete.");
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
