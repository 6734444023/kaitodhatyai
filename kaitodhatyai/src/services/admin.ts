async function adminLogin(password: string) {
  const res = await fetch(
    "https://auth-395846897458.europe-west1.run.app/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }
  );

  const data = await res.json();
  return data;
}

export default adminLogin;
