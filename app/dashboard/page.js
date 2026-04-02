import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { addMedication, updateMedication, deleteMedication, markFilled } from '@/app/medications/actions'
import MedicationsSection from './MedicationsSection'
import NotificationToggle from './NotificationToggle'
import styles from './page.module.css'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: medications } = await supabase
    .from('medications')
    .select('*')
    .order('name')

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Rx Tracker</h1>
        <div className={styles.headerRight}>
          <span className={styles.email}>{user.email}</span>
          <NotificationToggle />
          <form action={signOut}>
            <button className={styles.signOutButton} type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className={styles.main}>
        <MedicationsSection
          medications={medications ?? []}
          addMedication={addMedication}
          updateMedication={updateMedication}
          deleteMedication={deleteMedication}
          markFilled={markFilled}
        />
      </main>
    </div>
  )
}
