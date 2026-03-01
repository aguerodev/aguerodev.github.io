import { useEffect, useMemo, useState } from 'react'
import './App.css'

const PHONE_REGEX = /^(?:6[0-4]|7[0-2]|8[3-9])[0-9]{2}-[0-9]{4}$/
const API_BASE = import.meta.env.VITE_API_BASE || 'https://aprende-inscripciones.aguero2707.workers.dev'

const TESTIMONIALS = [
  {
    name: 'Oldemar Rodríguez',
    tagline: 'CEO (Chief Executive Officer) PROMiDAT Iberoamericano S.A.',
    img: 'https://senja-io.s3.us-west-1.amazonaws.com/public/media/ztwD85TIPlJME4v89fpJ5rg0.jpeg',
    text: 'Carlos tiene amplios conocimientos en Programación R y experiencia real en proyectos de Ciencia de Datos. Excelente formador.'
  },
  {
    name: 'Anthony García-Marín',
    tagline: 'Researcher | Data Analyst | Professor',
    img: 'https://senja-io.s3.us-west-1.amazonaws.com/public/media/sMKtIpTuIsgHprCrkBv93uRl.jpeg',
    text: 'Destaca por su dominio de R y su capacidad de explicar conceptos complejos con claridad y ejemplos prácticos.'
  },
  {
    name: 'Gabriel Jesús Barrios Arias',
    tagline: 'Data Analyst Manager II @ Walmart Global Tech',
    img: 'https://senja-io.s3.us-west-1.amazonaws.com/public/media/vWnX5SNmDQpqw4Vf0NZV0ZC7.jpeg',
    text: 'Instructor excepcional, materiales muy bien elaborados y una metodología que mantiene la motivación por aprender.'
  },
  {
    name: 'Diego Valladares-Sobrado',
    tagline: 'IT Projects | Data | Research',
    img: 'https://senja-io.s3.us-west-1.amazonaws.com/public/media/j1lNx9XIynn5ZBRahEIQ4Qgw.jpeg',
    text: 'Pasión por el tema, experiencia y habilidad para enseñar.'
  },
  {
    name: 'Esteban Navarro',
    tagline: 'Psicólogo y estudiante de estadística',
    img: 'https://senja-io.s3.us-west-1.amazonaws.com/public/avatar/ba0490a4-0038-4712-88f6-e719e2243574_ChatGPT%20Image%2028%20mar%202025%2C%2020_41_26.png',
    text: 'Es de los cursos más completos y actualizados que he llevado en R.'
  },
  {
    name: 'Verónica Cerdas Benavides',
    tagline: 'Economista',
    img: 'https://senja-io.s3.us-west-1.amazonaws.com/public/avatar/b35fff02-3f20-4785-907a-9fe012d8ea4d_1000235284.jpg',
    text: 'Muy didáctico y con enfoque práctico. Altamente recomendado.'
  }
]

function normalizePhoneInput(v) {
  const raw = (v || '').replace(/\D/g, '').slice(0, 8)
  return raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw
}

