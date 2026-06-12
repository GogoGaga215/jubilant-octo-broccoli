// Platoboost API bypass - no browser needed
// Based on leaked endpoints from the Hydrogen bypass source

const API_BASE = "https://api-gateway.platoboost.com/v1";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { link } = req.body || {};
  if (!link) {
    return res.status(400).json({ error: "Missing link" });
  }

  // Extract the ID from auth.platorelay.com/a?d=... or auth.platoboost.app/a?d=...
  let id = "";
  try {
    const url = new URL(link);
    id = url.searchParams.get("d") || "";
  } catch {
    // If not a full URL, treat as raw ID
    id = link;
  }

  if (!id) {
    return res.status(400).json({ error: "Could not extract ID from link" });
  }

  try {
    // Step 1: Check if key is already available
    const authRes = await fetch(`${API_BASE}/authenticators/2569/${id}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json"
      }
    });

    if (authRes.status === 200) {
      const authData = await authRes.json();
      if (authData.key) {
        return res.status(200).json({ success: true, key: authData.key, link: link });
      }
    }

    // Step 2: Start auth session
    const sessionRes = await fetch(`${API_BASE}/sessions/auth/2569/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json"
      },
      body: JSON.stringify({ captcha: "", type: "" })
    });

    if (sessionRes.status !== 200) {
      return res.status(500).json({ error: "Failed to start auth session" });
    }

    const sessionData = await sessionRes.json();
    const redirectUrl = sessionData.redirect || "";

    if (!redirectUrl) {
      return res.status(500).json({ error: "No redirect URL in session response" });
    }

    // Step 3: Extract tk from redirect URL
    const redirectParsed = new URL(redirectUrl);
    const rParam = redirectParsed.searchParams.get("r") || "";

    // Decode base64 r param
    let tk = "";
    try {
      const decodedR = Buffer.from(decodeURIComponent(rParam), "base64").toString("utf-8");
      const decodedUrl = new URL(decodedR);
      tk = decodedUrl.searchParams.get("tk") || "";
    } catch {
      return res.status(500).json({ error: "Failed to decode redirect parameters" });
    }

    if (!tk) {
      return res.status(500).json({ error: "Could not extract tk token" });
    }

    // Step 4: Complete auth with tk
    await new Promise(r => setTimeout(r, 5000)); // Wait 5s as per original bypass

    const completeRes = await fetch(`${API_BASE}/sessions/auth/2569/${id}/${tk}`, {
      method: "PUT",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json"
      }
    });

    if (completeRes.status !== 200) {
      return res.status(500).json({ error: "Failed to complete auth" });
    }

    // Step 5: Get the key
    const finalRes = await fetch(`${API_BASE}/authenticators/2569/${id}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json"
      }
    });

    if (finalRes.status !== 200) {
      return res.status(500).json({ error: "Failed to retrieve key" });
    }

    const finalData = await finalRes.json();
    if (finalData.key) {
      return res.status(200).json({ success: true, key: finalData.key, link: link });
    }

    return res.status(500).json({ error: "Key not found in response" });

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
  }
