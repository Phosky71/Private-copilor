import axios from "axios";

const API = "http://localhost:8000";

export const getWorkspaces = () =>
  axios.get(`${API}/workspace/list`);

export const createWorkspace = (name) =>
  axios.post(`${API}/workspace/create?name=${name}`);

export const addPath = (name, path) =>
  axios.post(`${API}/workspace/add-path?name=${name}&path=${path}`);

export const indexWorkspace = (name) =>
  axios.post(`${API}/workspace/index?name=${name}`);

export const chat = (name, query) =>
  axios.post(`${API}/chat?name=${name}&query=${query}`);