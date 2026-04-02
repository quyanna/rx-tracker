import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import styles from './page.module.css'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Rx Tracker</h1>
        <div className={styles.headerRight}>
          <span className={styles.email}>{user.email}</span>
          <form action={signOut}>
            <button className={styles.signOutButton} type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className={styles.main}>
        <p className={styles.placeholder}>
          Your medications will appear here. (Coming in Stage 3)
        </p>
      </main>
    </div>
  )
}
