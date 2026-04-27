import Link from 'next/link'
import { signInDemo } from '@/app/auth/actions'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>

        {/* Hero */}
        <section className={styles.hero}>
          <h1 className={styles.title}>Rx Tracker</h1>
          <p className={styles.subtitle}>
            Track your prescriptions, get reminded before you run out,
            and never scramble for a refill again.
          </p>
          <div className={styles.ctas}>
            <form action={signInDemo}>
              <button className={styles.primary} type="submit">
                Try demo &rarr;
              </button>
            </form>
            <Link className={styles.secondary} href="/login">Sign in</Link>
            <Link className={styles.tertiary} href="/signup">Create account</Link>
          </div>
        </section>

        {/* Feature highlights */}
        <section className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>💊</span>
            <h3 className={styles.featureTitle}>Track every refill</h3>
            <p className={styles.featureDesc}>
              Log your medications with their refill interval and last fill date.
              Rx Tracker calculates when each one is due.
            </p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔔</span>
            <h3 className={styles.featureTitle}>Get notified early</h3>
            <p className={styles.featureDesc}>
              Receive email or push notifications days before you run out —
              enough time to call the pharmacy.
            </p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>✅</span>
            <h3 className={styles.featureTitle}>One tap to log</h3>
            <p className={styles.featureDesc}>
              Hit "Just filled!" when you pick up a prescription and your
              countdown resets automatically.
            </p>
          </div>
        </section>

        {/* Static dashboard preview */}
        <section className={styles.preview}>
          <h2 className={styles.previewTitle}>Your dashboard at a glance</h2>
          <div className={styles.previewWindow}>
            <div className={styles.previewHeader}>
              <span className={styles.previewAppName}>Rx Tracker</span>
            </div>
            <div className={styles.previewBody}>
              <div className={styles.previewSectionHeader}>
                <span className={styles.previewSectionTitle}>My Medications</span>
                <span className={styles.previewAddBtn}>+ Add medication</span>
              </div>
              <div className={styles.previewCards}>
                <MockCard name="Atorvastatin 20mg" badge="5d overdue" badgeType="overdue" detail="Every 90 days · Last filled Jan 22" note="Take at bedtime" />
                <MockCard name="Metformin 500mg"   badge="4d left"    badgeType="soon"    detail="Every 30 days · Last filled Apr 1" note="Take with meals" />
                <MockCard name="Lisinopril 10mg"   badge="7d left"    badgeType="ok"      detail="Every 30 days · Last filled Apr 4" />
                <MockCard name="Sertraline 50mg"   badge="25d left"   badgeType="ok"      detail="Every 30 days · Last filled Apr 22" note="Take in the morning" />
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}

function MockCard({ name, badge, badgeType, detail, note }) {
  const badgeClass = `${styles.mockBadge} ${
    badgeType === 'overdue' ? styles.mockBadgeOverdue :
    badgeType === 'soon'    ? styles.mockBadgeSoon :
                              styles.mockBadgeOk
  }`
  return (
    <div className={styles.mockCard}>
      <div className={styles.mockCardHeader}>
        <span className={styles.mockMedName}>{name}</span>
        <span className={badgeClass}>{badge}</span>
      </div>
      <p className={styles.mockCardDetail}>{detail}</p>
      {note && <p className={styles.mockCardNote}>{note}</p>}
      <div className={styles.mockCardActions}>
        <span className={styles.mockBtn}>Edit</span>
        <span className={styles.mockBtnGreen}>Just filled!</span>
        <span className={styles.mockBtnRed}>Delete</span>
      </div>
    </div>
  )
}
