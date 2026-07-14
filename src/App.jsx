import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { contentLibrary } from './data/content';
import { getRecommendations, sortByReleaseDate } from './lib/recommendations';

const initialPreferences = {
  interests: ['Sci-Fi', 'Thriller'],
  favoriteActors: ['Zendaya', 'Timothée Chalamet'],
  recentWatched: ['Dune: Part Two'],
  ratingBias: 4,
};

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/discover', label: 'Discover' },
  { to: '/login', label: 'Login' },
  { to: '/connect', label: 'Connect' },
];

function App() {
  const location = useLocation();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [selectedGenre, setSelectedGenre] = useState('All');

  const recentItems = useMemo(() => sortByReleaseDate(contentLibrary).slice(0, 3), []);
  const recommendationItems = useMemo(() => getRecommendations(preferences), [preferences]);
  const filteredItems = useMemo(() => {
    if (selectedGenre === 'All') return contentLibrary;
    return contentLibrary.filter((item) => item.genres.includes(selectedGenre));
  }, [selectedGenre]);

  return (
    <div className="min-vh-100 bg-light text-dark">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">VibeMatcher</Link>
          <div className="navbar-nav ms-auto">
            {navItems.map((item) => (
              <Link
                key={item.to}
                className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Routes>
          <Route
            path="/"
            element={
              <div className="row g-4">
                <section className="col-lg-8">
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                      <h1 className="display-6 fw-bold">Find your next favorite movie or show</h1>
                      <p className="text-muted">VibeMatcher blends ratings, genres, recent choices, favorite actors, and release timing to explain each recommendation.</p>
                      <div className="d-flex flex-wrap gap-2">
                        {['Sci-Fi', 'Thriller', 'Drama', 'Comedy', 'Mystery'].map((tag) => (
                          <span className="badge bg-secondary" key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                      <h2 className="h4">Recommended for you</h2>
                      <div className="row g-3 mt-1">
                        {recommendationItems.map((item) => (
                          <div className="col-md-6" key={item.id}>
                            <div className="border rounded-4 p-3 h-100">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h3 className="h6 fw-bold mb-1">{item.title}</h3>
                                  <p className="small text-muted mb-2">{item.type === 'show' ? 'TV Show' : 'Movie'} • {item.releaseYear}</p>
                                </div>
                                <span className="badge bg-success">★ {item.rating}</span>
                              </div>
                              <p className="small mb-2">{item.description}</p>
                              <p className="small mb-2"><strong>Why:</strong> {item.whyRecommended}</p>
                              <div className="d-flex flex-wrap gap-2">
                                {item.genres.map((genre) => (
                                  <span className="badge bg-light text-dark" key={genre}>{genre}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <aside className="col-lg-4">
                  <div className="card shadow-sm border-0 mb-4">
                    <div className="card-body">
                      <h2 className="h5">Pick your interests</h2>
                      <label className="form-label mt-2">Interests</label>
                      <input
                        className="form-control"
                        value={preferences.interests.join(', ')}
                        onChange={(event) => setPreferences({ ...preferences, interests: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })}
                      />
                      <label className="form-label mt-3">Favorite actors</label>
                      <input
                        className="form-control"
                        value={preferences.favoriteActors.join(', ')}
                        onChange={(event) => setPreferences({ ...preferences, favoriteActors: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })}
                      />
                      <label className="form-label mt-3">Recently watched</label>
                      <input
                        className="form-control"
                        value={preferences.recentWatched.join(', ')}
                        onChange={(event) => setPreferences({ ...preferences, recentWatched: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })}
                      />
                      <label className="form-label mt-3">Minimum rating preference</label>
                      <input
                        type="range"
                        className="form-range"
                        min="3"
                        max="5"
                        value={preferences.ratingBias}
                        onChange={(event) => setPreferences({ ...preferences, ratingBias: Number(event.target.value) })}
                      />
                      <div className="text-muted small">Current bias: {preferences.ratingBias}/5</div>
                    </div>
                  </div>

                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h2 className="h5">Newly added</h2>
                      {recentItems.map((item) => (
                        <div className="border rounded-3 p-2 mb-2" key={item.id}>
                          <strong>{item.title}</strong>
                          <div className="small text-muted">{item.releaseYear} • {item.platform}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            }
          />

          <Route
            path="/discover"
            element={
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1 className="h3 mb-0">Discover by genre</h1>
                    <select className="form-select w-auto" value={selectedGenre} onChange={(event) => setSelectedGenre(event.target.value)}>
                      <option value="All">All</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Thriller">Thriller</option>
                      <option value="Drama">Drama</option>
                      <option value="Comedy">Comedy</option>
                    </select>
                  </div>
                  <div className="row g-3">
                    {filteredItems.map((item) => (
                      <div className="col-md-6 col-xl-4" key={item.id}>
                        <div className="border rounded-4 p-3 h-100">
                          <div className="d-flex justify-content-between">
                            <h2 className="h6 fw-bold">{item.title}</h2>
                            <span className="badge bg-info-subtle text-info-emphasis">{item.type === 'show' ? 'TV' : 'Movie'}</span>
                          </div>
                          <p className="small text-muted mb-2">Released {item.releaseYear} • {item.platform}</p>
                          <p className="small mb-2">Status: {item.status}</p>
                          <p className="small mb-2">Collection: {item.collection}</p>
                          <p className="small mb-2">Pricing: {item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }
          />

          <Route
            path="/login"
            element={
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h1 className="h3">Login</h1>
                      <label className="form-label mt-2">Email</label>
                      <input className="form-control" placeholder="you@example.com" />
                      <label className="form-label mt-3">Password</label>
                      <input className="form-control" type="password" placeholder="••••••••" />
                      <button className="btn btn-primary mt-3">Log in</button>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h1 className="h3">Register</h1>
                      <label className="form-label mt-2">Name</label>
                      <input className="form-control" placeholder="Your name" />
                      <label className="form-label mt-3">Email</label>
                      <input className="form-control" placeholder="you@example.com" />
                      <label className="form-label mt-3">Password</label>
                      <input className="form-control" type="password" placeholder="••••••••" />
                      <button className="btn btn-outline-primary mt-3">Create account</button>
                    </div>
                  </div>
                </div>
              </div>
            }
          />

          <Route
            path="/connect"
            element={
              <div className="row g-4">
                <div className="col-lg-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h1 className="h3">Contact</h1>
                      <p className="text-muted">Questions about recommendations or platform availability? Reach out to our concierge team.</p>
                      <form>
                        <label className="form-label mt-2">Name</label>
                        <input className="form-control" />
                        <label className="form-label mt-3">Message</label>
                        <textarea className="form-control" rows="4" />
                        <button className="btn btn-primary mt-3">Send</button>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <h1 className="h3">Connect</h1>
                      <p className="text-muted">Follow recent reviews, share favorites, and compare streaming options.</p>
                      <ul className="list-group">
                        <li className="list-group-item">Recent comments about Blade Runner 2049</li>
                        <li className="list-group-item">Community picks for sci-fi lovers</li>
                        <li className="list-group-item">Platform availability updated weekly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
