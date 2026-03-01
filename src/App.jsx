import { useState, useEffect } from 'react'

function App() {
  const API_URL = 'https://awf-api.lvl99.dev';

  // State variables for authentication, forums, posts, favorites, and view management
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [apiData, setApiData] = useState(null);
  
  const [selectedForum, setSelectedForum] = useState("");
  const [allForums, setAllForums] = useState([]);
  const [posts, setPosts] = useState([]);

  const [view, setView] = useState("home"); 
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("favIds")) || []);
  const [favPostDetails, setFavPostDetails] = useState([]);

  // Fetch token and user info on initial load
  useEffect(() => {
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: "jjones3511", 
        password: "8933511"     
      })
    })
    .then(res => res.json())
    .then(data => {
      setApiData(data);
      setToken(data.access_token); 
      setUserId(data.user.id);
      setUserName(`${data.user.firstName} ${data.user.lastName}`); 
    });
  }, []);

  // Fetch all forums once token is available
  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/forums`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        // log the forums data to verify its structure
        console.log("Fetched forums:", data);
        setAllForums(data);
      });
    }
  }, [token]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("favIds", JSON.stringify(favorites));
  }, [favorites]);

  // Fetch details for favorite posts when viewing favorites
  useEffect(() => {
    if (view === "favs" && token && favorites.length > 0) {
      Promise.all(
        favorites.map(id => 
          fetch(`${API_URL}/posts/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.json())
        )
      ).then(data => setFavPostDetails(data));
    }
  }, [view, favorites, token]);

  // Function to load posts for the selected forum
  const loadPosts = () => {
    if (!selectedForum || !token) return;
    fetch(`${API_URL}/forums/${selectedForum}?sortBy=hot&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setPosts(data); // limit is set in the API call, so we should get only 10 posts back
    });
  };

  // Function to toggle favorite status of a post
  const toggleFav = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030303', color: '#D7DADC', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Fancy Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #343536', paddingBottom: '15px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#D7DADC', fontSize: '28px', letterSpacing: '-0.5px' }}>🌐 Creddit Explorer</h1>
          {userName && (
            <div style={{ backgroundColor: '#1A1A1B', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', border: '1px solid #343536', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ height: '10px', width: '10px', backgroundColor: '#46D160', borderRadius: '50%', display: 'inline-block' }}></span>
              {userName}
            </div>
          )}
        </header>

        {/* Tabbed Navigation */}
        <nav style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button 
            onClick={() => setView("home")} 
            style={{ flex: 1, padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: view === "home" ? '#D7DADC' : '#1A1A1B', color: view === "home" ? '#1A1A1B' : '#D7DADC', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'all 0.2s' }}
          >
            🔍 Forum Search
          </button>
          <button 
            onClick={() => setView("favs")} 
            style={{ flex: 1, padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: view === "favs" ? '#D7DADC' : '#1A1A1B', color: view === "favs" ? '#1A1A1B' : '#D7DADC', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'all 0.2s' }}
          >
            ⭐ My Favorites ({favorites.length})
          </button>
        </nav>

        {view === "home" ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Control Panel / Search Area */}
            <div style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#F2F4F5' }}>Select a Forum</h3>
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#818384', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. funny" 
                    value={selectedForum}
                    onChange={(e) => setSelectedForum(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #343536', backgroundColor: '#272729', color: 'white', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#818384', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pick from List</label>
                  <select 
                    size="5" 
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #343536', backgroundColor: '#272729', color: 'white', boxSizing: 'border-box', outline: 'none' }}
                    onChange={(e) => setSelectedForum(e.target.value)}
                    value={selectedForum}
                  >
                    {allForums.map((forum) => (
                      <option key={forum.id} value={forum.slug} style={{ padding: '8px 5px', cursor: 'pointer' }}>{forum.slug}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #343536' }}>
                <div style={{ color: '#818384', fontSize: '15px' }}>
                  Target: <strong style={{ color: '#D7DADC', paddingLeft: '5px' }}>{selectedForum || "None Selected"}</strong>
                </div>
                <button onClick={loadPosts} style={{ backgroundColor: '#D93A00', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                  Load Top 10 Posts
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
              {posts.map((post) => (
                <div key={post.id} style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '8px', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#F2F4F5' }}>{post.title}</h4>
                  <p style={{ margin: '0 0 20px 0', color: '#D7DADC', lineHeight: '1.6', fontSize: '15px' }}>{post.content}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#818384', borderTop: '1px solid #272729', paddingTop: '15px' }}>
                    <span>Posted by <strong style={{ color: '#D7DADC' }}>u/{post.author}</strong> • {post.totalLikes} Likes</span>
                    <button 
                      onClick={() => toggleFav(post.id)}
                      style={{ 
                        backgroundColor: favorites.includes(post.id) ? '#272729' : 'transparent', 
                        border: '1px solid #343536', 
                        color: favorites.includes(post.id) ? '#FF4500' : '#D7DADC', 
                        padding: '8px 16px', 
                        borderRadius: '20px', 
                        cursor: 'pointer', 
                        fontWeight: 'bold' 
                      }}
                    >
                      {favorites.includes(post.id) ? "★ Unfavorite" : "☆ Favorite"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Favorites View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '22px', margin: '0 0 10px 0', color: '#F2F4F5' }}>Your Saved Content</h2>
            
            {favorites.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#1A1A1B', borderRadius: '12px', border: '2px dashed #343536', color: '#818384', fontSize: '16px' }}>
                No favorites saved yet. Go find something good!
              </div>
            )}
            
            {favPostDetails.map((post) => (
              <div key={post.id} style={{ backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '8px', padding: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#F2F4F5' }}>{post.title}</h4>
                <p style={{ margin: '0 0 20px 0', color: '#D7DADC', lineHeight: '1.6', fontSize: '15px' }}>{post.content}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#818384', borderTop: '1px solid #272729', paddingTop: '15px' }}>
                  <span>Posted by <strong style={{ color: '#D7DADC' }}>u/{post.author}</strong> • {post.totalLikes} Likes</span>
                  <button 
                    onClick={() => toggleFav(post.id)}
                    style={{ backgroundColor: 'transparent', border: '1px solid #343536', color: '#FF4500', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✖ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;