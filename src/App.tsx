import { generateGroups, selectRandomUsers } from './utils/randomGroupGenerator'
import './App.css'
import { useState, type ChangeEvent, type SyntheticEvent } from 'react'
import Group from './components/Group'
import Papa, { type ParseResult } from 'papaparse'
import { ToastContainer, toast } from 'react-toastify';
import { FaChevronLeft, FaChevronDown } from "react-icons/fa";

export type User = {
  id: number,
  vorname: string,
  nachname?: string,
}


function App() {
  let nextId = 0
  const [file, setFile] = useState<File>()
  const [users, setUsers] = useState<User[]>([])
  const [csvParsed, setCsvParsed] = useState<boolean>(false)
  const [groupGeneratorActive, setGroupGeneratorActive] = useState(false)
  const [randomSelectorActive, setRandomSelectorActive] = useState(false)
  const [groupCount, setGroupCount] = useState<number>(1)
  const [randomPersonCount, setRandomPersonCount] = useState<number>(1)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<User[][]>(() => generateGroups(users, groupCount))
  const [preview, setPreview] = useState<boolean>(true)
  const [wrongFormat, setWrongFormat] = useState<boolean>(false)
  const [inputSelection, setInputSelection] = useState<"" | "csv-input" | "manual-input">("")
  const [textAreaEmpty, setTextAreaEmpty] = useState<boolean>(true)
  const [textValue, setTextValue] = useState<string>("")

  function successNotify() {
    toast.success('Datei erfolgreich hochgeladen!', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      // transition: Bounce,
    });
  }

  function errorNotify() {
    toast.error('Spalte "Vorname" fehlt!', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      // transition: Bounce,
    });
  }

  function checkTextFieldEmpty(e: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>) {
    setTextAreaEmpty(e.currentTarget.value.trim() === "")
  }

  function handleSubmitPersons(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const formJson = Object.fromEntries(formData.entries())
    const names = (formJson.nameInput as string).split(",").map(name => name.trim()).map((name: string): User => ({
      id: nextId++,
      vorname: name
    }))
    console.log(names)
    setUsers(names)
    setCsvParsed(true)
    setGroups([])
    setGroupGeneratorActive(false)
    setRandomSelectorActive(false)
  }

  function selectionView() {
    if (inputSelection === "") {
      return null
    } else if (inputSelection === "csv-input") {
      return (
        <>
          <div className='file-input-container'>
            <label htmlFor="csvFile" className='file-input'>CSV wählen</label>

            <input type='file' name='csvFile' id='csvFile' accept='.csv' onChange={(e) => csvHandler(e)}/>

            <button onClick={() => {
                parseHandler(file)
                setGroupGeneratorActive(false)
                setRandomSelectorActive(false)
              }
            } disabled={!file}>Datei erneut verarbeiten</button>
          </div>

          {file ? <p>Hochgeladene Datei: <span style={{fontStyle: "italic"}}>{file.name}</span></p> : null}

          {randomUsers()}
        </>
      )
    }
    return (
      <div>
        <p>Gib die Namen durch Kommata getrennt in das Textfeld ein.</p>


        <form onSubmit={handleSubmitPersons} className='name-input-container'>
          <label htmlFor="nameInput">Namen: </label>
          <textarea id='nameInput'
            name='nameInput'
            rows={10} cols={40}
            onChange={(e) => {
              setTextValue(e.target.value)
              checkTextFieldEmpty(e)
              }
            }
            value={textValue}
            >
          </textarea>

          <div className='button-container'>
            <button type='submit' disabled={textAreaEmpty}>Liste erzeugen</button>
            <button type="button" onClick={() => {
              // e.preventDefault()
              setUsers([]);
              setTextValue("")
              setTextAreaEmpty(true)
              }}>
                Liste leeren
              </button>
          </div>
        </form>

        {randomUsers()}
      </div>
    )
  }

  function randomUsers() {
    if (users.length >0 && groupGeneratorActive) {
      return <div className='groups-container'>
          {groups.map((group, index) => {
            console.log(group)
            return (
              <Group key={group[0].id} index={index}>
                {group}
              </Group>
            )
          })}
        </div>
    } else if (users.length > 0 && randomSelectorActive) {
      return <div>
        <h2>Zufallsauswahl</h2>
        <ol>
          {selectedUsers.map(user => <li key={user.id}>{user.vorname} {user.nachname}</li>)}
        </ol>
      </div>
    } else if (users.length > 0) {
      return <div>
          <h2>
            Dateivorschau
            <span onClick={() => setPreview(!preview)} style={{background: "var(--primary-accent-bg-color)", padding:"3px 5px", borderRadius:"50%", color: "var(--primary-accent-color)"}}>
              {preview ? <FaChevronLeft /> : <FaChevronDown />}
            </span>
          </h2>
          <table>
            <thead>
              <tr>
                <th>Vorname</th>
                {users[0].nachname && <th>Nachname</th>}
              </tr>
            </thead>
            <tbody>
              {
                preview ? users.slice(0, 5).map(user => <tr key={user.id}>
                <td>{user.vorname}</td>
                {user.nachname && <td>{user.nachname}</td>}
              </tr>) : users.map(user => <tr key={user.id}>
                <td>{user.vorname}</td>
                {user.nachname && <td>{user.nachname}</td>}
              </tr>)
              }
            </tbody>
          </table>
        </div>
    } else if (wrongFormat) {
      return <div style={{marginTop: "10px"}}>
            CSV hat falsches Format. Die Spalte "Vorname" ist notwendig!
          </div>
    }
    return <div style={{marginTop: "10px"}}>
            Keine Daten vorhanden.
          </div>
  }

  function handleSubmitGroups(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget
    const formData = new FormData(form)
    const formJson = Object.fromEntries(formData.entries())
    const newGroupCount = Number(formJson.groupcount)

    setGroupCount(newGroupCount)
    setGroups(generateGroups(users, newGroupCount))
    setGroupGeneratorActive(true)
    setRandomSelectorActive(false)
  }

  function handleSubmitRandomSelection(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget
    const formData = new FormData(form)
    const formJson = Object.fromEntries(formData.entries())
    const newRandomPersonCount = Number(formJson.randomPersonCount)

    setRandomPersonCount(newRandomPersonCount)
    setSelectedUsers(selectRandomUsers(newRandomPersonCount, users))
    setGroupGeneratorActive(false)
    setRandomSelectorActive(true)
  }

  function csvHandler(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) {
    if (e.currentTarget.files) {
      const inputFile = e.currentTarget.files[0]
      setGroupGeneratorActive(false)
      setRandomSelectorActive(false)
      setFile(inputFile)
      parseHandler(inputFile)
    }
  }

  function inputSelectionHandler(e: ChangeEvent<HTMLSelectElement, HTMLSelectElement>) {
    const value = e.currentTarget.value as "" | "csv-input" | "manual-input"
    console.log(value)
    setInputSelection(value)
  }

  function parseHandler(file: File | undefined) {
    if(!file) {
      console.log("No file selected")
      setUsers([])
      setCsvParsed(false)
      return
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header:string) => {
        return header.toLowerCase().trim()
      },
      complete: function(results: ParseResult<User>) {
        const columnHeaders = Object.keys(results.data[0])
        console.log(columnHeaders)
        if(!columnHeaders.includes("vorname")) {
          console.log("Column vorname missing")
          setUsers([])
          // setGroups(generateGroups(importedUsers, groupCount))
          setCsvParsed(false)
          errorNotify()
          setWrongFormat(true)
          return
        }
        const importedUsers = results.data.map(user => {
          if (user.nachname) {
            return {"id": nextId++, "vorname": user.vorname, "nachname": user.nachname}
          }
          return {"id": nextId++, "vorname": user.vorname}
        })
        console.log(importedUsers)
        setWrongFormat(false)
        setUsers(importedUsers)
        // setGroups(generateGroups(importedUsers, groupCount))
        setCsvParsed(true)
        setTextValue(importedUsers.map(user => user.vorname).join(", "))
        setTextAreaEmpty(false)
        successNotify()
      }
    })
  }

  return (
    <>
      <h1>Zufallsgenerator</h1>
      <p>
        Importiere die Namen der Personen, für die du den Zufallsgenerator nutzen willst als .csv-Datei oder gib die Namen manuell ein. Die .csv-Datei muss die Spalte "Vorname" enthalten. Optional kann eine weitere Spalte "Nachname" inkludiert sein. Alle weiteren Spalten werden nicht beachtet. Du kannst Zufallsgruppen erzeugen oder zufällig Personen auslosen.
      </p>

      <div className='input-selection-container'>
        <h2>Wähle eine Option zum Import deiner Personen</h2>
        <label htmlFor='input-selection'>Methode: </label>
        <select id="input-selection" onChange={(e) => inputSelectionHandler(e)}>
          <option value={""}>--Wähle eine Option--</option>
          <option value={"csv-input"}>CSV-Import</option>
          <option value={"manual-input"}>Manuelle Eingabe</option>
        </select>
      </div>

      {selectionView()}

      <div className='form-container'>
        <form onSubmit={handleSubmitGroups} className='group-form-container'>
          <h3>Zufallsgruppen erstellen</h3>
          <label>
            Gruppenanzahl:
            <input type='number' name='groupcount' id='groupcount' min={1} max={users.length} defaultValue={groupCount}/>
          </label>

          <button type='submit' disabled={!csvParsed}>{groupGeneratorActive ? "Gruppen neu bilden" : "Gruppen erstellen"}</button>
        </form>

        <form onSubmit={handleSubmitRandomSelection} className='group-form-container'>
          <h3>Zufällige Personen auswählen</h3>
          <label>
            Anzahl Personen:
            <input type='number' name='randomPersonCount' id='randomPersonCount' min={1} max={users.length} defaultValue={randomPersonCount} className='input-box'/>
          </label>

          <button type='submit' disabled={!csvParsed}>{randomSelectorActive ? "Neu auswählen" : "Auswählen"}</button>
        </form>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        // transition={Bounce}
      />
    </>
  )
}

export default App
