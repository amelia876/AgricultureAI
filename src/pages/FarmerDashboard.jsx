import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import './FarmerDashboard.css';

const FarmerDashboard = () => {
  const [user, setUser] = useState(null);
  const [farmData, setFarmData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Sample data - replace with actual API calls
  const sampleFarmData = {
    farmName: "Green Valley Farms",
    location: "California, USA",
    totalAcres: 250,
    mainCrops: ["Corn", "Soybeans", "Wheat"],
    soilHealth: 85,
    weather: {
      temperature: 72,
      condition: "Sunny",
      humidity: 65,
      rainfall: "0.2in"
    },
    marketPrices: {
      corn: 4.25,
      soybeans: 12.80,
      wheat: 6.45
    },
    tasks: [
      { id: 1, task: "Soil Testing", dueDate: "2024-01-15", priority: "high" },
      { id: 2, task: "Plant Corn", dueDate: "2024-03-01", priority: "medium" },
      { id: 3, task: "Irrigation Check", dueDate: "2024-01-20", priority: "low" }
    ],
    alerts: [
      { id: 1, type: "weather", message: "Frost warning tonight", severity: "high" },
      { id: 2, type: "pest", message: "Increased pest activity detected", severity: "medium" }
    ]
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
          }
          // Simulate loading farm data
          setTimeout(() => {
            setFarmData(sampleFarmData);
            setLoading(false);
          }, 1000);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
        <span>{subtitle}</span>
      </div>
    </div>
  );

  const TaskItem = ({ task, dueDate, priority }) => (
    <div className="task-item">
      <div className="task-info">
        <span className="task-text">{task}</span>
        <span className="task-due">{dueDate}</span>
      </div>
      <div className={`priority-badge ${priority}`}>
        {priority}
      </div>
    </div>
  );

  const AlertItem = ({ type, message, severity }) => (
    <div className={`alert-item ${severity}`}>
      <div className="alert-icon">
        {type === 'weather' ? '🌦️' : type === 'pest' ? '🐛' : '⚠️'}
      </div>
      <div className="alert-content">
        <p>{message}</p>
        <span className="alert-type">{type}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your farm data...</p>
      </div>
    );
  }

  return (
    <div className="farmer-dashboard">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🌱</span>
            <h2>AgricultureAI</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'crops' ? 'active' : ''}`}
            onClick={() => setActiveTab('crops')}
          >
            <span className="nav-icon">🌾</span>
            My Crops
          </button>
          <button 
            className={`nav-item ${activeTab === 'weather' ? 'active' : ''}`}
            onClick={() => setActiveTab('weather')}
          >
            <span className="nav-icon">🌤️</span>
            Weather
          </button>
          <button 
            className={`nav-item ${activeTab === 'market' ? 'active' : ''}`}
            onClick={() => setActiveTab('market')}
          >
            <span className="nav-icon">💰</span>
            Market Prices
          </button>
          <button 
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <span className="nav-icon">✅</span>
            Tasks
          </button>
          <button 
            className={`nav-item ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <span className="nav-icon">🤖</span>
            AI Assistant
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Welcome back, {user?.firstName}!
</h1>
            <p>Here's what's happening on your farm today</p>
          </div>
          <div className="header-actions">
            <button className="action-btn notification-btn">
              <span className="btn-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>
            <button className="action-btn settings-btn">
              <span className="btn-icon">⚙️</span>
            </button>
          </div>
        </header>

        {/* Alert Banner */}
        {farmData?.alerts && farmData.alerts.length > 0 && (
          <div className="alert-banner">
            <div className="alert-banner-icon">⚠️</div>
            <div className="alert-banner-content">
              <strong>Important Alerts:</strong> You have {farmData.alerts.length} active alerts that need attention.
            </div>
            <button className="alert-banner-btn">View All</button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Stats Grid */}
              <div className="stats-grid">
                <StatCard 
                  title="Soil Health" 
                  value={`${farmData?.soilHealth}%`} 
                  subtitle="Excellent"
                  icon="🌿"
                  color="green"
                />
                <StatCard 
                  title="Current Temp" 
                  value={`${farmData?.weather.temperature}°F`} 
                  subtitle={farmData?.weather.condition}
                  icon="🌡️"
                  color="blue"
                />
                <StatCard 
                  title="Corn Price" 
                  value={`$${farmData?.marketPrices.corn}`} 
                  subtitle="per bushel"
                  icon="💰"
                  color="yellow"
                />
                <StatCard 
                  title="Tasks Due" 
                  value={farmData?.tasks.length} 
                  subtitle="this week"
                  icon="✅"
                  color="purple"
                />
              </div>

              {/* Charts and Data Grid */}
              <div className="data-grid">
                <div className="data-card">
                  <h3>Recent Alerts</h3>
                  <div className="alerts-list">
                    {farmData?.alerts.map(alert => (
                      <AlertItem key={alert.id} {...alert} />
                    ))}
                  </div>
                </div>

                <div className="data-card">
                  <h3>Upcoming Tasks</h3>
                  <div className="tasks-list">
                    {farmData?.tasks.map(task => (
                      <TaskItem key={task.id} {...task} />
                    ))}
                  </div>
                </div>

                <div className="data-card weather-card">
                  <h3>Weather Forecast</h3>
                  <div className="weather-info">
                    <div className="weather-main">
                      <span className="weather-temp">{farmData?.weather.temperature}°F</span>
                      <span className="weather-condition">{farmData?.weather.condition}</span>
                    </div>
                    <div className="weather-details">
                      <div className="weather-detail">
                        <span>Humidity</span>
                        <strong>{farmData?.weather.humidity}%</strong>
                      </div>
                      <div className="weather-detail">
                        <span>Rainfall</span>
                        <strong>{farmData?.weather.rainfall}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="data-card crops-card">
                  <h3>My Crops</h3>
                  <div className="crops-list">
                    {farmData?.mainCrops.map((crop, index) => (
                      <div key={index} className="crop-item">
                        <span className="crop-icon">🌾</span>
                        <span className="crop-name">{crop}</span>
                        <span className="crop-status">Growing</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="ai-tab">
              <div className="ai-header">
                <h2>AI Farming Assistant</h2>
                <p>Get personalized recommendations for your farm</p>
              </div>
              <div className="ai-container">
                {/* You can integrate the MessageBot component here */}
                <div className="ai-placeholder">
                  <div className="ai-placeholder-icon">🤖</div>
                  <h3>AI Assistant Coming Soon</h3>
                  <p>Our intelligent farming assistant will help you with crop recommendations, pest control, and yield predictions.</p>
                  <button className="primary-btn">Get Notified</button>
                </div>
              </div>
            </div>
          )}

          {/* Add other tabs content similarly */}
          {activeTab !== 'overview' && activeTab !== 'ai' && (
            <div className="tab-placeholder">
              <div className="placeholder-icon">
                {activeTab === 'crops' && '🌾'}
                {activeTab === 'weather' && '🌤️'}
                {activeTab === 'market' && '💰'}
                {activeTab === 'tasks' && '✅'}
              </div>
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Features Coming Soon</h2>
              <p>We're working hard to bring you the best farming tools and insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;