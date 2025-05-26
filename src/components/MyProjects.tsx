import React, { useEffect, useState } from 'react'
import { Copy } from 'lucide-react'
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
    const res = await fetch(`${backendUrl}/api/myProjects`, {
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
    }, 5000);
  }

  return (
    <div className="m-auto mt-[5rem] ml-[20rem] flex flex-row">
      <div className='flex flex-col'>
        <h3 className="mb-[2rem] p-[0.5rem] ml-[2rem] font-semibold text-xl">
          Moji projekti
        </h3>

        {myProjects.length === 0 ? (
          <div className="italic ml-[2rem]">Nimaš še dodanih projektov.</div>
        ) : (
          myProjects.map((project) => {
            const isCopied = copiedKeyId === project._id;
            return (
              <div key={project._id} className="ml-[2rem] mb-4">
                <h2 className="font-medium">{project.projectName}</h2>
                <div className="flex items-center">
                  <span className="text-gray-600">API ključ: {project.apiKey}</span>
                  <Copy
                    onClick={() => handleCopy(project.apiKey, project._id)}
                    style={{
                      cursor: "pointer",
                      marginLeft: "1.5rem",
                      transition: "color 0.3s",
                      color: isCopied ? "#B8B8B8" : "black",
                    }}
                    size={24}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className='ml-[10rem]'>
        <h3 className="mb-[2rem] p-[0.5rem] font-semibold text-xl">
          Navodila
        </h3>
        <p>Pošiljanje izpisov na API mora biti v tem formatu: </p>
        <pre style={{fontSize:"1rem"}}>
          <code>
            {`const res = await fetch(\`${backendUrl}/api/log\`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                apiKey,
                message,
                severity_level: severity,
              }),
            });`}
          </code>
        </pre>
        <p>API ključ mora biti veljaven</p>
        <p>Resnost (severity) mora biti ena od teh vrednosti:</p>
        <p className='italic'>debug, info, notice, warning, err, crit, alert, emerg</p>
        Več: <a href="https://en.wikipedia.org/wiki/Syslog">https://en.wikipedia.org/wiki/Syslog</a>
      </div>
    </div>
  );
}

export default MyProjects
