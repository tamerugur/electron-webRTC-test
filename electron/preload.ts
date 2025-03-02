import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("chatAPI", {
  saveChatLog: async (messages: any[]) => {
    return await ipcRenderer.invoke("save-chat-log", messages);
  },
  loadChatLog: async () => {
    return await ipcRenderer.invoke("load-chat-log");
  },
});
