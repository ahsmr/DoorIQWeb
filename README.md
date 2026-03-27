# DoorIQ 🚪💡

**DoorIQ** is a secure, low-latency smart doorbell and home access ecosystem developed as a **P&O II project at KU Leuven**. 

This project bridges hardware and web technologies, utilizing a **Raspberry Pi Zero 2W** for IoT edge processing, **Supabase** for secure backend infrastructure, and **LiveKit** for real-time WebRTC media streaming. 

---

## ✨ Key Features

* **Secure Authentication:** Encrypted user registration and login handled safely via Supabase Auth.
* **Bidirectional Real-Time Notifications:** Utilizes the Supabase Realtime API to send instant signals back and forth between the website dashboard and the Raspberry Pi Zero 2W (e.g., ringing the bell, unlocking the door).
* **Live Video & Audio:** High-quality, low-latency camera and audio streaming from the doorbell to the web dashboard via `cloud.livekit.io`.
* **Serverless Security:** Supabase Edge Functions act as a secure middleman, privately holding the LiveKit API and Secret keys to generate secure connection tokens for the client, ensuring credentials are never exposed to the frontend.

---

## 🏗 System Architecture

The ecosystem relies on four main pillars communicating in real-time:

1. **The Edge Device (Raspberry Pi Zero 2W):** Acts as the physical doorbell. It captures video and audio to publish to a LiveKit Room, and listens for/sends real-time database signals via Supabase.
2. **The Backend & Database (Supabase):** The central nervous system of the project. It handles the PostgreSQL database, user encryption/authentication, and real-time WebSockets to keep the Pi and the website perfectly in sync.
3. **The Gatekeeper (Supabase Edge Functions):** When a user wants to view the camera, the website calls an Edge Function. This function securely interacts with LiveKit's API to generate a temporary "Access Pass" (Token) for the stream.
4. **The Dashboard (React Website):** The user-facing portal. It authenticates users, displays real-time logs/notifications from the Pi, and connects to the LiveKit stream using the token provided by the Edge Function.

---

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:
* **Node.js** (v16 or higher) for the React frontend.
* **Python 3.9+** on the Raspberry Pi Zero 2W.
* A **Supabase** project setup.
* A **LiveKit Cloud** project setup.

---

## 🛠 Installation & Setup Guide

### 1. Backend: Supabase Edge Functions & Secrets
To allow your Edge Functions to generate LiveKit tokens, you need to provide Supabase with your LiveKit credentials securely.

1. Get your API Key and Secret from your LiveKit Cloud dashboard.
2. Set them as secrets in your Supabase project (via the Supabase CLI or Dashboard settings):
   ```bash
   supabase secrets set LIVEKIT_API_KEY=your_livekit_key
   supabase secrets set LIVEKIT_API_SECRET=your_livekit_secret