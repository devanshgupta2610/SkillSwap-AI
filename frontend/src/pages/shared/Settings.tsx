import { FormEvent, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { clientApi, creatorApi, sharedApi } from '../../services/endpoints'
import { Button } from '../../components/ui/Button'
import { Input, Label, Textarea } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../services/api'

export default function SettingsPage() {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('How should I write a strong project brief?')
  const [reply, setReply] = useState('')
  const [company, setCompany] = useState('')

  async function askAssistant(e: FormEvent) {
    e.preventDefault()
    try {
      const res = await sharedApi.assistant(prompt)
      setReply(res.reply)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function saveClient() {
    try {
      await clientApi.updateProfile({ company_name: company })
      toast.success('Settings saved')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="muted mt-1">Account · {user?.email} · {user?.role}</p>
      </div>
      {user?.role === 'client' ? (
        <Card className="space-y-3">
          <Label>Company name</Label>
          <Input value={company} onChange={(e) => setCompany(e.target.value)} />
          <Button onClick={saveClient}>Save</Button>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-white/65">
            Update detailed creator fields from the Profile page. Availability defaults to available.
          </p>
          <Button
            className="mt-4"
            variant="ghost"
            onClick={async () => {
              try {
                await creatorApi.updateProfile({ availability: 'available' })
                toast.success('Availability set to available')
              } catch (e) {
                toast.error(getErrorMessage(e))
              }
            }}
          >
            Set available
          </Button>
        </Card>
      )}
      <Card>
        <h2 className="font-semibold">AI assistant</h2>
        <form onSubmit={askAssistant} className="mt-3 space-y-3">
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <Button>Ask</Button>
        </form>
        {reply ? <p className="mt-4 text-sm text-white/70">{reply}</p> : null}
      </Card>
    </div>
  )
}
