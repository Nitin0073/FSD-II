(() => {
  "use strict";

  // ---------------- Mock user directory ----------------
  const USERS = [
    { username: "admin", password: "admin123", name: "Admin User",   role: "administrator" },
    { username: "alice", password: "wonderland", name: "Alice Chen", role: "analyst" },
    { username: "bob",   password: "builder123", name: "Bob Martinez", role: "viewer" },
  ];

  const DEMO_SECRET = "campus-lab-demo-secret-2026"; // NEVER do this in a real app: signing must happen server-side
  const TOKEN_LIFETIME_SECONDS = 120; // short lifetime so the countdown / expiry is easy to observe
  const STORAGE_KEY = "jwtlab_token";

  // ---------------- base64url helpers ----------------
  function base64urlFromBytes(bytes) {
    let bin = "";
    bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function base64urlFromString(str) {
    return base64urlFromBytes(new TextEncoder().encode(str));
  }
  function base64urlToString(b64url) {
    let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  // ---------------- HMAC-SHA256 signing (Web Crypto) ----------------
  async function hmacSign(message, secret) {
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
    return base64urlFromBytes(new Uint8Array(sigBuf));
  }

  async function buildToken(user, { expiresInSeconds = TOKEN_LIFETIME_SECONDS, overridePayload = null } = {}) {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const payload = overridePayload || {
      sub: user.username,
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + expiresInSeconds
    };
    const encHeader = base64urlFromString(JSON.stringify(header));
    const encPayload = base64urlFromString(JSON.stringify(payload));
    const signature = await hmacSign(`${encHeader}.${encPayload}`, DEMO_SECRET);
    return `${encHeader}.${encPayload}.${signature}`;
  }

  function decodeToken(token) {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return null;
    try {
      return {
        headerRaw: h, payloadRaw: p, sigRaw: s,
        header: JSON.parse(base64urlToString(h)),
        payload: JSON.parse(base64urlToString(p)),
      };
    } catch (e) {
      return null;
    }
  }

  async function verifyToken(token) {
    const decoded = decodeToken(token);
    if (!decoded) return { valid: false, reason: "Malformed token — could not be parsed." };
    const expectedSig = await hmacSign(`${decoded.headerRaw}.${decoded.payloadRaw}`, DEMO_SECRET);
    if (expectedSig !== decoded.sigRaw) {
      return { valid: false, reason: "Signature mismatch — payload or header was altered after signing." };
    }
    const now = Math.floor(Date.now() / 1000);
    if (decoded.payload.exp && now >= decoded.payload.exp) {
      return { valid: false, reason: "Signature is valid, but the token has expired." };
    }
    return { valid: true, reason: "Signature verified and token is within its validity window." };
  }

  // ---------------- DOM refs ----------------
  const loginScreen = document.getElementById("loginScreen");
  const dashScreen = document.getElementById("dashScreen");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");

  let countdownTimer = null;

  function showLogin() {
    loginScreen.classList.add("active");
    dashScreen.classList.remove("active");
    logoutBtn.style.display = "none";
    if (countdownTimer) clearInterval(countdownTimer);
  }

  async function showDashboard(token) {
    loginScreen.classList.remove("active");
    dashScreen.classList.add("active");
    logoutBtn.style.display = "inline-block";
    await renderDashboard(token);
  }

  // ---------------- Demo credential quick-fill ----------------
  document.querySelectorAll(".cred-row").forEach(row => {
    row.addEventListener("click", () => {
      document.getElementById("username").value = row.dataset.user;
      document.getElementById("password").value = row.dataset.pass;
    });
  });

  // ---------------- Login flow ----------------
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const user = USERS.find(u => u.username === username && u.password === password);

    if (!user) {
      loginError.classList.add("show");
      return;
    }
    loginError.classList.remove("show");

    const token = await buildToken(user);
    localStorage.setItem(STORAGE_KEY, token);
    await showDashboard(token);
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    showLogin();
  });

  // ---------------- Hero anatomy preview (login screen) ----------------
  async function pulseHeroAnatomy() {
    const demoPayload = { sub: "preview", name: "—", role: "—", iat: 0, exp: 0 };
    const encHeader = base64urlFromString(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const encPayload = base64urlFromString(JSON.stringify(demoPayload));
    document.getElementById("heroSegHeader").textContent = encHeader;
  }
  pulseHeroAnatomy();

  // ---------------- Dashboard rendering ----------------
  function fmtTime(ts) {
    return new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  async function renderDashboard(token) {
    const decoded = decodeToken(token);
    if (!decoded) { showLogin(); return; }

    const { payload } = decoded;
    document.getElementById("welcomeText").textContent = `Welcome back, ${payload.name}`;
    document.getElementById("roleBadge").textContent = payload.role;
    document.getElementById("issuedAt").textContent = fmtTime(payload.iat);

    // raw token, color coded
    const [h, p, s] = token.split(".");
    document.getElementById("rawTokenDisplay").innerHTML =
      `<span class="p1">${h}</span>.<span class="p2">${p}</span>.<span class="p3">${s}</span>`;

    // claims table
    const claimsTable = document.getElementById("claimsTable");
    claimsTable.innerHTML = "";
    Object.entries(payload).forEach(([k, v]) => {
      const tr = document.createElement("tr");
      const label = { sub: "sub (subject)", name: "name", role: "role", iat: "iat (issued)", exp: "exp (expires)" }[k] || k;
      const value = (k === "iat" || k === "exp") ? `${v}  →  ${fmtTime(v)}` : v;
      tr.innerHTML = `<td>${label}</td><td>${value}</td>`;
      claimsTable.appendChild(tr);
    });

    // anatomy strip
    document.querySelector('#dashAnatomy [data-part="header"]').textContent = h;
    document.querySelector('#dashAnatomy [data-part="payload"]').textContent = p;
    document.querySelector('#dashAnatomy [data-part="sig"]').textContent = s;

    // reset transient UI
    document.getElementById("decodedBox").classList.remove("show");
    document.getElementById("verifyResult").classList.remove("show", "pass", "fail");
    document.getElementById("tamperEditor").classList.remove("show");
    document.getElementById("tamperApplyRow").style.display = "none";
    document.getElementById("tamperNote").style.display = "none";
    document.getElementById("requestSim").style.display = "none";

    startCountdown(payload.exp);
  }

  function startCountdown(exp) {
    if (countdownTimer) clearInterval(countdownTimer);
    const el = document.getElementById("expiresIn");
    function tick() {
      const now = Math.floor(Date.now() / 1000);
      const remaining = exp - now;
      if (remaining <= 0) {
        el.textContent = "expired";
        el.classList.add("expired");
        el.classList.remove("expiring");
        clearInterval(countdownTimer);
        return;
      }
      el.textContent = `${remaining}s`;
      el.classList.toggle("expiring", remaining <= 20);
    }
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  // ---------------- Anatomy segment click → decode ----------------
  document.getElementById("dashAnatomy").addEventListener("click", (e) => {
    const seg = e.target.closest(".anatomy-seg");
    if (!seg) return;
    const token = localStorage.getItem(STORAGE_KEY);
    const decoded = decodeToken(token);
    if (!decoded) return;
    const box = document.getElementById("decodedBox");
    const part = seg.dataset.part;
    let content = "";
    if (part === "header") content = `<span class="k">HEADER (decoded)</span>\n${JSON.stringify(decoded.header, null, 2)}`;
    if (part === "payload") content = `<span class="k">PAYLOAD (decoded)</span>\n${JSON.stringify(decoded.payload, null, 2)}`;
    if (part === "sig") content = `<span class="k">SIGNATURE</span>\nHMACSHA256(base64url(header) + "." + base64url(payload), SECRET)\n\n= ${decoded.sigRaw}\n\nThe secret never leaves the server in a real system — verifying just means recomputing this and comparing.`;
    box.innerHTML = content;
    box.classList.add("show");
  });

  // ---------------- Verify signature button ----------------
  document.getElementById("verifyBtn").addEventListener("click", async () => {
    const token = localStorage.getItem(STORAGE_KEY);
    const result = await verifyToken(token);
    const el = document.getElementById("verifyResult");
    el.textContent = (result.valid ? "✓ VALID — " : "✗ INVALID — ") + result.reason;
    el.classList.remove("pass", "fail");
    el.classList.add("show", result.valid ? "pass" : "fail");
  });

  // ---------------- Tamper flow ----------------
  document.getElementById("tamperBtn").addEventListener("click", () => {
    const token = localStorage.getItem(STORAGE_KEY);
    const decoded = decodeToken(token);
    if (!decoded) return;
    const editor = document.getElementById("tamperEditor");
    editor.value = JSON.stringify(decoded.payload, null, 2);
    editor.classList.add("show");
    document.getElementById("tamperApplyRow").style.display = "flex";
    document.getElementById("tamperNote").style.display = "block";
  });

  document.getElementById("applyTamperBtn").addEventListener("click", async () => {
    const token = localStorage.getItem(STORAGE_KEY);
    const decoded = decodeToken(token);
    if (!decoded) return;
    let editedPayload;
    try {
      editedPayload = JSON.parse(document.getElementById("tamperEditor").value);
    } catch (e) {
      alert("That's not valid JSON — fix the syntax and try again.");
      return;
    }
    // Rebuild header.payload WITHOUT re-signing (this simulates an attacker editing the token client-side)
    const encHeader = decoded.headerRaw;
    const encPayload = base64urlFromString(JSON.stringify(editedPayload));
    const tamperedToken = `${encHeader}.${encPayload}.${decoded.sigRaw}`; // old signature kept on purpose

    const [h, p, s] = tamperedToken.split(".");
    document.getElementById("rawTokenDisplay").innerHTML =
      `<span class="p1">${h}</span>.<span class="p2">${p}</span>.<span class="p3">${s}</span>`;
    document.querySelector('#dashAnatomy [data-part="payload"]').textContent = p;

    const result = await verifyToken(tamperedToken);
    const el = document.getElementById("verifyResult");
    el.textContent = (result.valid ? "✓ VALID — " : "✗ INVALID — ") + result.reason;
    el.classList.remove("pass", "fail");
    el.classList.add("show", result.valid ? "pass" : "fail");
  });

  // ---------------- Simulate expired token ----------------
  document.getElementById("expireBtn").addEventListener("click", async () => {
    const token = localStorage.getItem(STORAGE_KEY);
    const decoded = decodeToken(token);
    if (!decoded) return;
    const expiredToken = await buildToken(null, {
      overridePayload: { ...decoded.payload, iat: decoded.payload.iat - 300, exp: Math.floor(Date.now() / 1000) - 5 }
    });
    localStorage.setItem(STORAGE_KEY, expiredToken);
    await renderDashboard(expiredToken);
    const result = await verifyToken(expiredToken);
    const el = document.getElementById("verifyResult");
    el.textContent = (result.valid ? "✓ VALID — " : "✗ INVALID — ") + result.reason;
    el.classList.remove("pass", "fail");
    el.classList.add("show", result.valid ? "pass" : "fail");
  });

  // ---------------- Simulated protected request ----------------
  document.getElementById("requestBtn").addEventListener("click", async () => {
    const token = localStorage.getItem(STORAGE_KEY);
    const result = await verifyToken(token);
    const sim = document.getElementById("requestSim");
    sim.style.display = "block";
    const decoded = decodeToken(token);
    const lines = [
      `<span class="method">GET</span> /api/profile HTTP/1.1`,
      `Authorization: Bearer ${token.slice(0, 24)}...${token.slice(-10)}`,
      ``,
      `// server receives request, no session lookup needed`,
      `// recomputes signature, checks exp claim...`,
      ``,
    ];
    if (result.valid) {
      lines.push(`<span class="status-ok">HTTP/1.1 200 OK</span>`);
      lines.push(`{ "sub": "${decoded.payload.sub}", "role": "${decoded.payload.role}" }`);
    } else {
      lines.push(`<span class="status-bad">HTTP/1.1 401 Unauthorized</span>`);
      lines.push(`{ "error": "${result.reason}" }`);
    }
    sim.innerHTML = lines.join("\n");
  });

  // ---------------- Boot: restore session if a valid token exists ----------------
  (async function boot() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      const result = await verifyToken(existing);
      if (result.valid) {
        await showDashboard(existing);
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
    }
    showLogin();
  })();

})();
