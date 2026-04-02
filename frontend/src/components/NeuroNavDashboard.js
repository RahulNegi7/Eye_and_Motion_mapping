import React, { useState, useEffect } from "react";
import EEGWave from './EEGWave'; // Import the EEG component
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Brain, Heart, Smile, Target, Activity } from "lucide-react";

const NeuroNavDashboard = () => {
  const [activeTab, setActiveTab] = useState("Last 24 Hours");
  const [sentimentData, setSentimentData] = useState({
    sentiment: 0,
    anxiety: 0,
    depression: 0,
    stress: 0,
    weeklyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [showSentimentAnalysis, setShowSentimentAnalysis] = useState(false);
  
  useEffect(() => {
    // Fetch sentiment data when component mounts
    fetchSentimentData();
  }, []);

  const fetchSentimentData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5001/api/analyzeConversation",
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setSentimentData(data);
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
      // Set mock data if API call fails
      setSentimentData({
        sentiment: 65,
        anxiety: 42,
        depression: 35,
        stress: 48,
        weeklyData: [
          {
            date: "03/01",
            sentiment: 58,
            anxiety: 50,
            depression: 42,
            stress: 55,
          },
          {
            date: "03/02",
            sentiment: 60,
            anxiety: 47,
            depression: 40,
            stress: 53,
          },
          {
            date: "03/03",
            sentiment: 62,
            anxiety: 45,
            depression: 38,
            stress: 51,
          },
          {
            date: "03/04",
            sentiment: 63,
            anxiety: 44,
            depression: 37,
            stress: 50,
          },
          {
            date: "03/05",
            sentiment: 64,
            anxiety: 43,
            depression: 36,
            stress: 49,
          },
          {
            date: "03/06",
            sentiment: 65,
            anxiety: 42,
            depression: 35,
            stress: 48,
          },
          {
            date: "03/07",
            sentiment: 67,
            anxiety: 40,
            depression: 33,
            stress: 46,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureCardClick = (feature) => {
    switch (feature) {
      case "sentiment-analysis":
        setShowSentimentAnalysis(true);
        break;
      case "virtual-environments":
        alert("Launching 3D Virtual Environment...");
        break;
      case "games":
        alert("Opening Neural Games...");
        break;
      default:
        break;
    }
  };

  const handleBackToStart = () => {
    alert("Redirecting to NeuroNav.js page...");
  };

  const getMoodLabel = (sentiment) => {
    if (sentiment >= 80) return "Very Positive";
    if (sentiment >= 60) return "Positive";
    if (sentiment >= 40) return "Neutral";
    if (sentiment >= 20) return "Negative";
    return "Very Negative";
  };

  const getStressLevel = (stress) => {
    if (stress <= 30) return "Low";
    if (stress <= 60) return "Moderate";
    return "High";
  };

  const getEmotionalState = (anxiety, depression) => {
    const average = (anxiety + depression) / 2;
    if (average <= 30) return "Stable";
    if (average <= 60) return "Mixed";
    return "Concerning";
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#19212E",
            padding: "10px",
            border: "1px solid #2A3346",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: "2px 0" }}>
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Sentiment Analysis Component
  const SentimentAnalysisView = () => {
    if (loading) {
      return (
        <div
          style={{
            backgroundColor: "#19212E",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "400px",
          }}
        >
          <div
            style={{
              animation: "spin 2s linear infinite",
              marginBottom: "20px",
            }}
          >
            <Brain size={48} color="#8454EE" />
          </div>
          <p>Analyzing conversation sentiment...</p>
        </div>
      );
    }

    return (
      <div
        style={{
          backgroundColor: "#19212E",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Brain size={24} color="#8454EE" />
            Conversation Sentiment Analysis
          </div>

          <Button onClick={() => setShowSentimentAnalysis(false)}>
            Close Analysis
          </Button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <MetricCard
            icon={<Heart size={24} color="#8454EE" />}
            title="Overall Mood"
            value={getMoodLabel(sentimentData.sentiment)}
            color="#8454EE"
          />

          <MetricCard
            icon={<Target size={24} color="#EF4444" />}
            title="Stress Level"
            value={getStressLevel(sentimentData.stress)}
            color="#EF4444"
          />

          <MetricCard
            icon={<Activity size={24} color="#3B82F6" />}
            title="Emotional State"
            value={getEmotionalState(
              sentimentData.anxiety,
              sentimentData.depression
            )}
            color="#3B82F6"
          />
        </div>

        <div style={{ height: "300px", marginTop: "30px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sentimentData.weeklyData}
              margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
              <XAxis dataKey="date" stroke="#8c9abe" />
              <YAxis domain={[0, 100]} stroke="#8c9abe" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                name="Sentiment"
                dataKey="sentiment"
                stroke="#8454EE"
                strokeWidth={2}
                dot={{ fill: "#8454EE", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                name="Anxiety"
                dataKey="anxiety"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                name="Depression"
                dataKey="depression"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                name="Stress"
                dataKey="stress"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <Button secondary>Export Analysis</Button>
          <Button>Generate Detailed Report</Button>
        </div>
      </div>
    );
  };

  const MetricCard = ({ icon, title, value, color }) => (
    <div
      style={{
        backgroundColor: "rgba(25, 33, 46, 0.7)",
        padding: "15px",
        borderRadius: "10px",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "10px",
          gap: "10px",
        }}
      >
        {icon}
        <div style={{ fontSize: "14px" }}>{title}</div>
      </div>

      <div style={{ fontSize: "20px", fontWeight: "bold" }}>{value}</div>
    </div>
  );

  // Enhanced consistent box style for all feature boxes
  const FeatureBox = ({ title, icon, children, height = "auto" }) => (
    <div
      style={{
        backgroundColor: "#19212E",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
        marginBottom: "20px",
        height: height,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginBottom: "15px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "rgba(132, 84, 238, 0.2)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#131928",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: "240px",
            backgroundColor: "#19212E",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "40px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                backgroundColor: "#8454EE",
                borderRadius: "8px",
                marginRight: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              N
            </div>
            NeuroNav
          </div>

          <NavItem active={true} icon="📊" label="Dashboard" />
          <NavItem icon="📈" label="Analytics" />
          <NavItem icon="⚙️" label="Settings" />
          <NavItem icon="📁" label="Projects" />
          <NavItem icon="👤" label="Profile" />

          <div style={{ marginTop: "auto" }}>
            <NavItem
              icon="🔙"
              label="Back to Start"
              onClick={handleBackToStart}
            />
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: "30px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              Neural Dashboard
            </div>

            <div
              style={{
                position: "relative",
                width: "260px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                🔍
              </div>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  width: "100%",
                  padding: "10px 15px 10px 40px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#19212E",
                  color: "white",
                  fontSize: "14px",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div style={{ fontWeight: "500" }}>Admin User</div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#8454EE",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                👤
              </div>
            </div>
          </div>
          
          {showSentimentAnalysis && <SentimentAnalysisView />}

          {/* 1. Sentiment Analysis Box */}
          <FeatureBox title="Sentiment Analysis" icon="🤖">
            <p style={{ marginBottom: "15px" }}>
              Chat with a chatbot and get an analyzed Sentiment Analysis. Discover emotion patterns
              and gain insights into your conversational well-being.
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "auto",
              }}
            >
              <Button onClick={() => handleFeatureCardClick("sentiment-analysis")}>
                Run Analysis
              </Button>
              <Button onClick={() => window.location.href = "http://localhost:3001"}>
                Start Conversation
              </Button>
            </div>
          </FeatureBox>

          {/* 2. Eye Tracking Games Box */}
          <FeatureBox title="Eye Tracking Games" icon="🎮">
            <p style={{ marginBottom: "15px" }}>
              Control games with your eye movements. Enhance coordination and focus with
              specialized eye-tracking technology.
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "auto",
              }}
            >
              <Button onClick={() => window.location.href = "http://localhost:7002"}>
                Plane Control Aviator
              </Button>
              <Button secondary onClick={() => alert("FPS game will be linked soon")}>
                3D FPS Game
              </Button>
            </div>
          </FeatureBox>

          {/* 3. Virtual Environments Box */}
          <FeatureBox title="3D Virtual Environments" icon="🌐">
            <p style={{ marginBottom: "15px" }}>
              Explore immersive neural landscapes and interact with 3D visualizations of brain 
              activity. Navigate through complex mental patterns in an interactive environment.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: "10px",
                marginTop: "auto",
              }}
            >
              <Button onClick={() => window.location.href = "http://localhost:6002"}>
                Launch Environment
              </Button>
            </div>
          </FeatureBox>

          {/* 4. Neural Activity Box (EEGWave component) */}
          <FeatureBox title="Neural Activity" icon="📊">
            <EEGWave />
          </FeatureBox>

          {/* Bottom Cards Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <FeatureBox title="Recent Activity" icon="📈" height="100%">
              <div style={{ marginBottom: "15px" }}>
                <ActivityItem
                  label="Sentiment Analysis Session"
                  time="2 hours ago"
                />
                <ActivityItem
                  label="Neural Training Complete"
                  time="Yesterday"
                />
                <ActivityItem label="Model Update" time="2 days ago" />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginTop: "auto",
                }}
              >
                <Button secondary>View All</Button>
              </div>
            </FeatureBox>

            <FeatureBox title="Performance Metrics" icon="📊" height="100%">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                }}
              >
                <StatItem value="92%" label="Accuracy" />
                <StatItem value="3.2ms" label="Response Time" />
                <StatItem value="8.7k" label="Processes" />
                <StatItem value="64GB" label="Memory Usage" />
              </div>
            </FeatureBox>

            <FeatureBox title="Quick Actions" icon="🚀" height="100%">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <Button>Run Scan</Button>
                <Button>New Project</Button>
                <Button>Generate Report</Button>
                <Button>Share Results</Button>
              </div>
            </FeatureBox>
            <FeatureBox title="Social Media Integration" icon="📱">
  <p style={{ marginBottom: "15px" }}>
    Connect your social media accounts and analyze engagement patterns through neural navigation. 
    Get insights into your online presence and optimize your social interactions.
  </p>
  <div
    style={{
      display: "flex",
      gap: "10px",
      marginTop: "auto",
    }}
  >
    <Button onClick={() => window.location.href = "http://localhost:6900"}>
      Go
    </Button>
    <Button secondary onClick={() => alert("View analytics dashboard coming soon")}>
      View Analytics
    </Button>
  </div>
</FeatureBox>
<FeatureBox title="Vision to Text" icon="📱">
  <p style={{ marginBottom: "15px" }}>
    Algorithm reads your lips and then a virtual character speaks what u said can be used in chattingmethod to streamline the iris based chatting.Work in Progress
  </p>
  <div
    style={{
      display: "flex",
      gap: "10px",
      marginTop: "auto",
    }}
  >
    <Button onClick={() => window.location.href = "http://127.0.0.1:3000/VisionToText/vision-to-text-voice/demo/lip_reading_3d.html"}>
      Test
    </Button>
    <Button secondary onClick={() => alert("View analytics dashboard coming soon")}>
      View
    </Button>
  </div>
</FeatureBox>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const NavItem = ({ icon, label, active, onClick }) => (
  <div
    style={{
      padding: "12px 15px",
      borderRadius: "8px",
      marginBottom: "8px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      backgroundColor: active ? "#8454EE" : "transparent",
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      if (!active)
        e.currentTarget.style.backgroundColor = "rgba(132, 84, 238, 0.2)";
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.backgroundColor = "transparent";
    }}
  >
    <div
      style={{
        width: "20px",
        height: "20px",
        marginRight: "12px",
      }}
    >
      {icon}
    </div>
    {label}
  </div>
);

const StatItem = ({ value, label }) => (
  <div style={{ marginBottom: "10px" }}>
    <div
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "5px",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: "12px",
        color: "#8c9abe",
      }}
    >
      {label}
    </div>
  </div>
);

const Button = ({ children, secondary, onClick }) => (
  <div
    style={{
      backgroundColor: secondary ? "transparent" : "#8454EE",
      color: "white",
      border: secondary ? "1px solid #8454EE" : "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "500",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      justifyContent: "center",
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      if (secondary) {
        e.currentTarget.style.backgroundColor = "rgba(132, 84, 238, 0.1)";
      } else {
        e.currentTarget.style.backgroundColor = "#7040d0";
      }
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = secondary
        ? "transparent"
        : "#8454EE";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    {children}
  </div>
);

const ActivityItem = ({ label, time }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "10px",
    }}
  >
    <div>{label}</div>
    <div>{time}</div>
  </div>
);

export default NeuroNavDashboard;
