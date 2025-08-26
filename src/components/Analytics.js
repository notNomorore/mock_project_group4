// src/pages/Analytics.js
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchTasks } from "../redux/slices/tasksSlice";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#aa46be", "#ff6699"];

function Analytics() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: tasks, loading, error } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // 1. Stacked Bar: task theo assignee và status
  const barData = useMemo(() => {
    const result = {};
    tasks.forEach((t) => {
      if (!result[t.assignee]) {
        result[t.assignee] = { name: t.assignee, done: 0, inProgress: 0, pending: 0 };
      }
      if (t.status === "done") result[t.assignee].done++;
      if (t.status === "in-progress") result[t.assignee].inProgress++;
      if (t.status === "pending") result[t.assignee].pending++;
    });
    return Object.values(result);
  }, [tasks]);

  // 2. Pie Chart: phân bố task theo priority
  const pieData = useMemo(() => {
    const counts = {};
    tasks.forEach((t) => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    return Object.keys(counts).map((name) => ({ name, value: counts[name] }));
  }, [tasks]);

  // 3. Line Chart: nhiều đường line theo status
  const lineData = useMemo(() => {
    const result = {};
    tasks.forEach((t) => {
      const date = t.deadline;
      if (!result[date]) {
        result[date] = { date, done: 0, inProgress: 0, pending: 0 };
      }
      if (t.status === "done") result[date].done++;
      if (t.status === "in-progress") result[date].inProgress++;
      if (t.status === "pending") result[date].pending++;
    });
    return Object.keys(result).sort().map((d) => result[d]);
  }, [tasks]);

  // 4. Radar Chart: hiệu suất nhân viên (so sánh done vs pending)
  const radarData = useMemo(() => {
    const result = {};
    tasks.forEach((t) => {
      if (!result[t.assignee]) {
        result[t.assignee] = { name: t.assignee, done: 0, pending: 0 };
      }
      if (t.status === "done") result[t.assignee].done++;
      if (t.status === "pending") result[t.assignee].pending++;
    });
    return Object.values(result);
  }, [tasks]);

  if (loading) return <p className="analytics-loading">Đang tải dữ liệu...</p>;
  if (error) return <p className="analytics-error">Lỗi: {error}</p>;

  return (
    <div className="analytics-container">
      <header className="user-management-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Report Dashboard for All Staffs</h1>
          </div>
          <div className="header-actions">
            <button
              onClick={() => navigate('/dashboard')}
              className="back-button"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Stacked Bar Chart */}
      <div className="chart-card">
        <h2>Task theo nhân viên & trạng thái</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="done" stackId="a" fill="#00C49F" />
            <Bar dataKey="inProgress" stackId="a" fill="#FFBB28" />
            <Bar dataKey="pending" stackId="a" fill="#FF8042" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="chart-card">
        <h2>Phân bố công việc theo độ ưu tiên</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Multi-Line Chart */}
      <div className="chart-card full-width">
        <h2>Tiến độ task theo thời gian</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="done" stroke="#00C49F" strokeWidth={3} />
            <Line type="monotone" dataKey="inProgress" stroke="#FFBB28" strokeWidth={3} />
            <Line type="monotone" dataKey="pending" stroke="#FF8042" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Radar Chart */}
      <div className="chart-card full-width">
        <h2>So sánh hiệu suất nhân viên</h2>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
            <Radar name="Done" dataKey="done" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6} />
            <Radar name="Pending" dataKey="pending" stroke="#FF8042" fill="#FF8042" fillOpacity={0.6} />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytics;
