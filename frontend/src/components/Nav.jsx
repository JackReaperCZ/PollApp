import { NavLink } from "react-router-dom";
import styles from "./Nav.module.css";

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.bracket}>[</span>
        WEBPOLL
        <span className={styles.bracket}>]</span>
      </div>
      <div className={styles.links}>
        <NavLink
          to="/"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
          end
        >
          anketa
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
        >
          o projektu
        </NavLink>
      </div>
    </nav>
  );
}
