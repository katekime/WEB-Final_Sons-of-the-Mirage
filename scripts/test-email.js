// Quick test: register a user and check if email works
async function main() {
  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "emailtest" + Date.now(),
        email: "emailtest" + Date.now() + "@test.com",
        password: "Test1234",
      }),
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}
main();
