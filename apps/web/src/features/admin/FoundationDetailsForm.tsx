import { useState } from 'react'
import type { FoundationProfile, UpdateFoundationInput } from '../../lib/api/foundation'
import { ApiError } from '../../lib/api/client'
import { Icon } from '../../components/ui/Icon'

interface FoundationDetailsFormProps {
  foundation: FoundationProfile | null
  onSave: (input: UpdateFoundationInput) => Promise<void>
}

export function FoundationDetailsForm({ foundation, onSave }: FoundationDetailsFormProps) {
  const [legalName, setLegalName] = useState(foundation?.legalName ?? '')
  const [shortName, setShortName] = useState(foundation?.shortName ?? '')
  const [edrpou, setEdrpou] = useState(foundation?.edrpou ?? '')
  const [taxId, setTaxId] = useState(foundation?.taxId ?? '')
  const [address, setAddress] = useState(foundation?.address ?? '')
  const [website, setWebsite] = useState(foundation?.website ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSave = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await onSave({
        legalName,
        shortName,
        edrpou,
        taxId: taxId || undefined,
        address: address || undefined,
        website: website || undefined,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося зберегти')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Загальні дані</h3>
        </div>
        <div className="card__body">
          {error && (
            <div className="note note--danger mb-3">
              <Icon name="alert" size={16} />
              <div>{error}</div>
            </div>
          )}
          <div className="field">
            <label>Повна назва</label>
            <input className="input" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
          </div>
          <div className="field">
            <label>Скорочена назва</label>
            <input className="input" value={shortName} onChange={(e) => setShortName(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="field">
              <label>Код ЄДРПОУ</label>
              <input className="input" value={edrpou} onChange={(e) => setEdrpou(e.target.value)} />
            </div>
            <div className="field">
              <label>ІПН</label>
              <input className="input" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Юридична адреса</label>
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="field">
            <label>Сайт</label>
            <input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
        </div>
        <div className="card__footer text-right">
          <button className="btn btn--primary" onClick={() => void handleSave()} disabled={submitting}>
            {submitting ? 'Збереження…' : 'Зберегти'}
          </button>
        </div>
      </div>
    </div>
  )
}
