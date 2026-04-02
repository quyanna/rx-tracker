import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Rx Tracker</h1>
        <p className={styles.subtitle}>Never miss a medication refill.</p>
        <div className={styles.ctas}>
          <Link className={styles.primary} href="/login">Sign in</Link>
          <Link className={styles.secondary} href="/signup">Create account</Link>
        </div>
      </main>
    </div>
  )
}
