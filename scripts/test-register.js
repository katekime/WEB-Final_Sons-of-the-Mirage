const http = require("http");

const body = JSON.stringify({
  username: "emailtest" + Date.now(),
  email: "emailtest" + Date.now() + "@test.com",
  password: "Test1234",
});

const req = http.request(
  {
    hostname: "127.0.0.1",
    port: 5000,
    path: "/api/auth/register",
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
  },
  (res) => {
    let data = "";
    res.on("data", (c) => (data += c));
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      console.log("Body:", data);
    });
  }
);
req.on("error", (e) => console.error("Error:", e.message));
req.write(body);
req.end();
