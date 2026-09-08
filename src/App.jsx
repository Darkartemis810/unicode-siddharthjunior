import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const seedProducts = [
  { id: 1, title: "C Programming Book", category: "Books", icon: "📘", price: 250, condition: "Good", seller: "Rahul", verified: true, location: "Campus Library", image: "" },
  { id: 2, title: "Engineering Graphics Kit", category: "Lab Equipment", icon: "📐", price: 350, condition: "Like New", seller: "Aman", verified: true, location: "Block A", image: "" },
  { id: 3, title: "Chemistry Lab Coat", category: "Lab Equipment", icon: "🧪", price: 180, condition: "Good", seller: "Priya", verified: true, location: "Science Block", image: "" },
  { id: 4, title: "Engineering Maths Notes", category: "Notes", icon: "📝", price: 0, condition: "Excellent", seller: "Yugal", verified: true, location: "Hostel", image: "" },
];

const seedNotes = [
  { id: 1, title: "Engineering Mathematics-II Complete Notes", subject: "Mathematics", semester: "2nd", author: "Dr. Mehta", authorType: "Faculty", verified: true, rating: 4.9, downloads: 284, type: "PDF", icon: "📐", fileName: "", image: "", ratings: [] },
  { id: 2, title: "DBMS Unit-wise Handwritten Notes", subject: "DBMS", semester: "3rd", author: "Aarav Sharma", authorType: "Student • 9.4 CGPA", verified: true, rating: 4.8, downloads: 421, type: "PDF", icon: "🗃️", fileName: "", image: "", ratings: [] },
  { id: 3, title: "Data Structures & Algorithms", subject: "DSA", semester: "3rd", author: "Dr. Priya", authorType: "Faculty", verified: true, rating: 5, downloads: 198, type: "PDF", icon: "💻", fileName: "", image: "", ratings: [] },
  { id: 4, title: "Operating Systems Revision Pack", subject: "OS", semester: "4th", author: "Vivek Patel", authorType: "Student • 9.1 CGPA", verified: true, rating: 4.7, downloads: 163, type: "PDF", icon: "⚙️", fileName: "", image: "", ratings: [] },
];

const seedResources = [
  { id: 1, title: "DBMS Previous Year Questions 2022–2025", category: "PYQs", subject: "DBMS", type: "PDF", downloads: 342, verified: true, icon: "📄", image: "" },
  { id: 2, title: "React Interview Preparation Sheet", category: "Cheat Sheets", subject: "Web Development", type: "PDF", downloads: 211, verified: true, icon: "⚛️", image: "" },
  { id: 3, title: "Data Science Lab Manual", category: "Lab Manuals", subject: "Data Science", type: "PDF", downloads: 187, verified: true, icon: "🧪", image: "" },
  { id: 4, title: "Hackathon Problem Statement Collection", category: "Career", subject: "Hackathons", type: "DOC", downloads: 129, verified: true, icon: "🏆", image: "" },
];

const seedMembers = [
  { id: 1, name: "Aarav Sharma", role: "Coder", skills: ["C++", "Python", "DSA"], experience: "3 Hackathons", rating: 4.9, status: "Available", verified: true, about: "Strong in problem solving and backend logic.", image: "" },
  { id: 2, name: "Priya Verma", role: "Presenter", skills: ["PPT", "Pitching", "Public Speaking"], experience: "5 Presentations", rating: 4.8, status: "Available", verified: true, about: "Confident presenter for demos and final pitches.", image: "" },
  { id: 3, name: "Rohan Gupta", role: "Frontend Developer", skills: ["React", "JavaScript", "CSS"], experience: "2 Projects", rating: 4.7, status: "Available", verified: true, about: "Builds responsive and interactive interfaces.", image: "" },
  { id: 4, name: "Neha Singh", role: "UI/UX Designer", skills: ["Figma", "UI Design", "Prototyping"], experience: "4 Projects", rating: 4.9, status: "Busy", verified: true, about: "Designs clean and user-friendly hackathon products.", image: "" },
  { id: 5, name: "Vivek Patel", role: "Data Analyst", skills: ["Python", "Pandas", "SQL"], experience: "2 Hackathons", rating: 4.8, status: "Available", verified: true, about: "Works on dashboards, analysis and insights.", image: "" },
  { id: 6, name: "Kunal Jain", role: "Backend Developer", skills: ["Node.js", "Express", "MongoDB"], experience: "3 Projects", rating: 4.8, status: "Available", verified: true, about: "Handles APIs, databases and server-side development.", image: "" },
];

const roles = ["All Roles", "Coder", "Presenter", "Frontend Developer", "Backend Developer", "Data Analyst", "UI/UX Designer", "Documentation"];
const noteSubjects = ["All Subjects", "Mathematics", "DBMS", "DSA", "OS", "Data Science"];
const resourceCategories = ["All Resources", "PYQs", "Cheat Sheets", "Lab Manuals", "Career"];

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

const API_BASE = "http://localhost:5000/api";
const API_ORIGIN = API_BASE.replace(/\/api$/, "");

function assetUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function apiFetch(endpoint, { method = "GET", token = "", body, formData = false } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!formData && body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body === undefined ? undefined : formData ? body : JSON.stringify(body),
  });
  let data = {};
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) {
    const error = new Error(data.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function authRequest(endpoint, payload) {
  return apiFetch(`/auth/${endpoint}`, { method: "POST", body: payload });
}

function mapListing(item) {
  return { ...item, id: item._id || item.id, image: assetUrl(item.image), icon: item.icon || "📦" };
}
function mapNote(item) {
  return { ...item, id: item._id || item.id, author: item.uploader || item.author, image: assetUrl(item.coverImage || item.image), fileName: item.fileName || "", ratings: item.ratings || [] };
}
function mapResource(item) {
  return { ...item, id: item._id || item.id, image: assetUrl(item.image), icon: item.icon || "📚" };
}
function mapMember(item) {
  return { ...item, id: item._id || item.id, image: assetUrl(item.image), skills: Array.isArray(item.skills) ? item.skills : [] };
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("unitrade-theme") || "dark");
  const [tab, setTab] = useState("home");
  const [products, setProducts] = useState(() => readStorage("unitrade-products", seedProducts));
  const [notes, setNotes] = useState(() => readStorage("unitrade-notes", seedNotes));
  const [resources, setResources] = useState(() => readStorage("unitrade-resources", seedResources));
  const [members, setMembers] = useState(() => readStorage("unitrade-members", seedMembers));
  const [wishlist, setWishlist] = useState(() => readStorage("unitrade-wishlist", []));
  const [user, setUser] = useState(() => readStorage("unitrade-user", null));
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("unitrade-token") || "");
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [marketCategory, setMarketCategory] = useState("All");
  const [noteSearch, setNoteSearch] = useState("");
  const [resourceSearch, setResourceSearch] = useState("");
  const [role, setRole] = useState("All Roles");
  const [noteSubject, setNoteSubject] = useState("All Subjects");
  const [resourceCategory, setResourceCategory] = useState("All Resources");
  const [toast, setToast] = useState("");
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", role: "Coder", skills: "", cgpa: "", college: "", about: "", image: "", imageFile: null });
  const [listing, setListing] = useState({ title: "", category: "Books", price: "", condition: "Good", location: "", seller: "", image: "", imageFile: null });
  const [noteForm, setNoteForm] = useState({ title: "", subject: "DBMS", semester: "3rd", authorType: "Student", cgpa: "", college: "", description: "", file: null, image: "" });
  const [resourceForm, setResourceForm] = useState({ title: "", category: "PYQs", subject: "", type: "PDF", description: "", image: "", imageFile: null });
  const [noteAccess, setNoteAccess] = useState(() => readStorage("unitrade-note-access", []));
  const [noteRatings, setNoteRatings] = useState(() => readStorage("unitrade-note-ratings", {}));
  const toastTimerRef = useRef(null);
  const localIdSeqRef = useRef(1);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        const [listingData, noteData, resourceData, teamData] = await Promise.all([
          apiFetch("/listings"), apiFetch("/notes"), apiFetch("/resources"), apiFetch("/team")
        ]);
        if (cancelled) return;
        const mergeKeepExisting = (existing, incoming, mapper) => {
          const mapped = Array.isArray(incoming) ? incoming.map(mapper) : [];
          const incomingKeys = new Set(mapped.map(x => `${x.title || x.name || ""}|${x.subject || x.role || ""}`));
          const keep = existing.filter(x => !incomingKeys.has(`${x.title || x.name || ""}|${x.subject || x.role || ""}`));
          return [...mapped, ...keep];
        };
        setProducts(prev => mergeKeepExisting(prev.length ? prev : seedProducts, listingData, mapListing));
        setNotes(prev => mergeKeepExisting(prev.length ? prev : seedNotes, noteData, mapNote));
        setResources(prev => mergeKeepExisting(prev.length ? prev : seedResources, resourceData, mapResource));
        setMembers(prev => mergeKeepExisting(prev.length ? prev : seedMembers, teamData, mapMember));
      } catch (error) {
        console.warn("UniTrade API bootstrap failed; using local demo data.", error.message);
      }
    }
    bootstrap();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!authToken) return;
    apiFetch("/auth/me", { token: authToken })
      .then(result => setUser(prev => ({ ...(prev || {}), ...(result.user || {}) })))
      .catch(error => {
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem("unitrade-token");
          setAuthToken("");
          setUser(null);
        }
      });
  }, [authToken]);

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark-mode" : "light-mode";
    localStorage.setItem("unitrade-theme", theme);
  }, [theme]);
  useEffect(() => localStorage.setItem("unitrade-products", JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem("unitrade-notes", JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem("unitrade-resources", JSON.stringify(resources)), [resources]);
  useEffect(() => localStorage.setItem("unitrade-members", JSON.stringify(members)), [members]);
  useEffect(() => localStorage.setItem("unitrade-wishlist", JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => localStorage.setItem("unitrade-note-access", JSON.stringify(noteAccess)), [noteAccess]);
  useEffect(() => localStorage.setItem("unitrade-note-ratings", JSON.stringify(noteRatings)), [noteRatings]);
  useEffect(() => {
    if (user) localStorage.setItem("unitrade-user", JSON.stringify(user));
    else localStorage.removeItem("unitrade-user");
  }, [user]);

  const notify = (msg) => {
    setToast(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2600);
  };

  const go = (id) => {
    setTab(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requireLogin = (action) => {
    if (!user) {
      notify("Please login first");
      setModal("login");
      return false;
    }
    action?.();
    return true;
  };

  const filteredProducts = useMemo(
    () => products.filter(p => {
      const hay = `${p.title} ${p.category} ${p.seller} ${p.location}`.toLowerCase();
      return hay.includes(search.toLowerCase()) &&
        (marketCategory === "All" || p.category === marketCategory);
    }),
    [products, search, marketCategory]
  );
  const filteredNotes = useMemo(
    () => notes.filter(n =>
      `${n.title} ${n.subject} ${n.author}`.toLowerCase().includes(noteSearch.toLowerCase()) &&
      (noteSubject === "All Subjects" || n.subject === noteSubject)
    ),
    [notes, noteSearch, noteSubject]
  );
  const filteredResources = useMemo(
    () => resources.filter(r =>
      `${r.title} ${r.subject} ${r.category}`.toLowerCase().includes(resourceSearch.toLowerCase()) &&
      (resourceCategory === "All Resources" || r.category === resourceCategory)
    ),
    [resources, resourceSearch, resourceCategory]
  );
  const filteredMembers = useMemo(
    () => members.filter(m =>
      (role === "All Roles" || m.role === role) &&
      `${m.name} ${m.role} ${m.skills.join(" ")}`.toLowerCase().includes(search.toLowerCase())
    ),
    [members, role, search]
  );

  const submitLogin = async (e) => {
    e.preventDefault();
    if (authLoading) return;

    const data = new FormData(e.currentTarget);
    const name = data.get("name")?.trim();
    const email = data.get("email")?.trim().toLowerCase();
    const password = data.get("password");
    const college = data.get("college")?.trim() || "";
    const course = data.get("course")?.trim() || "";

    if (!email || !password || (authMode === "register" && !name)) {
      return notify(authMode === "register" ? "Fill all required sign-up fields" : "Enter email and password");
    }

    try {
      setAuthLoading(true);
      const result = await authRequest(authMode === "register" ? "register" : "login",
        authMode === "register"
          ? { name, email, password, college, course }
          : { email, password }
      );

      localStorage.setItem("unitrade-token", result.token || "");
      setAuthToken(result.token || "");

      const loggedUser = {
        ...(result.user || {}),
        name: result.user?.name || name || "Student",
        email: result.user?.email || email,
        college: result.user?.college || college || "Campus",
        course: result.user?.course || course || "",
        joined: "2026",
      };

      localStorage.setItem("unitrade-user", JSON.stringify(loggedUser));
      setUser(loggedUser);
      setModal(null);
      notify(authMode === "register" ? "Account created successfully! 🎓" : `Welcome back, ${loggedUser.name}! 🎓`);
    } catch (error) {
      notify(error.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const readImage = (file, setter, key = "image") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return notify("Please choose an image file");
    if (file.size > 5 * 1024 * 1024) return notify("Image must be under 5 MB");
    const reader = new FileReader();
    reader.onload = () => setter(prev => ({ ...prev, [key]: reader.result, imageFile: file }));
    reader.readAsDataURL(file);
  };

  const readNoteFile = (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && !/\.(pdf|doc|docx)$/i.test(file.name)) {
      return notify("Please choose a PDF, DOC or DOCX file");
    }
    if (file.size > 15 * 1024 * 1024) return notify("Notes file must be under 15 MB");
    setNoteForm(prev => ({ ...prev, file }));
  };

  const addListing = async (e) => {
    e.preventDefault();
    if (!authToken) return requireLogin();
    if (!listing.title || listing.price === "" || !listing.location || !listing.imageFile) {
      return notify("Fill all required fields and upload item photo 📷");
    }
    try {
      const body = new FormData();
      ["title", "category", "price", "condition", "location", "seller"].forEach(k => body.append(k, listing[k] ?? ""));
      body.append("image", listing.imageFile);
      const created = await apiFetch("/listings", { method: "POST", token: authToken, body, formData: true });
      setProducts(p => [mapListing(created), ...p]);
      setListing({ title: "", category: "Books", price: "", condition: "Good", location: "", seller: "", image: "", imageFile: null });
      setModal(null);
      notify("Listing saved to UniTrade backend ✓");
    } catch (error) {
      // If the backend is temporarily unavailable, keep the listing in this browser
      // so the Publish Listing button still works during a demo/development run.
      console.warn("Listing upload failed, falling back to local state:", error);
      const nextSeq = localIdSeqRef.current++;
      const fallbackId = `local-listing-${nextSeq}`;
      const localListing = {
        id: fallbackId,
        title: listing.title,
        category: listing.category,
        icon: "📦",
        price: Number(listing.price),
        condition: listing.condition,
        seller: listing.seller || user?.name || "Student",
        verified: true,
        location: listing.location,
        image: listing.image || "",
      };
      setProducts(p => [localListing, ...p]);
      setListing({ title: "", category: "Books", price: "", condition: "Good", location: "", seller: "", image: "", imageFile: null });
      setModal(null);
      notify(`Listing saved locally. Backend unavailable right now.`);
    }
  };
  const addNote = async (e) => {
    e.preventDefault();
    if (!authToken) return requireLogin();
    if (!noteForm.title || !noteForm.college || !noteForm.description || !noteForm.file || !noteForm.imageFile) {
      return notify("Complete note details, choose the notes file and upload cover photo 📷");
    }
    if (noteForm.authorType === "Student" && Number(noteForm.cgpa) < 9) {
      return notify("Only students with 9.0+ CGPA can submit verified notes");
    }
    try {
      const body = new FormData();
      ["title", "subject", "semester", "authorType", "cgpa", "college", "description"].forEach(k => body.append(k, noteForm[k] ?? ""));
      body.append("document", noteForm.file);
      body.append("coverImage", noteForm.imageFile);
      const created = await apiFetch("/notes/upload", { method: "POST", token: authToken, body, formData: true });
      setNotes(n => [mapNote(created), ...n]);
      setNoteForm({ title: "", subject: "DBMS", semester: "3rd", authorType: "Student", cgpa: "", college: "", description: "", file: null, image: "", imageFile: null });
      setModal(null);
      notify("Note submitted to backend verification queue ✓");
    } catch (error) {
      notify(error.message || "Could not upload note");
    }
  };
  const addResource = async (e) => {
    e.preventDefault();
    if (!authToken) return requireLogin();
    if (!resourceForm.title || !resourceForm.subject || !resourceForm.description || !resourceForm.imageFile) {
      return notify("Complete resource details and upload resource photo 📷");
    }
    try {
      const body = new FormData();
      ["title", "category", "subject", "type", "description"].forEach(k => body.append(k, resourceForm[k] ?? ""));
      body.append("image", resourceForm.imageFile);
      const created = await apiFetch("/resources", { method: "POST", token: authToken, body, formData: true });
      setResources(r => [mapResource(created), ...r]);
      setResourceForm({ title: "", category: "PYQs", subject: "", type: "PDF", description: "", image: "", imageFile: null });
      setModal(null);
      notify("Resource saved to backend ✓");
    } catch (error) {
      notify(error.message || "Could not add resource");
    }
  };
  const addMember = async (e) => {
    e.preventDefault();
    if (!authToken) return requireLogin();
    if (!profile.name || !profile.skills || !profile.college || !profile.imageFile) {
      return notify("Complete your team profile and upload profile photo 📷");
    }
    try {
      const body = new FormData();
      ["name", "role", "college", "about", "phone", "email", "cgpa", "status", "experience"].forEach(k => {
        const value = k === "status" ? "Available" : k === "experience" ? "New profile" : profile[k] ?? "";
        body.append(k, value);
      });
      body.append("skills", profile.skills);
      body.append("image", profile.imageFile);
      const created = await apiFetch("/team", { method: "POST", token: authToken, body, formData: true });
      setMembers(m => [mapMember(created), ...m]);
      setProfile({ name: "", email: "", phone: "", role: "Coder", skills: "", cgpa: "", college: "", about: "", image: "", imageFile: null });
      setModal(null);
      notify("Team profile saved to backend ✓");
    } catch (error) {
      notify(error.message || "Could not publish team profile");
    }
  };
  const accessNote = async (note) => {
    if (!authToken) return requireLogin();
    try {
      if (typeof note.id === "string" && note.id.length >= 20) {
        const result = await apiFetch(`/notes/${note.id}/access`, { token: authToken });
        setNoteAccess(a => a.includes(note.id) ? a : [...a, note.id]);
        setNotes(all => all.map(n => n.id === note.id ? { ...n, downloads: result.downloads ?? ((n.downloads || 0) + 1) } : n));
        setModal({ type: "noteAccess", data: { ...note, ...result, downloadUrl: assetUrl(result.downloadUrl) } });
        if (result.downloadUrl) window.open(assetUrl(result.downloadUrl), "_blank", "noopener,noreferrer");
        notify("Verified note access granted ✓");
      } else {
        setNoteAccess(a => a.includes(note.id) ? a : [...a, note.id]);
        setNotes(all => all.map(n => n.id === note.id ? { ...n, downloads: (n.downloads || 0) + 1 } : n));
        setModal({ type: "noteAccess", data: note });
        notify(note.fileName ? `Demo access opened: ${note.fileName}` : `Demo access opened: ${note.title}`);
      }
    } catch (error) {
      notify(error.message || "Could not access note");
    }
  };

  const submitNoteRating = async (note, rating) => {
    if (!authToken) return requireLogin();
    if (!noteAccess.includes(note.id)) return notify("Access the note before rating it");
    if (!rating) return notify("Please select a rating");
    try {
      if (typeof note.id === "string" && note.id.length >= 20) {
        const result = await apiFetch(`/notes/${note.id}/rate`, { method: "POST", token: authToken, body: { rating: Number(rating) } });
        setNotes(all => all.map(n => n.id === note.id ? { ...n, rating: result.rating, ratingsCount: result.ratingsCount } : n));
      } else {
        const key = `${user?.email}:${note.id}`;
        if (noteRatings[key]) return notify("You have already rated this note");
        setNoteRatings(r => ({ ...r, [key]: Number(rating) }));
        setNotes(all => all.map(n => {
          if (n.id !== note.id) return n;
          const previous = Array.isArray(n.ratings) ? n.ratings : [];
          const next = [...previous, Number(rating)];
          return { ...n, ratings: next, rating: Number((next.reduce((a, b) => a + b, 0) / next.length).toFixed(1)) };
        }));
      }
      notify("Thanks! Your note rating was submitted ⭐");
      setModal(null);
    } catch (error) {
      notify(error.message || "Could not submit rating");
    }
  };
  const download = (label) => notify(`Demo download started: ${label}`);
  const toggleWish = (id) => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  const nav = [
    ["home", "Home"],
    ["marketplace", "Marketplace"],
    ["notes", "Verified Notes"],
    ["resources", "Resources"],
    ["team", "Team Finder"],
    ["ai", "🤖 AI Center"],
    ["business", "💼 Business"],
    ["dashboard", "Dashboard"],
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <button className="brand" onClick={() => go("home")}><span>♻</span><b>UniTrade</b></button>
        <div className="nav-links">
          {nav.map(([id, label]) => (
            <button key={id} className={tab === id ? "active" : ""} onClick={() => go(id)}>{label}</button>
          ))}
        </div>
        <div className="nav-actions">
          <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "☀️" : "🌙"}</button>
          <button className="icon-btn" onClick={() => setModal("wishlist")}>♡ {wishlist.length}</button>
          {user
            ? <button className="login-btn" onClick={() => {
                setUser(null);
                setAuthToken("");
                localStorage.removeItem("unitrade-token");
                localStorage.removeItem("unitrade-user");
                notify("Logged out");
              }}>Logout</button>
            : <button className="login-btn" onClick={() => { setAuthMode("login"); setModal("login"); }}>Login / Sign Up</button>}
        </div>
      </nav>

      {tab === "home" && (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">🎓 CAMPUS DIGITAL ECOSYSTEM</span>
              <h1>One platform.<br/><span>Everything students need.</span></h1>
              <p>Buy & sell academic materials, discover verified notes and resources, build high-performing teams, use AI tools and explore the commercial campus ecosystem.</p>
              <div className="hero-buttons">
                <button className="primary-btn" onClick={() => go("marketplace")}>Explore Marketplace →</button>
                <button className="secondary-btn" onClick={() => go("notes")}>📚 Browse Verified Notes</button>
                <button className="secondary-btn" onClick={() => go("team")}>🤝 Find Teammates</button>
              </div>
              <div className="trust-row"><span>✓ Campus-focused</span><span>✓ Verified contributors</span><span>✓ Student-first</span></div>
            </div>
            <div className="hero-visual">
              <div className="orbit-card one">📚 <b>Verified Notes</b><small>Faculty + 9.0+ CGPA</small></div>
              <div className="hero-logo">♻<small>SMART<br/>CAMPUS</small></div>
              <div className="orbit-card two">🤝 <b>Team Matching</b><small>Skills • Ratings • Availability</small></div>
              <div className="orbit-card three">🛍️ <b>Marketplace</b><small>Reuse • Save • Earn</small></div>
            </div>
          </section>

          <section className="feature-strip">
            {[
              ["📚", "Verified Knowledge", "Faculty and 9.0+ CGPA contributors"],
              ["🛍️", "Campus Marketplace", "Buy, sell and reuse materials"],
              ["🤝", "Team Finder", "Find coders, presenters & designers"],
              ["🧩", "Resource Hub", "PYQs, manuals, sheets & career resources"],
              ["🤖", "AI Center", "Smart recommendations & team matching"],
              ["💼", "Commercialisation", "Plans, subscriptions & campus analytics"],
            ].map(x => (
              <div className="feature-card" key={x[1]} onClick={() => x[1] === "AI Center" ? go("ai") : x[1] === "Commercialisation" ? go("business") : null}>
                <i>{x[0]}</i><div><b>{x[1]}</b><span>{x[2]}</span></div>
              </div>
            ))}
          </section>

          <section className="section">
            <SectionTitle eyebrow="WHY UNITRADE" title="Built to become a real campus product" text="A scalable frontend foundation for a student marketplace + academic knowledge network." />
            <div className="metric-grid">
              <Metric n="500+" t="Students" />
              <Metric n="120+" t="Resources" />
              <Metric n="9.0+" t="Verified student-note threshold" />
              <Metric n="24/7" t="Campus access" />
            </div>
          </section>
        </main>
      )}

      {tab === "marketplace" && (
        <main className="section page">
          <SectionTitle eyebrow="CAMPUS MARKETPLACE" title="Buy, sell & reuse" text="A safer peer-to-peer marketplace for academic materials." />
          <div className="toolbar">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔎 Search books, kits, notes..." />
            <button className="primary-btn" onClick={() => requireLogin(() => { setListing(prev => ({ ...prev, seller: user?.name || prev.seller })); setModal("listing"); })}>+ List Item</button>
          </div>
          <div className="chips">{["All", "Books", "Notes", "Lab Equipment", "Graphics"].map(c =>
            <button className={marketCategory === c ? "selected" : ""} key={c} onClick={() => setMarketCategory(c)}>{c}</button>
          )}</div>
          <div className="product-grid">
            {filteredProducts.map(p => (
              <article className="product-card" key={p.id}>
                <button className="heart" onClick={() => toggleWish(p.id)}>{wishlist.includes(p.id) ? "❤️" : "♡"}</button>
                {p.image ? <img className="card-photo" src={p.image} alt={p.title} /> : <div className="product-icon">{p.icon}</div>}
                <span className="tag">{p.category}</span>
                <h3>{p.title}</h3>
                <p>Good quality academic material available on campus.</p>
                <div className="meta"><span>📍 {p.location}</span><span>👤 {p.seller}</span><span>✓ Verified</span></div>
                <div className="card-bottom"><b>{p.price === 0 ? "FREE" : `₹${p.price}`}</b><button className="small-btn" onClick={() => setModal({ type: "product", data: p })}>View</button></div>
              </article>
            ))}
          </div>
        </main>
      )}

      {tab === "notes" && (
        <main className="section page">
          <div className="notes-hero">
            <div><span className="eyebrow">🔐 TRUSTED ACADEMIC KNOWLEDGE</span><h1>Verified Notes Library</h1><p>Only <b>faculty members</b> and students with <b>9.0+ CGPA</b> can publish verified notes in this frontend demo.</p></div>
            <button className="primary-btn" onClick={() => requireLogin(() => setModal("note"))}>+ Upload Notes</button>
          </div>
          <div className="verification-banner"><b>✓ Verification Standard</b><span>Faculty verification OR student CGPA ≥ 9.0</span><span>•</span><span>Quality moderation</span><span>•</span><span>Access → Rating</span></div>
          <div className="toolbar"><input value={noteSearch} onChange={e => setNoteSearch(e.target.value)} placeholder="🔎 Search verified notes..." /><select value={noteSubject} onChange={e => setNoteSubject(e.target.value)}>{noteSubjects.map(x => <option key={x}>{x}</option>)}</select></div>
          <div className="notes-grid">
            {filteredNotes.map(n => {
              const myKey = user ? `${user.email}:${n.id}` : "";
              const hasRated = Boolean(noteRatings[myKey]);
              return (
                <article className="note-card" key={n.id}>
                  {n.image ? <img className="card-photo note-photo" src={n.image} alt={n.title} /> : <div className="note-top"><span className="big-icon">{n.icon}</span><span className="verified">✓ VERIFIED</span></div>}
                  <div className="note-top compact"><span className="tag">{n.subject} • {n.semester} Sem</span><span className="verified">✓ VERIFIED</span></div>
                  <h3>{n.title}</h3>
                  <p>By <b>{n.author}</b> · {n.authorType}</p>
                  <div className="rating">{n.rating > 0 ? `⭐ ${n.rating}` : "☆ Not rated yet"} <span>• {n.downloads} accesses</span></div>
                  <button className="wide-btn" onClick={() => accessNote(n)}>Open / Access Notes</button>
                  {noteAccess.includes(n.id) && !hasRated && (
                    <button className="rate-link" onClick={() => setModal({ type: "rateNote", data: n })}>⭐ Rate after access</button>
                  )}
                  {hasRated && <small className="rated-msg">✓ You rated this note</small>}
                </article>
              );
            })}
          </div>
        </main>
      )}

      {tab === "resources" && (
        <main className="section page">
          <SectionTitle eyebrow="RESOURCE HUB" title="Resources beyond notes" text="Useful academic and career material for everyday student life." />
          <div className="resource-categories">
            {resourceCategories.map(x => <button key={x} className={resourceCategory === x ? "selected" : ""} onClick={() => setResourceCategory(x)}>{x}</button>)}
          </div>
          <div className="toolbar"><input value={resourceSearch} onChange={e => setResourceSearch(e.target.value)} placeholder="🔎 Search PYQs, manuals, cheat sheets..." /><button className="primary-btn" onClick={() => requireLogin(() => setModal("resource"))}>+ Add Resource</button></div>
          <div className="resource-grid">
            {filteredResources.map(r => (
              <article className="resource-card" key={r.id}>
                {r.image ? <img className="resource-photo" src={r.image} alt={r.title} /> : <div className="resource-icon">{r.icon}</div>}
                <span className="tag">{r.category}</span><h3>{r.title}</h3><p>{r.subject} · {r.type}</p>
                <div className="resource-foot"><span>✓ Verified · {r.downloads} uses</span><button className="small-btn" onClick={() => download(r.title)}>Open</button></div>
              </article>
            ))}
          </div>
        </main>
      )}

      {tab === "team" && (
        <main className="section page">
          <SectionTitle eyebrow="HACKATHON TEAM FINDER" title="Build the right team" text="Discover students by role, skills, availability and ratings." />
          <div className="toolbar"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔎 Search by name or skill..." /><select value={role} onChange={e => setRole(e.target.value)}>{roles.map(x => <option key={x}>{x}</option>)}</select><button className="primary-btn" onClick={() => requireLogin(() => setModal("member"))}>+ Add My Profile</button></div>
          <div className="team-grid">
            {filteredMembers.map(m => (
              <article className="member-card" key={m.id}>
                {m.image ? <img className="member-photo" src={m.image} alt={m.name} /> : <div className="avatar">{m.name.split(" ").map(x => x[0]).join("").slice(0, 2)}</div>}
                <div className="member-head"><div><h3>{m.name} <span className="verified-dot">✓</span></h3><b>{m.role}</b></div><span className={m.status === "Available" ? "available" : "busy"}>{m.status}</span></div>
                <p>{m.about}</p><div className="skill-list">{m.skills.map(s => <span key={s}>{s}</span>)}</div>
                <div className="member-foot"><span>{m.rating ? `⭐ ${m.rating}` : "☆ New"} · {m.experience}</span><button className="small-btn" onClick={() => setModal({ type: "memberView", data: m })}>Invite</button></div>
              </article>
            ))}
          </div>
        </main>
      )}

      {tab === "ai" && (
        <main className="section page">
          <SectionTitle eyebrow="UNITRADE AI CENTER" title="AI-powered student assistance" text="A dedicated AI layer for team discovery, study planning and career/resource recommendations." />
          <div className="ai-grid">
            <AiCard icon="🤝" title="Smart Team Matcher" text="Match students by project role, skills, availability and ratings." button="Find Best Team" onClick={() => go("team")} />
            <AiCard icon="📚" title="Study Assistant" text="Turn a subject or topic into a structured study plan, revision checklist and practice roadmap." button="Create Study Plan" onClick={() => notify("AI study planner demo is ready for backend AI integration 🤖")} />
            <AiCard icon="🧩" title="Resource Recommendation" text="Recommend PYQs, notes, manuals and cheat sheets according to a student's selected subject." button="Explore Resources" onClick={() => go("resources")} />
            <AiCard icon="💼" title="Career Recommendations" text="Suggest skills, project directions and campus opportunities based on a student's profile." button="Open Dashboard" onClick={() => go("dashboard")} />
          </div>
          <div className="ai-note"><b>Production plan:</b> connect this frontend to an AI API/backend for real recommendations, document Q&A and personalised matching.</div>
        </main>
      )}

      {tab === "business" && (
        <main className="section page">
          <SectionTitle eyebrow="COMMERCIALISATION & BUSINESS" title="Turn UniTrade into a sustainable campus product" text="A commercial model that keeps core student welfare features accessible while creating revenue for operations and growth." />
          <div className="business-grid">
            <BusinessCard icon="🚀" title="Premium Listing Boost" text="Optional paid visibility for student sellers so useful listings reach more campus users." value="Revenue stream" />
            <BusinessCard icon="🏫" title="College Subscription" text="Institutions can subscribe for verified portals, analytics, moderation and resource management." value="B2B recurring" />
            <BusinessCard icon="⭐" title="Student Pro" text="Optional advanced AI tools, enhanced profile visibility and productivity features." value="B2C recurring" />
            <BusinessCard icon="🤝" title="Partnerships" text="Future partnerships with education providers, recruiters and campus service providers." value="Partner revenue" />
          </div>
          <div className="business-panel">
            <h3>Business KPIs</h3>
            <div className="metric-grid">
              <Metric n={products.length} t="Marketplace listings" />
              <Metric n={notes.length} t="Verified notes" />
              <Metric n={resources.length} t="Resources" />
              <Metric n={members.length} t="Team profiles" />
            </div>
          </div>
          <div className="pricing-grid">
            <div className="price-card"><span className="tag">FREE</span><h3>Student Basic</h3><b>₹0</b><p>Marketplace, notes, resources and Team Finder.</p><button className="secondary-btn" onClick={() => notify("Basic plan selected")}>Current plan</button></div>
            <div className="price-card featured-price"><span className="tag">PRO</span><h3>Student Pro</h3><b>₹49/mo</b><p>Advanced AI assistance, profile boost and productivity tools.</p><button className="primary-btn" onClick={() => notify("Student Pro demo selected")}>Explore Pro</button></div>
            <div className="price-card"><span className="tag">COLLEGE</span><h3>Campus Partner</h3><b>Custom</b><p>Institutional verification, analytics, moderation and branded campus ecosystem.</p><button className="secondary-btn" onClick={() => notify("Campus Partner enquiry created")}>Contact Sales</button></div>
          </div>
        </main>
      )}

      {tab === "dashboard" && (
        <main className="section page">
          <SectionTitle eyebrow="STUDENT DASHBOARD" title={user ? `Welcome, ${user.name}` : "Your UniTrade workspace"} text="Manage your activity, saved items and campus identity." />
          {!user ? <div className="empty-panel"><h2>Login to unlock your dashboard</h2><p>Save listings, publish resources and create your team profile.</p><button className="primary-btn" onClick={() => setModal("login")}>Login / Sign Up</button></div> :
            <div className="dashboard-grid">
              <div className="dash-profile"><div className="avatar large">{user.name.split(" ").map(x => x[0]).join("").slice(0, 2)}</div><h2>{user.name}</h2><p>{user.email}</p><span className="verified">✓ Campus Account</span><button className="secondary-btn" onClick={() => setModal("member")}>Create / Edit Team Profile</button><button className="secondary-btn" onClick={() => go("ai")}>🤖 AI Center</button><button className="secondary-btn" onClick={() => go("business")}>💼 Commercialisation</button></div>
              <div className="dash-stats"><Metric n={wishlist.length} t="Saved items"/><Metric n={products.length} t="Marketplace listings"/><Metric n={notes.length} t="Verified notes"/><Metric n={resources.length} t="Resources"/></div>
            </div>}
        </main>
      )}

      <footer>
        <div><b className="footer-logo">♻ UniTrade</b><p>Student Welfare & Resource Sharing Platform</p></div>
        <div><b>Product</b><span onClick={() => go("marketplace")}>Marketplace</span><span onClick={() => go("notes")}>Verified Notes</span><span onClick={() => go("team")}>Team Finder</span></div>
        <div><b>Innovation</b><span onClick={() => go("ai")}>AI Center</span><span onClick={() => go("business")}>Commercialisation</span><span>Campus-first design</span></div>
        <div><b>Vision</b><span>Multi-campus ecosystem</span><span>Academic resource sharing</span></div>
      </footer>

      {modal && (
        <Modal title={
          modal === "login" ? "Welcome to UniTrade" :
          modal === "listing" ? "List an Academic Item" :
          modal === "note" ? "Upload Verified Notes" :
          modal === "resource" ? "Add a Resource" :
          modal === "member" ? "Create Team Profile" :
          modal === "wishlist" ? "Your Wishlist" :
          modal?.type === "product" ? modal.data.title :
          modal?.type === "memberView" ? modal.data.name :
          modal?.type === "noteAccess" ? "Notes Access" :
          modal?.type === "rateNote" ? "Rate this Note" : "UniTrade"
        } onClose={() => setModal(null)}>

          {modal === "login" && (
            <form className="form" onSubmit={submitLogin}>
              <div className="auth-switch">
                <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Login</button>
                <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Create Account</button>
              </div>

              {authMode === "register" && (
                <>
                  <label>Full Name<input name="name" placeholder="Your full name" required /></label>
                  <div className="two">
                    <label>College / Institution<input name="college" placeholder="Your college" required /></label>
                    <label>Course<input name="course" placeholder="B.Tech IT" /></label>
                  </div>
                </>
              )}

              <label>College Email<input name="email" type="email" placeholder="student@college.edu" required /></label>
              <label>Password<input name="password" type="password" placeholder="Minimum 6 characters" minLength="6" required /></label>
              <div className="info-box">
                <b>{authMode === "register" ? "Create your real UniTrade account." : "Login with your UniTrade account."}</b>
                <br />Your account is securely handled by the UniTrade backend using JWT authentication.
              </div>
              <button className="primary-btn" disabled={authLoading}>
                {authLoading ? "Please wait..." : authMode === "register" ? "Create Account →" : "Login →"}
              </button>
            </form>
          )}

          {modal === "listing" && (
            <form className="form" onSubmit={addListing}>
              <label>Item Name<input value={listing.title} onChange={e => setListing({...listing, title:e.target.value})} placeholder="e.g. Data Structures Book" required /></label>
              <div className="two">
                <label>Category<select value={listing.category} onChange={e => setListing({...listing, category:e.target.value})}><option>Books</option><option>Notes</option><option>Lab Equipment</option><option>Graphics</option></select></label>
                <label>Price<input type="number" min="0" value={listing.price} onChange={e => setListing({...listing, price:e.target.value})} placeholder="₹" required /></label>
              </div>
              <label>Pickup Location<input value={listing.location} onChange={e => setListing({...listing, location:e.target.value})} placeholder="Campus / Hostel" required /></label>
              <label>Condition<select value={listing.condition} onChange={e => setListing({...listing, condition:e.target.value})}><option>Like New</option><option>Excellent</option><option>Good</option></select></label>
              <label>Seller Name<input value={listing.seller} onChange={e => setListing({...listing, seller:e.target.value})} placeholder="Your name" required /></label>
              <label>Item Photo *<input type="file" accept="image/*" onChange={e => readImage(e.target.files?.[0], setListing)} required /></label>
              {listing.image && <img className="upload-preview" src={listing.image} alt="Item preview" />}
              <button className="primary-btn">Publish Listing</button>
            </form>
          )}

          {modal === "note" && (
            <form className="form" onSubmit={addNote}>
              <div className="info-box"><b>Verification rule:</b> Faculty members or students with CGPA ≥ 9.0 only. In production, faculty identity/CGPA must be checked by backend/admin.</div>
              <label>Note Title<input value={noteForm.title} onChange={e => setNoteForm({...noteForm,title:e.target.value})} placeholder="e.g. DBMS Unit 1–5 Notes" required /></label>
              <div className="two">
                <label>Subject<select value={noteForm.subject} onChange={e => setNoteForm({...noteForm,subject:e.target.value})}>{noteSubjects.slice(1).map(x => <option key={x}>{x}</option>)}</select></label>
                <label>Semester<input value={noteForm.semester} onChange={e => setNoteForm({...noteForm,semester:e.target.value})} required /></label>
              </div>
              <label>Contributor Type<select value={noteForm.authorType} onChange={e => setNoteForm({...noteForm,authorType:e.target.value})}><option>Student</option><option>Faculty</option></select></label>
              {noteForm.authorType === "Student" && <label>CGPA<input type="number" min="0" max="10" step="0.01" value={noteForm.cgpa} onChange={e => setNoteForm({...noteForm,cgpa:e.target.value})} placeholder="Minimum 9.0" required /></label>}
              <label>College / Institution<input value={noteForm.college} onChange={e => setNoteForm({...noteForm,college:e.target.value})} required /></label>
              <label>Description<textarea value={noteForm.description} onChange={e => setNoteForm({...noteForm,description:e.target.value})} placeholder="What does this resource cover?" required /></label>
              <label>Notes File *<input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => readNoteFile(e.target.files?.[0])} required /></label>
              {noteForm.file && <div className="file-selected">📄 {noteForm.file.name}</div>}
              <label>Notes Cover Photo *<input type="file" accept="image/*" onChange={e => readImage(e.target.files?.[0], setNoteForm)} required /></label>
              {noteForm.image && <img className="upload-preview" src={noteForm.image} alt="Notes preview" />}
              <button className="primary-btn">Submit for Verification ✓</button>
            </form>
          )}

          {modal === "resource" && (
            <form className="form" onSubmit={addResource}>
              <label>Resource Title<input value={resourceForm.title} onChange={e => setResourceForm({...resourceForm,title:e.target.value})} required /></label>
              <div className="two">
                <label>Category<select value={resourceForm.category} onChange={e => setResourceForm({...resourceForm,category:e.target.value})}>{resourceCategories.slice(1).map(x => <option key={x}>{x}</option>)}</select></label>
                <label>Subject<input value={resourceForm.subject} onChange={e => setResourceForm({...resourceForm,subject:e.target.value})} required /></label>
              </div>
              <label>Type<select value={resourceForm.type} onChange={e => setResourceForm({...resourceForm,type:e.target.value})}><option>PDF</option><option>DOC</option><option>Link</option></select></label>
              <label>Description<textarea value={resourceForm.description} onChange={e => setResourceForm({...resourceForm,description:e.target.value})} required /></label>
              <label>Resource Photo *<input type="file" accept="image/*" onChange={e => readImage(e.target.files?.[0], setResourceForm)} required /></label>
              {resourceForm.image && <img className="upload-preview" src={resourceForm.image} alt="Resource preview" />}
              <button className="primary-btn">Add Resource</button>
            </form>
          )}

          {modal === "member" && (
            <form className="form" onSubmit={addMember}>
              <label>Name<input value={profile.name} onChange={e => setProfile({...profile,name:e.target.value})} placeholder="Your name" required /></label>
              <label>Role<select value={profile.role} onChange={e => setProfile({...profile,role:e.target.value})}>{roles.slice(1).map(x => <option key={x}>{x}</option>)}</select></label>
              <label>Skills <small>comma separated</small><input value={profile.skills} onChange={e => setProfile({...profile,skills:e.target.value})} placeholder="React, JavaScript, CSS" required /></label>
              <label>College<input value={profile.college} onChange={e => setProfile({...profile,college:e.target.value})} required /></label>
              <div className="two"><label>Email<input type="email" value={profile.email} onChange={e => setProfile({...profile,email:e.target.value})} placeholder="your@email.com" /></label><label>Phone<input value={profile.phone} onChange={e => setProfile({...profile,phone:e.target.value})} placeholder="Contact number" /></label></div>
              <label>About<textarea value={profile.about} onChange={e => setProfile({...profile,about:e.target.value})} /></label>
              <label>Profile Photo *<input type="file" accept="image/*" onChange={e => readImage(e.target.files?.[0], setProfile)} required /></label>
              {profile.image && <img className="upload-preview avatar-preview" src={profile.image} alt="Profile preview" />}
              <div className="info-box">Profile photo is compulsory for a new Team Finder profile.</div>
              <button className="primary-btn">Publish Team Profile</button>
            </form>
          )}

          {modal === "wishlist" && (
            <div className="wishlist-list">
              {wishlist.length === 0 ? <div className="empty-panel">No saved items yet.</div> :
                products.filter(p => wishlist.includes(p.id)).map(p => (
                  <div className="wish-row" key={p.id}><span>{p.icon}</span><div><b>{p.title}</b><small>{p.category}</small></div><strong>{p.price === 0 ? "FREE" : `₹${p.price}`}</strong></div>
                ))}
            </div>
          )}

          {modal?.type === "product" && (
            <div className="detail">
              {modal.data.image ? <img className="detail-photo" src={modal.data.image} alt={modal.data.title} /> : <div className="detail-icon">{modal.data.icon}</div>}
              <span className="verified">✓ VERIFIED LISTING</span><h2>{modal.data.title}</h2>
              <p>Academic material available for campus pickup. Connect through the platform to coordinate safely.</p>
              <div className="detail-grid"><b>₹{modal.data.price}</b><span>Condition: {modal.data.condition}</span><span>Seller: {modal.data.seller}</span><span>📍 {modal.data.location}</span></div>
              <button className="primary-btn" onClick={() => notify("Connection request sent 🤝")}>Connect with Seller</button>
            </div>
          )}

          {modal?.type === "memberView" && (
            <div className="detail">
              {modal.data.image ? <img className="detail-photo profile-detail-photo" src={modal.data.image} alt={modal.data.name} /> : <div className="avatar large">{modal.data.name.split(" ").map(x => x[0]).join("").slice(0, 2)}</div>}
              <span className="verified">✓ VERIFIED PROFILE</span><h2>{modal.data.name}</h2><b>{modal.data.role}</b><p>{modal.data.about}</p>
              <div className="skill-list">{modal.data.skills.map(s => <span key={s}>{s}</span>)}</div>
              <div className="detail-grid"><span>⭐ {modal.data.rating || "New"}</span><span>{modal.data.experience}</span><span>{modal.data.status}</span></div>
              <button className="primary-btn" onClick={() => notify(`Invite sent to ${modal.data.name}!`)}>Send Team Invite</button>
            </div>
          )}

          {modal?.type === "noteAccess" && (
            <div className="detail">
              <div className="detail-icon">📚</div><span className="verified">✓ ACCESS GRANTED</span><h2>{modal.data.title}</h2>
              <p>This demo records that you accessed this note. Only after access can you submit a rating.</p>
              <div className="file-selected">📄 {modal.data.fileName || "Demo note file"}</div>
              <button className="primary-btn" onClick={() => setModal({ type: "rateNote", data: modal.data })}>⭐ Rate this note</button>
            </div>
          )}

          {modal?.type === "rateNote" && (
            <RatingForm note={modal.data} onSubmit={rating => submitNoteRating(modal.data, rating)} onClose={() => setModal(null)} />
          )}
        </Modal>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function RatingForm({ note, onSubmit }) {
  const [rating, setRating] = useState("");
  return (
    <div className="form">
      <div className="info-box">You can rate this note because you have already accessed it.</div>
      <h3>{note.title}</h3>
      <div className="rating-picker">
        {[1, 2, 3, 4, 5].map(n => <button type="button" key={n} className={Number(rating) >= n ? "picked" : ""} onClick={() => setRating(n)}>⭐</button>)}
      </div>
      <button className="primary-btn" onClick={() => onSubmit(rating)} disabled={!rating}>Submit Rating</button>
    </div>
  );
}

function AiCard({ icon, title, text, button, onClick }) {
  return <article className="ai-card"><div className="ai-icon">{icon}</div><h3>{title}</h3><p>{text}</p><button className="small-btn" onClick={onClick}>{button}</button></article>;
}

function BusinessCard({ icon, title, text, value }) {
  return <article className="business-card"><div className="ai-icon">{icon}</div><span className="tag">{value}</span><h3>{title}</h3><p>{text}</p></article>;
}

function SectionTitle({ eyebrow, title, text }) {
  return <div className="section-title"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

function Metric({ n, t }) {
  return <div className="metric"><b>{n}</b><span>{t}</span></div>;
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <span className="eyebrow">UNITRADE</span>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default App;
