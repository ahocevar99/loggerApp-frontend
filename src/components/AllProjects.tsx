import React, { useEffect, useState } from 'react';
import type { Log } from '../utils/logUtils';
import { filterLogs, sortLogs } from '../utils/logUtils';
import * as XLSX from 'xlsx';
import '../styles/AllProjects.css';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface AddProjectProps {
  token: string | null;
}

const AllProjects: React.FC<AddProjectProps> = ({ token }) => {
  type Project = {
    _id: string;
    projectName: string;
    ownerUsername: string;
    ownerEmail: string;
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [content, setContent] = useState<'projects' | 'logs'>('projects');

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'date'>('date');
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '1h'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const exportToExcel = (logs: Log[]) => {
    const data = logs.map(log => ({
      Projekt: log.project.projectName,
      Sporočilo: log.message,
      Resnost: log.severity_level,
      Datum: new Date(log.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logi');
    XLSX.writeFile(workbook, 'izpisi.xlsx');
  };

  const fetchProjects = async () => {
    if (!token) return;
    const res = await fetch(`${backendUrl}/api/allProjects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
  };

  const fetchLogs = async () => {
    if (!token) return;
    const res = await fetch(`${backendUrl}/api/allLogs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      setLogs(data);
    }
  };

  const refreshData = () => {
    fetchProjects();
    fetchLogs();
  };

  useEffect(() => {
    fetchProjects();
    fetchLogs();
  }, [token]);

  const filtered = filterLogs(logs, selectedProjectId, timeFilter);
  const sorted = sortLogs(filtered, sortBy);
  const searched = sorted.filter(log =>
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.severity_level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="all-projects-container">
      <div className="tabs">
        <h3
          className={`tab ${content === 'projects' ? 'active' : ''}`}
          onClick={() => setContent('projects')}
        >
          Vsi projekti
        </h3>
        <h3
          className={`tab ${content === 'logs' ? 'active' : ''}`}
          onClick={() => setContent('logs')}
        >
          Izpisi
        </h3>
        <button className="refresh-button" onClick={refreshData}>
          Osveži
        </button>
      </div>

      {content === 'projects' ? (
        projects.length === 0 ? (
          <div className="info-text">Ni še dodanih projektov.</div>
        ) : (
          <div className="project-grid">
            {projects.map(project => (
              <div key={project._id} className="project-card">
                <h2>{project.projectName}</h2>
                <p><strong>Uporabnik:</strong> {project.ownerUsername}</p>
                <p><strong>Email:</strong> {project.ownerEmail}</p>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          <div className="log-controls">
            <input
              type="text"
              placeholder="Išči po sporočilu, projektu, resnosti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              <option value="all">Vsi projekti</option>
              {projects.map(proj => (
                <option key={proj._id} value={proj._id}>{proj.projectName}</option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="date">Sortiraj po datumu</option>
              <option value="severity">Sortiraj po resnosti</option>
            </select>
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)}>
              <option value="all">Vsi</option>
              <option value="24h">Zadnjih 24 ur</option>
              <option value="1h">Zadnja 1 ura</option>
            </select>
          </div>

          {searched.length === 0 ? (
            <div className="info-text">Ni najdenih logov.</div>
          ) : (
            <>
              <div className="log-summary">
                <p>{`Število izpisov za izbran kriterij: ${searched.length}`}</p>
                <button onClick={() => exportToExcel(searched)} className="button">
                  Izvozi v Excel
                </button>
              </div>
              <div className="log-grid">
                {searched.map((log) => (
                  <div key={log._id} className="log-card">
                    <p><strong>Projekt:</strong> {log.project.projectName}</p>
                    <p><strong>Sporočilo:</strong> {log.message}</p>
                    <p><strong>Resnost:</strong> {log.severity_level}</p>
                    <p><strong>Datum:</strong> {new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AllProjects;
