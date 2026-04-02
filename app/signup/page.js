import Link from 'next/link'
import { signUp } from '@/app/auth/actions'
import styles from '@/app/auth/auth.module.css'

export default function SignupPage({ searchParams }) {
  const error = searchParams?.error

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create account</h1>

        {error && <p className={styles.error}>{error}</p>}

        <form className={styles.form} action={signUp}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <button className={styles.button} type="submit">
            Create account
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
