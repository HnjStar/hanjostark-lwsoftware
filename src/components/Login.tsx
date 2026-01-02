import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/dashboard'
          }
        })
        
        if (error) {
          throw error
        }
        
        // Prüfe ob E-Mail-Bestätigung erforderlich ist
        if (data.user && !data.session) {
          alert('Registrierung erfolgreich! Bitte prüfen Sie Ihre E-Mails und bestätigen Sie Ihr Konto, bevor Sie sich anmelden.')
        } else {
          alert('Registrierung erfolgreich! Sie werden jetzt angemeldet.')
        }
        setIsSignUp(false)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error: any) {
      // Detailliertere Fehlermeldungen
      let errorMessage = 'Ein Fehler ist aufgetreten'
      
      if (error.message) {
        errorMessage = error.message
        // Übersetze häufige Fehlermeldungen
        if (error.message.includes('User already registered')) {
          errorMessage = 'Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Prüfen Sie Ihr Postfach.'
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Ungültige Anmeldedaten. Bitte überprüfen Sie E-Mail und Passwort.'
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Das Passwort muss mindestens 6 Zeichen lang sein.'
        }
      }
      
      setError(errorMessage)
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Landwirtschaft Software</h1>
        <h2>{isSignUp ? 'Registrierung' : 'Anmeldung'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ihre@email.de"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Lädt...' : isSignUp ? 'Registrieren' : 'Anmelden'}
          </button>
        </form>
        
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
          }}
          className="toggle-button"
        >
          {isSignUp
            ? 'Bereits registriert? Hier anmelden'
            : 'Noch kein Konto? Hier registrieren'}
        </button>
      </div>
    </div>
  )
}

export default Login
