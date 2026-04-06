document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api';

    // Navigation Toggles
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(item.getAttribute('data-target')).classList.add('active');
        });
    });

    // OVERVIEW ELEMENTS
    const ovTotal = document.getElementById('ov-total');
    const ovCritical = document.getElementById('ov-critical');
    const ovWait = document.getElementById('ov-wait');
    const ovBacklog = document.getElementById('ov-backlog');
    const ovLandslide = document.getElementById('ov-landslide');
    const ovFeed = document.getElementById('ov-feed');

    // POLICE / STATE ELEMENTS
    const polCivilian = document.getElementById('pol-civilian');
    const polArmy = document.getElementById('pol-army');
    const polCap = document.getElementById('pol-cap');
    const btnApplyPolice = document.getElementById('btn-apply-police');
    const btnRunDispatch = document.getElementById('btn-run-dispatch');
    const dispatchStatus = document.getElementById('dispatch-status');
    const dispatchIssued = document.getElementById('dispatch-issued');
    const btnDroneScan = document.getElementById('btn-drone-scan');
    const visSource = document.getElementById('vis-source');
    const visTrucks = document.getElementById('vis-trucks');
    const visFrames = document.getElementById('vis-frames');

    // DRIVER ELEMENTS
    const driverForm = document.getElementById('driver-form');
    const regTruck = document.getElementById('reg-truck');
    const regCargo = document.getElementById('reg-cargo');
    const regResult = document.getElementById('reg-result');
    const cargoClassText = document.getElementById('cargo-class-text');
    const cargoAiStatus = document.getElementById('cargo-ai-status');

    // Live AI NLP Analyzer for Medical Cargo Priority
    const criticalKeywords = ['medic', 'hospital', 'oxygen', 'blood', 'vaccine', 'drug', 'emergency', 'ambulance'];
    
    if (regCargo && cargoClassText) {
        regCargo.addEventListener('input', (e) => {
            let val = e.target.value.toLowerCase();
            if (val.length < 3) {
                cargoClassText.textContent = "Awaiting Manifest Input...";
                cargoClassText.style.color = "#9ca3af";
                cargoAiStatus.style.border = "1px solid #e5e7eb";
                cargoAiStatus.style.boxShadow = "none";
                return;
            }
            
            let isMedical = criticalKeywords.some(kw => val.includes(kw));
            if (isMedical) {
                cargoClassText.textContent = "TIER 1: CRITICAL MEDICAL PASS";
                cargoClassText.style.color = "#ef4444"; 
                cargoAiStatus.style.border = "1px solid #ef4444";
                cargoAiStatus.style.boxShadow = "0 0 15px rgba(239, 68, 68, 0.2)";
            } else {
                cargoClassText.textContent = "TIER 3: STANDARD COMMERCIAL";
                cargoClassText.style.color = "#059669";
                cargoAiStatus.style.border = "1px solid #059669";
                cargoAiStatus.style.boxShadow = "0 0 15px rgba(5, 150, 105, 0.1)";
            }
        });
    }

    // MESSAGING ELEMENTS
    const btnSendMsg = document.getElementById('btn-send-msg');
    const msgBody = document.getElementById('msg-body');
    const msgResult = document.getElementById('msg-result');
    const msgHistory = document.getElementById('msg-history');

    // State
    let systemMode = {
        civilianOpen: true,
        armyConvoy: false,
        capacityHr: 120,
        dispatchPaused: true
    };
    let globalDataCache = {};

    function addFeedItem(msg, source, color = 'red') {
        const d = new Date();
        const timeStr = d.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', second:'2-digit'});
        const html = `
            <div class="feed-item" style="animation: fadeIn 0.5s">
                <span class="dot ${color}"></span>
                <div class="feed-content">
                    <p>${msg}</p>
                    <span>${source} · ${timeStr}</span>
                </div>
            </div>
        `;
        ovFeed.insertAdjacentHTML('afterbegin', html);
        if(ovFeed.children.length > 5) ovFeed.lastElementChild.remove();
    }

    async function fetchDashboard() {
        try {
            const res = await fetch(`${API_URL}/dashboard/live`);
            const data = await res.json();
            globalDataCache = data;
            
            // Populating Overview
            if(ovTotal) ovTotal.textContent = (data.queueSize + 1200).toLocaleString();
            if(ovBacklog) ovBacklog.textContent = data.queueSize.toLocaleString();
            
            // Generate some dynamic mock stats based on queue
            let waitTime = (data.queueSize / systemMode.capacityHr).toFixed(1);
            if(ovWait) ovWait.textContent = isFinite(waitTime) ? waitTime : '∞';

            // Landslide
            if(ovLandslide) {
                if (data.landslideRisk > 3) {
                    ovLandslide.textContent = 'High';
                    ovLandslide.className = 'lbl red';
                } else if (data.landslideRisk > 1) {
                    ovLandslide.textContent = 'Medium';
                    ovLandslide.className = 'lbl orange';
                } else {
                    ovLandslide.textContent = 'Low';
                    ovLandslide.className = 'lbl green';
                }
            }

            // If it suddenly rains heavily, fire an alert
            if (data.landslideRisk > 4 && Math.random() < 0.2) {
                addFeedItem(`Landslide risk CRITICAL (Level ${data.landslideRisk}). Metering halted.`, 'ML Predictor', 'red');
            }

        } catch (e) {
            console.error("Fetch failed", e);
        }
    }

    // Driver Registration
    if(driverForm) {
        driverForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            regResult.textContent = 'Registering via AI...';
            regResult.style.color = 'var(--text-secondary)';
            
            try {
                const res = await fetch(`${API_URL}/token/generate`, { method: 'POST' });
                const json = await res.json();
                
                let isCritical = regCargo.value.toLowerCase().includes('medical') || regCargo.value.toLowerCase().includes('oxygen');
                
                setTimeout(() => {
                    regResult.textContent = `Success! Token [${json.token}] issued on ${json.time}`;
                    regResult.style.color = 'var(--teal)';
                    
                    // Add feed
                    if (isCritical) {
                        addFeedItem(`Priority pass approved for ${regTruck.value} (${regCargo.value}).`, 'Vision/WhatsApp', 'red');
                        if (ovCritical) ovCritical.textContent = parseInt(ovCritical.textContent) + 1;
                    } else {
                        addFeedItem(`Standard clearance. Token ${json.token} issued to ${regTruck.value}`, 'Auto-Gate', 'green');
                    }
                    
                    regTruck.value = '';
                    regCargo.value = '';
                }, 800);

            } catch(e) {
                regResult.textContent = 'API Error';
                regResult.style.color = 'var(--red)';
            }
        });
    }

    // Police Dashboard Actions
    if(btnApplyPolice) {
        btnApplyPolice.addEventListener('click', () => {
            systemMode.civilianOpen = polCivilian.checked;
            systemMode.armyConvoy = polArmy.checked;
            systemMode.capacityHr = parseInt(polCap.value) || 0;
            
            addFeedItem(`Police override applied. Civilian: ${systemMode.civilianOpen}, Army: ${systemMode.armyConvoy}, Cap: ${systemMode.capacityHr}/hr`, 'Police Command', 'orange');
            fetchDashboard(); // force refresh UI calculations
        });
    }

    if(btnRunDispatch) {
        btnRunDispatch.addEventListener('click', () => {
            systemMode.dispatchPaused = false;
            addFeedItem(`Dispatch algorithm RUN initiated. Gate opening.`, 'Dispatch Engine', 'green');
            
            if (dispatchStatus) {
                dispatchStatus.textContent = 'Live Flow';
                dispatchStatus.className = 'val green';
                dispatchIssued.textContent = Math.floor(Math.random() * 30 + 10) + " Tkns/min";
            }
        });
    }

    if (btnDroneScan) {
        btnDroneScan.addEventListener('click', () => {
            btnDroneScan.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;
            btnDroneScan.disabled = true;

            let frames = 0;
            let iv = setInterval(() => {
                frames += Math.floor(Math.random() * 200 + 50);
                if (visFrames) visFrames.textContent = frames.toLocaleString();
            }, 50);

            setTimeout(() => {
                clearInterval(iv);
                btnDroneScan.innerHTML = `<i class="fa-solid fa-camera"></i> Scan Complete`;
                btnDroneScan.disabled = false;
                
                let cams = ['Cam-44_Banihal', 'Drone_Alpha_Udhampur', 'Cam-13_Checkpoint'];
                if (visSource) visSource.textContent = cams[Math.floor(Math.random() * cams.length)];
                
                let heavy = Math.floor(Math.random() * 300) + 120;
                if (visTrucks) {
                    visTrucks.textContent = heavy + " Trks/hr";
                    visTrucks.style.color = (heavy > 200) ? 'var(--orange)' : 'var(--teal)';
                }

                addFeedItem(`YOLOv8 Scan resolved: Extracted ${heavy} object signatures from stream.`, 'Vision AI Module', 'teal');
            }, 1800);
        });
    }

    // Messaging Action
    if (btnSendMsg) {
        btnSendMsg.addEventListener('click', () => {
            let content = msgBody.value.trim();
            if(!content) {
                msgResult.textContent = 'Please enter a message payload first.';
                msgResult.style.color = 'var(--orange)';
                return;
            }

            msgResult.textContent = 'Authenticating with Twilio SMS Gateway...';
            msgResult.style.color = 'var(--text-secondary)';

            // Simulate HTTP dispatch delay
            setTimeout(() => {
                msgResult.textContent = `✔ Broadcast dispatched securely to 4,200 recipients.`;
                msgResult.style.color = 'var(--teal)';
                
                // Add to history UI
                const d = new Date();
                const timeStr = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const li = `<li><span style="color:#f39c12;">Manual Auth</span> <span style="font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:150px;">${content}</span> <span class="lbl green">${timeStr}</span></li>`;
                msgHistory.insertAdjacentHTML('afterbegin', li);
                
                // Echo to overview feed
                addFeedItem(`MANUAL BROADCAST: "${content}"`, 'Admin Dashboard', 'orange');
                msgBody.value = '';
                
            }, 1200);
        });
    }

    // Autonomous Cargo Priority Simulator
    const autoCargoTable = document.getElementById('op-cargo-auto');
    const mockCargoList = [
        "Cement Bags (50kg)", "Steel Reinforcements", "Hospital Oxygen Cylinders", "Fresh Produce (Apples)",
        "Logging Timber", "Electronic Appliances", "Emergency Vaccines (Cold)", "Auto Parts", "Commercial Furniture",
        "Military Rations", "Frozen Meat", "Army Artillery", "Raw Coal Bulk"
    ];

    function spawnAutoCargo() {
        if (!autoCargoTable) return;
        
        let cargoStr = mockCargoList[Math.floor(Math.random() * mockCargoList.length)];
        let truckId = "JK" + Math.floor(Math.random() * 90) + "AB" + Math.floor(1000 + Math.random() * 8999);
        
        let isMed = /oxygen|vaccine|hospital|medic/i.test(cargoStr);
        let isMil = /military|army/i.test(cargoStr);
        let isFood = /produce|meat/i.test(cargoStr);
        
        // Define dynamically mixed styling
        let tier = 'STANDARD';
        let bgStyle = 'transparent';
        let colorStyle = 'inherit';
        let weightStyle = 'normal';
        let badgeColor = 'green';
        let priority = 3;

        if (isMed) {
            tier = 'TIER 1 (MED)';
            bgStyle = 'rgba(239, 68, 68, 0.15)'; colorStyle = '#ef4444'; weightStyle = '600'; badgeColor = '#ef4444';
        } else if (isMil) {
            tier = 'TIER 1 (MILITARY)';
            bgStyle = 'rgba(56, 189, 248, 0.15)'; colorStyle = '#38bdf8'; weightStyle = '600'; badgeColor = '#3b82f6';
        } else if (isFood) {
            tier = 'TIER 2 (FOOD)';
            bgStyle = 'rgba(243, 156, 18, 0.15)'; colorStyle = '#f39c12'; weightStyle = '600'; badgeColor = '#f39c12';
        } else {
            badgeColor = '#22c55e';
        }

        let rowHTML = `
            <tr style="animation: fadeIn 0.5s; background: ${bgStyle};">
                <td style="color: ${colorStyle}; font-weight: ${weightStyle};">${truckId}</td>
                <td style="color: #4b5563; font-weight: 500;">${cargoStr}</td>
                <td><span style="display:inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; color: #fff; background-color: ${badgeColor};">${tier}</span></td>
            </tr>
        `;

        // Physical Prioritization Logic
        if (priority === 1) {
            autoCargoTable.insertAdjacentHTML('afterbegin', rowHTML); // absolute front
        } else if (priority === 2) {
            // Place under Tier 1 but ahead of Standard. 
            if (autoCargoTable.children.length > 2) {
                autoCargoTable.children[1].insertAdjacentHTML('afterend', rowHTML);
            } else {
                autoCargoTable.insertAdjacentHTML('afterbegin', rowHTML); 
            }
        } else {
            autoCargoTable.insertAdjacentHTML('beforeend', rowHTML); // sent to back of line
        }

        // Live Feed Integration with properly mapped glowing dots
        let feedColorVar = 'green';
        let actionDesc = 'processed to standard queue.';
        if (isMed) { feedColorVar = 'red'; actionDesc = 'GRANTED PRIORITY BYPASS.'; }
        else if (isMil) { feedColorVar = 'blue'; actionDesc = 'GRANTED PRIORITY BYPASS.'; }
        else if (isFood) { feedColorVar = 'orange'; actionDesc = 'Routed to elevated track.'; }
        
        addFeedItem(`AI SORTER: [${tier}] ${truckId} ${actionDesc}`, 'Payload AI', feedColorVar);

        // Auto-Prune overflow: Drops the newest arriving standard trucks if queue is massively full
        if (autoCargoTable.children.length > 7) {
            autoCargoTable.lastElementChild.remove();
        }
    }

    // High Intelligence Anti-Starvation Sweeper:
    // Identifies the oldest standard truck waiting in line and grants bypass priority.
    function antiStarvationSweep() {
        if (!autoCargoTable || autoCargoTable.children.length < 3) return;

        let oldestStandardRow = null;

        // Loop top-down. The first "STANDARD" truck we hit is the oldest because
        // new standard trucks are appended to the very bottom.
        for (let row of autoCargoTable.children) {
            if (row.textContent.includes('STANDARD') && !row.dataset.rescued) {
                oldestStandardRow = row;
                break; // Found the oldest waiting standard truck!
            }
        }

        if (oldestStandardRow) {
            oldestStandardRow.dataset.rescued = 'true';
            
            let truckIdTD = oldestStandardRow.children[0];
            let truckId = truckIdTD.textContent;
            
            oldestStandardRow.style.background = 'rgba(139, 92, 246, 0.15)'; 
            truckIdTD.style.color = '#8b5cf6';
            truckIdTD.style.fontWeight = '600';
            
            let statusTD = oldestStandardRow.children[2];
            statusTD.innerHTML = `<span style="display:inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; color: #fff; background-color: #8b5cf6;">AGE-ESCALATED</span>`;
            
            // Execute absolute jump to the top of queue
            autoCargoTable.insertAdjacentElement('afterbegin', oldestStandardRow);
            
            addFeedItem(`ANTI-STARVATION: ${truckId} processing stalled. Age-Escalation granted!`, 'Aging Algo', 'violet');
        }
    }

    // Start Loops
    fetchDashboard();
    setInterval(fetchDashboard, 5000);
    setInterval(spawnAutoCargo, 3500);
    setInterval(antiStarvationSweep, 18000); // Scans for stalled trucks every 18 seconds
});
