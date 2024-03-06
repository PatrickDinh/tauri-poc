import { useMemo } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { open, save } from '@tauri-apps/api/dialog';
import { writeTextFile } from "@tauri-apps/api/fs";
import { Command } from '@tauri-apps/api/shell';
import axios from 'axios';

function App() {
  const isInApp = useMemo(() => '__TAURI__' in window, [])

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

  async function postToPostBin() {
    await axios.post('https://example.com')
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

      { isInApp &&
        <>
          <button type="button" onClick={openFile}>Open file</button>
          <button type="button" onClick={saveTextToFile}>Save Text</button>
          <button type="button" onClick={openVsCodeAtPath}>Open VSCode</button>
          <button type="button" onClick={callAlgokitCli}>Call Algokit CLI version</button>
        </>
      }
      <button type="button" onClick={postToPostBin}>Post to PostBin</button>
    </div>
  );
}

export default App;
