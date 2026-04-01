import { useEffect, useState } from 'react'
import './App.css'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500'

async function getMovies(query = '') {
  const url = query
    ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    : `${BASE_URL}/movie/popular?api_key=${API_KEY}`

  const response = await fetch(url)
  return response.json()
}

async function getMovieDetails(id) {
  const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos`)
  return response.json()
}

function App() {
  const [movies, setMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!API_KEY) {
      setError('Add your TMDB API key in a .env file using VITE_TMDB_API_KEY.')
      return
    }

    async function loadPopularMovies() {
      try {
        setLoading(true)
        setError('')

        const data = await getMovies()
        setMovies(data.results || [])

        if (data.results && data.results.length > 0) {
          fetchMovieDetails(data.results[0].id)
        }
      } catch {
        setError('Could not load movies.')
      } finally {
        setLoading(false)
      }
    }

    loadPopularMovies()
  }, [])

  async function fetchMovies(query = '') {
    try {
      setLoading(true)
      setError('')

      const data = await getMovies(query)

      setMovies(data.results || [])

      if (data.results && data.results.length > 0) {
        fetchMovieDetails(data.results[0].id)
      } else {
        setSelectedMovie(null)
      }
    } catch {
      setError('Could not load movies.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchMovieDetails(id) {
    try {
      setDetailsLoading(true)

      const data = await getMovieDetails(id)
      setSelectedMovie(data)
    } catch {
      setError('Could not load movie details.')
    } finally {
      setDetailsLoading(false)
    }
  }

  function handleSearch(event) {
    event.preventDefault()
    fetchMovies(search)
  }

  function getTrailer() {
    if (!selectedMovie?.videos?.results) {
      return null
    }

    return selectedMovie.videos.results.find((video) => video.site === 'YouTube')
  }

  const trailer = getTrailer()

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-panel__top">
          <div className="hero-panel__nav">
            <div>
              <p className="eyebrow">Movie DB App</p>
              <h1>Discover real movies with a clean, simple movie dashboard.</h1>
            </div>
            <div className="hero-panel__badge">Live TMDB Data</div>
          </div>

          <div className="hero-panel__summary">
            <div className="summary-card">
              <span>Collection</span>
              <strong>{search ? 'Search results' : 'Popular movies'}</strong>
            </div>
            <div className="summary-card">
              <span>Results</span>
              <strong>{loading ? '...' : movies.length}</strong>
            </div>
            <div className="summary-card">
              <span>Selected</span>
              <strong>{selectedMovie?.title || 'None'}</strong>
            </div>
          </div>
        </div>

        <div className="hero-panel__content">
          <p className="eyebrow">Movie DB App</p>
          <h2>Search any movie and inspect the details panel instantly.</h2>
          <p className="hero-panel__text">
            Browse live TMDB data, open a movie card, and check rating, runtime, cast, and trailer without leaving the
            page.
          </p>
        </div>

        <form className="controls-panel" onSubmit={handleSearch}>
          <div className="search-box">
            <label htmlFor="movie-search">Search movies</label>
            <input
              id="movie-search"
              type="text"
              placeholder="Search any movie..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="action-row">
            <button type="submit" className="primary-button">
              Search
            </button>
            <button type="button" className="secondary-button" onClick={() => fetchMovies()}>
              Show Popular
            </button>
          </div>
        </form>
      </section>

      {error ? <p className="status-banner">{error}</p> : null}

      <section className="content-grid">
        <div className="catalog-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Movies</p>
              <h2>{search ? 'Search Results' : 'Popular Movies'}</h2>
            </div>
            <p className="section-heading__status">{loading ? 'Loading movies...' : `${movies.length} movies found`}</p>
          </div>

          <div className="poster-grid">
            {movies.map((movie) => (
              <button
                key={movie.id}
                className="movie-card"
                type="button"
                onClick={() => fetchMovieDetails(movie.id)}
              >
                <div className="movie-card__poster-wrap">
                  {movie.poster_path ? (
                    <img
                      className="movie-card__poster"
                      src={`${IMAGE_URL}${movie.poster_path}`}
                      alt={movie.title}
                    />
                  ) : (
                    <div className="movie-card__poster movie-card__poster--placeholder">No Image</div>
                  )}
                </div>

                <div className="movie-card__copy">
                  <div className="movie-card__eyebrow">
                    <span>{movie.release_date || 'No date'}</span>
                    <span>{movie.vote_average?.toFixed(1)}</span>
                  </div>
                  <h3>{movie.title}</h3>
                  <p>{movie.overview?.slice(0, 80) || 'No description'}...</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="details-panel">
          <div className="details-panel__header">
            <p className="eyebrow">Details</p>
            <h2>{detailsLoading ? 'Loading...' : selectedMovie?.title || 'Select a movie'}</h2>
          </div>

          {selectedMovie ? (
            <>
              <div className="details-panel__poster">
                {selectedMovie.poster_path ? (
                  <img src={`${IMAGE_URL}${selectedMovie.poster_path}`} alt={selectedMovie.title} />
                ) : (
                  <div className="movie-card__poster movie-card__poster--placeholder">No Image</div>
                )}
              </div>

              <div className="detail-stats">
                <div>
                  <span>Release Date</span>
                  <strong>{selectedMovie.release_date || 'No date'}</strong>
                </div>
                <div>
                  <span>Rating</span>
                  <strong>{selectedMovie.vote_average?.toFixed(1) || 'N/A'}</strong>
                </div>
                <div>
                  <span>Runtime</span>
                  <strong>{selectedMovie.runtime ? `${selectedMovie.runtime} min` : 'N/A'}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{selectedMovie.status || 'N/A'}</strong>
                </div>
              </div>

              <div className="detail-copy">
                <p className="detail-copy__genres">
                  {selectedMovie.genres?.map((genre) => genre.name).join(', ') || 'No genres'}
                </p>
                <p>{selectedMovie.overview || 'No overview available.'}</p>
              </div>

              <div className="detail-list">
                <h3>Cast</h3>
                <div className="pill-list">
                  {selectedMovie.credits?.cast?.slice(0, 5).map((actor) => (
                    <span key={actor.id} className="info-pill">
                      {actor.name}
                    </span>
                  ))}
                </div>
              </div>

              {trailer ? (
                <div className="details-panel__footer">
                  <span>Trailer available</span>
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Watch Trailer
                  </a>
                </div>
              ) : null}
            </>
          ) : (
            <div className="empty-state">Select a movie to see details.</div>
          )}
        </aside>
      </section>
    </main>
  )
}

export default App
