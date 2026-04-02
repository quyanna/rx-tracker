'use client'

import styles from './page.module.css'

export default function MedicationForm({ medication, onSubmit, onCancel }) {
  const isEditing = !!medication

  const today = new Date()
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className={styles.formCard}>
      <h3 className={styles.formTitle}>
        {isEditing ? 'Edit medication' : 'Add medication'}
      </h3>

      <form className={styles.medicationForm} action={onSubmit}>
        {isEditing && (
          <input type="hidden" name="id" value={medication.id} />
        )}

        <div className={styles.field}>
          <label htmlFor="name">Medication name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={medication?.name}
            placeholder="e.g. Lisinopril"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.field}>
            <label htmlFor="interval_days">Refill every (days)</label>
            <input
              id="interval_days"
              name="interval_days"
              type="number"
              min="1"
              required
              defaultValue={medication?.interval_days ?? 30}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="notify_days_before">Notify days before</label>
            <input
              id="notify_days_before"
              name="notify_days_before"
              type="number"
              min="1"
              required
              defaultValue={medication?.notify_days_before ?? 7}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="last_fill_date">Last fill date</label>
          <input
            id="last_fill_date"
            name="last_fill_date"
            type="date"
            required
            max={maxDate}
            defaultValue={medication?.last_fill_date}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={medication?.notes ?? ''}
            placeholder="e.g. Take with food"
          />
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={styles.submitButton}>
            {isEditing ? 'Save changes' : 'Add medication'}
          </button>
        </div>
      </form>
    </div>
  )
}
