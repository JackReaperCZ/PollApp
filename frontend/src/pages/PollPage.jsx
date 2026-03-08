import { useState, useEffect } from "react";
import { fetchPoll, submitVote } from "../api.js";
import styles from "./PollPage.module.css";

function ResultBar({ label, votes, total, isSelected }) {
  const pct = total === 0 ? 0 : Math.round((votes / total) * 100);
  return (
    <div className={`${styles.resultRow} ${isSelected ? styles.resultSelected : ""}`}>
      <div className={styles.resultLabel}>
        <span>{label}</span>
        <span className={styles.resultPct}>{pct}%</span>
      </div>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ "--target-width": `${pct}%` }}
        />
      </div>
      <span className={styles.resultVotes}>{votes} hlasů</span>
    </div>
  );
}

export default function PollPage() {
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadPoll();
  }, []);

  async function loadPoll() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPoll();
      setPoll(data);
      console.log("[UI] Anketa zobrazena uživateli.");
    } catch (err) {
      setError("Nepodařilo se načíst anketu. Zkuste to znovu.");
      console.error("[UI] Chyba při zobrazení ankety:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVote() {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitVote(selected);
      setPoll((prev) => ({ ...prev, options: result.options }));
      setVoted(true);
      setShowResults(true);
      console.log("[UI] Výsledky zobrazeny po hlasování.");
    } catch (err) {
      setError("Chyba při odesílání hlasu. Zkuste to znovu.");
      console.error("[UI] API error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const totalVotes = poll?.options?.reduce((acc, o) => acc + o.votes, 0) || 0;

  if (loading) {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>načítání ankety...</p>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.tag}>ANKETA // 2024</div>
          <h1 className={styles.question}>{poll?.question}</h1>
          <p className={styles.subtitle}>
            Celkem hlasů: <strong>{totalVotes}</strong>
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Voting form */}
        {!voted && !showResults && (
          <div className={styles.voteSection}>
            <div className={styles.options}>
              {poll?.options?.map((opt) => (
                <button
                  key={opt.id}
                  className={`${styles.option} ${selected === opt.id ? styles.optionSelected : ""}`}
                  onClick={() => setSelected(opt.id)}
                >
                  <span className={styles.optionCheck}>
                    {selected === opt.id ? "▶" : "○"}
                  </span>
                  <span className={styles.optionLabel}>{opt.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              <button
                className={styles.submitBtn}
                onClick={handleVote}
                disabled={!selected || submitting}
              >
                {submitting ? "odesílám..." : "hlasovat"}
              </button>
              <button
                className={styles.resultsBtn}
                onClick={() => setShowResults(true)}
              >
                zobrazit výsledky
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {(voted || showResults) && (
          <div className={styles.results}>
            {voted && (
              <div className={styles.successMsg}>
                ✓ Váš hlas byl zaznamenán
              </div>
            )}
            <div className={styles.resultsList}>
              {poll?.options?.map((opt) => (
                <ResultBar
                  key={opt.id}
                  label={opt.label}
                  votes={opt.votes}
                  total={totalVotes}
                  isSelected={selected === opt.id}
                />
              ))}
            </div>
            {!voted && (
              <button
                className={styles.resultsBtn}
                onClick={() => setShowResults(false)}
              >
                ← zpět na hlasování
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
