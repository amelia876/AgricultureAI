import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";


import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import './FarmerDashBoard.css';

const FarmerDashboard = () => {
  const [user, setUser] = useState(null);
  const [farmData, setFarmData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Crop Management State
  const [crops, setCrops] = useState([]);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropStats, setCropStats] = useState({
    totalCrops: 0,
    averageHealth: 0,
    harvestingSoon: 0,
    harvested: 0,
    currentMonthCrops: 0
  });
  
  // New Crop Form State
  const [newCrop, setNewCrop] = useState({
    name: '',
    type: '',
    plantedDate: '',
    expectedHarvestDate: '',
    actualHarvestDate: '',
    area: '',
    health: 85,
    notes: ''
  });

  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Enhanced sample data
  const sampleFarmData = {
    farmName: "Green Valley Farms",
    location: "California, USA",
    totalAcres: 250,
    soilHealth: 85,
    weather: {
      current: {
        temperature: 72,
        condition: "Sunny",
        humidity: 65,
        rainfall: "0.2in",
        windSpeed: "8 mph"
      },
      forecast: [
        { day: "Today", high: 72, low: 58, condition: "Sunny", precipitation: 10 },
        { day: "Tomorrow", high: 68, low: 55, condition: "Partly Cloudy", precipitation: 20 },
        { day: "Wed", high: 70, low: 56, condition: "Cloudy", precipitation: 30 },
        { day: "Thu", high: 65, low: 52, condition: "Rain", precipitation: 80 },
        { day: "Fri", high: 67, low: 54, condition: "Partly Cloudy", precipitation: 20 }
      ]
    },
    marketPrices: {
      corn: { current: 4.25, change: 0.15, trend: "up" },
      soybeans: { current: 12.80, change: -0.30, trend: "down" },
      wheat: { current: 6.45, change: 0.08, trend: "up" },
      cotton: { current: 0.85, change: 0.02, trend: "up" }
    },
    tasks: [
      { id: 1, task: "Soil Testing", dueDate: "2024-01-15", priority: "high", completed: false },
      { id: 2, task: "Plant Corn", dueDate: "2024-03-01", priority: "medium", completed: false },
      { id: 3, task: "Irrigation Check", dueDate: "2024-01-20", priority: "low", completed: true }
    ],
    alerts: [
      { id: 1, type: "weather", message: "Frost warning tonight", severity: "high", timestamp: "2024-01-10T08:00:00" },
      { id: 2, type: "pest", message: "Increased pest activity detected", severity: "medium", timestamp: "2024-01-09T14:30:00" }
    ]
  };

  // Load messages from Firebase
  const loadMessages = (userId) => {
    const messagesQuery = query(
      collection(db, "messages"),
      where("userId", "==", userId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
    });

    return unsubscribe;
  };

  // Send message to Firebase
const sendMessage = async () => {
  if (newMessage.trim() === '') return;

  try {
    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Call your Express backend instead of Firebase
    const response = await fetch("http://localhost:4000/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ message: newMessage })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    // Add AI response to UI
    const botMessage = {
      id: Date.now() + 1,
      text: data.response || "Sorry, I couldn't understand that.",
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
    
  } catch (error) {
    console.error("Error sending message:", error);
    const errorMessage = {
      id: Date.now() + 1,
      text: `⚠️ Error: ${error.message}`,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};

// Remove the generateAIResponse function entirely

  /*
  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const messageData = {
        text: newMessage,
        userId: currentUser.uid,
        userName: `${user?.firstName} ${user?.lastName}`,
        timestamp: serverTimestamp(),
        type: 'user'
      };

      await addDoc(collection(db, "messages"), messageData);
      setNewMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        generateAIResponse(newMessage);
      }, 1000);
      
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Generate AI response
  const generateAIResponse = async (userMessage) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const lowerMessage = userMessage.toLowerCase();
      let response = "I'm here to help with your farming questions! How can I assist you today?";

      // Simple response logic based on keywords
      if (lowerMessage.includes('weather') || lowerMessage.includes('rain')) {
        response = `Based on your location, the current weather is ${farmData?.weather.current.condition} with a temperature of ${farmData?.weather.current.temperature}°F. There's ${farmData?.weather.current.rainfall} of rainfall expected today.`;
      } else if (lowerMessage.includes('crop') || lowerMessage.includes('plant')) {
        response = `You currently have ${cropStats.totalCrops} crops. ${cropStats.harvestingSoon > 0 ? `${cropStats.harvestingSoon} crops are ready for harvest soon. ` : ''}Your average crop health is ${cropStats.averageHealth}%.`;
      } else if (lowerMessage.includes('price') || lowerMessage.includes('market')) {
        response = `Current market prices: Corn $${farmData?.marketPrices.corn.current}, Soybeans $${farmData?.marketPrices.soybeans.current}, Wheat $${farmData?.marketPrices.wheat.current}.`;
      } else if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
        const pendingTasks = farmData?.tasks.filter(t => !t.completed).length || 0;
        response = `You have ${pendingTasks} pending tasks. ${pendingTasks > 0 ? 'Check your tasks tab to manage them.' : 'Great job staying on top of your tasks!'}`;
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = `Hello ${user?.firstName}! I'm your farming assistant. I can help you with weather updates, crop management, market prices, and task tracking.`;
      }

      const aiMessageData = {
        text: response,
        userId: currentUser.uid,
        userName: "Farm Assistant",
        timestamp: serverTimestamp(),
        type: 'ai'
      };

      await addDoc(collection(db, "messages"), aiMessageData);
    } catch (error) {
      console.error("Error generating AI response:", error);
    }
  };

  */

  // Calculate crop statistics
  const calculateCropStats = (cropsData) => {
    const totalCrops = cropsData.length;
    const averageHealth = totalCrops > 0 
      ? Math.round(cropsData.reduce((acc, crop) => acc + (crop.health || 0), 0) / totalCrops)
      : 0;
    
    const harvestingSoon = cropsData.filter(crop => {
      if (crop.actualHarvestDate) return false;
      if (!crop.expectedHarvestDate) return false;
      
      const harvestDate = new Date(crop.expectedHarvestDate);
      const today = new Date();
      const daysUntilHarvest = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
      
      return daysUntilHarvest <= 30 && daysUntilHarvest > 0;
    }).length;

    const harvested = cropsData.filter(crop => crop.actualHarvestDate).length;

    const currentMonthCrops = cropsData.filter(crop => {
      if (!crop.plantedDate) return false;
      const plantedDate = new Date(crop.plantedDate);
      const today = new Date();
      return plantedDate.getMonth() === today.getMonth() && 
             plantedDate.getFullYear() === today.getFullYear();
    }).length;

    setCropStats({
      totalCrops,
      averageHealth,
      harvestingSoon,
      harvested,
      currentMonthCrops
    });
  };

  // Load crops from Firebase
  const loadUserCrops = (userId) => {
    const cropsQuery = query(
      collection(db, "crops"),
      where("userId", "==", userId),
      orderBy("plantedDate", "desc")
    );

    const unsubscribe = onSnapshot(cropsQuery, (snapshot) => {
      const cropsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCrops(cropsData);
      calculateCropStats(cropsData);
    });

    return unsubscribe;
  };

  // Add new crop to Firebase
  const handleAddCrop = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const cropData = {
        ...newCrop,
        userId: currentUser.uid,
        status: newCrop.actualHarvestDate ? 'harvested' : 'growing',
        createdAt: new Date().toISOString(),
        area: parseFloat(newCrop.area) || 0,
        health: parseInt(newCrop.health) || 85
      };

      await addDoc(collection(db, "crops"), cropData);
      
      setNewCrop({
        name: '', type: '', plantedDate: '', expectedHarvestDate: '',
        actualHarvestDate: '', area: '', health: 85, notes: ''
      });
      setShowAddCropModal(false);
    } catch (error) {
      console.error("Error adding crop:", error);
      alert("Error adding crop. Please try again.");
    }
  };

  // Delete crop from Firebase
  const handleDeleteCrop = async (cropId) => {
    if (window.confirm("Are you sure you want to delete this crop?")) {
      try {
        await deleteDoc(doc(db, "crops", cropId));
        setSelectedCrop(null);
      } catch (error) {
        console.error("Error deleting crop:", error);
        alert("Error deleting crop. Please try again.");
      }
    }
  };

  // Mark crop as harvested
  const handleMarkAsHarvested = async (cropId) => {
    try {
      const cropRef = doc(db, "crops", cropId);
      await updateDoc(cropRef, {
        actualHarvestDate: new Date().toISOString().split('T')[0],
        status: 'harvested'
      });
    } catch (error) {
      console.error("Error marking crop as harvested:", error);
    }
  };

  // Get crop status
  const getCropStatus = (crop) => {
    if (crop.actualHarvestDate) return 'harvested';
    if (crop.expectedHarvestDate) {
      const harvestDate = new Date(crop.expectedHarvestDate);
      const today = new Date();
      const daysUntilHarvest = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));
      if (daysUntilHarvest <= 0) return 'ready-to-harvest';
      if (daysUntilHarvest <= 30) return 'harvesting-soon';
    }
    return 'growing';
  };

  // Get status color and text
  const getStatusInfo = (status) => {
    switch (status) {
      case 'harvested': return { text: 'Harvested', color: '#6b7280', bgColor: '#f3f4f6' };
      case 'ready-to-harvest': return { text: 'Ready to Harvest', color: '#dc2626', bgColor: '#fee2e2' };
      case 'harvesting-soon': return { text: 'Harvesting Soon', color: '#d97706', bgColor: '#fef3c7' };
      default: return { text: 'Growing', color: '#059669', bgColor: '#d1fae5' };
    }
  };

  // Calculate days until harvest
  const getDaysUntilHarvest = (expectedHarvestDate) => {
    if (!expectedHarvestDate) return null;
    const harvestDate = new Date(expectedHarvestDate);
    const today = new Date();
    const difference = harvestDate - today;
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
            loadUserCrops(currentUser.uid);
            loadMessages(currentUser.uid);
          }
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAddTask = () => {
    if (newTask.trim() && newTaskDueDate) {
      const newTaskObj = {
        id: Date.now(),
        task: newTask,
        dueDate: newTaskDueDate,
        priority: newTaskPriority,
        completed: false
      };
      
      setFarmData(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTaskObj]
      }));
      
      setNewTask('');
      setNewTaskDueDate('');
      setNewTaskPriority('medium');
    }
  };

  const handleToggleTask = (taskId) => {
    setFarmData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const handleDeleteTask = (taskId) => {
    setFarmData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Component Definitions
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

  const TaskItem = ({ task, dueDate, priority, completed, onToggle, onDelete }) => (
    <div className={`task-item ${completed ? 'completed' : ''}`}>
      <div className="task-checkbox">
        <input type="checkbox" checked={completed} onChange={onToggle} />
      </div>
      <div className="task-info">
        <span className="task-text">{task}</span>
        <span className="task-due">{dueDate}</span>
      </div>
      <div className="task-actions">
        <div className={`priority-badge ${priority}`}>{priority}</div>
        <button className="delete-task-btn" onClick={onDelete}>🗑️</button>
      </div>
    </div>
  );

  const AlertItem = ({ type, message, severity, timestamp }) => (
    <div className={`alert-item ${severity}`}>
      <div className="alert-icon">
        {type === 'weather' ? '🌦️' : type === 'pest' ? '🐛' : '⚠️'}
      </div>
      <div className="alert-content">
        <p>{message}</p>
        <div className="alert-meta">
          <span className="alert-type">{type}</span>
          <span className="alert-time">{new Date(timestamp).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  const CropItem = ({ crop }) => {
    const status = getCropStatus(crop);
    const statusInfo = getStatusInfo(status);
    const daysUntilHarvest = getDaysUntilHarvest(crop.expectedHarvestDate);

    return (
      <div className="crop-card">
        <div className="crop-item">
          <div className="crop-icon">🌾</div>
          <div className="crop-details">
            <div className="crop-header">
              <span className="crop-name">{crop.name}</span>
              <span className="crop-status" style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}>
                {statusInfo.text}
              </span>
            </div>
            <div className="crop-info">
              <span>Planted: {new Date(crop.plantedDate).toLocaleDateString()}</span>
              {crop.expectedHarvestDate && <span>Expected: {new Date(crop.expectedHarvestDate).toLocaleDateString()}</span>}
              {crop.area && <span>Area: {crop.area} acres</span>}
            </div>
            {daysUntilHarvest !== null && status === 'growing' && (
              <div className="crop-harvest-countdown">
                <span className="countdown-text">
                  {daysUntilHarvest > 0 ? `${daysUntilHarvest} days until harvest` : 'Ready for harvest!'}
                </span>
              </div>
            )}
            <div className="crop-health">
              <div className="health-bar">
                <div className="health-progress" style={{ width: `${crop.health}%` }}></div>
              </div>
              <span className="health-value">{crop.health}%</span>
            </div>
          </div>
        </div>
        <div className="crop-actions">
          <button className="btn-secondary" onClick={() => setSelectedCrop(crop)}>View Details</button>
          {status !== 'harvested' && (
            <button className="btn-warning" onClick={() => handleMarkAsHarvested(crop.id)}>Mark Harvested</button>
          )}
        </div>
      </div>
    );
  };

  const WeatherDay = ({ day, high, low, condition, precipitation }) => (
    <div className="weather-day">
      <div className="weather-day-header">
        <span className="weather-day-name">{day}</span>
        <span className="weather-condition-icon">
          {condition === 'Sunny' && '☀️'}
          {condition === 'Partly Cloudy' && '⛅'}
          {condition === 'Cloudy' && '☁️'}
          {condition === 'Rain' && '🌧️'}
        </span>
      </div>
      <div className="weather-temps">
        <span className="weather-high">{high}°</span>
        <span className="weather-low">{low}°</span>
      </div>
      <div className="weather-precipitation">
        <span className="precipitation-icon">💧</span>
        <span>{precipitation}%</span>
      </div>
    </div>
  );

  const MarketPriceItem = ({ crop, price, change, trend }) => (
    <div className="market-price-item">
      <div className="crop-info">
        <span className="crop-icon">🌾</span>
        <span className="crop-name">{crop}</span>
      </div>
      <div className="price-info">
        <span className="current-price">${price}</span>
        <div className={`price-change ${trend}`}>
          <span className="change-icon">{trend === 'up' ? '↗️' : '↘️'}</span>
          <span className="change-amount">${Math.abs(change).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  // Chat Component
  const ChatBox = () => (
    <div className={`chat-box ${showChat ? 'active' : ''}`}>
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-icon">🤖</span>
          Farm Assistant
        </div>
        <button className="chat-close" onClick={() => setShowChat(false)}>×</button>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-icon">💬</div>
            <p>Start a conversation with your farm assistant!</p>
            <small>Ask about weather, crops, prices, or tasks.</small>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'ai' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                <div className="message-sender">{message.userName}</div>
                <div className="message-text">{message.text}</div>
                <div className="message-time">
                  {message.timestamp?.toDate?.() ? new Date(message.timestamp.toDate()).toLocaleTimeString() : 'Just now'}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask about your farm..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="chat-text-input"
        />
        <button onClick={sendMessage} className="chat-send-btn">
          Send
        </button>
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
            <h2>YaadWise</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <span className="nav-icon">📊</span> Overview
          </button>
          <button className={`nav-item ${activeTab === 'crops' ? 'active' : ''}`} onClick={() => setActiveTab('crops')}>
            <span className="nav-icon">🌾</span> My Crops
          </button>
          <button className={`nav-item ${activeTab === 'weather' ? 'active' : ''}`} onClick={() => setActiveTab('weather')}>
            <span className="nav-icon">🌤️</span> Weather
          </button>
          <button className={`nav-item ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>
            <span className="nav-icon">💰</span> Market Prices
          </button>
          <button className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
            <span className="nav-icon">✅</span> Tasks
          </button>
          <button className={`nav-item ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
            <span className="nav-icon">🤖</span> AI Assistant
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            <div className="user-details">
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Welcome back, {user?.firstName}!</h1>
            <p>Here's what's happening on your farm today</p>
          </div>
          <div className="header-actions">
            <button className="action-btn chat-toggle-btn" onClick={() => setShowChat(!showChat)}>
              <span className="btn-icon">💬</span>
            </button>
            <button className="action-btn notification-btn">
              <span className="btn-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>
            <button className="action-btn settings-btn">
              <span className="btn-icon">⚙️</span>
            </button>
          </div>
        </header>

        {/* Smart Alert Banner */}
        {(farmData?.alerts?.length > 0 || cropStats.currentMonthCrops > 0 || cropStats.harvestingSoon > 0) && (
          <div className="alert-banner">
            <div className="alert-banner-icon">
              {cropStats.harvestingSoon > 0 ? '🚜' : cropStats.currentMonthCrops > 0 ? '🌱' : '⚠️'}
            </div>
            <div className="alert-banner-content">
              <strong>Farm Update:</strong>
              {cropStats.currentMonthCrops > 0 && (
                <span className="alert-item">
                  <span className="alert-emoji">🌱</span>
                  You planted {cropStats.currentMonthCrops} {cropStats.currentMonthCrops === 1 ? 'crop' : 'crops'} this month.
                </span>
              )}
              {cropStats.harvestingSoon > 0 && (
                <span className="alert-item">
                  <span className="alert-emoji">🚜</span>
                  {cropStats.harvestingSoon} {cropStats.harvestingSoon === 1 ? 'crop is' : 'crops are'} ready for harvest soon.
                </span>
              )}
              {farmData?.alerts && farmData.alerts.length > 0 && (
                <span className="alert-item">
                  <span className="alert-emoji">⚠️</span>
                  {farmData.alerts.length} active {farmData.alerts.length === 1 ? 'alert' : 'alerts'} need attention.
                </span>
              )}
            </div>
            <button className="alert-banner-btn" onClick={() => setActiveTab('crops')}>Manage Crops</button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <StatCard title="Soil Health" value={`${farmData?.soilHealth}%`} subtitle="Excellent" icon="🌿" color="green" />
                <StatCard title="Current Temp" value={`${farmData?.weather.current.temperature}°F`} subtitle={farmData?.weather.current.condition} icon="🌡️" color="blue" />
                <StatCard title="Corn Price" value={`$${farmData?.marketPrices.corn.current}`} subtitle="per bushel" icon="💰" color="yellow" />
                <StatCard title="Tasks Due" value={farmData?.tasks.filter(t => !t.completed).length} subtitle="pending" icon="✅" color="purple" />
              </div>

              <div className="data-grid">
                <div className="data-card">
                  <h3>Recent Alerts</h3>
                  <div className="alerts-list">
                    {farmData?.alerts.map(alert => <AlertItem key={alert.id} {...alert} />)}
                  </div>
                </div>

                <div className="data-card">
                  <h3>Upcoming Tasks</h3>
                  <div className="tasks-list">
                    {farmData?.tasks.slice(0, 3).map(task => (
                      <TaskItem key={task.id} {...task} onToggle={() => handleToggleTask(task.id)} onDelete={() => handleDeleteTask(task.id)} />
                    ))}
                  </div>
                </div>

                <div className="data-card weather-card">
                  <h3>Weather Forecast</h3>
                  <div className="weather-info">
                    <div className="weather-main">
                      <span className="weather-temp">{farmData?.weather.current.temperature}°F</span>
                      <span className="weather-condition">{farmData?.weather.current.condition}</span>
                    </div>
                    <div className="weather-details">
                      <div className="weather-detail">
                        <span>Humidity</span>
                        <strong>{farmData?.weather.current.humidity}%</strong>
                      </div>
                      <div className="weather-detail">
                        <span>Wind</span>
                        <strong>{farmData?.weather.current.windSpeed}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="data-card crops-card">
                  <h3>My Crops</h3>
                  <div className="crops-list">
                    {crops.slice(0, 2).map((crop) => <CropItem key={crop.id} crop={crop} />)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crops' && (
            <div className="crops-tab">
              <div className="tab-header">
                <div className="header-content">
                  <h2>My Crops</h2>
                  <p>Manage and monitor your crop progress</p>
                </div>
                <button className="btn-primary add-crop-btn" onClick={() => setShowAddCropModal(true)}>+ Add New Crop</button>
              </div>
              
              <div className="crop-stats">
                <div className="stat-item"><span className="stat-value">{cropStats.totalCrops}</span><span className="stat-label">Total Crops</span></div>
                <div className="stat-item"><span className="stat-value">{cropStats.averageHealth}%</span><span className="stat-label">Average Health</span></div>
                <div className="stat-item"><span className="stat-value">{cropStats.harvestingSoon}</span><span className="stat-label">Harvesting Soon</span></div>
                <div className="stat-item"><span className="stat-value">{cropStats.harvested}</span><span className="stat-label">Harvested</span></div>
              </div>
              
              <div className="crops-grid">
                {crops.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🌾</div>
                    <h3>No Crops Added Yet</h3>
                    <p>Start by adding your first crop to track its progress.</p>
                    <button className="btn-primary" onClick={() => setShowAddCropModal(true)}>Add Your First Crop</button>
                  </div>
                ) : (
                  crops.map(crop => <CropItem key={crop.id} crop={crop} />)
                )}
              </div>
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="weather-tab">
              <div className="tab-header">
                <h2>Weather Forecast</h2>
                <p>7-day weather outlook for your farm</p>
              </div>
              <div className="current-weather">
                <div className="current-weather-card">
                  <h3>Current Conditions</h3>
                  <div className="current-weather-content">
                    <div className="current-temp">
                      <span className="temp-value">{farmData?.weather.current.temperature}°F</span>
                      <span className="temp-feels">Feels like {farmData?.weather.current.temperature + 2}°F</span>
                    </div>
                    <div className="current-details">
                      <div className="weather-detail-item"><span>Humidity</span><span>{farmData?.weather.current.humidity}%</span></div>
                      <div className="weather-detail-item"><span>Wind</span><span>{farmData?.weather.current.windSpeed}</span></div>
                      <div className="weather-detail-item"><span>Rainfall</span><span>{farmData?.weather.current.rainfall}</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="forecast-section">
                <h3>5-Day Forecast</h3>
                <div className="forecast-grid">
                  {farmData?.weather.forecast.map((day, index) => <WeatherDay key={index} {...day} />)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="market-tab">
              <div className="tab-header">
                <h2>Market Prices</h2>
                <p>Current commodity prices and trends</p>
              </div>
              <div className="market-prices-grid">
                <MarketPriceItem crop="Corn" price={farmData?.marketPrices.corn.current} change={farmData?.marketPrices.corn.change} trend={farmData?.marketPrices.corn.trend} />
                <MarketPriceItem crop="Soybeans" price={farmData?.marketPrices.soybeans.current} change={farmData?.marketPrices.soybeans.change} trend={farmData?.marketPrices.soybeans.trend} />
                <MarketPriceItem crop="Wheat" price={farmData?.marketPrices.wheat.current} change={farmData?.marketPrices.wheat.change} trend={farmData?.marketPrices.wheat.trend} />
                <MarketPriceItem crop="Cotton" price={farmData?.marketPrices.cotton.current} change={farmData?.marketPrices.cotton.change} trend={farmData?.marketPrices.cotton.trend} />
              </div>
              <div className="market-insights">
                <h3>Market Insights</h3>
                <div className="insights-grid">
                  <div className="insight-card">
                    <div className="insight-icon">📈</div>
                    <div className="insight-content">
                      <h4>Corn Prices Rising</h4>
                      <p>Corn prices have increased by 3.6% this week due to export demand.</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">📉</div>
                    <div className="insight-content">
                      <h4>Soybeans Dip</h4>
                      <p>Soybean prices down 2.3% on increased South American production.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="tasks-tab">
              <div className="tab-header">
                <h2>Farm Tasks</h2>
                <p>Manage your daily farming activities</p>
              </div>
              <div className="task-management">
                <div className="add-task-section">
                  <h3>Add New Task</h3>
                  <div className="add-task-form">
                    <input type="text" placeholder="Task description..." value={newTask} onChange={(e) => setNewTask(e.target.value)} className="task-input" />
                    <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="task-date-input" />
                    <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="task-priority-select">
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <button onClick={handleAddTask} className="btn-primary">Add Task</button>
                  </div>
                </div>
                <div className="tasks-section">
                  <h3>All Tasks</h3>
                  <div className="tasks-list-full">
                    {farmData?.tasks.map(task => (
                      <TaskItem key={task.id} {...task} onToggle={() => handleToggleTask(task.id)} onDelete={() => handleDeleteTask(task.id)} />
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
                <div className="ai-placeholder">
                  <div className="ai-placeholder-icon">🤖</div>
                  <h3>Farm Assistant Ready</h3>
                  <p>Your AI farming assistant is here to help with crop recommendations, pest control, weather insights, and yield predictions.</p>
                  <button className="primary-btn" onClick={() => setShowChat(true)}>Start Chat</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Box */}
      <ChatBox />

      {/* Chat Toggle Button (when chat is closed) */}
      {!showChat && (
        <button className="chat-floating-btn" onClick={() => setShowChat(true)}>
          <span className="chat-floating-icon">💬</span>
        </button>
      )}
    </div>
  );
};

export default FarmerDashboard;