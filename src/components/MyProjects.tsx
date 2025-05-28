import React, { useEffect, useState } from 'react'
import { Copy } from 'lucide-react'
import '../styles/MyProjects.css'
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface AddProjectProps {
  token: string | null;
}

const MyProjects: React.FC<AddProjectProps> = ({ token }) => {
  type Project = {
    _id: string;
    projectName: string;
    apiKey: string;
  };

  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)

  const fetchProjects = async () => {
    if (!token) return
    const res = await fetch(`https://loggerapp-backend.onrender.com/api/myProjects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    if (res.ok) {
      const data = await res.json();
      setMyProjects(data)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [token])

  const handleCopy = (apiKey: string, projectId: string) => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKeyId(projectId);
    setTimeout(() => {
      setCopiedKeyId(null);
    }, 4000);
  }

  return (
    <div className="container">
      <section className='my-projects'>
        <h3 className="section-title">
          Moji projekti
        </h3>

        {myProjects.length === 0 ? (
          <div className="empty-message">Nimaš še dodanih projektov.</div>
        ) : (
          myProjects.map((project) => {
            const isCopied = copiedKeyId === project._id;
            return (
              <div key={project._id} className="project-card">
                <h4 className="project-name">{project.projectName}</h4>
                <div className='api-key'>
                  <span className="label">API ključ:</span>
                  <div className="key-container">
                    <code className="api-key-text">{project.apiKey}</code>
                    <span
                      role="img"
                      aria-label={isCopied ? "Kopirano!" : "Kopiraj API ključ"}
                      title={isCopied ? "Kopirano!" : "Kopiraj API ključ"}
                      style={{ display: 'inline-flex', cursor: 'pointer' }}
                      onClick={() => handleCopy(project.apiKey, project._id)}
                    >
                      <Copy
                        className={`copy-icon ${isCopied ? 'copied' : ''}`}
                        size={24}
                        strokeWidth={1.5}
                      />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className='instructions'>
        <h3 className="section-title">Navodila</h3>
        <p>Pošiljanje izpisov na API mora biti v tem formatu:</p>
        <pre className='code-block'>
          <code>
            {`const res = await fetch(\`${backendUrl}/api/log\`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Origin": "--> OriginURL <--"
  },
  body: JSON.stringify({
    apiKey,
    message,
    severity_level,
  }),
});`}
          </code>
        </pre>
        <p><strong>apiKey</strong> mora biti veljaven API ključ</p>
        <p><strong>OriginURL</strong> je URL iz katerega se izpisi pošiljajo na API</p>
        <p><strong>severity_level</strong> (resnost) mora biti ena od teh vrednosti:</p>
        <p className='italic'>debug, info, notice, warning, err, crit, alert, emerg</p>
        <p>Več: <a href="https://en.wikipedia.org/wiki/Syslog" target="_blank" rel="noopener noreferrer">https://en.wikipedia.org/wiki/Syslog</a></p>
      </section>
    </div>
  );
}

export default MyProjects;
