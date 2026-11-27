import React, { useMemo, useRef, useState } from 'react'
import {
  Activity, BarChart3, Bell, BookOpen, Camera, Check, ChevronDown, ChevronRight,
  Cloud, CloudSun, Droplets, FlaskConical, Headset, Home, Leaf, LogOut, Menu,
  Search, Settings, ShieldCheck, Sprout, Sun, TrendingUp, UploadCloud, UserRound,
  Users, Wind, X, Wheat, Image as ImageIcon, CalendarDays, MapPin, ArrowUpRight
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

const weatherDays = [
  { day: 'Mon', icon: '☀️', high: 32, low: 22 },
  { day: 'Tue', icon: '☀️', high: 31, low: 21 },
  { day: 'Wed', icon: '☁️', high: 30, low: 20 },
  { day: 'Thu', icon: '🌤️', high: 29, low: 19 },
  { day: 'Fri', icon: '🌤️', high: 30, low: 20 },
  { day: 'Sat', icon: '☀️', high: 31, low: 21 },
  { day: 'Sun', icon: '☀️', high: 32, low: 22 }
]
const marketData = [
  { crop: 'Wheat', price: 2850, unit: '40 kg', change: '+3.2%', trend: 'up', category: 'Grains' },
  { crop: 'Rice (Basmati)', price: 6200, unit: '40 kg', change: '+1.8%', trend: 'up', category: 'Grains' },
  { crop: 'Cotton', price: 8200, unit: '40 kg', change: '-0.6%', trend: 'down', category: 'Cash crops' },
  { crop: 'Maize', price: 2450, unit: '40 kg', change: '+2.1%', trend: 'up', category: 'Grains' },
  { crop: 'Sugarcane', price: 425, unit: '40 kg', change: '+0.9%', trend: 'up', category: 'Cash crops' },
  { crop: 'Potato', price: 1800, unit: '100 kg', change: '-1.2%', trend: 'down', category: 'Vegetables' }
]
const trendData = [
  { month: 'Jan', wheat: 1900, rice: 1700, cotton: 1500 },
  { month: 'Feb', wheat: 1850, rice: 1780, cotton: 1650 },
  { month: 'Mar', wheat: 2050, rice: 1900, cotton: 1600 },
  { month: 'Apr', wheat: 2200, rice: 1850, cotton: 1750 },
  { month: 'May', wheat: 2150, rice: 2050, cotton: 1800 },
  { month: 'Jun', wheat: 2350, rice: 2200, cotton: 1950 },
  { month: 'Jul', wheat: 2450, rice: 2150, cotton: 2100 },
  { month: 'Aug', wheat: 2600, rice: 2300, cotton: 2250 }
]
const diseaseTips = ['Use recommended fungicide', 'Improve air circulation', 'Avoid over-watering']

function readStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function App() {
  const [page, setPage] = useState('Dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState(() => readStore('agriai_user',
    { name: 'Waseem', role: 'Landlord', email: 'Landlord@gmail.com' }))
  const [loggedIn, setLoggedIn] = useState(() => readStore('agriai_logged', true))
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [cropImage, setCropImage] = useState('')
  const [analysisDone, setAnalysisDone] = useState(false)
  const [consultations, setConsultations] = useState(() => readStore('agriai_consultations', []))
  const [profileName, setProfileName] = useState(user.name)
  const [profileEmail, setProfileEmail] = useState(user.email)
  const [filter, setFilter] = useState('All')
  const [selectedCrop, setSelectedCrop] = useState('Wheat')
  const [soil, setSoil] = useState('Loamy')
  const [authMode, setAuthMode] = useState('signin')
  const fileRef = useRef(null)

  const go = (next) => { setPage(next); setMobileOpen(false); setNotice('') }
  const toast = (msg) => { setNotice(msg); window.setTimeout(() => setNotice(''), 3000) }
  const navItems = [
    ['Dashboard', Home], ['Disease Detection', Camera], ['Weather', CloudSun],
    ['Crop Prices', BarChart3], ['Fertilizer Guide', Sprout], ['Consultation', Headset], ['Profile', UserRound]
  ]
  const doLogout = () => {
    setLoggedIn(false);
    localStorage.setItem('agriai_logged', 'false');
    setAuthMode('signin')
  }
  const doLogin = (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const next = { name: fd.get('name') || 'Waseem ', email: fd.get('email'), role: 'Landlord' }
    setUser(next);
    setProfileName(next.name);
    setProfileEmail(next.email)
    localStorage.setItem('agriai_user', JSON.stringify(next));
    localStorage.setItem('agriai_logged', 'true')
    setLoggedIn(true); go('Dashboard')
  }
  const saveProfile = (e) => {
    e.preventDefault()
    const next = { ...user, name: profileName, email: profileEmail }
    setUser(next); localStorage.setItem('agriai_user', JSON.stringify(next));
    toast('Profile updated successfully')
  }
  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast('Please choose an image file')
    if (file.size > 5 * 1024 * 1024) return toast('Image must be smaller than 5 MB')
    setCropImage(URL.createObjectURL(file)); setAnalysisDone(false)
  }
  const submitConsult = (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const item = {
      id: Date.now(), topic: fd.get('topic'),
      message: fd.get('message'), date: new Date().toLocaleDateString(),
      status: 'Submitted'
    }
    const next = [item, ...consultations]
    setConsultations(next); localStorage.setItem('agriai_consultations',
      JSON.stringify(next));
    e.currentTarget.reset()
    toast('Your consultation request has been saved on this device')
  }

  if (!loggedIn) return <AuthScreen mode={authMode} setMode={setAuthMode} onSubmit={doLogin} />

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark">
        <Leaf size={29} fill="currentColor" />
      </div>
        <div>
          <b>AgriAI</b>
          <small>Smart Farming</small>
        </div>
      </div>
      <nav>{navItems.map(([label, Icon]) => <button key={label} className={`nav-link ${page === label ? 'active' : ''}`} onClick={() => go(label)}><Icon size={18} /><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card">
        <Sprout size={23} /><b>Grow smarter</b><span>Better decisions for every season.</span>
      </div>
        <button className="nav-link" onClick={doLogout}><LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu />
        </button>
        <div className="searchbox">
          <Search size={17} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search anything..."
            onKeyDown={e => e.key === 'Enter' && go(query.toLowerCase().includes('price') ? 'Crop Prices' :
              query.toLowerCase().includes('weather') ? 'Weather' : 'Dashboard')} />
        </div>
        <button className="icon-btn notification" onClick={() => toast('You are all caught up!')}><Bell size={19} /><i /></button>
        <button className="user-menu" onClick={() => go('Profile')}><div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div><span><b>{user.name}</b><small>Farmer</small></span><ChevronDown size={15} /></button>
      </header>
      <section className="page-content">
        {page === 'Dashboard' && <Dashboard user={user} go={go} />}
        {page === 'Disease Detection' && <DiseasePage cropImage={cropImage} onFile={onFile} fileRef={fileRef} analysisDone={analysisDone} setAnalysisDone={setAnalysisDone} />}
        {page === 'Weather' && <WeatherPage />}
        {page === 'Crop Prices' && <PricesPage filter={filter} setFilter={setFilter} />}
        {page === 'Fertilizer Guide' && <FertilizerPage selectedCrop={selectedCrop} setSelectedCrop={setSelectedCrop} soil={soil} setSoil={setSoil} />}
        {page === 'Consultation' && <ConsultPage onSubmit={submitConsult} consultations={consultations} />}
        {page === 'Profile' && <ProfilePage user={user} name={profileName} setName={setProfileName} email={profileEmail} setEmail={setProfileEmail} onSubmit={saveProfile} />}
      </section>
      <footer className="footer">© 2026 AgriAI <span>Smart Farming for a Prosperous Pakistan</span></footer>
    </main>
    {notice && <div className="toast"><Check size={17} />{notice}</div>}
  </div>
}

function PageHeading({ eyebrow, title, subtitle, action }) {
  return <div className="page-heading">
    <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>
}
function Dashboard({ user, go }) {
  return <>
    <div className="hero-banner">
      <div>
        <span className="eyebrow light">YOUR FARM, YOUR FUTURE</span>
        <h1>Welcome back, {user.name.split(' ')[0]}! <span>👋</span></h1>
        <p>Let's grow together with AI-powered agriculture.</p>
        <button className="btn btn-white" onClick={() => go('Disease Detection')}>
          Analyze a crop <ArrowUpRight size={16} /></button></div>
      <div className="hero-art"><div className="sun-disc" />
        <div className="field field-one" />
        <div className="field field-two" />
        <div className="tractor">🚜</div>
      </div>
    </div>
    <div className="stats-grid">
      <StatCard icon={<Leaf />} label="Healthy Crops" value="12.5 ha" change="+5%" tone="green" />
      <StatCard icon={<CloudSun />} label="Weather Today" value="32°C" detail="Partly Cloudy" tone="blue" />
      <StatCard icon={<TrendingUp />} label="Crop Price (Wheat)" value="Rs. 2,850/q" change="+8%" tone="orange" />
      <StatCard icon={<FlaskConical />} label="Fertilizer Suggestion" value="Urea (46%)" detail="Best for Wheat" tone="purple" />
    </div>
    <div className="dashboard-grid">
      <section className="panel disease-panel">
        <div className="panel-title">
          <h3>Disease Detection Result</h3>
          <span className="status-pill danger">● Disease Detected</span>
        </div>
        <div className="disease-content">
          <div className="leaf-photo">
            <img src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop" alt="Green crop leaves" />
          </div>
          <div><span className="tiny-label">LATEST ANALYSIS</span>
            <h2>Leaf Blight</h2
            ><p>It is a fungal disease that causes brown spots on leaves.</p>
            <b className="solution-title">Solutions:</b>
            <ul className="check-list">{diseaseTips.map(t => <li key={t}><Check size={14} />
              {t}</li>)}</ul><button className="text-btn" onClick={() =>
                go('Disease Detection')}>View details <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>
      <section className="panel forecast-panel">
        <div className="panel-title">
          <h3>7-Day Weather Forecast</h3>
          <button className="subtle-link" onClick={() =>
            go('Weather')}>View all</button>
        </div>
        <div className="forecast-row">{weatherDays.map(d =>
          <div className="forecast-day" key={d.day}>
            <b>{d.day}</b>
            <span>{d.icon}</span>
            <strong>{d.high}°</strong>
            <small>{d.low}°</small>
          </div>)}
        </div>
      </section>
      <section className="panel chart-panel">
        <div className="panel-title">
          <h3>Crop Prices Trend</h3>
          <div className="legend"><span>
            <i className="dot green-dot" />Wheat</span>
            <span><i className="dot yellow-dot" />Rice</span>
            <span><i className="dot blue-dot" />Cotton</span>
          </div>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2ef" />
              <XAxis dataKey="month" tickLine={false} axisLine={false}
                tick={{ fontSize: 11, fill: '#82918a' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#82918a' }} width={34} />
              <Tooltip />
              <Line dataKey="wheat" stroke="#159447" strokeWidth={2.5} dot={false} />
              <Line dataKey="rice" stroke="#f3b92f" strokeWidth={2.5} dot={false} />
              <Line dataKey="cotton" stroke="#54a8ed" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="panel quick-panel">
        <div className="panel-title">
          <h3>Quick Actions</h3>
        </div>
        <div className="quick-actions">{[['Disease Detection', Camera],
        ['Weather', CloudSun], ['Crop Prices', BarChart3],
        ['Fertilizer Guide', Sprout]].map(([t, I]) =>
          <button onClick={() => go(t)} key={t}>
            <span><I size={20} /></span>{t}</button>)}
        </div>
        <div className="tip-box">
          <Sprout size={18} />
          <p><b>Farm tip</b><br />Check soil moisture before your next irrigation cycle.</p>
        </div>
      </section>
    </div>
  </>
}
function StatCard({ icon, label, value, change, detail, tone }) {
  return <div className="stat-card">
    <div className={`stat-icon ${tone}`}>{icon}</div>
    <div className="stat-copy">
      <span>{label}</span>
      <b>{value}</b>
      <small>{change ? <em>{change} this week</em> : detail}</small>
    </div>
  </div>
}
function DiseasePage({ cropImage, onFile, fileRef, analysisDone, setAnalysisDone }) {
  return <>
    <PageHeading eyebrow="AI POWERED CROP CARE" title="Disease Detection"
      subtitle="Upload a clear photo of your crop leaf to check for common plant diseases." />
    <div className="content-two">
      <section className="panel upload-panel">
        <div className="section-title">
          <div className="round-icon"> <Camera />
          </div>
          <div>
            <h3>Upload Crop Image</h3>
            <p>Supported formats: JPG, PNG · Max size: 5 MB</p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        <button className={`upload-zone ${cropImage ? 'has-image' : ''}`} onClick={() =>
          fileRef.current?.click()}>{cropImage ?
            <img src={cropImage} alt="Selected crop" />
            : <><UploadCloud size={42} />
              <b>Click to upload or drag and drop</b>
              <span>Choose a clear image of the affected leaf</span>
              <small>JPG or PNG (MAX. 5MB)</small>
            </>}
        </button>
        {cropImage && <div className="upload-actions">
          <button className="btn btn-outline" onClick={() => {
            fileRef.current.value = ''; window.URL.revokeObjectURL(cropImage);
          }}>Choose another</button><button className="btn btn-primary" onClick={() =>
            setAnalysisDone(true)}>Analyze image <ArrowUpRight size={16} />
          </button>
        </div>}
        {!cropImage && <div className="privacy-note">
          <ShieldCheck size={16} /> Your image stays in this browser. No file is uploaded.</div>}
      </section>
      <section className="panel result-panel">
        <div className="panel-title">
          <h3>Analysis Result</h3>
          <span className="status-pill neutral">Demo mode</span>
        </div>{analysisDone ? <>
          <div className="result-status"><Check size={18} /> Sample analysis complete</div>
          <h2>Possible Leaf Blight</h2>
          <p className="muted">This is a simulated demonstration result, not a real AI diagnosis.</p>
          <div className="confidence">
            <span>Demo confidence</span>
            <b>92%</b>
          </div>
          <div className="progress"><i /></div>
          <b>Suggested next steps</b>
          <ul className="check-list">{diseaseTips.map(t => <li key={t}>
            <Check size={14} />{t}</li>)}</ul></> :
          <div className="empty-result">
            <div className="empty-illustration">
              <Leaf size={44} /></div>
            <h3>Your result will appear here</h3>
            <p>Upload a crop photo and select Analyze image to see the demo result.</p>
          </div>}
      </section>
    </div>
    <div className="info-banner"><ShieldCheck size={20} />
      <div>
        <b>Important note</b>
        <p>For this frontend-only version, disease results are simulated.
          Confirm crop problems with a local agricultural expert before treatment.</p>
      </div>
    </div>
  </>
}
function WeatherPage() {
  return <><PageHeading eyebrow="LOCAL CONDITIONS" title="Weather Information" subtitle="Sample weather overview for Lahore, Pakistan." action={<div className="location-chip"><MapPin size={15} /> Lahore, Pakistan <ChevronDown size={14} /></div>} />
    <div className="weather-hero panel">
      <div><span className="tiny-label">TODAY · PARTLY CLOUDY</span>
        <div className="big-temp">32°<small>C</small></div>
        <p>Feels like 34°C</p>
        <div className="weather-meta">
          <span><Droplets />Humidity <b>65%</b></span>
          <span><Wind />Wind <b>12 km/h</b></span>
          <span><Cloud />Rain <b>10%</b></span>
        </div>
      </div>
      <div className="weather-sun">🌤️</div>
    </div>
    <section className="panel forecast-large">
      <div className="panel-title">
        <h3>7-Day Forecast</h3>
        <span className="tiny-label">SAMPLE DATA</span>
      </div>
      <div className="forecast-row large">{weatherDays.map(d =>
        <div className="forecast-day" key={d.day}>
          <b>{d.day}</b>
          <span>{d.icon}</span>
          <strong>{d.high}°</strong>
          <small>{d.low}°</small>
        </div>
      )}
      </div>
    </section>
    <div className="info-banner">
      <CloudSun size={20} />
      <div><b>Weather data is for demonstration</b>
        <p>Connect a weather provider API later to show live conditions and location-based forecasts.</p>
      </div>
    </div>
  </>
}
function PricesPage({ filter, setFilter }) {
  const [search, setSearch] = useState('')
  const rows = useMemo(() => marketData.filter(x => (filter === 'All' ||
    x.category === filter) && x.crop.toLowerCase().includes(search.toLowerCase())),
    [filter, search])
  return <><PageHeading eyebrow="MARKET INSIGHTS" title="Crop Market Prices"
    subtitle="Keep track of sample crop rates and market movement." action={<span className="updated-chip">
      <Activity size={14} /> Demo rates</span>} />
    <div className="market-summary">
      <div className="panel">
        <span>Top performing crop</span>
        <b>Wheat</b>
        <strong className="positive">+3.2% <TrendingUp size={15} /></strong>
      </div>
      <div className="panel">
        <span>Average sample rate</span>
        <b>Rs. 3,625</b>
        <small>Per 40 kg (mixed crops)</small>
      </div>
      <div className="panel">
        <span>Market watch</span>
        <b>6 crops</b>
        <small>Across 3 categories</small>
      </div>
    </div>
    <section className="panel table-panel">
      <div className="table-toolbar">
        <h3>Latest Crop Rates</h3>
        <div className="table-filters">
          <div className="mini-search"><Search size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search crop" /></div><select value={filter} onChange={e =>
                setFilter(e.target.value)}>
            <option>All</option>
            <option>Grains</option>
            <option>Cash crops</option>
            <option>Vegetables</option>
          </select>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Crop</th>
              <th>Category</th>
              <th>Price</th>
              <th>Unit</th>
              <th>Change</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => <tr key={r.crop}><td>
              <span className="crop-name">
                <span className="crop-emoji">{r.crop === 'Wheat' ? '🌾' : r.crop.includes('Rice') ?
                  '🍚' : r.crop === 'Cotton' ? '☁️' :
                    r.crop === 'Maize' ? '🌽' : r.crop === 'Potato' ? '🥔' : '🎋'}</span>
                <b>{r.crop}</b>
              </span>
            </td>
              <td>{r.category}</td>
              <td>
                <b>Rs. {r.price.toLocaleString()}</b>
              </td>
              <td>{r.unit}</td>
              <td className={r.trend === 'up' ? 'positive' : 'negative'}>
                {r.change}</td><td><span className={`status-pill ${r.trend === 'up' ?
                  'success' : 'danger'}`}>{r.trend === 'up' ? 'Rising' : 'Falling'}
                </span>
              </td>
            </tr>)}
          </tbody>
        </table>
        {rows.length === 0 &&
          <div className="no-results">No crops match your search.</div>}
      </div>
    </section>
    <p className="disclaimer">Rates shown are sample values for UI demonstration only.
      Actual market prices vary by city, quality and date.</p>
  </>
}
function FertilizerPage({ selectedCrop, setSelectedCrop, soil, setSoil }) {
  const [stage, setStage] = useState('Vegetative')
  const recommendations = {
    Wheat: {
      name: 'Urea (46% N)',
      amount: '1 bag per acre', note: 'Apply in split doses; irrigate after application.'
    },
    Rice: {
      name: 'NPK 15-15-15', amount: '1.5 bags per acre',
      note: 'Use balanced nutrition and follow local soil-test advice.'
    },
    Cotton: {
      name: 'Urea + DAP', amount: 'As per soil test',
      note: 'Avoid excess nitrogen during late growth.'
    },
    Maize: {
      name: 'NPK 20-20-0', amount: '1 bag per acre',
      note: 'Place fertilizer near the root zone, not directly on seed.'
    }
  }
  const rec = recommendations[selectedCrop]
  return <>
    <PageHeading eyebrow="SMART INPUT PLANNING" title="Fertilizer Guide"
      subtitle="Explore a sample recommendation based on crop, soil type and growth stage." />
    <div className="content-two">
      <section className="panel form-panel">
        <h3>Farm Details</h3
        ><p className="muted">Select your crop conditions to view a demo suggestion.</p>
        <label>Crop type</label>
        <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}>{Object.keys(recommendations).map(x =>
          <option key={x}>{x}</option>)}</select>
        <label>Soil type</label>
        <select value={soil} onChange={e => setSoil(e.target.value)}>
          {['Loamy', 'Clay', 'Sandy', 'Silt'].map(x => <option key={x}>{x} </option>)}
        </select>
        <label>Growth stage</label>
        <select value={stage} onChange={e => setStage(e.target.value)}>
          {['Seedling', 'Vegetative', 'Flowering', 'Maturity'].map(x =>
            <option key={x}>{x}</option>)}
        </select>
        <div className="form-hint"><BookOpen size={17} />
          A soil test gives the most reliable fertilizer plan.</div>
      </section>
      <section className="panel recommendation-panel">
        <div className="recommend-head"><div className="round-icon">
          <FlaskConical /></div><span className="status-pill success">Suggested guide</span>
        </div>
        <span className="tiny-label">FOR {selectedCrop.toUpperCase()} · {soil.toUpperCase()} SOIL</span>
        <h2>{rec.name}</h2>
        <div className="amount-box">
          <span>Sample application guide</span>
          <b>{rec.amount}</b></div>
        <p>{rec.note}</p>
        <div className="recommend-detail">
          <span><Check /> Crop: {selectedCrop}</span>
          <span><Check /> Soil: {soil}</span>
          <span><Check /> Stage: {stage}</span>
        </div>
        <div className="info-banner compact">
          <ShieldCheck size={18} />
          <p>Confirm quantity with an agricultural officer and a soil test before application.</p>
        </div>
      </section>
    </div>
  </>
}
function ConsultPage({ onSubmit, consultations }) {
  return <><PageHeading eyebrow="EXPERT SUPPORT" title="Farmer Consultation" subtitle="Submit a question for an agricultural expert. This demo saves requests on your device." />
    <div className="content-two">
      <form className="panel form-panel" onSubmit={onSubmit}>
        <h3>Request a Consultation</h3>
        <label>Your topic</label>
        <select name="topic" required>
          <option value="">Select a topic</option>
          <option>Crop disease</option>
          <option>Soil health</option>
          <option>Irrigation</option>
          <option>Fertilizer usage</option>
          <option>Market guidance</option>
        </select>
        <label>Describe your question</label>
        <textarea name="message" rows="5" required minLength="10"
          placeholder="Explain your crop issue or question..." />
        <button className="btn btn-primary full-btn" type="submit">Submit request
          <ArrowUpRight size={16} /></button>
      </form>
      <section className="panel history-panel">
        <div className="panel-title">
          <h3>Your Requests</h3>
          <span className="count-badge">{consultations.length}</span>
        </div>{consultations.length ? consultations.map(c => <div className="request-item" key={c.id}>
          <div className="request-icon"><Headset size={18} />
          </div><div><b>{c.topic}</b>
            <p>{c.message}</p><small>{c.date} · {c.status}</small>
          </div>
        </div>) :
          <div className="empty-result small-empty">
            <div className="empty-illustration"><CalendarDays /></div>
            <h3>No requests yet</h3>
            <p>Your submitted consultation requests will appear here.</p>
          </div>}
      </section>
    </div>
  </>
}
function ProfilePage({ user, name, setName, email, setEmail, onSubmit }) {
  return <>
    <PageHeading eyebrow="ACCOUNT SETTINGS" title="My Profile"
      subtitle="Manage your local demo account details." />
    <div className="profile-layout"><section className="panel profile-card">
      <div className="profile-avatar">
        {name.slice(0, 1).toUpperCase()}
      </div>
      <h2>{name}</h2>
      <p>{email}</p>
      <span className="status-pill success">Farmer account</span>
      <div className="profile-stats">
        <span>
          <b>12.5 ha</b>
          <small>Farm area</small>
        </span>
        <span>
          <b>3</b>
          <small>Crop types</small>
        </span>
      </div>
    </section>
      <form className="panel form-panel profile-form" onSubmit={onSubmit}>
        <h3>Personal Information</h3>
        <label>Full name</label>
        <input value={name} onChange={e => setName(e.target.value)}
          required /><label>Email address</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Account type</label>
        <input value="Farmer" disabled />
        <button className="btn btn-primary" type="submit">Save changes <Check size={16} />
        </button>
      </form>
    </div>
  </>
}
function AuthScreen({ mode, setMode, onSubmit }) {
  return <div className="auth-screen">
    <div className="auth-visual">
      <div className="brand auth-brand">
        <div className="brand-mark">
          <Leaf size={30} fill="currentColor" />
        </div>
        <div>
          <b>AgriAI</b>
          <small>Smart Farming</small>
        </div>
      </div>
      <div className="auth-message">
        <span className="eyebrow light">SMART FARMING STARTS HERE</span>
        <h1>Grow smarter.<br />Farm better.</h1>
        <p>Practical tools and insights to help you care for your crops.</p>
      </div>
      <div className="auth-landscape">
        <div className="tractor">🚜</div>
      </div>
    </div>
    <div className="auth-form-wrap">
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="auth-logo">
          <Leaf size={38} fill="currentColor" />
        </div>
        <h2>{mode === 'signin' ? 'Welcome back!' : 'Create your account'}</h2>
        <p>Sign in to continue to your AgriAI dashboard.</p>
        {mode === 'signup' && <>
          <label>Full name</label>
          <input name="name" placeholder="Your name" required /></>}
        <label>Email address</label>
        <input type="email" name="email" placeholder="you@example.com" required />
        <label>Password</label>
        <input type="password" name="password" placeholder="Enter password" required minLength="4" />
        <button className="btn btn-primary full-btn" type="submit">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
          <ArrowUpRight size={16} /></button>
        <div className="auth-switch">{mode === 'signin' ? "Don't have an account?" :
          "Already have an account?"} <button type="button" onClick={() =>
            setMode(mode === 'signin' ? 'signup' : 'signin')}>{mode === 'signin' ?
              'Sign up' : 'Sign in'}</button>
        </div>
        <small className="demo-note">Demo only · Any valid email and password will work.</small>
      </form>
    </div>
  </div>
}
export default App
