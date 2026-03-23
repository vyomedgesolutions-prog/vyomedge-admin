import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPortfolio, createPortfolio, updatePortfolio } from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi'

export default function PortfolioForm() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(id)

  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [form, setForm] = useState({
    client:      '',
    description: '',
    url:         '',
    logoUrl:     '',
    color:       '#7600C4',
    tags:        '',
    da:          0,
    pa:          0,
    results:     [{ label: '', value: '' }],
    isPublished: true,
  })

  useEffect(() => {
    if (isEdit) {
      getPortfolio()
        .then(({ data }) => {
          const item = data.portfolio?.find(p => p._id === id)
          if (item) {
            setForm({
              client:      item.client      || '',
              description: item.description || '',
              url:         item.url         || '',
              logoUrl:     item.logoUrl || item.icon || '',
              color:       item.color       || '#7600C4',
              tags:        item.tags?.join(', ') || '',
              da:          item.metrics?.da  || 0,
              pa:          item.metrics?.pa  || 0,
              results:     item.results?.length > 0 ? item.results : [{ label: '', value: '' }],
              isPublished: item.isPublished ?? true,
            })
          }
        })
        .catch(() => toast.error('Failed to fetch item'))
        .finally(() => setFetching(false))
    }
  }, [id, isEdit])

  const addResult    = () => setForm({ ...form, results: [...form.results, { label: '', value: '' }] })
  const removeResult = (i) => setForm({ ...form, results: form.results.filter((_, idx) => idx !== i) })
  const updateResult = (i, field, val) => {
    const r = [...form.results]
    r[i][field] = val
    setForm({ ...form, results: r })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      client:      form.client,
      description: form.description,
      url:         form.url,
      logoUrl:     form.logoUrl,
      icon:        form.logoUrl, // keep icon in sync for backward compat
      color:       form.color,
      tags:        form.tags.split(',').map(t => t.trim()).filter(Boolean),
      metrics:     { da: parseInt(form.da) || 0, pa: parseInt(form.pa) || 0 },
      results:     form.results.filter(r => r.label && r.value),
      isPublished: form.isPublished,
    }
    try {
      if (isEdit) {
        await updatePortfolio(id, payload)
        toast.success('Portfolio updated')
      } else {
        await createPortfolio(payload)
        toast.success('Portfolio item created')
      }
      navigate('/portfolio')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  )

  return (
    <div>
      <button onClick={() => navigate('/portfolio')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <HiOutlineArrowLeft className="w-5 h-5" />
        Back to Portfolio
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit Portfolio' : 'Add Portfolio Item'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="glass rounded-xl p-6 space-y-6">

          {/* Client Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Client Name *</label>
            <input type="text" value={form.client} required placeholder="e.g., The SuperC"
              onChange={e => setForm({ ...form, client: e.target.value })}
              className="w-full px-4 py-3 rounded-lg" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description *</label>
            <textarea value={form.description} required rows={4}
              placeholder="Describe the project and results..."
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg resize-y" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Website URL */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Website URL</label>
              <input type="url" value={form.url} placeholder="https://example.com"
                onChange={e => setForm({ ...form, url: e.target.value })}
                className="w-full px-4 py-3 rounded-lg" />
            </div>
            {/* Tags */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tags</label>
              <input type="text" value={form.tags} placeholder="SEO, Meta Ads, Web Dev"
                onChange={e => setForm({ ...form, tags: e.target.value })}
                className="w-full px-4 py-3 rounded-lg" />
            </div>
          </div>

          {/* Client Logo URL */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Client Logo</label>
            <input type="url" value={form.logoUrl}
              placeholder="https://example.com/logo.png"
              onChange={e => setForm({ ...form, logoUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-lg" />
            {/* Live preview */}
            {form.logoUrl && (
              <div className="mt-3 flex items-center gap-3">
                <img src={form.logoUrl} alt="logo preview"
                  onError={e => e.target.style.display = 'none'}
                  className="w-14 h-14 object-contain rounded-xl bg-white/10 p-2" />
                <div>
                  <p className="text-xs text-gray-400">Logo preview</p>
                  <button type="button"
                    onClick={() => setForm({ ...form, logoUrl: '' })}
                    className="text-xs text-red-400 hover:text-red-300 mt-0.5">
                    Remove
                  </button>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-600 mt-2">
              Upload your logo to{' '}
              <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer"
                className="text-primary hover:underline">imgbb.com</a>
              {' '}(free) → copy the direct image link → paste here.
            </p>
          </div>

          {/* Color, DA, PA */}
          <div className="grid grid-cols-3 gap-6">
            {/* Color */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Brand Color</label>
              <input type="color" value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                className="w-full h-12 rounded-lg cursor-pointer" />
            </div>
            {/* DA */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">DA</label>
              <input type="number" value={form.da} min="0" max="100"
                onChange={e => setForm({ ...form, da: e.target.value })}
                className="w-full px-4 py-3 rounded-lg" />
            </div>
            {/* PA */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">PA</label>
              <input type="number" value={form.pa} min="0" max="100"
                onChange={e => setForm({ ...form, pa: e.target.value })}
                className="w-full px-4 py-3 rounded-lg" />
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Results / Metrics</label>
              <button type="button" onClick={addResult}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80">
                <HiOutlinePlus className="w-4 h-4" /> Add Result
              </button>
            </div>
            <div className="space-y-3">
              {form.results.map((result, i) => (
                <div key={i} className="flex gap-3">
                  <input type="text" value={result.label} placeholder="Label (e.g., Total Clicks)"
                    onChange={e => updateResult(i, 'label', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg" />
                  <input type="text" value={result.value} placeholder="Value (e.g., 28.2K)"
                    onChange={e => updateResult(i, 'value', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg" />
                  {form.results.length > 1 && (
                    <button type="button" onClick={() => removeResult(i)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isPublished" checked={form.isPublished}
              onChange={e => setForm({ ...form, isPublished: e.target.checked })}
              className="w-5 h-5 rounded" />
            <label htmlFor="isPublished" className="text-sm">Publish on website</label>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-primary rounded-lg hover:bg-primary/80 transition-all font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={() => navigate('/portfolio')}
            className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}