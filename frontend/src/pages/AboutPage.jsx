import styles from "./AboutPage.module.css";

const TECH = [
  {
    name: "Express",
    desc: "Node.js webový framework pro REST API a middleware.",
    icon: "⚙",
    color: "#47ff9a",
  },
  {
    name: "React + Vite",
    desc: "Frontend knihovna s bleskurychlým build systémem.",
    icon: "⚛",
    color: "#47b8ff",
  },
  {
    name: "PostgreSQL",
    desc: "Relační databáze pro persistentní ukládání hlasů.",
    icon: "🗄",
    color: "#e8ff47",
  },
  {
    name: "Docker",
    desc: "Kontejnerizace pro konzistentní deployment.",
    icon: "🐳",
    color: "#47b8ff",
  },
  {
    name: "Winston",
    desc: "Strukturované logování na backendu (konzole + soubor).",
    icon: "📝",
    color: "#ff9a47",
  },
];

export default function AboutPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.tag}>O PROJEKTU</div>
          <h1 className={styles.title}>Webová Anketa</h1>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Popis projektu</h2>
          <p className={styles.text}>
            Webová anketa je full-stack aplikace umožňující uživatelům hlasovat
            v jednoduché otázce a zobrazit sdílené výsledky v reálném čase.
            Hlasy jsou ukládány v PostgreSQL databázi a jsou sdíleny napříč
            všemi uživateli. Výsledky přetrvávají po reloadu stránky.
          </p>
          <p className={styles.text}>
            Backend poskytuje chráněný API endpoint pro reset hlasování
            (vyžaduje tajný token). Frontend loguje klíčové akce do konzole
            a backend loguje všechny události do konzole i do rotujících
            souborů.
          </p>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Použité technologie</h2>
          <div className={styles.techGrid}>
            {TECH.map((t) => (
              <div key={t.name} className={styles.techCard}>
                <div className={styles.techIcon} style={{ color: t.color }}>
                  {t.icon}
                </div>
                <div>
                  <div className={styles.techName}>{t.name}</div>
                  <div className={styles.techDesc}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>API Endpoints</h2>
          <div className={styles.apiList}>
            <div className={styles.apiRow}>
              <span className={styles.method}>GET</span>
              <code>/api/poll</code>
              <span className={styles.apiDesc}>Načtení otázky a výsledků</span>
            </div>
            <div className={styles.apiRow}>
              <span className={styles.method} style={{ color: "#47b8ff" }}>POST</span>
              <code>/api/poll/vote</code>
              <span className={styles.apiDesc}>Odeslání hlasu</span>
            </div>
            <div className={styles.apiRow}>
              <span className={styles.method} style={{ color: "#ff4747" }}>POST</span>
              <code>/api/poll/reset</code>
              <span className={styles.apiDesc}>Reset hlasování (chráněno tokenem)</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Hlásit chybu</h2>
          <p className={styles.text}>
            Narazili jste na chybu nebo máte návrh na vylepšení? Otevřete
            issue na GitHubu:
          </p>
          <a
            href="https://github.com/JackReaperCZ/PollApp/issues"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ghLink}
          >
            → GitHub Issues
          </a>
        </div>
      </div>
    </main>
  );
}
