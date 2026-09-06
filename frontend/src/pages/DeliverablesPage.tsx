import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Upload, CheckCircle, XCircle, FileText, ArrowRight,
  Tag, PlusCircle, ExternalLink, Clock,
} from 'lucide-react'
import { getProject } from '../api/projects'
import {
  getDeliverables, uploadDeliverable, addDeliverableLink,
  approveDeliverable, requestRevision, deleteDeliverable,
} from '../api/deliverables'
import type { ProjectDto, DeliverableDto } from '../types'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import CommentThread from '../components/CommentThread'
import { deliverableStatusColor, deliverableStatusLabel, categoryColor, categoryLabel } from '../utils/status'
import { formatDate, formatFileSize, timeAgo } from '../utils/format'

export default function DeliverablesPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const isClient = user?.role === 'CLIENT'

  const [project, setProject] = useState<ProjectDto | null>(null)
  const [deliverables, setDeliverables] = useState<DeliverableDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [showLink, setShowLink] = useState(false)
  const [selected, setSelected] = useState<DeliverableDto | null>(null)
  const [revisionModal, setRevisionModal] = useState<DeliverableDto | null>(null)
  const [filterCat, setFilterCat] = useState<string>('ALL')

  const load = () =>
    Promise.all([getProject(projectId), getDeliverables(projectId)])
      .then(([p, d]) => { setProject(p); setDeliverables(d) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [projectId])

  const handleApprove = async (d: DeliverableDto) => {
    const updated = await approveDeliverable(d.id)
    setDeliverables((prev) => prev.map((x) => x.id === updated.id ? updated : x))
    setSelected(updated)
  }

  const handleRevision = async (d: DeliverableDto, feedback: string) => {
    const updated = await requestRevision(d.id, feedback)
    setDeliverables((prev) => prev.map((x) => x.id === updated.id ? updated : x))
    setRevisionModal(null)
    setSelected(updated)
  }

  const handleDelete = async (d: DeliverableDto) => {
    if (!confirm('Delete this deliverable?')) return
    await deleteDeliverable(d.id)
    setDeliverables((prev) => prev.filter((x) => x.id !== d.id))
    setSelected(null)
  }

  const filtered = filterCat === 'ALL'
    ? deliverables
    : deliverables.filter((d) => d.category === filterCat)

  const categories = ['ALL', ...Array.from(new Set(deliverables.map((d) => d.category)))]

  if (loading) return <div className="card h-64 animate-pulse" />

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
            <Link to="/projects" className="hover:text-brand-600">Projects</Link>
            <ArrowRight size={12} />
            <Link to={`/projects/${projectId}`} className="hover:text-brand-600">{project?.title}</Link>
            <ArrowRight size={12} />
            <span className="text-slate-700">Deliverables</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Files & Deliverables</h1>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowLink(true)} className="btn-secondary text-sm">
              <ExternalLink size={14} /> Add Link
            </button>
            <button onClick={() => setShowUpload(true)} className="btn-primary text-sm">
              <Upload size={14} /> Upload File
            </button>
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterCat === cat
                ? 'bg-brand-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
            }`}
          >
            {cat === 'ALL' ? 'All Files' : categoryLabel[cat]}
            <span className="ml-1.5 opacity-70">
              {cat === 'ALL' ? deliverables.length : deliverables.filter((d) => d.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-slate-400">
          <FileText size={36} className="mb-3 opacity-30" />
          <p className="text-slate-500">No files yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <div
              key={d.id}
              onClick={() => setSelected(d)}
              className="card p-4 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
            >
              {/* Status banner for client */}
              {isClient && d.status === 'PENDING' && (
                <div className="mb-3 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <Clock size={13} className="text-amber-600" />
                  <span className="text-xs text-amber-700 font-medium">Awaiting your review</span>
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 text-lg">
                  {d.fileType === 'figma' ? '🎨' : d.fileType === 'pdf' ? '📄'
                    : d.fileType === 'zip' ? '📦' : d.fileType === 'link' ? '🔗' : '📁'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-700 truncate">
                    {d.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{d.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`badge text-[10px] ${categoryColor[d.category]}`}>
                  <Tag size={9} className="mr-1" />{categoryLabel[d.category]}
                </span>
                <span className="badge text-[10px] bg-slate-100 text-slate-600">{d.versionTag}</span>
                <span className={`badge text-[10px] ${deliverableStatusColor[d.status]}`}>
                  {deliverableStatusLabel[d.status]}
                </span>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>{d.uploadedBy?.fullName ?? 'Unknown'}</span>
                <span>{timeAgo(d.createdAt)}</span>
              </div>

              {/* Approval buttons for client on pending */}
              {isClient && d.status === 'PENDING' && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleApprove(d)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button
                    onClick={() => setRevisionModal(d)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <XCircle size={13} /> Revise
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Deliverable Detail Modal */}
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${categoryColor[selected.category]}`}>{categoryLabel[selected.category]}</span>
              <span className="badge bg-slate-100 text-slate-600">{selected.versionTag}</span>
              <span className={`badge ${deliverableStatusColor[selected.status]}`}>
                {deliverableStatusLabel[selected.status]}
              </span>
            </div>

            {selected.feedback && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-red-600 mb-1">Revision Feedback</p>
                <p className="text-sm text-red-700">{selected.feedback}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Uploaded by</p>
                <p className="font-medium">{selected.uploadedBy?.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Uploaded on</p>
                <p className="font-medium">{formatDate(selected.createdAt)}</p>
              </div>
              {selected.fileSize && (
                <div>
                  <p className="text-xs text-slate-400">File size</p>
                  <p className="font-medium">{formatFileSize(selected.fileSize)}</p>
                </div>
              )}
            </div>

            {selected.fileUrl && (
              <a
                href={selected.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-center"
              >
                <ExternalLink size={14} />
                {selected.fileType === 'link' ? 'Open Link' : 'Download / View File'}
              </a>
            )}

            {/* Approval actions for client */}
            {isClient && selected.status === 'PENDING' && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleApprove(selected)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
                >
                  <CheckCircle size={15} /> Approve Deliverable
                </button>
                <button
                  onClick={() => setRevisionModal(selected)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium"
                >
                  <XCircle size={15} /> Request Changes
                </button>
              </div>
            )}

            {isAdmin && (
              <div className="flex justify-end pt-1">
                <button className="btn-danger text-xs" onClick={() => handleDelete(selected)}>
                  Delete Deliverable
                </button>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">Comments</p>
              <CommentThread deliverableId={selected.id} />
            </div>
          </div>
        </Modal>
      )}

      {/* Revision feedback modal */}
      {revisionModal && (
        <RevisionModal
          deliverable={revisionModal}
          onClose={() => setRevisionModal(null)}
          onSubmit={(feedback) => handleRevision(revisionModal, feedback)}
        />
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          projectId={projectId}
          onClose={() => setShowUpload(false)}
          onUploaded={(d) => { setDeliverables((prev) => [d, ...prev]); setShowUpload(false) }}
        />
      )}

      {/* Link modal */}
      {showLink && (
        <LinkModal
          projectId={projectId}
          onClose={() => setShowLink(false)}
          onAdded={(d) => { setDeliverables((prev) => [d, ...prev]); setShowLink(false) }}
        />
      )}
    </div>
  )
}

// ── Sub-modals ─────────────────────────────────────────────────────────────────

function RevisionModal({ deliverable, onClose, onSubmit }: {
  deliverable: DeliverableDto
  onClose: () => void
  onSubmit: (feedback: string) => void
}) {
  const [feedback, setFeedback] = useState('')
  return (
    <Modal title="Request Changes" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Please describe the changes needed for <strong>{deliverable.title}</strong>:
        </p>
        <textarea
          className="input resize-none"
          rows={4}
          placeholder="e.g. Please fix the mobile layout issues and update the color scheme…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-danger"
            disabled={!feedback.trim()}
            onClick={() => onSubmit(feedback.trim())}
          >
            <XCircle size={14} /> Submit Feedback
          </button>
        </div>
      </div>
    </Modal>
  )
}

function UploadModal({ projectId, onClose, onUploaded }: {
  projectId: number
  onClose: () => void
  onUploaded: (d: DeliverableDto) => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('OTHER')
  const [version, setVersion] = useState('v1.0')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) { setError('Title and file are required'); return }
    setUploading(true)
    const fd = new FormData()
    fd.append('title', title)
    fd.append('category', category)
    fd.append('versionTag', version)
    fd.append('file', file)
    try {
      const d = await uploadDeliverable(projectId, fd)
      onUploaded(d)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal title="Upload File" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div>
          <label className="label">Title *</label>
          <input className="input" placeholder="e.g. UI Mockups v2" value={title}
            onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {['DESIGN', 'DOCS', 'CODE', 'INVOICES', 'OTHER'].map((c) => (
                <option key={c} value={c}>{categoryLabel[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Version Tag</label>
            <input className="input" placeholder="v1.0" value={version}
              onChange={(e) => setVersion(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">File *</label>
          <input
            type="file"
            className="input py-1.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 file:text-xs file:font-medium hover:file:bg-brand-100"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={uploading}>
            {uploading ? 'Uploading…' : <><Upload size={14} /> Upload</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function LinkModal({ projectId, onClose, onAdded }: {
  projectId: number
  onClose: () => void
  onAdded: (d: DeliverableDto) => void
}) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('OTHER')
  const [version, setVersion] = useState('v1.0')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const d = await addDeliverableLink(projectId, { title, fileUrl: url, category, versionTag: version })
      onAdded(d)
    } finally { setSaving(false) }
  }

  return (
    <Modal title="Add Link" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Title *</label>
          <input className="input" placeholder="e.g. Figma Design File" value={title}
            onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="label">URL *</label>
          <input className="input" type="url" placeholder="https://figma.com/…" value={url}
            onChange={(e) => setUrl(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {['DESIGN', 'DOCS', 'CODE', 'INVOICES', 'OTHER'].map((c) => (
                <option key={c} value={c}>{categoryLabel[c]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Version Tag</label>
            <input className="input" placeholder="v1.0" value={version}
              onChange={(e) => setVersion(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Adding…' : <><PlusCircle size={14} /> Add Link</>}
          </button>
        </div>
      </form>
    </Modal>
  )
}


