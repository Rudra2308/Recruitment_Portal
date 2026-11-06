import bcrypt from "bcryptjs";

const raw = process.argv[2] ?? "";
const password = raw.trim();

if (!password) {
  console.error("Usage: npm run hash-password -- \"your-password\"");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log("\nPassword hash generated successfully:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
console.log("Paste this into your .env.local file.\n");
