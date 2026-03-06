import { useState, useEffect, useMemo } from 'react'
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

interface Kulturpflanze {
  id: number
  name: string
  eppoCode: string
  aktiv: boolean
}

interface Verwendungsart {
  id: number
  name: string
  aktiv: boolean
}

interface PflanzenschutzmittelItem {
  id: number
  mittel: string
  nummer: string
  aktiv: boolean
}

interface Flaeche {
  id: number
  alias: string
  fid: string
  gps: string
  aktiv: boolean
}

interface BbchStadium {
  id: number
  stadium: string
  aktiv: boolean
}

const Dashboard = ({ session }: { session: any }) => {
  const [user, setUser] = useState<User>({ name: '', vorname: '' })
  const [entries, setEntries] = useState<Entry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Filter State
  const [filterFlaeche, setFilterFlaeche] = useState('')
  const [filterFid, setFilterFid] = useState('')
  const [filterDatumVon, setFilterDatumVon] = useState('')
  const [filterDatumBis, setFilterDatumBis] = useState('')
  
  // Formular-Felder (neue Reihenfolge)
  const [artDerVerwendung, setArtDerVerwendung] = useState('Agrarfläche')
  const [flaecheAlias, setFlaecheAlias] = useState('')
  const [flaecheFid, setFlaecheFid] = useState('')
  const [flaecheGps, setFlaecheGps] = useState('')
  const [kulturpflanze, setKulturpflanze] = useState('')
  const [eppoCode, setEppoCode] = useState('')
  const [pflanzenschutzmittel, setPflanzenschutzmittel] = useState('')
  const [zulassungsnummer, setZulassungsnummer] = useState('')
  const [aufwandsmengeWert, setAufwandsmengeWert] = useState('')
  const [aufwandsmengeEinheit, setAufwandsmengeEinheit] = useState('l')
  const [bbchStadium, setBbchStadium] = useState('')
  const [anwendungsdatum, setAnwendungsdatum] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [startzeitpunkt, setStartzeitpunkt] = useState(format(new Date(), 'HH:mm'))
  
  // Auswahlfelder (mit id und aktiv für Verwaltung)
  const [verwendungsarten, setVerwendungsarten] = useState<Verwendungsart[]>([])
  const [pflanzenschutzmittelListe, setPflanzenschutzmittelListe] = useState<PflanzenschutzmittelItem[]>([])
  const [kulturpflanzenListe, setKulturpflanzenListe] = useState<Kulturpflanze[]>([])
  const [flaechenListe, setFlaechenListe] = useState<Flaeche[]>([])
  const [bbchStadienListe, setBbchStadienListe] = useState<BbchStadium[]>([])
  
  // Listen verwalten Modal
  const [showListenVerwalten, setShowListenVerwalten] = useState(false)
  const [verwaltungTab, setVerwaltungTab] = useState<'verwendung' | 'flaeche' | 'kultur' | 'psm' | 'bbch'>('verwendung')
  
  // Dialoge für neue Einträge
  const [showNewVerwendung, setShowNewVerwendung] = useState(false)
  const [newVerwendung, setNewVerwendung] = useState('')
  const [showNewPflanzenschutzmittel, setShowNewPflanzenschutzmittel] = useState(false)
  const [newPflanzenschutzmittel, setNewPflanzenschutzmittel] = useState('')
  const [newZulassungsnummer, setNewZulassungsnummer] = useState('')
  const [showNewKulturpflanze, setShowNewKulturpflanze] = useState(false)
  const [newKulturpflanze, setNewKulturpflanze] = useState('')
  const [newKulturpflanzeEppo, setNewKulturpflanzeEppo] = useState('')
  const [showNewFlaeche, setShowNewFlaeche] = useState(false)
  const [newFlaecheAlias, setNewFlaecheAlias] = useState('')
  const [newFlaecheFid, setNewFlaecheFid] = useState('')
  const [newFlaecheGps, setNewFlaecheGps] = useState('')
  const [showNewBbch, setShowNewBbch] = useState(false)
  const [newBbch, setNewBbch] = useState('')

  useEffect(() => {
    loadUserData()
    loadEntries()
    loadDropdownData()
  }, [session])

  // Standardwert setzen, wenn gewählter Wert nicht mehr aktiv ist
  useEffect(() => {
    if (aktiveVerwendungen.length > 0 && !aktiveVerwendungen.some(v => v.name === artDerVerwendung)) {
      setArtDerVerwendung(aktiveVerwendungen[0].name)
    }
  }, [aktiveVerwendungen, artDerVerwendung])

  // Filter-Logik
  useEffect(() => {
    let filtered = [...entries]
    
    if (filterFlaeche) {
      filtered = filtered.filter(e => 
        e.flaeche_alias.toLowerCase().includes(filterFlaeche.toLowerCase())
      )
    }
    
    if (filterFid) {
      filtered = filtered.filter(e => 
        e.flaeche_fid?.toLowerCase().includes(filterFid.toLowerCase())
      )
    }
    
    if (filterDatumVon) {
      filtered = filtered.filter(e => 
        new Date(e.anwendungsdatum) >= new Date(filterDatumVon)
      )
    }
    
    if (filterDatumBis) {
      filtered = filtered.filter(e => 
        new Date(e.anwendungsdatum) <= new Date(filterDatumBis)
      )
    }
    
    setFilteredEntries(filtered)
  }, [entries, filterFlaeche, filterFid, filterDatumVon, filterDatumBis])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('name, vorname')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setUser({ name: data.name || '', vorname: data.vorname || '' })
        } else {
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
      const [verwendungen, psm, kulturen, flaechen, bbch] = await Promise.all([
        supabase.from('verwendungsarten').select('id, name, aktiv'),
        supabase.from('pflanzenschutzmittel').select('id, mittel, zulassungsnummer, aktiv'),
        supabase.from('kulturpflanzen').select('id, name, eppo_code, aktiv'),
        supabase.from('flaechen').select('id, alias, fid, gps, aktiv'),
        supabase.from('bbch_stadien').select('id, stadium, aktiv')
      ])

      if (verwendungen.data) {
        setVerwendungsarten(verwendungen.data.map((v: any) => ({
          id: v.id,
          name: v.name,
          aktiv: v.aktiv !== false
        })).sort((a, b) => a.name.localeCompare(b.name, 'de')))
      }

      if (psm.data) {
        setPflanzenschutzmittelListe(psm.data.map((p: any) => ({
          id: p.id,
          mittel: p.mittel,
          nummer: p.zulassungsnummer,
          aktiv: p.aktiv !== false
        })).sort((a, b) => a.mittel.localeCompare(b.mittel, 'de')))
      }

      if (kulturen.data) {
        setKulturpflanzenListe(kulturen.data.map((k: any) => ({
          id: k.id,
          name: k.name,
          eppoCode: k.eppo_code || '',
          aktiv: k.aktiv !== false
        })).sort((a, b) => a.name.localeCompare(b.name, 'de')))
      }

      if (flaechen.data) {
        setFlaechenListe(flaechen.data.map((f: any) => ({
          id: f.id,
          alias: f.alias,
          fid: f.fid || '',
          gps: f.gps || '',
          aktiv: f.aktiv !== false
        })).sort((a, b) => a.alias.localeCompare(b.alias, 'de')))
      }

      if (bbch.data) {
        setBbchStadienListe(bbch.data.map((b: any) => ({
          id: b.id,
          stadium: b.stadium,
          aktiv: b.aktiv !== false
        })).sort((a, b) => a.stadium.localeCompare(b.stadium, 'de')))
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
    setArtDerVerwendung(aktiveVerwendungen[0]?.name ?? 'Agrarfläche')
    setFlaecheAlias('')
    setFlaecheFid('')
    setFlaecheGps('')
    setKulturpflanze('')
    setEppoCode('')
    setPflanzenschutzmittel('')
    setZulassungsnummer('')
    setAufwandsmengeWert('')
    setAufwandsmengeEinheit('l')
    setBbchStadium('')
    setAnwendungsdatum(format(new Date(), 'yyyy-MM-dd'))
    setStartzeitpunkt(format(new Date(), 'HH:mm'))
  }

  const handleAddVerwendung = async () => {
    if (!newVerwendung.trim()) return
    
    try {
      const { error } = await supabase
        .from('verwendungsarten')
        .insert([{ name: newVerwendung }])
      
      if (error) throw error
      
      setArtDerVerwendung(newVerwendung)
      setNewVerwendung('')
      setShowNewVerwendung(false)
      loadDropdownData()
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
      
      setPflanzenschutzmittel(newPflanzenschutzmittel)
      setZulassungsnummer(newZulassungsnummer)
      setNewPflanzenschutzmittel('')
      setNewZulassungsnummer('')
      setShowNewPflanzenschutzmittel(false)
      loadDropdownData()
    } catch (error: any) {
      alert('Fehler: ' + error.message)
    }
  }

  const handleAddKulturpflanze = async () => {
    if (!newKulturpflanze.trim() || !newKulturpflanzeEppo.trim()) return
    
    try {
      const { error } = await supabase
        .from('kulturpflanzen')
        .insert([{ name: newKulturpflanze, eppo_code: newKulturpflanzeEppo }])
      
      if (error) throw error
      
      setKulturpflanze(newKulturpflanze)
      setEppoCode(newKulturpflanzeEppo)
      setNewKulturpflanze('')
      setNewKulturpflanzeEppo('')
      setShowNewKulturpflanze(false)
      loadDropdownData()
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
      
      setFlaecheAlias(newFlaecheAlias)
      setFlaecheFid(newFlaecheFid)
      setFlaecheGps(newFlaecheGps)
      setNewFlaecheAlias('')
      setNewFlaecheFid('')
      setNewFlaecheGps('')
      setShowNewFlaeche(false)
      loadDropdownData()
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
      
      setBbchStadium(newBbch)
      setNewBbch('')
      setShowNewBbch(false)
      loadDropdownData()
    } catch (error: any) {
      alert('Fehler: ' + error.message)
    }
  }

  const toggleAktiv = async (tabelle: string, id: number, aktiv: boolean) => {
    try {
      const { error } = await supabase
        .from(tabelle)
        .update({ aktiv })
        .eq('id', id)
      
      if (error) throw error
      loadDropdownData()
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

  const handleKulturpflanzeSelect = (name: string) => {
    const kultur = kulturpflanzenListe.find(k => k.name === name)
    if (kultur) {
      setKulturpflanze(kultur.name)
      setEppoCode(kultur.eppoCode)
    }
  }

  const handlePflanzenschutzmittelSelect = (mittel: string) => {
    const psm = pflanzenschutzmittelListe.find(p => p.mittel === mittel)
    if (psm) {
      setPflanzenschutzmittel(psm.mittel)
      setZulassungsnummer(psm.nummer)
    }
  }

  // Nur aktive Einträge für Dropdowns (alphabetisch bereits sortiert)
  const aktiveVerwendungen = useMemo(() => verwendungsarten.filter(v => v.aktiv), [verwendungsarten])
  const aktiveFlaechen = useMemo(() => flaechenListe.filter(f => f.aktiv), [flaechenListe])
  const aktiveKulturpflanzen = useMemo(() => kulturpflanzenListe.filter(k => k.aktiv), [kulturpflanzenListe])
  const aktivePsm = useMemo(() => pflanzenschutzmittelListe.filter(p => p.aktiv), [pflanzenschutzmittelListe])
  const aktiveBbch = useMemo(() => bbchStadienListe.filter(b => b.aktiv), [bbchStadienListe])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const exportToExcel = async (selectedEntries: Entry[] = filteredEntries.length > 0 ? filteredEntries : entries) => {
    try {
      const XLSX = await import('xlsx')
      
      const data = selectedEntries.map(entry => ({
        'Art der Verwendung': entry.art_der_verwendung,
        'Fläche (Alias)': entry.flaeche_alias,
        'Flurstücksnummer (FID)': entry.flaeche_fid,
        'GPS-Daten': entry.flaeche_gps,
        'Kulturpflanze': entry.kulturpflanze,
        'EPPO Code': entry.eppo_code,
        'Pflanzenschutzmittel': entry.pflanzenschutzmittel,
        'Zulassungsnummer': entry.zulassungsnummer,
        'Aufwandsmenge': `${entry.aufwandsmenge_wert} ${entry.aufwandsmenge_einheit}`,
        'BBCH Stadium': entry.bbch_stadium,
        'Anwendungsdatum': entry.anwendungsdatum,
        'Startzeitpunkt': entry.startzeitpunkt,
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
          <button onClick={() => setShowListenVerwalten(true)} className="action-button settings">
            Listen verwalten
          </button>
          <button onClick={() => exportToExcel(entries)} className="action-button secondary">
            Alle exportieren (Excel)
          </button>
        </div>

        {showListenVerwalten && (
          <div className="modal">
            <div className="modal-content listen-verwalten">
              <h3>Listen verwalten – Aktiv/Inaktiv</h3>
              <p className="listen-hint">Inaktive Einträge erscheinen nicht mehr in den Auswahlfeldern.</p>
              
              <div className="verwaltung-tabs">
                {(['verwendung', 'flaeche', 'kultur', 'psm', 'bbch'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`tab-btn ${verwaltungTab === tab ? 'active' : ''}`}
                    onClick={() => setVerwaltungTab(tab)}
                  >
                    {tab === 'verwendung' && 'Verwendungsarten'}
                    {tab === 'flaeche' && 'Flächen'}
                    {tab === 'kultur' && 'Kulturpflanzen'}
                    {tab === 'psm' && 'Pflanzenschutzmittel'}
                    {tab === 'bbch' && 'BBCH Stadien'}
                  </button>
                ))}
              </div>

              <div className="verwaltung-liste">
                {verwaltungTab === 'verwendung' && verwendungsarten.map(v => (
                  <div key={v.id} className={`listen-item ${!v.aktiv ? 'inaktiv' : ''}`}>
                    <span>{v.name}</span>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={v.aktiv}
                        onChange={() => toggleAktiv('verwendungsarten', v.id, !v.aktiv)}
                      />
                      {v.aktiv ? 'Aktiv' : 'Inaktiv'}
                    </label>
                  </div>
                ))}
                {verwaltungTab === 'flaeche' && flaechenListe.map(f => (
                  <div key={f.id} className={`listen-item ${!f.aktiv ? 'inaktiv' : ''}`}>
                    <span>{f.alias}{f.fid && ` (${f.fid})`}</span>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={f.aktiv}
                        onChange={() => toggleAktiv('flaechen', f.id, !f.aktiv)}
                      />
                      {f.aktiv ? 'Aktiv' : 'Inaktiv'}
                    </label>
                  </div>
                ))}
                {verwaltungTab === 'kultur' && kulturpflanzenListe.map(k => (
                  <div key={k.id} className={`listen-item ${!k.aktiv ? 'inaktiv' : ''}`}>
                    <span>{k.name}{k.eppoCode && ` (${k.eppoCode})`}</span>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={k.aktiv}
                        onChange={() => toggleAktiv('kulturpflanzen', k.id, !k.aktiv)}
                      />
                      {k.aktiv ? 'Aktiv' : 'Inaktiv'}
                    </label>
                  </div>
                ))}
                {verwaltungTab === 'psm' && pflanzenschutzmittelListe.map(p => (
                  <div key={p.id} className={`listen-item ${!p.aktiv ? 'inaktiv' : ''}`}>
                    <span>{p.mittel} ({p.nummer})</span>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={p.aktiv}
                        onChange={() => toggleAktiv('pflanzenschutzmittel', p.id, !p.aktiv)}
                      />
                      {p.aktiv ? 'Aktiv' : 'Inaktiv'}
                    </label>
                  </div>
                ))}
                {verwaltungTab === 'bbch' && bbchStadienListe.map(b => (
                  <div key={b.id} className={`listen-item ${!b.aktiv ? 'inaktiv' : ''}`}>
                    <span>{b.stadium}</span>
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={b.aktiv}
                        onChange={() => toggleAktiv('bbch_stadien', b.id, !b.aktiv)}
                      />
                      {b.aktiv ? 'Aktiv' : 'Inaktiv'}
                    </label>
                  </div>
                ))}
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setShowListenVerwalten(false)}>Schließen</button>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="form-container">
            <h2>Neuer Eintrag</h2>
            <form onSubmit={handleSubmit}>
              {/* 1. Art der Verwendung */}
              <div className="form-row">
                <div className="form-group">
                  <label>Art der Verwendung *</label>
                  <div className="select-with-add">
                    <select
                      value={artDerVerwendung}
                      onChange={(e) => setArtDerVerwendung(e.target.value)}
                      required
                    >
                      {aktiveVerwendungen.map(v => (
                        <option key={v.id} value={v.name}>{v.name}</option>
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

                {/* 2. Fläche */}
                <div className="form-group">
                  <label>Behandelte Fläche (FID/Flurstücksnummer oder GPS) *</label>
                  <div className="select-with-add">
                    <select
                      value={flaecheAlias}
                      onChange={(e) => handleFlaecheSelect(e.target.value)}
                      required
                    >
                      <option value="">Bitte wählen</option>
                      {aktiveFlaechen.map(f => (
                        <option key={f.id} value={f.alias}>{f.alias}</option>
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

              {/* 3. Kulturpflanze mit EPPO Code */}
              <div className="form-row">
                <div className="form-group">
                  <label>Behandelte Kulturpflanze/Pflanzenprodukt *</label>
                  <div className="select-with-add">
                    <select
                      value={kulturpflanze}
                      onChange={(e) => handleKulturpflanzeSelect(e.target.value)}
                      required
                    >
                      <option value="">Bitte wählen</option>
                      {aktiveKulturpflanzen.map(k => (
                        <option key={k.id} value={k.name}>{k.name}</option>
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
                  {eppoCode && (
                    <div className="flaeche-details">
                      <small>EPPO Code: {eppoCode}</small>
                    </div>
                  )}
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
                      <input
                        type="text"
                        value={newKulturpflanzeEppo}
                        onChange={(e) => setNewKulturpflanzeEppo(e.target.value)}
                        placeholder="EPPO Code (z.B. BRSNW)"
                        required
                      />
                      <div className="modal-buttons">
                        <button type="button" onClick={handleAddKulturpflanze}>Hinzufügen</button>
                        <button type="button" onClick={() => setShowNewKulturpflanze(false)}>Abbrechen</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Pflanzenschutzmittel */}
                <div className="form-group">
                  <label>Pflanzenschutzmittel *</label>
                  <div className="select-with-add">
                    <select
                      value={pflanzenschutzmittel}
                      onChange={(e) => handlePflanzenschutzmittelSelect(e.target.value)}
                      required
                    >
                      <option value="">Bitte wählen</option>
                      {aktivePsm.map(p => (
                        <option key={p.id} value={p.mittel}>{p.mittel}</option>
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

              {/* 5. Aufwandsmenge */}
              <div className="form-row">
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
                      <option value="kg">kg</option>
                      <option value="l">l</option>
                      <option value="ml">ml</option>
                    </select>
                  </div>
                </div>

                {/* 6. BBCH Stadium */}
                <div className="form-group">
                  <label>BBCH Stadium der Kultur *</label>
                  <div className="select-with-add">
                    <select
                      value={bbchStadium}
                      onChange={(e) => setBbchStadium(e.target.value)}
                      required
                    >
                      <option value="">Bitte wählen</option>
                      {aktiveBbch.map(b => (
                        <option key={b.id} value={b.stadium}>{b.stadium}</option>
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

                {/* Datum und Zeit */}
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
              </div>

              {/* Name und Vorname */}
              <div className="form-row">
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
          
          {/* Filter-Section */}
          <div className="filter-section">
            <h3>Filter</h3>
            <div className="filter-row">
              <div className="filter-group">
                <label>Fläche (Alias)</label>
                <input
                  type="text"
                  value={filterFlaeche}
                  onChange={(e) => setFilterFlaeche(e.target.value)}
                  placeholder="Fläche suchen..."
                />
              </div>
              <div className="filter-group">
                <label>FID/Flurstücksnummer</label>
                <input
                  type="text"
                  value={filterFid}
                  onChange={(e) => setFilterFid(e.target.value)}
                  placeholder="FID suchen..."
                />
              </div>
              <div className="filter-group">
                <label>Von Datum</label>
                <input
                  type="date"
                  value={filterDatumVon}
                  onChange={(e) => setFilterDatumVon(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Bis Datum</label>
                <input
                  type="date"
                  value={filterDatumBis}
                  onChange={(e) => setFilterDatumBis(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-actions">
              <button
                onClick={() => {
                  setFilterFlaeche('')
                  setFilterFid('')
                  setFilterDatumVon('')
                  setFilterDatumBis('')
                }}
                className="filter-reset-button"
              >
                Filter zurücksetzen
              </button>
              <button
                onClick={() => exportToExcel(filteredEntries)}
                className="filter-export-button"
                disabled={filteredEntries.length === 0}
              >
                Gefilterte exportieren ({filteredEntries.length})
              </button>
            </div>
            <p className="filter-info">
              {filteredEntries.length} von {entries.length} Einträgen
            </p>
          </div>

          <div className="entries-grid">
            {filteredEntries.map((entry) => (
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
                  <p><strong>Fläche:</strong> {entry.flaeche_alias}</p>
                  {entry.flaeche_fid && <p><strong>FID:</strong> {entry.flaeche_fid}</p>}
                  <p><strong>Mittel:</strong> {entry.pflanzenschutzmittel}</p>
                  <p><strong>Menge:</strong> {entry.aufwandsmenge_wert} {entry.aufwandsmenge_einheit}</p>
                  <p><strong>EPPO:</strong> {entry.eppo_code}</p>
                </div>
              </div>
            ))}
            {filteredEntries.length === 0 && entries.length > 0 && (
              <div className="no-entries">
                <p>Keine Einträge gefunden, die den Filterkriterien entsprechen.</p>
              </div>
            )}
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