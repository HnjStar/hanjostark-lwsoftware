import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import './Dashboard.css'

interface Entry {
  id?: number
  art_der_verwendung: string
  pflanzenschutzmittel: string
  zulassungsnummer: string
  anwendungsdatum: string
  startzeitpunkt: string
  aufwandsmenge_wert: number
  aufwandsmenge_einheit: string
  kulturpflanze: string
  flaeche_alias: string
  flaeche_fid: string
  flaeche_gps: string
  eppo_code: string
  bbch_stadium: string
  user_name: string
  user_vorname: string
  created_at?: string
}

interface User {
  name: string
  vorname: string
}

const Dashboard = ({ session }: { session: any }) => {
  const [user, setUser] = useState<User>({ name: '', vorname: '' })
  const [entries, setEntries] = useState<Entry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Formular-Felder
  const [artDerVerwendung, setArtDerVerwendung] = useState('Agrarfläche')
  const [pflanzenschutzmittel, setPflanzenschutzmittel] = useState('')
  const [zulassungsnummer, setZulassungsnummer] = useState('')
  const [anwendungsdatum, setAnwendungsdatum] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [startzeitpunkt, setStartzeitpunkt] = useState(format(new Date(), 'HH:mm'))
  const [aufwandsmengeWert, setAufwandsmengeWert] = useState('')
  const [aufwandsmengeEinheit, setAufwandsmengeEinheit] = useState('l')
  const [kulturpflanze, setKulturpflanze] = useState('')
  const [flaecheAlias, setFlaecheAlias] = useState('')
  const [flaecheFid, setFlaecheFid] = useState('')
  const [flaecheGps, setFlaecheGps] = useState('')
  const [eppoCode, setEppoCode] = useState('')
  const [bbchStadium, setBbchStadium] = useState('')
  
  // Auswahlfelder
  const [verwendungsarten, setVerwendungsarten] = useState<string[]>(['Agrarfläche', 'geschlossener Raum', 'Saatgut'])
  const [pflanzenschutzmittelListe, setPflanzenschutzmittelListe] = useState<Array<{mittel: string, nummer: string}>>([])
  const [kulturpflanzenListe, setKulturpflanzenListe] = useState<string[]>([])
  const [flaechenListe, setFlaechenListe] = useState<Array<{alias: string, fid: string, gps: string}>>([])
  const [eppoCodesListe, setEppoCodesListe] = useState<string[]>([])
  const [bbchStadienListe, setBbchStadienListe] = useState<string[]>([])
  
  // Dialoge für neue Einträge
  const [showNewVerwendung, setShowNewVerwendung] = useState(false)
  const [newVerwendung, setNewVerwendung] = useState('')
  const [showNewPflanzenschutzmittel, setShowNewPflanzenschutzmittel] = useState(false)
  const [newPflanzenschutzmittel, setNewPflanzenschutzmittel] = useState('')
  const [newZulassungsnummer, setNewZulassungsnummer] = useState('')
  const [showNewKulturpflanze, setShowNewKulturpflanze] = useState(false)
  const [newKulturpflanze, setNewKulturpflanze] = useState('')
  const [showNewFlaeche, setShowNewFlaeche] = useState(false)
  const [newFlaecheAlias, setNewFlaecheAlias] = useState('')
  const [newFlaecheFid, setNewFlaecheFid] = useState('')
  const [newFlaecheGps, setNewFlaecheGps] = useState('')
  const [showNewEppo, setShowNewEppo] = useState(false)
  const [newEppo, setNewEppo] = useState('')
  const [showNewBbch, setShowNewBbch] = useState(false)
  const [newBbch, setNewBbch] = useState('')

  useEffect(() => {
    loadUserData()
    loadEntries()
    loadDropdownData()
  }, [session])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Versuche Benutzerdaten aus der DB zu laden
        const { data } = await supabase
          .from('users')
          .select('name, vorname')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setUser({ name: data.name || '', vorname: data.vorname || '' })
        } else {
          // Fallback: Name aus E-Mail extrahieren
          const emailParts = user.email?.split('@')[0].split('.') || []
          setUser({
            vorname: emailParts[0] || '',
            name: emailParts[1] || emailParts[0] || ''
          })
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error)
    }
  }

  const loadEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('eintraege')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Fehler beim Laden der Einträge:', error)
    }
  }

  const loadDropdownData = async () => {
    try {
      // Lade alle Dropdown-Daten aus der DB
      const [verwendungen, psm, kulturen, flaechen, eppo, bbch] = await Promise.all([
        supabase.from('verwendungsarten').select('name'),
        supabase.from('pflanzenschutzmittel').select('mittel, zulassungsnummer'),
        supabase.from('kulturpflanzen').select('name'),
        supabase.from('flaechen').select('alias, fid, gps'),
        supabase.from('eppo_codes').select('code'),
        supabase.from('bbch_stadien').select('stadium')
      ])

      if (verwendungen.data) {
        const defaultVerwendungen = ['Agrarfläche', 'geschlossener Raum', 'Saatgut']
        const dbVerwendungen = verwendungen.data.map((v: any) => v.name)
        setVerwendungsarten([...new Set([...defaultVerwendungen, ...dbVerwendungen])])
      }

      if (psm.data) {
        setPflanzenschutzmittelListe(psm.data.map((p: any) => ({
          mittel: p.mittel,
          nummer: p.zulassungsnummer
        })))
      }

      if (kulturen.data) {
        setKulturpflanzenListe(kulturen.data.map((k: any) => k.name))
      }

      if (flaechen.data) {
        setFlaechenListe(flaechen.data.map((f: any) => ({
          alias: f.alias,
          fid: f.fid || '',
          gps: f.gps || ''
        })))
      }

      if (eppo.data) {
        setEppoCodesListe(eppo.data.map((e: any) => e.code))
      }

      if (bbch.data) {
        setBbchStadienListe(bbch.data.map((b: any) => b.stadium))
      }
    } catch (error) {
      console.error('Fehler beim Laden der Dropdown-Daten:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      const entry = {
        user_id: authUser?.id,
        art_der_verwendung: artDerVerwendung,
        pflanzenschutzmittel: pflanzenschutzmittel,
        zulassungsnummer: zulassungsnummer,
        anwendungsdatum: anwendungsdatum,
        startzeitpunkt: startzeitpunkt,
        aufwandsmenge_wert: parseFloat(aufwandsmengeWert),
        aufwandsmenge_einheit: aufwandsmengeEinheit,
        kulturpflanze: kulturpflanze,
        flaeche_alias: flaecheAlias,
        flaeche_fid: flaecheFid,
        flaeche_gps: flaecheGps,
        eppo_code: eppoCode,
        bbch_stadium: bbchStadium,
        user_name: user.name,
        user_vorname: user.vorname
      }

      const { error } = await supabase
        .from('eintraege')
        .insert([entry])

      if (error) throw error

      alert('Eintrag erfolgreich gespeichert!')
      resetForm()
      loadEntries()
      setShowForm(false)
    } catch (error: any) {
      alert('Fehler beim Speichern: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setArtDerVerwendung('Agrarfläche')
    setPflanzenschutzmittel('')
    setZulassungsnummer('')
    setAnwendungsdatum(format(new Date(), 'yyyy-MM-dd'))
    setStartzeitpunkt(format(new Date(), 'HH:mm'))
    setAufwandsmengeWert('')
    setAufwandsmengeEinheit('l')
    setKulturpflanze('')
    setFlaecheAlias('')
    setFlaecheFid('')
    setFlaecheGps('')
    setEppoCode('')
    setBbchStadium('')
  }

  const handleAddVerwendung = async () => {
    if (!newVerwendung.trim()) return
    
    try {
      const { error } = await supabase
        .from('verwendungsarten')
        .insert([{ name: newVerwendung }])
      
      if (error) throw error
      
      setVerwendungsarten([...verwendungsarten, newVerwendung])
      setArtDerVerwendung(newVerwendung)
      setNewVerwendung('')
      setShowNewVerwendung(false)
    } catch (error: any) {
      alert('Fehler: ' + error.message)
    }
  }

  const handleAddPflanzenschutzmittel = async () => {
    if (!newPflanzenschutzmittel.trim() || !newZulassungsnummer.trim()) return
    
    try {
      const { error } = await supabase
        .from('pflanzenschutzmittel')
        .insert([{ mittel: newPflanzenschutzmittel, zulassungsnummer: newZulassungsnummer }])
      
      if (error) throw error
      
      setPflanzenschutzmittelListe([...pflanzenschutzmittelListe, {
        mittel: newPflanzenschutzmittel,
        nummer: newZulassungsnummer
      }])
      setPflanzenschutzmittel(newPflanzenschutzmittel)
      setZulassungsnummer(newZulassungsnummer)
      setNewPflanzenschutzmittel('')
      setNewZulassungsnummer('')
      setShowNewPflanzenschutzmittel(false)
    } catch (error: any) {
      alert('Fehler: ' + error.message)
    }
  }

  const handleAddKulturpflanze = async () => {
    if (!newKulturpflanze.trim()) return
    
    try {
      const { error } = await supabase
        .from('kulturpflanzen')
        .insert([{ name: newKulturpflanze }])
      
      if (error) throw error
      
      setKulturpflanzenListe([...kulturpflanzenListe, newKulturpflanze])
      setKulturpflanze(newKulturpflanze)
      setNewKulturpflanze('')
      setShowNewKulturpflanze(false)
    } catch (error: any) {
      alert('Fehler: ' + error.message)
    }
  }

  const handleAddFlaeche = async () => {
    if (!newFlaecheAlias.trim()) return
    
    try {
      const { error } = await supabase
        .from('flaechen')
        .insert([{ alias: newFlaecheAlias, fid: newFlaecheFid, gps: newFlaecheGps }])
      
      if (error) throw error
      
      setFlaechenListe([...flaechenListe, {
        alias: newFlaecheAlias,
        fid: newFlaecheFid,
        gps: newFlaecheGps
      }])
      setFlaecheAlias(newFlaecheAlias)
      setFlaecheFid(newFlaecheFid)
      setFlaecheGps(newFlaecheGps)
      setNewFlaecheAlias('')
      setNewFlaecheFid('')
      setNewFlaecheGps('')
      setShowNewFlaeche(false)
    } catch (error: any) {
      alert('Fehler: ' + error.message)
    }
  }

  const handleAddEppo = async () => {
    if (!newEppo.trim()) return
    
    try {
      const { error } = await supabase
        .from('eppo_codes')
        .insert([{ code: newEppo }])
      
      if (error) throw error
      
      setEppoCodesListe([...eppoCodesListe, newEppo])
      setEppoCode(newEppo)
      setNewEppo('')
      setShowNewEppo(false)
    } catch (error: any) {
      alert('Fehler: ' + error.message)
    }
  }

  const handleAddBbch = async () => {
    if (!newBbch.trim()) return
    
    try {
      const { error } = await supabase
        .from('bbch_stadien')
        .insert([{ stadium: newBbch }])
      
      if (error) throw error
      
      setBbchStadienListe([...bbchStadienListe, newBbch])
      setBbchStadium(newBbch)
      setNewBbch('')
      setShowNewBbch(false)
    } catch (error: any) {
      alert('Fehler: ' + error.message)
    }
  }

  const handleFlaecheSelect = (alias: string) => {
    const flaeche = flaechenListe.find(f => f.alias === alias)
    if (flaeche) {
      setFlaecheAlias(flaeche.alias)
      setFlaecheFid(flaeche.fid)
      setFlaecheGps(flaeche.gps)
    }
  }

  const handlePflanzenschutzmittelSelect = (mittel: string) => {
    const psm = pflanzenschutzmittelListe.find(p => p.mittel === mittel)
    if (psm) {
      setPflanzenschutzmittel(psm.mittel)
      setZulassungsnummer(psm.nummer)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const exportToExcel = async (selectedEntries: Entry[] = entries) => {
    try {
      const XLSX = await import('xlsx')
      
      const data = selectedEntries.map(entry => ({
        'Art der Verwendung': entry.art_der_verwendung,
        'Pflanzenschutzmittel': entry.pflanzenschutzmittel,
        'Zulassungsnummer': entry.zulassungsnummer,
        'Anwendungsdatum': entry.anwendungsdatum,
        'Startzeitpunkt': entry.startzeitpunkt,
        'Aufwandsmenge': `${entry.aufwandsmenge_wert} ${entry.aufwandsmenge_einheit}`,
        'Kulturpflanze': entry.kulturpflanze,
        'Fläche (Alias)': entry.flaeche_alias,
        'Flurstücksnummer (FID)': entry.flaeche_fid,
        'GPS-Daten': entry.flaeche_gps,
        'EPPO Code': entry.eppo_code,
        'BBCH Stadium': entry.bbch_stadium,
        'Name': entry.user_name,
        'Vorname': entry.user_vorname,
        'Erstellt am': entry.created_at ? format(new Date(entry.created_at), 'dd.MM.yyyy HH:mm', { locale: de }) : ''
      }))

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Einträge')
      
      const fileName = `Pflanzenschutzmittel-Eintraege_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      alert('Fehler beim Export: ' + error)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Landwirtschaft Software</h1>
        <div className="header-actions">
          <span className="user-info">{user.vorname} {user.name}</span>
          <button onClick={handleLogout} className="logout-button">Abmelden</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="action-buttons">
          <button onClick={() => setShowForm(!showForm)} className="action-button">
            {showForm ? 'Formular ausblenden' : 'Neuer Eintrag'}
          </button>
          <button onClick={() => exportToExcel()} className="action-button secondary">
            Alle exportieren (Excel)
          </button>
        </div>

        {showForm && (
          <div className="form-container">
            <h2>Neuer Eintrag</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Art der Verwendung *</label>
                  <div className="select-with-add">
                    <select
                      value={artDerVerwendung}
                      onChange={(e) => setArtDerVerwendung(e.target.value)}
                      required
                    >
                      {verwendungsarten.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewVerwendung(true)}
                      className="add-button"
                    >
                      +
                    </button>
                  </div>
                </div>

                {showNewVerwendung && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>Neue Verwendungsart hinzufügen</h3>
                      <input
                        type="text"
                        value={newVerwendung}
                        onChange={(e) => setNewVerwendung(e.target.value)}
                        placeholder="Verwendungsart"
                      />
                      <div className="modal-buttons">
                        <button type="button" onClick={handleAddVerwendung}>Hinzufügen</button>
                        <button type="button" onClick={() => setShowNewVerwendung(false)}>Abbrechen</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Pflanzenschutzmittel *</label>
                  <div className="select-with-add">
                    <select
                      value={pflanzenschutzmittel}
                      onChange={(e) => handlePflanzenschutzmittelSelect(e.target.value)}
                      required
                    >
                      <option value="">Bitte wählen</option>
                      {pflanzenschutzmittelListe.map((p, i) => (
                        <option key={i} value={p.mittel}>{p.mittel}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewPflanzenschutzmittel(true)}
                      className="add-button"
                    >
                      +
                    </button>
                  </div>
                </div>

                {showNewPflanzenschutzmittel && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>Neues Pflanzenschutzmittel hinzufügen</h3>
                      <input
                        type="text"
                        value={newPflanzenschutzmittel}
                        onChange={(e) => setNewPflanzenschutzmittel(e.target.value)}
                        placeholder="Pflanzenschutzmittel"
                      />
                      <input
                        type="text"
                        value={newZulassungsnummer}
                        onChange={(e) => setNewZulassungsnummer(e.target.value)}
                        placeholder="Zulassungsnummer"
                      />
                      <div className="modal-buttons">
                        <button type="button" onClick={handleAddPflanzenschutzmittel}>Hinzufügen</button>
                        <button type="button" onClick={() => setShowNewPflanzenschutzmittel(false)}>Abbrechen</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Zulassungsnummer *</label>
                  <input
                    type="text"
                    value={zulassungsnummer}
                    onChange={(e) => setZulassungsnummer(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Anwendungsdatum *</label>
                  <input
                    type="date"
                    value={anwendungsdatum}
                    onChange={(e) => setAnwendungsdatum(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Startzeitpunkt *</label>
                  <input
                    type="time"
                    value={startzeitpunkt}
                    onChange={(e) => setStartzeitpunkt(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Aufwandsmenge *</label>
                  <div className="amount-input">
                    <input
                      type="number"
                      step="0.01"
                      value={aufwandsmengeWert}
                      onChange={(e) => setAufwandsmengeWert(e.target.value)}
                      placeholder="Wert"
                      required
                    />
                    <select
                      value={aufwandsmengeEinheit}
                      onChange={(e) => setAufwandsmengeEinheit(e.target.value)}
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Behandelte Kulturpflanze/Pflanzenprodukt *</label>
                  <div className="select-with-add">
                    <select
                      value={kulturpflanze}
                      onChange={(e) => setKulturpflanze(e.target.value)}
                      required
                    >
                      <option value="">Bitte wählen</option>
                      {kulturpflanzenListe.map((k, i) => (
                        <option key={i} value={k}>{k}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewKulturpflanze(true)}
                      className="add-button"
                    >
                      +
                    </button>
                  </div>
                </div>

                {showNewKulturpflanze && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>Neue Kulturpflanze hinzufügen</h3>
                      <input
                        type="text"
                        value={newKulturpflanze}
                        onChange={(e) => setNewKulturpflanze(e.target.value)}
                        placeholder="Kulturpflanze (z.B. Raps)"
                      />
                      <div className="modal-buttons">
                        <button type="button" onClick={handleAddKulturpflanze}>Hinzufügen</button>
                        <button type="button" onClick={() => setShowNewKulturpflanze(false)}>Abbrechen</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Behandelte Fläche (FID/Flurstücksnummer oder GPS) *</label>
                  <div className="select-with-add">
                    <select
                      value={flaecheAlias}
                      onChange={(e) => handleFlaecheSelect(e.target.value)}
                      required
                    >
                      <option value="">Bitte wählen</option>
                      {flaechenListe.map((f, i) => (
                        <option key={i} value={f.alias}>{f.alias}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewFlaeche(true)}
                      className="add-button"
                    >
                      +
                    </button>
                  </div>
                  {flaecheFid && (
                    <div className="flaeche-details">
                      <small>FID: {flaecheFid}</small>
                      {flaecheGps && <small>GPS: {flaecheGps}</small>}
                    </div>
                  )}
                </div>

                {showNewFlaeche && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>Neue Fläche hinzufügen</h3>
                      <input
                        type="text"
                        value={newFlaecheAlias}
                        onChange={(e) => setNewFlaecheAlias(e.target.value)}
                        placeholder="Alias (z.B. Feld X)"
                      />
                      <input
                        type="text"
                        value={newFlaecheFid}
                        onChange={(e) => setNewFlaecheFid(e.target.value)}
                        placeholder="Flurstücksnummer (FID)"
                      />
                      <input
                        type="text"
                        value={newFlaecheGps}
                        onChange={(e) => setNewFlaecheGps(e.target.value)}
                        placeholder="GPS-Daten (z.B. 52.1234, 10.5678)"
                      />
                      <div className="modal-buttons">
                        <button type="button" onClick={handleAddFlaeche}>Hinzufügen</button>
                        <button type="button" onClick={() => setShowNewFlaeche(false)}>Abbrechen</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>EPPO Code *</label>
                  <div className="select-with-add">
                    <select
                      value={eppoCode}
                      onChange={(e) => setEppoCode(e.target.value)}
                      required
                    >
                      <option value="">Bitte wählen</option>
                      {eppoCodesListe.map((e, i) => (
                        <option key={i} value={e}>{e}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewEppo(true)}
                      className="add-button"
                    >
                      +
                    </button>
                  </div>
                </div>

                {showNewEppo && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>Neuen EPPO Code hinzufügen</h3>
                      <input
                        type="text"
                        value={newEppo}
                        onChange={(e) => setNewEppo(e.target.value)}
                        placeholder="EPPO Code"
                      />
                      <div className="modal-buttons">
                        <button type="button" onClick={handleAddEppo}>Hinzufügen</button>
                        <button type="button" onClick={() => setShowNewEppo(false)}>Abbrechen</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>BBCH Stadium der Kultur *</label>
                  <div className="select-with-add">
                    <select
                      value={bbchStadium}
                      onChange={(e) => setBbchStadium(e.target.value)}
                      required
                    >
                      <option value="">Bitte wählen</option>
                      {bbchStadienListe.map((b, i) => (
                        <option key={i} value={b}>{b}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewBbch(true)}
                      className="add-button"
                    >
                      +
                    </button>
                  </div>
                </div>

                {showNewBbch && (
                  <div className="modal">
                    <div className="modal-content">
                      <h3>Neues BBCH Stadium hinzufügen</h3>
                      <input
                        type="text"
                        value={newBbch}
                        onChange={(e) => setNewBbch(e.target.value)}
                        placeholder="BBCH Stadium"
                      />
                      <div className="modal-buttons">
                        <button type="button" onClick={handleAddBbch}>Hinzufügen</button>
                        <button type="button" onClick={() => setShowNewBbch(false)}>Abbrechen</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={user.name} disabled />
                </div>

                <div className="form-group">
                  <label>Vorname</label>
                  <input type="text" value={user.vorname} disabled />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? 'Speichert...' : 'Eintrag speichern'}
                </button>
                <button type="button" onClick={resetForm} className="reset-button">
                  Zurücksetzen
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="entries-section">
          <h2>Übersicht der Einträge</h2>
          <div className="entries-grid">
            {entries.map((entry) => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <h3>{entry.kulturpflanze}</h3>
                  <button
                    onClick={() => exportToExcel([entry])}
                    className="export-button"
                    title="Als Excel exportieren"
                  >
                    📥
                  </button>
                </div>
                <div className="entry-details">
                  <p><strong>Datum:</strong> {format(new Date(entry.anwendungsdatum), 'dd.MM.yyyy', { locale: de })}</p>
                  <p><strong>Zeit:</strong> {entry.startzeitpunkt}</p>
                  <p><strong>Mittel:</strong> {entry.pflanzenschutzmittel}</p>
                  <p><strong>Fläche:</strong> {entry.flaeche_alias}</p>
                  <p><strong>Menge:</strong> {entry.aufwandsmenge_wert} {entry.aufwandsmenge_einheit}</p>
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="no-entries">
                <p>Noch keine Einträge vorhanden.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
