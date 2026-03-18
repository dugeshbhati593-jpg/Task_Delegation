fetch("http://localhost:3000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "master@admin.com", password: "password" })
}).then(res => res.json()).then(console.log).catch(console.error);
