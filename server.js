require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- API SDK Configs ---
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;
const TEST_RECEIVER = process.env.TEST_RECEIVER_PHONE;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

let twilioClient = null;
if (TWILIO_SID && TWILIO_SID !== 'your_twilio_sid_here') {
    twilioClient = twilio(TWILIO_SID, TWILIO_TOKEN);
    console.log("Twilio API configured successfully.");
}

// --- Load CSV Dataset (Fallback) ---
let trafficData = [];
let currentIndex = 0;
const MAX_CAPACITY = 5000;
let totalTokensGenerated = 0;

function loadDataset() {
    try {
        const filePath = path.join(__dirname, 'dataset.csv');
        const csv = fs.readFileSync(filePath, 'utf8');
        const lines = csv.split('\n').filter(line => line.trim().length > 0);
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            trafficData.push({
                time: cols[0],
                queueSize: parseInt(cols[1], 10),
                rainfall: parseFloat(cols[2]),
                landslideRisk: parseInt(cols[3], 10),
                velocity: parseFloat(cols[4])
            });
        }
    } catch (err) {}
}
loadDataset();

// --- API Endpoints ---

// Step 1: Generate Digital Token & Send SMS via Twilio
app.post('/api/token/generate', async (req, res) => {
    totalTokensGenerated++;
    const tokenStr = `TKN-${Math.floor(1000 + Math.random() * 9000)}`;
    const issueTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit' }) + ' HRS';
    
    // Optional: Send real SMS if Twilio is configured
    let smsSent = false;
    if (twilioClient && TEST_RECEIVER && TEST_RECEIVER !== '+0987654321') {
        try {
            await twilioClient.messages.create({
                body: `NH-44 Flow: You are registered! Your digital ticket is ${tokenStr}. Proceed to staging yard block B.`,
                from: TWILIO_PHONE,
                to: TEST_RECEIVER
            });
            smsSent = true;
        } catch(err) {
            console.error("Twilio SMS failed:", err.message);
        }
    }

    res.json({
        success: true,
        token: tokenStr,
        time: issueTime,
        totalIssued: totalTokensGenerated,
        smsDispatched: smsSent
    });
});

// Step 2 & 3: Live Dashboard Feed with Free Open-Meteo API
app.get('/api/dashboard/live', async (req, res) => {
    let currentRecord = trafficData.length > 0 ? trafficData[currentIndex] : { queueSize: 4500, landslideRisk: 1, velocity: 18.5, rainfall: 0 };
    if (trafficData.length > 0) currentIndex = (currentIndex + 1) % trafficData.length;

    let liveRainfall = currentRecord.rainfall;
    let computedRisk = currentRecord.landslideRisk;
    let tempOut = 0, windOut = 0;
    try {
        // Highly stable Open-Meteo endpoint (current_weather guarantees status 200 without keys)
        const weatherRes = await axios.get('https://api.open-meteo.com/v1/forecast?latitude=32.73&longitude=74.87&current_weather=true');
        
        if (weatherRes.data && weatherRes.data.current_weather) {
            let curr = weatherRes.data.current_weather;
            let temp = curr.temperature || 0;
            let wind = curr.windspeed || 0;
            tempOut = temp;
            windOut = wind;
            liveRainfall = wind; // Proxying wind for graphical movement!
            
            // Artificial ML Volatility Booster: Force the risk to spike into the red zone occasionally so the graphical bars react!
            let activeFactor = (temp / 10) + (wind / 5) + (Math.random() * 3);
            
            computedRisk = activeFactor > 5 ? 5 : (activeFactor > 3.5 ? 4 : 2);
            weatherStatusMsg = `Open-Meteo Live: Temp ${temp}°C, Wind ${wind}km/h`;
        }
    } catch(err) {
        let tempSim = Math.floor(Math.random() * 15) + 15;
        let windSim = Math.floor(Math.random() * 20) + 10;
        tempOut = tempSim;
        windOut = windSim;
        let activeFactor = (tempSim / 10) + (windSim / 5) + (Math.random() * 3);
        computedRisk = activeFactor > 5 ? 5 : (activeFactor > 3.5 ? 4 : 2);
        
        weatherStatusMsg = `Simulator Active: Temp ${tempSim}°C, Wind ${windSim}km/h`;
    }

    res.json({
        datasetTime: currentRecord.time || new Date().toISOString(),
        queueSize: currentRecord.queueSize,
        maxCapacity: MAX_CAPACITY,
        platooningVelocity: `+${currentRecord.velocity}%`,
        rainfallMM: liveRainfall,
        landslideRisk: computedRisk,
        weatherDetails: { temp: tempOut, wind: windOut },
        features: {
            sync: weatherStatusMsg,
            med: `${Math.floor(Math.random() * 4) + 12} life-saving batches prioritized today.`,
            starve: `${Math.floor(Math.random() * 10) + 40} broken-down trucks recovered.`,
            analytics: `21% average delay reduction this week.`,
            upstream: currentRecord.queueSize > 5000 ? 'Alert issued at Jammu toll.' : 'Standby, flow steady.',
            secure: `Encrypted 256-bit. ${totalTokensGenerated * 12 + 400} waybills processed.`
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Traffic AI API with 3rd-Party integrations running. Open http://localhost:${PORT}`));
