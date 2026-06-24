async function test() {
  try {
    const res = await fetch('http://localhost:8000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://80.225.195.25'
      },
      body: JSON.stringify({
        username: "prachinewuser" + Math.floor(Math.random()*1000),
        display_name: "Prachi New",
        email: "prachi.new" + Math.floor(Math.random()*1000) + "@ggits.net",
        password: "password123"
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Body:`, data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

test();
