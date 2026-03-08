const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function fetchPoll() {
  console.log("[Poll] Načítání ankety z:", API_URL);
  try {
    const res = await fetch(`${API_URL}/api/poll`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("[Poll] Anketa načtena:", data);
    return data;
  } catch (error) {
    console.error("[Poll] Chyba při načítání ankety:", error);
    throw error;
  }
}

export async function submitVote(optionId) {
  console.log("[Poll] Odesílání hlasu pro možnost:", optionId);
  try {
    const res = await fetch(`${API_URL}/api/poll/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("[Poll] Hlas odeslán, výsledky:", data);
    return data;
  } catch (error) {
    console.error("[Poll] Chyba při odesílání hlasu:", error);
    throw error;
  }
}
