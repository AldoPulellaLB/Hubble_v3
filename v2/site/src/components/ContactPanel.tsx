'use client'

import { useId, useState, type RefObject } from 'react'
import Button from './Button'
import s from './ContactPanel.module.css'

type Props = {
  onClose: () => void
  closeRef?: RefObject<HTMLButtonElement | null>
}

/* The three reasons someone opens this, in the order they are likely. The
   value is what a handler would branch on; the label is what the reader
   reads. */
const TOPICS = [
  { id: 'business', label: 'New business' },
  { id: 'press', label: 'Press' },
  { id: 'other', label: 'Everything else' },
]

/**
 * The contact panel.
 *
 * A right-hand sheet on the same stage the savings calculator uses: the site
 * knocks back behind it and the nav retracts. `SavingsStage` owns that motion
 * and the freeze — this component is the sheet's own content and nothing else.
 *
 * Grouped rather than a flat list of nine fields: what you want, then the
 * business, then you. A form this long reads as a wall without the headings,
 * and the groups are real `fieldset`/`legend` pairs so the grouping is in the
 * accessibility tree too, not just in the type.
 *
 * Every field carries a visible label. The reference this follows labels by
 * placeholder alone, which disappears the moment the reader types and leaves
 * them checking what a half-filled field was for — so the labels here follow
 * the calculator's own pattern instead.
 */
export default function ContactPanel({ onClose, closeRef }: Props) {
  const uid = useId().replace(/:/g, '')
  const [topic, setTopic] = useState('business')
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    /* TODO — no endpoint yet. The browser has already run `required` and the
       `type` constraints by the time this fires; what is missing is the POST.
       Wire it here and keep the `sent` state as the success view. Nothing is
       transmitted today, so do not ship this page live as-is. */
    setSent(true)
  }

  return (
    <aside
      className={s.panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${uid}-title`}
    >
      <header className={s.head}>
        <div>
          <p className={s.eyebrow}>Contact</p>
          <h2 id={`${uid}-title`} className={s.title}>Let&rsquo;s get in touch</h2>
        </div>
        <button
          ref={closeRef}
          type="button"
          className={s.close}
          onClick={onClose}
          aria-label="Close the contact form"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        </button>
      </header>

      {sent ? (
        /* The success view replaces the form rather than sitting above it:
           leaving nine filled fields on screen invites a second send. */
        <div className={s.done} role="status">
          <span className={s.doneMark} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
          </span>
          <p className={s.doneTitle}>Thanks — that&rsquo;s with us.</p>
          <p className={s.doneBody}>
            One of the team will come back to you. If it is urgent, call
            <a href="tel:+27100010001"> +27 10 001 0001</a>.
          </p>
          <Button onClick={onClose} variant="primary" chevron={false}>Close</Button>
        </div>
      ) : (
        <form className={s.form} onSubmit={submit} noValidate={false}>
          <fieldset className={s.group}>
            <legend className={s.legend}>What is this about?</legend>
            <div className={s.topics}>
              {TOPICS.map((t) => (
                <label key={t.id} className={s.topic} data-sel={topic === t.id ? '' : undefined}>
                  <input
                    type="radio"
                    name="topic"
                    value={t.id}
                    checked={topic === t.id}
                    onChange={() => setTopic(t.id)}
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className={s.group}>
            <legend className={s.legend}>Describe your challenge</legend>
            <p className={s.field}>
              <label htmlFor={`${uid}-msg`} className={s.lab}>Message</label>
              <textarea
                id={`${uid}-msg`} name="message" rows={4} required
                className={s.textarea}
                placeholder="What are you trying to solve?"
              />
            </p>
          </fieldset>

          <fieldset className={s.group}>
            <legend className={s.legend}>About the business</legend>
            <div className={s.two}>
              <p className={s.field}>
                <label htmlFor={`${uid}-co`} className={s.lab}>Company</label>
                <input id={`${uid}-co`} name="company" type="text" required
                       autoComplete="organization" className={s.input} />
              </p>
              <p className={s.field}>
                <label htmlFor={`${uid}-loc`} className={s.lab}>Location</label>
                <input id={`${uid}-loc`} name="location" type="text" required
                       autoComplete="address-level2" className={s.input} />
              </p>
            </div>
          </fieldset>

          <fieldset className={s.group}>
            <legend className={s.legend}>About you</legend>
            <div className={s.two}>
              <p className={s.field}>
                <label htmlFor={`${uid}-first`} className={s.lab}>First name</label>
                <input id={`${uid}-first`} name="first_name" type="text" required
                       autoComplete="given-name" className={s.input} />
              </p>
              <p className={s.field}>
                <label htmlFor={`${uid}-last`} className={s.lab}>Last name</label>
                <input id={`${uid}-last`} name="last_name" type="text" required
                       autoComplete="family-name" className={s.input} />
              </p>
            </div>
            <p className={s.field}>
              <label htmlFor={`${uid}-email`} className={s.lab}>Email</label>
              {/* `type="email"` for the constraint and the right mobile
                  keyboard both. */}
              <input id={`${uid}-email`} name="email" type="email" required
                     autoComplete="email" inputMode="email" className={s.input} />
            </p>
            <p className={s.field}>
              <label htmlFor={`${uid}-tel`} className={s.lab}>
                Phone <span className={s.opt}>optional</span>
              </label>
              <input id={`${uid}-tel`} name="phone" type="tel"
                     autoComplete="tel" inputMode="tel" className={s.input} />
            </p>
          </fieldset>

          <div className={s.foot}>
            <Button type="submit" variant="primary" chevron={false}>Send</Button>
            <p className={s.fine}>
              We use this to reply to you and nothing else.
            </p>
          </div>
        </form>
      )}
    </aside>
  )
}
