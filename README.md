# DoorIQ 🚪💡

**DoorIQ** is a secure, low-latency smart doorbell and home access ecosystem developed as a **P&O II (Problem-solving & Design) project at KU Leuven**. 

This project bridges hardware and web technologies, utilizing a **Raspberry Pi Zero 2W** for IoT edge processing, **Supabase** for secure backend infrastructure, and **LiveKit** for real-time WebRTC media streaming.

---

## ⚠️ Academic Disclaimer
**This project is developed solely for educational purposes as part of the P&O II course for the Department of Computer Science at KU Leuven.**
DoorIQ has **no affiliation** with the commercial entity *doorIQ.ai* or any other existing trademarked security systems.

---

## ✨ Key Features

* **Secure Authentication:** User registration and profile management handled via Supabase Auth and PostgreSQL.
* **Multi-User Ecosystem:** * **Homes:** Create a "Home" and manage members.
    * **Invites:** Invite other users to your home using their unique User UUID.
    * **Device Linking:** Seamlessly link a physical DoorIQ hardware device to your home dashboard.
* **Live Interaction (LiveKit):**
    * **WebRTC Streaming:** Low-latency video and audio rooms for instant communication.
    * **IR Night Vision:** Support for infrared cameras to ensure security in zero-light conditions.
    * **Two-Way Audio:** Listen to the doorstep mic and speak back through the Raspberry Pi's speaker in real-time.
* **Smart Automation & Voice Notes:**
    * **Prerecorded Responses:** Set specific voice notes to play automatically when the physical doorbell button is pressed.
    * **Manual Trigger:** Play "Standard" or "Custom" voice notes from the dashboard if you cannot speak live.
* **Edge Intelligence:**
    * **Motion Detection:** Passive Infrared (PIR) sensors trigger instant live notifications and logs on the website.
    * **Live Activity Logs:** A real-time feed of motion events and doorbell presses.
* **Serverless Security:** Supabase Edge Functions securely handle LiveKit API keys and Secret keys to generate temporary access tokens, keeping your credentials hidden from the frontend.

---

## 🏗 System Architecture

The ecosystem relies on four main pillars:

1.  **The Edge Device (Raspberry Pi Zero 2W):** The hardware core. It monitors the motion sensor and button, captures IR camera footage, and manages the speaker/mic output via Python.
2.  **The Backend & Database (Supabase):** Acts as the central hub. It stores the state of "Homes," handles user permissions, and provides the Realtime engine that syncs the Pi and the Web Dashboard instantly.
3.  **The Gatekeeper (Supabase Edge Functions):** A secure middleware layer that generates LiveKit connection tokens for users, ensuring only authorized home members can access the camera feed.
4.  **The Dashboard (React):** A sleek, high-performance web interface where users manage their profile, interact with visitors, and view historical activity logs.

---

## 📋 Prerequisites

* **Node.js** (v18+) for the React dashboard.
* **Python 3.9+** on the Raspberry Pi Zero 2W.
* **Supabase Account:** With a project setup and Edge Functions enabled.
* **LiveKit Cloud Account:** For the WebRTC room hosting.
* **Hardware:** Raspberry Pi Zero 2W, IR Camera, PIR Motion Sensor, Tactile Doorbell Button, USB Speaker, and USB Microphone.

---

## 🛠 Installation & Setup Guide

### 1. Backend: Supabase Secrets
You must provide Supabase with your LiveKit credentials to allow Edge Functions to sign access tokens (for this project
"swift-action" is used as  the name of the Edge function):

```bash
# Set your LiveKit credentials in Supabase
supabase secrets set LIVEKIT_API_KEY=your_key_here
supabase secrets set LIVEKIT_API_SECRET=your_secret_here
```

### 2.Database & schema
Ensure your Supabase project includes the following tables to support the home/member ecosystem:

*   **profiles:** Links to auth.users (id, full_name, avatar_url).

*   **homes:** (id, name, owner_id).

*  **home_members:** (home_id, user_id) - allows multiple people per home.

*  **authorized_devices:** (id, device_name, home_id) - links the hardware to a specific home.

*  **event:** (created_at, event_type, home_id) - tracks motion and rings.

*  **commands:** (home_id,type,payload)

### 3. Frontend Setup (React)
```bash
# Install dependencies
npm install

# Create a .env file with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Start the development server
cd DoorIQWeb
npm run dev
```


### 🎓 Academic Credit
This project was created for:

*  **Course:** P&O II (Problem-solving and Design II)

*  **Department:** Computer Science

*  **University:** KU Leuven

*  **Year: 2025-2026**
