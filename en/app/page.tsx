"use client"

import React, { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"

// Supabase Doğrudan Bağlantısı
const supabaseUrl = "https://mxfjbhqswsbogbnaynuk.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZmpiaHFzd3Nib2dibmF5bnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExMDI4MDksImV4cCI6MjEwNjY3ODgwOX0.tpzIjyHrVKUcGFWQ9U_rdQ2Qgd4DhANzgk3GUPtBys8"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Gizli Kod Tuş Sıralaması: Yukarı, Yukarı, Aşağı, Aşağı, Sol, Sağ, Sol, Sağ, s, i, g, m, a
const SECRET_SEQUENCE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "s", "i", "g", "m", "a"
]

export default function Page() {
  const [likes, setLikes] = useState<number>(0)
  const [dislikes, setDislikes] = useState<number>(0)
  const [voted, setVoted] = useState<"like" | "dislike" | null>(null)
  const [secretUnlocked, setSecretUnlocked] = useState(false)
  
  const keyHistory = useRef<string[]>([])

  // 1. Supabase Veritabanından Oyları Çek
  useEffect(() => {
    fetchVotes()

    const savedVote = localStorage.getItem("sigma_user_vote") as "like" | "dislike" | null
    if (savedVote) setVoted(savedVote)
  }, [])

  const fetchVotes = async () => {
    try {
      const { data, error } = await supabase
        .from("votes")
        .select("likes, dislikes")
        .eq("id", "main_game")
        .single()

      if (data && !error) {
        setLikes(data.likes)
        setDislikes(data.dislikes)
      }
    } catch (e) {
      console.error("Supabase veri çekme hatası:", e)
    }
  }

  // 2. "↑↑↓↓←→←→sigma" Gizli Kod Dinleyicisi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const pressedKey = e.key.length === 1 ? e.key.toLowerCase() : e.key
      
      keyHistory.current = [...keyHistory.current, pressedKey].slice(-SECRET_SEQUENCE.length)

      const isMatch = SECRET_SEQUENCE.every(
        (key, index) => key === keyHistory.current[index]
      )

      if (isMatch) {
        setSecretUnlocked(true)
        playBassSound()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Web Audio API Bas Ses Efekti
  const playBassSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sawtooth"
      osc.frequency.setValueAtTime(120, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch (e) {}
  }

  // 3. Oy Kullanma ve Supabase'e Yazma
  const handleVote = async (type: "like" | "dislike") => {
    playBassSound()
    if (voted === type) return

    let newLikes = likes
    let newDislikes = dislikes

    if (type === "like") {
      newLikes += 1
      if (voted === "dislike") newDislikes = Math.max(0, newDislikes - 1)
    } else {
      newDislikes += 1
      if (voted === "like") newLikes = Math.max(0, newLikes - 1)
    }

    setLikes(newLikes)
    setDislikes(newDislikes)
    setVoted(type)
    localStorage.setItem("sigma_user_vote", type)

    try {
      await supabase
        .from("votes")
        .update({ likes: newLikes, dislikes: newDislikes })
        .eq("id", "main_game")
    } catch (e) {
      console.error("Supabase oy güncelleme hatası:", e)
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#09090b",
      color: "#ffffff",
      fontFamily: "sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "10px", letterSpacing: "2px" }}>
        🔥 THE SIGMA GAMES 🔥
      </h1>
      <p style={{ color: "#a1a1aa", marginBottom: "30px" }}>Gelişmiş Web Oyun Portalı</p>

      {/* LIKE / DISLIKE SİSTEMİ */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
        <button
          onClick={() => handleVote("like")}
          style={{
            padding: "12px 24px",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: voted === "like" ? "#22c55e" : "#27272a",
            color: "#fff",
            transition: "0.2s"
          }}
        >
          THUMBS UP 👍 ({likes})
        </button>

        <button
          onClick={() => handleVote("dislike")}
          style={{
            padding: "12px 24px",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: voted === "dislike" ? "#ef4444" : "#27272a",
            color: "#fff",
            transition: "0.2s"
          }}
        >
          THUMBS DOWN 👎 ({dislikes})
        </button>
      </div>

      {/* GİZLİ KOD ALANI */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p style={{ fontSize: "0.85rem", color: "#71717a" }}>
          Gizli Kombinasyon: <b>↑ ↑ ↓ ↓ ← → ← → s i g m a</b>
        </p>

        {secretUnlocked && (
          <div style={{
            marginTop: "20px",
            padding: "15px 25px",
            border: "2px dashed #eab308",
            borderRadius: "10px",
            backgroundColor: "#18181b",
            color: "#eab308",
            fontWeight: "bold"
          }}>
            🎉 GİZLİ SIGMA MODU AÇILDI! VIP OYUN KODU: <u>SIGMA-999-ULTRA</u>
          </div>
        )}
      </div>
    </main>
  )
}
