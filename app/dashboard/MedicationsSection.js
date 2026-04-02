'use client'

import { useState } from 'react'
import MedicationForm from './MedicationForm'
import styles from './page.module.css'

// Parse a YYYY-MM-DD string in local time (avoids timezone off-by-one issues)
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getDaysUntilRefill(lastFillDate, intervalDays) {
  const next = parseLocalDate(lastFillDate)
  next.setDate(next.getDate() + intervalDays)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Math.ceil((next - today) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr) {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function MedicationsSection({
  medications,
  addMedication,
  updateMedication,
  deleteMedication,
  markFilled,
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingMed, setEditingMed] = useState(null)

  function handleEdit(med) {
    setEditingMed(med)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditingMed(null)
  }

  async function handleSubmit(formData) {
    if (editingMed) {
      await updateMedication(formData)
    } else {
      await addMedication(formData)
    }
    handleClose()
  }

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>My Medications</h2>
        {!showForm && (
          <button
            className={styles.addButton}
            onClick={() => setShowForm(true)}
          >
            + Add medication
          </button>
        )}
      </div>

      {showForm && (
        <MedicationForm
          medication={editingMed}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      )}

      {medications.length === 0 && !showForm && (
        <p className={styles.empty}>
          No medications yet. Add one to get started.
        </p>
      )}

      <div className={styles.medicationList}>
        {medications.map((med) => {
          const daysUntil = getDaysUntilRefill(med.last_fill_date, med.interval_days)
          const isOverdue = daysUntil < 0
          const isDueSoon = !isOverdue && daysUntil <= med.notify_days_before

          return (
            <div key={med.id} className={styles.medicationCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.medName}>{med.name}</h3>
                <span
                  className={`${styles.badge} ${
                    isOverdue
                      ? styles.badgeOverdue
                      : isDueSoon
                      ? styles.badgeSoon
                      : styles.badgeOk
                  }`}
                >
                  {isOverdue
                    ? `${Math.abs(daysUntil)}d overdue`
                    : daysUntil === 0
                    ? 'Due today'
                    : `${daysUntil}d left`}
                </span>
              </div>

              <p className={styles.cardDetail}>
                Every {med.interval_days} days &middot; Last filled{' '}
                {formatDate(med.last_fill_date)}
              </p>

              {med.notes && (
                <p className={styles.cardNotes}>{med.notes}</p>
              )}

              <div className={styles.cardActions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEdit(med)}
                >
                  Edit
                </button>
                <form action={markFilled}>
                  <input type="hidden" name="id" value={med.id} />
                  <button className={styles.filledButton} type="submit">
                    Just filled!
                  </button>
                </form>
                <form
                  action={deleteMedication}
                  onSubmit={(e) => {
                    if (!confirm(`Delete ${med.name}?`)) e.preventDefault()
                  }}
                >
                  <input type="hidden" name="id" value={med.id} />
                  <button className={styles.deleteButton} type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
