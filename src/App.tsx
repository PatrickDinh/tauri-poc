import { useMemo, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { open, save } from '@tauri-apps/api/dialog';
import { writeTextFile } from "@tauri-apps/api/fs";
import { Command } from '@tauri-apps/api/shell';

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  const isInApp = useMemo(() => '__TAURI__' in window, [])

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  async function openFile() {
    await open({
      multiple: true,
      filters: [{
        name: 'Image',
        extensions: ['png', 'jpeg']
      }]
    });
  }

  async function saveTextToFile() {
    const filePath = await save({
      filters: [{
        name: 'Text',
        extensions: ['txt']
      }]
    });
    if (filePath)
      await writeTextFile(filePath, 'Hello World!');
  }

  async function openVsCodeAtPath() {
    const dirPath = await open({
      multiple: false,
      directory: true
    });

    if (dirPath && !Array.isArray(dirPath)) {
      const command = new Command('code', dirPath)
      command.on('close', data => {
        console.log(`command finished with code ${data.code} and signal ${data.signal}`)
      });
      command.on('error', error => console.error(`command error: "${error}"`));

      const child = await command.spawn();
      console.log('pid:', child.pid);
    }
  }

  async function callAlgokitCli() {
    const command = new Command('algokit', ['--version'])
    command.on('close', data => {
      console.log(`command finished with code ${data.code} and signal ${data.signal}`)
    });
    command.on('error', error => console.error(`command error: "${error}"`));
    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
    command.stderr.on('data', line => console.log(`command stderr: "${line}"`));
    await command.execute();
  }

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>

      <p>{greetMsg}</p>
      { isInApp &&
        <>
          <button type="button" onClick={openFile}>Open file</button>
          <button type="button" onClick={saveTextToFile}>Save Text</button>
          <button type="button" onClick={openVsCodeAtPath}>Open VSCode</button>
          <button type="button" onClick={callAlgokitCli}>Call Algokit CLI version</button>
        </>
      }
    </div>
  );
}

export default App;
