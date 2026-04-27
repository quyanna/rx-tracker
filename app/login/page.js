import Link from 'next/link'
import { signIn } from '@/app/auth/actions'
import styles from '@/app/auth/auth.module.css'

export default function LoginPage({ searchParams }) {
  const error = searchParams?.error
  const message = searchParams?.message

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign in</h1>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <form className={styles.form} action={signIn}>
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
              autoComplete="current-password"
            />
          </div>

          <button className={styles.button} type="submit">
            Sign in
          </button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
        <p className={styles.footer}>
          <Link href="/">&larr; Back to home</Link>
        </p>
      </div>
    </div>
  )
}
