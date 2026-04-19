import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { format, parseISO } from 'date-fns'
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
  behandelte_flaeche_wert?: number | null
  behandelte_flaeche_einheit?: string | null
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

/** Komma oder Punkt als Dezimaltrennzeichen */
function parseDecimalInput(raw: string): number {
  const n = parseFloat(raw.trim().replace(/\s/g, '').replace(',', '.'))
  return n
}

/** InVeKoS-Schlagskennung: gespeicherte reine Ziffern-FID mit DEBYLI0 anzeigen, falls noch kein Präfix in der DB */
function formatFidInVeKoS(fid: string | null | undefined): string {
  if (fid == null || String(fid).trim() === '') return ''
  const s = String(fid).trim()
  if (/^DEBYLI/i.test(s)) return s
  if (/^[0-9]+$/.test(s)) return `DEBYLI0${s}`
  return s
}

const AUFWANDSMENGE_EINHEIT_GRUPPEN: { label: string; options: { value: string; label: string }[] }[] = [
  {
    label: 'Absolute Menge',
    options: [
      { value: 'g', label: 'g' },
      { value: 'kg', label: 'kg' },
      { value: 'ml', label: 'ml' },
      { value: 'l', label: 'l' }
    ]
  },
  {
    label: 'pro Fläche (z. B. Agrar)',
    options: [
      { value: 'l/ha', label: 'l/ha' },
      { value: 'ml/ha', label: 'ml/ha' },
      { value: 'kg/ha', label: 'kg/ha' },
      { value: 'g/ha', label: 'g/ha' }
    ]
  },
  {
    label: 'Saatgut / Erzeugnis (pro Masse)',
    options: [
      { value: 'ml/kg', label: 'ml/kg' },
      { value: 'g/kg', label: 'g/kg' },
      { value: 'l/t', label: 'l/t' },
      { value: 'ml/t', label: 'ml/t' },
      { value: 'g/t', label: 'g/t' },
      { value: 'kg/t', label: 'kg/t' }
    ]
  }
]

const BEHANDELTE_FL_EINHEITEN = ['ha', 't', 'kg', 'm²'] as const

