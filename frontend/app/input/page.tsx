"use client";

import { useState, useRef, useEffect } from "react";
import { Subscription } from "@rails/actioncable";
import { getConsumer } from "@/lib/cable";

interface LogEntry {
  text: string;
  color: string;
  id: number;
}

export default function InputPage() {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [connected, setConnected] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const subRef = useRef<Subscription | null>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    const subscription = getConsumer().subscriptions.create("CommentChannel", {
      connected() { setConnected(true); },
      disconnected() { setConnected(false); },
      received() {},
    });
    subRef.current = subscription;
    return () => { subscription.unsubscribe(); };
  }, []);

  function send() {
    const trimmed = text.trim();
    if (!trimmed || !subRef.current) return;
    subRef.current.perform("receive", { text: trimmed, color });
    setLog((prev) => [
      { text: trimmed, color, id: counterRef.current++ },
      ...prev.slice(0, 29),
    ]);
    setText("");
  }

  return (
    <div className="min-h-screen bg-[#111] text-gray-200 flex flex-col items-center justify-center gap-6 p-6 font-sans">
      <h1 className="text-xl text-gray-400 tracking-wide">コメント入力</h1>

      <div className="w-full max-w-md flex flex-col gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          maxLength={100}
          placeholder="コメントを入力..."
          autoFocus
          className="text-lg px-4 py-3 rounded-lg border-2 border-[#444] bg-[#222] text-white outline-none focus:border-red-600 transition-colors"
        />

        <div className="flex gap-3 items-center">
          <label className="text-sm text-gray-500">色</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-8 rounded border-none cursor-pointer bg-transparent"
          />
          <button
            onClick={send}
            disabled={!connected || !text.trim()}
            className="flex-1 py-3 text-base font-bold bg-red-600 text-white rounded-lg disabled:bg-[#555] disabled:cursor-default hover:bg-red-700 transition-colors"
          >
            送信
          </button>
        </div>
      </div>

      <p className={`text-sm ${connected ? "text-green-400" : "text-red-400"}`}>
        {connected ? "接続済み" : "接続中..."}
      </p>

      <ul className="w-full max-w-md flex flex-col gap-1 max-h-52 overflow-y-auto">
        {log.map((entry) => (
          <li
            key={entry.id}
            className="text-sm px-3 py-1 bg-[#1a1a1a] rounded text-gray-400 animate-fadeIn"
            style={{ borderLeft: `3px solid ${entry.color}` }}
          >
            {entry.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
