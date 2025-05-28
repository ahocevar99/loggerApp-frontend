import React, { useEffect, useState } from 'react'
import "../styles/AddProject.css"
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface AddProjectProps {
    token: string;
}

const AddProject: React.FC<AddProjectProps> = ({ token }) => {
    const [sources, setSources] = useState<number>(0)
    const [alertMessage, setAlertMessage] = useState<string>("")
    const [projectName, setProjectName] = useState<string>("")
    const [origins, setOrigins] = useState<string[]>([])
    const [projectSavedMessage, setProjectSavedMessage] = useState<string>("")

    useEffect(() => {
        if (sources > 2) setAlertMessage("Dodaš lahko največ 3 izvorne URL naslove!")
    }, [sources])

    const onSaveMessage = `Projekt ${projectName} je uspešno shranjen. Nahaja se v zavihku 'Moji projekti', kjer je tudi API ključ, ki ga uporabiš za pošiljanje izpisov tega projekta`

    const removeTrailingSlash = (url: string) => url.endsWith('/') ? url.slice(0, -1) : url;
    const handleOriginChange = (index: number, value: string) => {
        const cleanedValue = removeTrailingSlash(value.trim());
        if (cleanedValue !== "") {
            let updated = [...origins];
            updated[index] = cleanedValue;
            setOrigins(updated);
        }
    }

    const isValidURL = (url: string): boolean => {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const handleSubmit = async () => {
        if (!token) {
            setAlertMessage("Nimaš dovoljenj za dodajanje projektov!")
            return
        }
        setProjectSavedMessage("")
        if (!projectName.trim()) {
            setAlertMessage('Vnesi ime projekta!');
            return;
        }
        if (projectName.trim().length < 8) {
            setAlertMessage('Ime projekta je prekratko!');
            return;
        }
        if (origins.length === 0) {
            setAlertMessage('Vnesi vsaj en izvorni URL naslov!');
            return;
        }

        const filteredOrigins = origins
            .map(origin => origin.trim())
            .filter(origin => origin !== '');
        const hasValidUrl = filteredOrigins.some(isValidURL);
        if (!hasValidUrl) {
            setAlertMessage("Vsaj en izvorni URL naslov mora biti veljaven!");
            return;
        }


        const payload = {
            name: projectName,
            origins: filteredOrigins,
        };

        try {
            const res = await fetch(`${backendUrl}/api/addProject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const data = await res.json()
                if (data.message === "Project saved") setProjectSavedMessage(onSaveMessage)
                setProjectName("")
                setOrigins([])
            }
        } catch (error) { }
    }

    return (
        <div className="add-project-container">
            <h3 className="title">Dodaj projekt</h3>

            <div className="form">
                <div className="form-group">
                    <label>Ime projekta:</label>
                    <input
                        type="text"
                        value={projectName || ""}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Izvor:</label>
                    <div className="input-row">
                        <input
                            type="text"
                            value={origins[0] || ""}
                            onChange={(e) => handleOriginChange(0, e.target.value)}
                        />
                        <button onClick={() => setSources(sources + 1)}>+</button>
                    </div>
                </div>

                {sources > 0 && (
                    <input
                        type="text"
                        className="additional-input"
                        value={origins[1] || ""}
                        onChange={(e) => handleOriginChange(1, e.target.value)}
                    />
                )}
                {sources > 1 && (
                    <input
                        type="text"
                        className="additional-input"
                        value={origins[2] || ""}
                        onChange={(e) => handleOriginChange(2, e.target.value)}
                    />
                )}

                {alertMessage && (
                    <div className="alert">{alertMessage}</div>
                )}

                <button className="submit-btn" onClick={handleSubmit}>Dodaj</button>
            </div>

            {projectSavedMessage && (
                <div className="success-message">
                    {projectSavedMessage}
                </div>
            )}
        </div>
    );




}

export default AddProject