export default function App() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')

  const [loginOpen, setLoginOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginMsg, setLoginMsg] = useState('')
  const [session, setSession] = useState(null)

  const [cursos, setCursos] = useState([])
  const [cursosMsg, setCursosMsg] = useState('')

  useEffect(() => {
    try {
      const s = localStorage.getItem('aprende_session')
      if (s) setSession(JSON.parse(s))
    } catch {
      setSession(null)
    }
  }, [])

  useEffect(() => {
    async function loadCursos() {
      if (!session?.id || !session?.role) return
      setCursosMsg('Cargando cursos...')
      try {
        const u = `${API_BASE}/api/cursos?role=${encodeURIComponent(session.role)}&user_id=${encodeURIComponent(session.id)}`
        const r = await fetch(u)
        const j = await r.json()
        if (!r.ok || !j.ok) throw new Error(j.error || 'No se pudieron cargar cursos')
        setCursos(j.items || [])
        setCursosMsg((j.items || []).length ? '' : 'No hay cursos asignados todavía.')
      } catch (e) {
        setCursosMsg(`⚠️ ${e.message}`)
      }
    }
    loadCursos()
  }, [session])

  const phoneValid = useMemo(() => PHONE_REGEX.test(phone), [phone])
  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email])

  async function handleEnroll(e) {
    e.preventDefault()
    if (!emailValid) {
      setMsg('⚠️ Ingrese un correo válido. Ejemplo: nombre@correo.com')
      return
    }
    if (!phoneValid) {
      setMsg('⚠️ Use formato 8888-8888. Prefijos móviles válidos: 60-64, 70-72, 83-89.')
      return
    }

    setMsg('Enviando...')
    try {
      const res = await fetch(`${API_BASE}/api/inscripciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phone })
      })
      const raw = await res.text()
      let out = {}
      try { out = raw ? JSON.parse(raw) : {} } catch { out = {} }
      if (!res.ok) throw new Error(out.error || `Error ${res.status} al enviar la inscripción.`)

      setMsg('✅ Inscripción enviada correctamente. Le contactaremos por WhatsApp.')
      setEmail('')
      setPhone('')
    } catch (err) {
      setMsg(`⚠️ ${err.message}`)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoginMsg('Validando...')
    try {
      const r = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword.trim() })
      })
      const j = await r.json()
      if (!r.ok || !j.ok) {
        setLoginMsg(`⚠️ ${j.error || 'Credenciales inválidas.'}`)
        return
      }

      const next = {
        id: j.user.id,
        email: j.user.email,
        name: j.user.full_name || '',
        role: j.user.role,
      }
      localStorage.setItem('aprende_session', JSON.stringify(next))
      setSession(next)
      setLoginMsg('✅ Sesión iniciada.')
      setTimeout(() => setLoginOpen(false), 300)
    } catch (err) {
      setLoginMsg(`⚠️ ${err.message}`)
    }
  }

  function logout() {
    localStorage.removeItem('aprende_session')
    setSession(null)
    setCursos([])
    setCursosMsg('')
  }

  return (
    <>
      <header className="hero">
        <nav className="nav wrap">
          <div className="brand">Aprende Tidyverse</div>
          <div className="nav-actions">
            {!session ? (
              <button className="nav-cta" type="button" onClick={() => setLoginOpen(true)}>Iniciar sesión</button>
            ) : (
              <button className="nav-cta" type="button" onClick={logout}>Cerrar sesión</button>
            )}
          </div>
        </nav>

        <div className="wrap hero-grid">
          <section>
            <p className="eyebrow">INSCRIPCIÓN ABIERTA</p>
            <h1>Limpieza y Manipulación de Datos con R</h1>
            <p className="lead">Domine un flujo profesional para limpiar, transformar y preparar datos reales para análisis, reportes y dashboards.</p>
            <div className="chips">
              <span><strong>Precio:</strong> $99 USD</span>
              <span><strong>Duración:</strong> 6 semanas</span>
              <span><strong>Modalidad:</strong> En vivo + ejercicios</span>
            </div>
          </section>

          <aside id="inscripcion" className="enroll-card">
            <h3>Reserve su cupo</h3>
            <p>Déjenos su correo y teléfono. Le enviaremos por <strong>WhatsApp</strong> la información para completar la inscripción.</p>
            <form className="form" onSubmit={handleEnroll}>
              <label>Correo electrónico
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@correo.com" required />
              </label>
              <label>Teléfono / WhatsApp
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(normalizePhoneInput(e.target.value))} placeholder="8888-8888" maxLength={9} required />
              </label>
              <button type="submit">Enviar inscripción</button>
            </form>
            <p className="form-msg">{msg}</p>
          </aside>
        </div>
      </header>

      <main className="wrap sections">
        {session && (
          <section className="panel">
            <h2>Mis cursos ({session.role})</h2>
            <p className="form-msg">{cursosMsg}</p>
            <div className="curriculum">
              {cursos.map((c) => (
                <article className="week-card" key={c.generation_id}>
                  <div className="week-title">{c.course_title} · Generación {c.code}</div>
                  <p>Inicio: {c.starts_on || '-'} · Fin: {c.ends_on || '-'} · Estado: {c.status || '-'}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="panel instructor">
          <img src="/me.png" alt="Carlos Agüero" />
          <div>
            <h2>Instructor</h2>
            <p><strong>Carlos Agüero</strong> · 10 años de experiencia formando profesionales en análisis y ciencia de datos.</p>
            <p>
              <a href="https://www.linkedin.com/in/carlos-aguero-cr" target="_blank" rel="noreferrer">LinkedIn</a> ·{' '}
              <a href="https://education.rstudio.com/trainers/people/aguero+carlos/" target="_blank" rel="noreferrer">Perfil de instructor certificado RStudio</a> ·{' '}
              <a href="https://carpentries.org/community/instructors/" target="_blank" rel="noreferrer">Perfil de instructor de Software Carpentries</a>
            </p>
          </div>
        </section>

        <section className="panel">
          <h2>Temario (6 semanas)</h2>
          <div className="curriculum">
            <article className="week-card active"><div className="week-title">Semana 1 · Introducción a Tidyverse y Manipulación de Datos Básicos</div><p>Repaso completo de operaciones básicas con <code>dplyr</code> y validación de información con <code>pointblank</code>.</p></article>
            <article className="week-card"><div className="week-title">Semana 2 · Filtrados Avanzados y Operaciones Lógicas Complejas</div><p>Uso avanzado de <code>filter()</code>, <code>filter_out()</code>, <code>replace_when()</code>, <code>replace_values()</code> y <code>recode_values()</code>.</p></article>
            <article className="week-card"><div className="week-title">Semana 3 · Resúmenes y Datos Agrupados</div><p>Estadística descriptiva y agrupaciones con <code>group_by()</code>, <code>summarise()</code> y <code>across()</code>.</p></article>
            <article className="week-card"><div className="week-title">Semana 4 · Transformación con tidyr</div><p><code>pivot_longer()</code>, <code>pivot_wider()</code>, manejo de ausentes e imputación.</p></article>
            <article className="week-card"><div className="week-title">Semana 5 · Combinación de datos con Joins</div><p><code>inner_join()</code>, <code>left_join()</code>, <code>right_join()</code>, <code>full_join()</code>.</p></article>
            <article className="week-card"><div className="week-title">Semana 6 · Proyecto Final</div><p>Aplicación integral de limpieza, transformación y validación en un caso real.</p></article>
          </div>
        </section>

        <section className="panel testimonials">
          <h2>Testimonios de estudiantes</h2>
          <p className="form-msg">Experiencias reales de personas que han llevado cursos conmigo.</p>

          <div className="testimonials-marquee">
            <div className="marquee-row">
              <div className="marquee-track">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <article className="testimonial-card" key={`t1-${i}`}>
                    <div className="testimonial-head">
                      <img src={t.img} alt={t.name} loading="lazy" referrerPolicy="no-referrer" />
                      <div>
                        <div className="testimonial-name">{t.name}</div>
                        <div className="testimonial-tagline">{t.tagline}</div>
                      </div>
                    </div>
                    <p className="testimonial-text">{t.text}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="marquee-row reverse">
              <div className="marquee-track">
                {[...TESTIMONIALS.slice().reverse(), ...TESTIMONIALS.slice().reverse()].map((t, i) => (
                  <article className="testimonial-card" key={`t2-${i}`}>
                    <div className="testimonial-head">
                      <img src={t.img} alt={t.name} loading="lazy" referrerPolicy="no-referrer" />
                      <div>
                        <div className="testimonial-name">{t.name}</div>
                        <div className="testimonial-tagline">{t.tagline}</div>
                      </div>
                    </div>
                    <p className="testimonial-text">{t.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel upcoming">
          <h2>Próximos cursos</h2>
          <div className="upcoming-grid">
            <article className="upcoming-card"><span className="tag">Anuncio</span><h3>Visualización de datos con R</h3><p>Diseño de gráficos efectivos con ggplot2 y storytelling con datos.</p><a href="#" className="upcoming-btn">Ver detalles</a></article>
            <article className="upcoming-card"><span className="tag">Anuncio</span><h3>Análisis de datos geoespaciales con R</h3><p>Mapas, capas espaciales y análisis territorial aplicado a proyectos reales.</p><a href="#" className="upcoming-btn">Ver detalles</a></article>
            <article className="upcoming-card"><span className="tag">Anuncio</span><h3>Fundamentos de R</h3><p>Base sólida en R: sintaxis, estructuras de datos y flujo de análisis reproducible.</p><a href="#" className="upcoming-btn">Ver detalles</a></article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <strong>Aprende Tidyverse</strong>
            <p>Formación práctica en análisis y ciencia de datos con R.</p>
          </div>
          <div>
            <p>Contacto: <a href="mailto:carlos.aguero@aprendetidyverse.com">carlos.aguero@aprendetidyverse.com</a></p>
            <p>WhatsApp: <a href="https://wa.me/50683725899" target="_blank" rel="noreferrer">wa.me/50683725899</a></p>
          </div>
        </div>
      </footer>

      <div className={`modal ${loginOpen ? 'show' : ''}`} onClick={(e) => e.target.classList.contains('modal') && setLoginOpen(false)}>
        <div className="modal-card">
          <h3>Iniciar sesión</h3>
          <form className="form" onSubmit={handleLogin}>
            <label>Correo
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required placeholder="nombre@correo.com" />
            </label>
            <label>Contraseña
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required placeholder="********" />
            </label>
            <button type="submit">Entrar</button>
          </form>
          <p className="form-msg">{loginMsg}</p>
          <button className="upcoming-btn" type="button" onClick={() => setLoginOpen(false)}>Cerrar</button>
        </div>
      </div>
    </>
  )
}
