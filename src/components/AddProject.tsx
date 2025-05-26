import React, { useEffect, useState } from 'react'

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
        if (sources > 2) setAlertMessage("Dodaš lahko največ 3 izvorne URL naslove")
    }, [sources])

    const onSaveMessage = `Projekt ${projectName} je uspešno shranjen. Nahaja se v zavihku 'Moji projekti', kjer je tudi API ključ, ki ga uporabiš za pošiljanje izpisov tega projekta`

    const handleOriginChange = (index: number, value: string) => {
        if (value != "") {
            let updated: string[];
            updated = [...origins]
            updated[index] = value;
            setOrigins(updated)
        }
    }

    const isValidURL = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch (e) {
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

        const filteredOrigins = origins.filter((origin) => origin.trim() !== '');
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
            const res = await fetch('/api/addProject', {
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
        <div className="m-auto mt-[5rem] ml-[20rem] flex flex-col">
            <h3 className="mb-[2rem] p-[0.5rem] ml-[2rem] font-semibold text-xl">Dodaj projekt</h3>

            <div className="grid grid-cols-[10rem_1fr] gap-y-[1rem] ml-[2rem]">
                <label className="mr-[2rem]">Ime projekta:</label>
                <input type="text" className="py-[0.3rem] w-[20rem]" value={projectName || ""} onChange={((e) => setProjectName(e.target.value))} />

                <label className="mr-[2rem]">Izvor:</label>
                <div className="flex items-center gap-2">
                    <input type="text" className="py-[0.3rem] w-[20rem]" value={origins[0] || ""} onChange={((e) => handleOriginChange(0, e.target.value))} />
                    <button
                        onClick={() => setSources(sources + 1)}
                        className="px-[1rem] py-[0.5rem] ml-[1rem] cursor-pointer"
                    >
                        +
                    </button>
                </div>
                {sources > 0 && (
                    <>
                        <div></div>
                        <input type="text" className="py-[0.3rem] w-[20rem]" value={origins[1] || ""} onChange={((e) => handleOriginChange(1, e.target.value))} />
                    </>
                )}

                {sources > 1 && (
                    <>
                        <div></div>
                        <input type="text" className="py-[0.3rem] w-[20rem]" value={origins[2] || ""} onChange={((e) => handleOriginChange(2, e.target.value))} />
                    </>
                )}
                {alertMessage != "" && (
                    <>
                        <div></div>
                        <div className='text-red-600 italic'>{alertMessage}</div>
                    </>
                )}
                {
                    <>
                        <div></div>
                        <button className='w-[5rem] h-[2rem] cursor-pointer' onClick={handleSubmit}>Dodaj</button>
                        <div></div>
                        <div className='italic'>{projectSavedMessage || ""}</div>
                    </>
                }
            </div>
        </div>
    )
}

export default AddProject
