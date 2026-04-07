# Kastra Control Tower | AI Traffic Management (NH-44)

An **AI-driven Smart Traffic Management Interface & Autonomous Queue Sorter** designed to dynamically regulate throughput, alleviate massive highway chokepoints, and automatically prioritize critical cargo through intelligent real-time diagnostics.

## 🚨 Problem Statement
Major arterial highways, specifically **National Highway 44 (NH-44)** in complex operational zones, suffer from catastrophic transport bottleneck failures. These supply-chain failures originate from:
1. **Unregulated Physical Staging:** Vast numbers of heavy commercial vehicles stampede towards terminal chokepoints simultaneously, causing 10km+ instances of physical shoulder parking and systemic delays.
2. **Zero Inherent Prioritization:** Critical military logistics, volatile fuel runs, and highly fragile medical/oxygen convoys frequently become trapped behind commercial timber or coal freighters for up to 48 hours without mathematical override routes.
3. **Environmental Cascades:** Unexpected weather anomalies (such as flash landslides or blizzard conditions) cause immediate systemic shutdowns due to a lack of predictive upstream signaling to trucks waiting hundreds of miles away in the network.

There is currently no digital, deterministic framework capable of seamlessly separating priorities without human-gatekeeper friction, while simultaneously ensuring low-priority commercial traffic doesn't succumb to continuous queue starvation.

## 💡 Project Description
Originated to stabilize the high-friction environment of NH-44, Kastra introduces an intelligent upstream metering framework. By converting physical, uncoordinated gate queues into structured **Digital Holding Yards** via SMS Tokens, Kastra limits physical dispatch velocity exclusively to what the downstream roads can actively endure.

The platform utilizes a highly visual **AI Control Tower** application. It autonomously intercepts truck waybills, parses them naturally, and executes intelligent bypass logic—guaranteeing that high-value emergency payloads bypass standard logistical flows instantly, while utilizing advanced algorithmic queue management to automatically rotate commercial loads to maintain economic equilibrium.

## 🧠 Google AI Integration & Machine Learning
This platform was explicitly architected incorporating advanced predictive analysis methodologies inspired by immense language and vision ecosystems. Specifically:
* **NLP Payload Matrix:** The system autonomously ingests countless raw incoming cargo manifests, leveraging natural language processing and pattern recognition to immediately evaluate security vectors (separating `Tier 1: Critical Oxygen/Medical` from `Tier 3: Raw Materials`).
* **Predictive Environmental ML & YOLOv8 Simulation:** High-order intelligence modules simulate the ingestion of highly dense weather REST variables (Open-Meteo) and live visual object recognition protocols (utilizing YOLOv8 modeled algorithms via CCTV arrays) to autonomously throttle downstream toll limits without requiring any administrative oversight.

---

## 🔥 Core Feature Architecture

*   **Autonomous Payload AI Protocol**: Ingests incoming truck manifests and processes natural language keywords. Instantly categorizes payloads into Tier 1 (Medical & Military), Tier 2 (Food/Perishables), and Tier 3 (Standard Commercial). Tier 1 payloads physically bypass the grid and leap cleanly to the front of operations.
*   **True FIFO Anti-Starvation Sweeper**: Uses foundational Operating System OS-aging physics to ensure standard queues are never trapped endlessly. An autonomous script natively sweeps the base of the queue—intercepting any Standard truck mathematically stranded by continuous Medical influxes—violently escalating its rating over the priority threshold to enforce fairness.
*   **ML Landslide Risk Monitor**: Connects with live weather dynamics (simulating Open-Meteo REST parameters), dynamically triggering emergency capacity halving or instantaneous gateway closures during extreme wind probabilities.
*   **Digital Token Generation**: Migrates physical driver lines into structured Digital Holding Yards. Issues exact time-slot QR tokens via simulated HTTP endpoints.
*   **Police Command Subsystem**: Empowers authorities to trigger live Drone Node scans, overwrite civilian payload capacities, or launch Army Convoys that permanently pause all other routing flows.
*   **Twilio SMS Messaging Gateway**: Designed to interface natively with the Twilio backend to broadcast mass delay alerts or target specific token receivers in the holding yards safely.

## 🎨 Layout & Light Mode Physics

Kastra is built on a custom **Enterprise-grade Light Mode UI**. Standard `rgba` translucency algorithms were completely removed and replaced by rigid, ultra-visible hex contrasts bounded by pristine `#cbd5e1` structural models. The entire interface reacts utilizing explicit smooth `cubic-bezier()` CSS hover constraints.

*   **Frontend**: Vanilla HTML / JS / Custom CSS Physics
*   **Backend Simulation**: Express.js (Node Backend Gateway) + API Routes

## ⚙️ Installation & Usage

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/kastra-traffic-management.git
   cd kastra-traffic-management
   ```

2. **Initialize Node Environment & Dependencies:**
   Make sure you have Node installed. Then install the core packages:
   ```bash
   npm install express cors dotenv
   ```

3. **Configure Environment Variables (Optional):**
   If integrating real live messaging, create a `.env` file at the root:
   ```env
   TWILIO_ACCOUNT_SID=your_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=your_twilio_number_here
   TEST_RECEIVER_PHONE=fallback_test_number
   ```

4. **Launch the Core Control Gateway:**
   ```bash
   node server.js
   ```

5. **Access the Subsystems:**
   * **Marketing Terminal:** Navigate to `http://localhost:3000/index.html` 
   * **Live Dashboard Control:** Go to `http://localhost:3000/dashboard.html` or click "Launch NH-44 Control Tower" from the main terminal.

## 🔍 System Operations Preview
Watch the Autonomous AI live! Upon accessing `dashboard.html`, head to the **Operations** tab. You'll witness the continuous incoming stream of mixed payloads sorting themselves natively based on the mathematical hierarchy. Look out for the glowing Violet `[AGE-ESCALATED]` badges firing when the Anti-Starvation sweep intercepts an older commercial truck structurally separated from dispatch!