const Dashboard = ({ session }: { session: any }) => {
  const [user, setUser] = useState<User>({ name: '', vorname: '' })
  const [entries, setEntries] = useState<Entry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null)
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
  const [behandelteFlaecheWert, setBehandelteFlaecheWert] = useState('')
  const [behandelteFlaecheEinheit, setBehandelteFlaecheEinheit] = useState<string>('ha')
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

  // Nur aktive Einträge für Dropdowns (alphabetisch bereits sortiert)
  const aktiveVerwendungen = useMemo(() => verwendungsarten.filter(v => v.aktiv), [verwendungsarten])
  const aktiveFlaechen = useMemo(() => flaechenListe.filter(f => f.aktiv), [flaechenListe])
  const aktiveKulturpflanzen = useMemo(() => kulturpflanzenListe.filter(k => k.aktiv), [kulturpflanzenListe])
  const aktivePsm = useMemo(() => pflanzenschutzmittelListe.filter(p => p.aktiv), [pflanzenschutzmittelListe])
  const aktiveBbch = useMemo(() => bbchStadienListe.filter(b => b.aktiv), [bbchStadienListe])

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
      const q = filterFid.toLowerCase()
      filtered = filtered.filter(e => {
        const raw = (e.flaeche_fid || '').toLowerCase()
        const formatted = formatFidInVeKoS(e.flaeche_fid || '').toLowerCase()
        return raw.includes(q) || formatted.includes(q)
      })
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
      // select('*') lädt alle Spalten – funktioniert auch ohne aktiv-Spalte (vor Migration)
      // v.aktiv !== false: wenn aktiv fehlt (undefined), gilt als aktiv (keine Datenverlust-Gefahr)
      const [verwendungen, psm, kulturen, flaechen, bbch] = await Promise.all([
        supabase.from('verwendungsarten').select('*'),
        supabase.from('pflanzenschutzmittel').select('*'),
        supabase.from('kulturpflanzen').select('*'),
        supabase.from('flaechen').select('*'),
        supabase.from('bbch_stadien').select('*')
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
          nummer: p.zulassungsnummer || '',
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

      // Fehler loggen, falls Abfragen fehlschlagen (Daten bleiben in DB!)
      const errors = [verwendungen.error, psm.error, kulturen.error, flaechen.error, bbch.error].filter(Boolean)
      if (errors.length > 0) {
        console.error('Fehler beim Laden einiger Listen:', errors)
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

      const aufwandWert = parseDecimalInput(aufwandsmengeWert)
      if (Number.isNaN(aufwandWert) || aufwandWert < 0) {
        alert('Bitte eine gültige Aufwandsmenge eingeben.')
        setLoading(false)
        return
      }

      const bfWert = parseDecimalInput(behandelteFlaecheWert)
      if (Number.isNaN(bfWert) || bfWert <= 0) {
        alert('Bitte die behandelte Fläche bzw. Einheit angeben (z. B. 1,1 bei Einheit ha oder 550 bei Einheit kg).')
        setLoading(false)
        return
      }
      
      const payload = {
        art_der_verwendung: artDerVerwendung,
        pflanzenschutzmittel: pflanzenschutzmittel,
        zulassungsnummer: zulassungsnummer,
        anwendungsdatum: anwendungsdatum,
        startzeitpunkt: startzeitpunkt,
        aufwandsmenge_wert: aufwandWert,
        aufwandsmenge_einheit: aufwandsmengeEinheit,
        behandelte_flaeche_wert: bfWert,
        behandelte_flaeche_einheit: behandelteFlaecheEinheit,
        kulturpflanze: kulturpflanze,
        flaeche_alias: flaecheAlias,
        flaeche_fid: flaecheFid,
        flaeche_gps: flaecheGps,
        eppo_code: eppoCode,
        bbch_stadium: bbchStadium,
        user_name: user.name,
        user_vorname: user.vorname
      }

      if (editingEntryId != null) {
        const { error } = await supabase
          .from('eintraege')
          .update(payload)
          .eq('id', editingEntryId)

        if (error) throw error
        alert('Eintrag wurde aktualisiert.')
      } else {
        const { error } = await supabase
          .from('eintraege')
          .insert([{ ...payload, user_id: authUser?.id }])

        if (error) throw error
        alert('Eintrag erfolgreich gespeichert!')
      }

      resetForm()
      loadEntries()
      setShowForm(false)
    } catch (error: any) {
      const msg = error.message || String(error)
      if (msg.includes('behandelte_flaeche') || msg.includes('schema cache')) {
        alert('Datenbank: Bitte die Migration supabase-migration-behandelte-flaeche.sql in der Supabase-Konsole ausführen.\n\n' + msg)
      } else {
        alert('Fehler beim Speichern: ' + msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const startEditEntry = (entry: Entry) => {
    if (entry.id == null) return
    setEditingEntryId(entry.id)
    setArtDerVerwendung(entry.art_der_verwendung)
    setFlaecheAlias(entry.flaeche_alias)
    setFlaecheFid(entry.flaeche_fid || '')
    setFlaecheGps(entry.flaeche_gps || '')
    setKulturpflanze(entry.kulturpflanze)
    setEppoCode(entry.eppo_code)
    setPflanzenschutzmittel(entry.pflanzenschutzmittel)
    setZulassungsnummer(entry.zulassungsnummer)
    setAufwandsmengeWert(String(entry.aufwandsmenge_wert))
    setAufwandsmengeEinheit(entry.aufwandsmenge_einheit || 'l')
    setBehandelteFlaecheWert(
      entry.behandelte_flaeche_wert != null && entry.behandelte_flaeche_wert !== undefined
        ? String(entry.behandelte_flaeche_wert).replace('.', ',')
        : ''
    )
    setBehandelteFlaecheEinheit(entry.behandelte_flaeche_einheit || 'ha')
    setBbchStadium(entry.bbch_stadium)
    const d = entry.anwendungsdatum
    setAnwendungsdatum(d ? d.slice(0, 10) : format(new Date(), 'yyyy-MM-dd'))
    const t = String(entry.startzeitpunkt || '')
    setStartzeitpunkt(t.length >= 5 ? t.slice(0, 5) : t)
    setShowForm(true)
  }

  const handleDeleteEntry = async (entry: Entry) => {
    if (entry.id == null) return
    if (!window.confirm('Diesen Eintrag wirklich löschen? Dies kann nicht rückgängig gemacht werden.')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('eintraege').delete().eq('id', entry.id)
      if (error) throw error
      loadEntries()
    } catch (error: any) {
      const msg = error.message || String(error)
      if (msg.includes('policy') || msg.includes('permission') || msg.includes('42501')) {
        alert('Löschen nicht erlaubt: Bitte in Supabase die Datei supabase-migration-eintraege-update-delete.sql im SQL Editor ausführen.')
      } else {
        alert('Löschen fehlgeschlagen: ' + msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEditingEntryId(null)
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
    setBehandelteFlaecheWert('')
    setBehandelteFlaecheEinheit('ha')
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
      
      if (error) {
        if (error.message?.includes('aktiv') || error.message?.includes('column')) {
          alert('Aktiv/Inaktiv-Funktion: Bitte führen Sie die Migration (supabase-migration-aktiv.sql) in der Supabase-Konsole aus.')
          return
        }
        throw error
      }
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const exportToExcel = async (selectedEntries: Entry[] = filteredEntries.length > 0 ? filteredEntries : entries) => {
    try {
      const XLSX = await import('xlsx')

      const formatDatumDe = (isoDate: string) => {
        try {
          return format(parseISO(isoDate.slice(0, 10)), 'dd.MM.yyyy', { locale: de })
        } catch {
          return isoDate
        }
      }

      const formatZeitExport = (t: string | undefined) => {
        if (!t) return ''
        const s = String(t)
        return s.length >= 8 && s.includes(':') ? s.slice(0, 5) : s.slice(0, 5)
      }

      // Feste Spaltenreihenfolge (LfL / elektronische Aufzeichnung); ohne „Erstellt am“
      const data = selectedEntries.map((entry) => {
        const behandelt =
          entry.behandelte_flaeche_wert != null && entry.behandelte_flaeche_einheit
            ? `${entry.behandelte_flaeche_wert} ${entry.behandelte_flaeche_einheit}`.trim()
            : ''

        return {
          Schlagbezeichnung: entry.flaeche_alias ?? '',
          'Art der Verwendung': entry.art_der_verwendung ?? '',
          Pflanzenschutzmittel: entry.pflanzenschutzmittel ?? '',
          Zulassungsnummer: entry.zulassungsnummer ?? '',
          Anwendungsdatum: formatDatumDe(entry.anwendungsdatum),
          Startzeitpunkt: formatZeitExport(entry.startzeitpunkt),
          Aufwandsmenge: `${entry.aufwandsmenge_wert ?? ''} ${entry.aufwandsmenge_einheit ?? ''}`.trim(),
          'Kulturpflanze/Pflanzenerzeugnis': entry.kulturpflanze ?? '',
          'Behandelte Fläche bzw. Einheit': behandelt,
          'EPPO-Code': entry.eppo_code ?? '',
          'BBCH Kultur': entry.bbch_stadium ?? '',
          'Flurstücksnummer (FID/InVeKoS)': formatFidInVeKoS(entry.flaeche_fid ?? ''),
          'GPS-Daten': entry.flaeche_gps ?? '',
          'Name des Anwenders': entry.user_name ?? '',
          'Vorname des Anwenders': entry.user_vorname ?? ''
        }
      })

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
          <button
            type="button"
            onClick={() => {
              if (showForm) {
                setEditingEntryId(null)
                setShowForm(false)
              } else {
                setEditingEntryId(null)
                resetForm()
                setShowForm(true)
              }
            }}
            className="action-button"
          >
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
                    <span>{f.alias}{f.fid && ` (${formatFidInVeKoS(f.fid)})`}</span>
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
            <h2>{editingEntryId != null ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</h2>
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
                      <small>FID: {formatFidInVeKoS(flaecheFid)}</small>
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
                  <p className="field-hint">z. B. absolute Menge (l, ml) oder Verhältnis wie l/ha, ml/kg bei Saatgut</p>
                  <div className="amount-input amount-input-wide">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={aufwandsmengeWert}
                      onChange={(e) => setAufwandsmengeWert(e.target.value)}
                      placeholder="z. B. 1,75"
                      required
                    />
                    <select
                      value={aufwandsmengeEinheit}
                      onChange={(e) => setAufwandsmengeEinheit(e.target.value)}
                      className="select-einheit"
                    >
                      {AUFWANDSMENGE_EINHEIT_GRUPPEN.map((gruppe) => (
                        <optgroup key={gruppe.label} label={gruppe.label}>
                          {gruppe.options.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Behandelte Fläche bzw. Einheit *</label>
                  <p className="field-hint">Fläche, die behandelt wurde, z. B. 2,25 ha oder bei Saatgut 15 t</p>
                  <div className="amount-input amount-input-wide">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={behandelteFlaecheWert}
                      onChange={(e) => setBehandelteFlaecheWert(e.target.value)}
                      placeholder="z. B. 1,1"
                      required
                    />
                    <select
                      value={behandelteFlaecheEinheit}
                      onChange={(e) => setBehandelteFlaecheEinheit(e.target.value)}
                    >
                      {BEHANDELTE_FL_EINHEITEN.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
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
                  {loading ? 'Speichert...' : editingEntryId != null ? 'Änderungen speichern' : 'Eintrag speichern'}
                </button>
                <button type="button" onClick={resetForm} className="reset-button">
                  Zurücksetzen
                </button>
                {editingEntryId != null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntryId(null)
                      resetForm()
                      setShowForm(false)
                    }}
                    className="reset-button"
                  >
                    Bearbeiten abbrechen
                  </button>
                )}
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
                  <div className="entry-header-actions">
                    <button
                      type="button"
                      onClick={() => startEditEntry(entry)}
                      className="entry-action-button edit"
                      title="Eintrag bearbeiten"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEntry(entry)}
                      className="entry-action-button delete"
                      title="Eintrag löschen"
                      disabled={loading}
                    >
                      🗑️
                    </button>
                    <button
                      type="button"
                      onClick={() => exportToExcel([entry])}
                      className="export-button"
                      title="Als Excel exportieren"
                    >
                      📥
                    </button>
                  </div>
                </div>
                <div className="entry-details">
                  <p><strong>Datum:</strong> {format(new Date(entry.anwendungsdatum), 'dd.MM.yyyy', { locale: de })}</p>
                  <p><strong>Zeit:</strong> {entry.startzeitpunkt}</p>
                  <p><strong>Fläche:</strong> {entry.flaeche_alias}</p>
                  {entry.flaeche_fid && (
                    <p><strong>FID:</strong> {formatFidInVeKoS(entry.flaeche_fid)}</p>
                  )}
                  <p><strong>Mittel:</strong> {entry.pflanzenschutzmittel}</p>
                  <p><strong>Aufwandsmenge:</strong> {entry.aufwandsmenge_wert} {entry.aufwandsmenge_einheit}</p>
                  {entry.behandelte_flaeche_wert != null && entry.behandelte_flaeche_einheit && (
                    <p><strong>Behandelte Fläche:</strong> {entry.behandelte_flaeche_wert} {entry.behandelte_flaeche_einheit}</p>
                  )}
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