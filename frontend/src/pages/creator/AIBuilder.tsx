import { FormEvent, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { creatorApi } from '../../services/endpoints'
import { getErrorMessage } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input, Label, Textarea } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

export default function AIPortfolioBuilderPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [details, setDetails] = useState('')
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [pdfUrl, setPdfUrl] = useState<string | undefined>()
  const [uploading, setUploading] = useState(false)

  const mutation = useMutation({
    mutationFn: () =>
      creatorApi.createPortfolio({
        project_details: details,
        image_url: imageUrl,
        pdf_url: pdfUrl,
        use_ai: true,
      }),
    onSuccess: () => {
      toast.success('AI portfolio card created')
      qc.invalidateQueries({ queryKey: ['portfolio'] })
      navigate('/creator/portfolio')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  async function onUpload(file: File, kind: 'image' | 'pdf') {
    setUploading(true)
    try {
      const res = await creatorApi.upload(file, kind)
      if (kind === 'image') setImageUrl(res.url)
      else setPdfUrl(res.url)
      toast.success('Upload ready')
    } catch (e) {
      toast.error(getErrorMessage(e, 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">AI Portfolio Builder</h1>
        <p className="muted mt-1">Upload assets and project notes — AI drafts a client-ready card.</p>
      </div>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Project details</Label>
            <Textarea
              required
              minLength={10}
              placeholder="Describe what you built, your role, outcomes, stack…"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], 'image')}
              />
              {imageUrl ? <p className="mt-2 truncate text-xs text-accent-soft">{imageUrl}</p> : null}
            </div>
            <div>
              <Label>PDF</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], 'pdf')}
              />
              {pdfUrl ? <p className="mt-2 truncate text-xs text-accent-soft">{pdfUrl}</p> : null}
            </div>
          </div>
          <Button disabled={mutation.isPending || uploading}>
            {mutation.isPending ? 'Generating…' : 'Generate portfolio card'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
