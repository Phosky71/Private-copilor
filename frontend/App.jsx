import { useEffect, useState } from "react";
import {
  getWorkspaces,
  createWorkspace,
  addPath,
  indexWorkspace,
  chat
} from "./api";

import "./styles.css";

export default function App() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selected, setSelected] = useState("");
  const [msg, setMsg] = useState("");
  const [out, setOut] = useState("");

  const [newWS, setNewWS] = useState("");
  const [newPath, setNewPath] = useState("");

  async function load() {
    const res = await getWorkspaces();
    setWorkspaces(res.data);
    setSelected(res.data[0] || "");
  }

  useEffect(() => {
    load();
  }, []);

  async function send() {
    const res = await chat(selected, msg);
    setOut(res.data.response);
  }

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <div className="sidebar">

        <h2>Workspaces</h2>

        {workspaces.map((w) => (
          <div
            key={w}
            className={`ws ${selected === w ? "active" : ""}`}
            onClick={() => setSelected(w)}
          >
            {w}
          </div>
        ))}

        <div className="section">
          <input
            placeholder="New workspace"
            value={newWS}
            onChange={(e) => setNewWS(e.target.value)}
          />
          <button onClick={async () => {
            await createWorkspace(newWS);
            setNewWS("");
            load();
          }}>
            Create
          </button>
        </div>

        <div className="section">
          <input
            placeholder="Add folder path"
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
          />
          <button onClick={async () => {
            await addPath(selected, newPath);
            setNewPath("");
          }}>
            Add
          </button>
        </div>

        <button
          className="indexBtn"
          onClick={() => indexWorkspace(selected)}
        >
          Index workspace
        </button>

      </div>

      {/* CHAT */}
      <div className="chat">

        <div className="chatBox">
          {out}
        </div>

        <div className="inputBar">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Ask something about your code..."
          />
          <button onClick={send}>Send</button>
        </div>

      </div>

    </div>
  );
}