document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api';

    // UI Elements
    const liveTokenDisp = document.getElementById('live-token-disp');
    const tokenTimeDisp = liveTokenDisp ? liveTokenDisp.nextElementSibling.querySelector('span') : null;
    const capacityTxt = document.getElementById('capacity-txt');
    const queueTxt = document.getElementById('queue-txt');
    const progressFill = document.querySelector('.progress-fill-thick');
    const velocityTxt = progressFill ? progressFill.parentElement.nextElementSibling : null;
    const hFills = document.querySelectorAll('.h-fill');
    const landingFeed = document.getElementById('landing-live-feed');

    // MOCKUP ANIMATIONS & DATA FETCHING

    function addFeedLog(msg, colorHex) {
        if (!landingFeed) return;
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        const html = `
            <div style="font-size: 13px; color: #4b5563; display: flex; gap: 15px; animation: fadeIn 0.3s; padding-bottom: 8px; border-bottom: 1px solid #f3f4f6;">
                <span style="color: #9ca3af;">[${time}]</span>
                <span style="color: ${colorHex}; flex-shrink: 0; font-weight: 600;">» LOG:</span>
                <span style="color: #1f2937;">${msg}</span>
            </div>
        `;
        landingFeed.insertAdjacentHTML('afterbegin', html);
        if (landingFeed.children.length > 8) landingFeed.lastElementChild.remove();
    }

    // Step 1: Token Generation via POST API
    async function triggerTokenGeneration() {
        if (!liveTokenDisp) return;
        
        liveTokenDisp.style.opacity = 0;
        tokenTimeDisp.style.opacity = 0;
        
        try {
            const res = await fetch(`${API_URL}/token/generate`, { method: 'POST' });
            const data = await res.json();
            
            setTimeout(() => {
                liveTokenDisp.textContent = data.token;
                tokenTimeDisp.textContent = data.time;
                liveTokenDisp.style.opacity = 1;
                tokenTimeDisp.style.opacity = 1;

                liveTokenDisp.style.color = 'var(--accent)';
                setTimeout(() => liveTokenDisp.style.color = '#fff', 500);

                addFeedLog(`Virtual Queue Token ${data.token} successfully issued to registered driver.`, '#22c55e');
            }, 300);
        } catch (e) {
            console.error("Token generation failed:", e);
            addFeedLog(`API ERROR: Token server timeout / error.`, '#ef4444');
        }
    }

    // Showcase Cards: Fetch Live Dashboard Stats
    async function fetchLiveStats() {
        try {
            const res = await fetch(`${API_URL}/dashboard/live`);
            const data = await res.json();
            
            if (capacityTxt) capacityTxt.textContent = data.maxCapacity.toLocaleString();
            if (queueTxt) queueTxt.textContent = (data.queueSize / 1000).toFixed(1) + 'k';

            if (progressFill) {
                let speedPct = 80;
                if (data.queueSize > data.maxCapacity) speedPct = 40;
                
                progressFill.style.width = '0%';
                setTimeout(() => {
                    progressFill.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
                    progressFill.style.width = speedPct + '%';
                    if (velocityTxt) velocityTxt.textContent = (speedPct === 40) ? '+5.2% Velocity' : data.platooningVelocity;
                }, 100);
            }

            // 3. New Detailed ML Predictor Panel
            if (data.weatherDetails) {
                const lsTag = document.getElementById('ls-status-tag');
                const lsTemp = document.getElementById('ls-temp');
                const lsWind = document.getElementById('ls-wind');
                const lsSat = document.getElementById('ls-sat');
                const lsAction = document.getElementById('ls-action-rec');

                addFeedLog(`Open-Meteo HTTP GET | Lat: 32.73, Lon: 74.87 | Temp: ${data.weatherDetails.temp}°C, Wind: ${data.weatherDetails.wind}km/h`, '#3b82f6');

                if (lsTemp && lsWind && lsSat) {
                    lsTemp.textContent = data.weatherDetails.temp + '°C';
                    lsWind.textContent = data.weatherDetails.wind + ' km/h';
                    
                    let satProb = (data.landslideRisk / 5 * 100).toFixed(0);
                    lsSat.textContent = satProb + '%';

                    if (data.landslideRisk >= 5) {
                        lsTag.textContent = 'CRITICAL RISK';
                        lsTag.style.background = '#ef4444';
                        lsSat.style.color = '#ef4444';
                        lsAction.textContent = 'AI ACTION: HIGH DANGER DETECTED. Toll gates closed immediately. Emergency reroute initialized.';
                        lsAction.style.background = 'rgba(239, 68, 68, 0.1)';
                        lsAction.style.borderLeft = '3px solid #ef4444';
                        
                        addFeedLog(`ML ALGORITHM SPUR: Landslide Probability at ${satProb}%. Executing gate closure.`, '#ef4444');
                    } else if (data.landslideRisk >= 4) {
                        lsTag.textContent = 'WARNING';
                        lsTag.style.background = '#f39c12';
                        lsSat.style.color = '#f39c12';
                        lsAction.textContent = 'AI ACTION: Conditions deteriorating. Halt standard dispatch. Enforce 50% capacity flow limit.';
                        lsAction.style.background = 'rgba(243, 156, 18, 0.1)';
                        lsAction.style.borderLeft = '3px solid #f39c12';
                        
                        addFeedLog(`ML ALGORITHM SPUR: Restrictive queuing enforced. Halving capacity to 50% due to wind metrics.`, '#f39c12');
                    } else {
                        lsTag.textContent = 'SAFE';
                        lsTag.style.background = '#10b981';
                        lsSat.style.color = '#1f2937';
                        lsAction.textContent = 'AI ACTION: Conditions steady. Staggered platooning dispatch permitted.';
                        lsAction.style.background = 'rgba(16, 185, 129, 0.1)';
                        lsAction.style.borderLeft = '3px solid #10b981';
                        lsAction.style.color = '#1f2937';
                        
                        addFeedLog(`ML Core Engine Output computed steadily. Landslide risk low (${satProb}%).`, '#10b981');
                    }
                }
            }

            // 4. Feature Card Live Updates (STAYS CONSTANTLY VISIBLE)
            if (data.features) {
                const wreadout = document.getElementById('live-weather-readout');
                if(wreadout) wreadout.textContent = data.features.sync;

                const fsync = document.getElementById('feat-sync');
                if(fsync) fsync.textContent = data.features.sync;
                
                const fmed = document.getElementById('feat-med');
                if(fmed) fmed.textContent = data.features.med;

                const fstarve = document.getElementById('feat-starve');
                if(fstarve) fstarve.textContent = data.features.starve;

                const fanalytics = document.getElementById('feat-analytics');
                if(fanalytics) fanalytics.textContent = data.features.analytics;

                const fupstream = document.getElementById('feat-upstream');
                if(fupstream) {
                    fupstream.textContent = data.features.upstream;
                    const upDot = document.getElementById('dot-upstream');
                    if (data.features.upstream.includes('Alert')) {
                        fupstream.style.color = '#ef4444';
                        if(upDot) {
                           upDot.style.backgroundColor = '#ef4444';
                           upDot.classList.add('active');
                        }
                    } else {
                        fupstream.style.color = 'var(--accent)';
                        if(upDot) {
                            upDot.style.backgroundColor = 'var(--accent)';
                            upDot.classList.remove('active');
                        }
                    }
                }

                const fsecure = document.getElementById('feat-secure');
                if(fsecure) fsecure.textContent = data.features.secure;

                // Pulse all active dots momentarily
                const dots = document.querySelectorAll('.pulse-dot:not(#dot-upstream)');
                dots.forEach(d => {
                    d.classList.add('active');
                    setTimeout(() => d.classList.remove('active'), 1500);
                });
            }

        } catch (e) {
            console.error("Live stats fetch failed:", e);
        }
    }

    triggerTokenGeneration();
    fetchLiveStats();

    setInterval(triggerTokenGeneration, 4000); 
    setInterval(fetchLiveStats, 5000); 
});
