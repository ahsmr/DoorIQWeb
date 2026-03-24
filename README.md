# DoorIQ 🚪💡

DoorIQ is a secure, low-latency smart doorbell and home access ecosystem. It uses a **Raspberry Pi** as a camera source, **LiveKit** for WebRTC streaming, and **Supabase** for user authentication and event logging.

---

## 🏗 System Architecture

- **The Publisher (Raspberry Pi):** Captures video and joins a LiveKit Room named after a specific `home_id`.
- **The Gatekeeper (Supabase Edge Function):** Verifies the user's login and generates a temporary "Access Pass" (Token) for the stream.
- **The Subscriber (React Dashboard):** Connects to the stream and displays real-time video, logs, and stored clips.

---

## 🛠 Installation Guide

### 1. Frontend Dependencies (The Website)
Before running the dashboard, you must install the React libraries, including the LiveKit client and Supabase SDK.
```bash
cd Website
npm install