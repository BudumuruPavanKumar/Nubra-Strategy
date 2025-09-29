"use strict"
// Nubra Smart Trading Assistant - Interactive Application
class SmartTradingAssistant {
    constructor() {
        this.currentStep = 1;
        this.isOnboardingComplete = false;
        this.learningProgress = 33;
        this.chartInstance = null;
        this.currentTab = 'positions';
        this.tradingData = {
            userStats: {
                totalTrades: 156,
                successRate: 68,
                avgReturn: 12.4,
                riskScore: "Moderate",
                experience: "Intermediate"
            },
            patterns: [
                {
                    id: 'rsi',
                    type: "RSI Oversold",
                    frequency: 23,
                    success: 74,
                    description: "You often buy when RSI < 30",
                    automatable: true,
                    details: {
                        analysis: "Our AI detected that you consistently buy options when RSI drops below 30. This pattern shows strong consistency and good success rate.",
                        suggestions: [
                            "Automate RSI-based entries with 30 threshold",
                            "Add volume confirmation for better accuracy",
                            "Set automatic stop-loss at 20% below entry"
                        ],
                        performance: {
                            avgReturn: 18.5,
                            winRate: 74,
                            avgHoldTime: "2.3 hours",
                            bestPerformance: "+45%"
                        }
                    }
                },
                {
                    id: 'ma',
                    type: "Moving Average Cross",
                    frequency: 18,
                    success: 69,
                    description: "Buying on moving average signals",
                    automatable: true,
                    details: {
                        analysis: "You frequently enter positions when 9 EMA crosses above 21 EMA. This momentum-based strategy works well in trending markets.",
                        suggestions: [
                            "Set up automatic MA crossover alerts",
                            "Add trend filter for better timing",
                            "Consider position sizing based on trend strength"
                        ],
                        performance: {
                            avgReturn: 14.2,
                            winRate: 69,
                            avgHoldTime: "4.1 hours",
                            bestPerformance: "+32%"
                        }
                    }
                },
                {
                    id: 'support',
                    type: "Support Bounce",
                    frequency: 31,
                    success: 81,
                    description: "Trading near support levels",
                    automatable: false,
                    details: {
                        analysis: "You excel at identifying support level bounces manually. This requires discretionary judgment and is best kept manual.",
                        suggestions: [
                            "Use alerts when price approaches key levels",
                            "Create watchlists for support/resistance zones",
                            "Document your support level identification rules"
                        ],
                        performance: {
                            avgReturn: 22.1,
                            winRate: 81,
                            avgHoldTime: "1.8 hours",
                            bestPerformance: "+58%"
                        }
                    }
                }
            ],
            portfolio: {
                totalValue: 485600,
                todayPnL: 2340,
                positions: [
                    {
                        symbol: "NIFTY23DEC21000CE",
                        qty: 50,
                        price: 45.50,
                        pnl: 1250,
                        type: "CE"
                    },
                    {
                        symbol: "BANKNIFTY23DEC46000PE",
                        qty: 25,
                        price: 89.20,
                        pnl: -340,
                        type: "PE"
                    }
                ]
            }
        };

        this.init();
    }

    init() {
        this.showOnboarding();
        this.initChart();
        this.bindEvents();
        this.updateRealTimeData();
        this.startDataSimulation();
        // Initialize extra features
        this.initWatchlist();
        this.applySavedTheme();
    }

    // Onboarding Functions
    showOnboarding() {
        const modal = document.getElementById('onboardingModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.updateOnboardingStep(1);
        }
    }

    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateOnboardingStep(this.currentStep);
        } else {
            this.completeOnboarding();
        }
    }

    updateOnboardingStep(step) {
        // Hide all steps
        document.querySelectorAll('.onboarding__step').forEach(el => {
            el.classList.add('hidden');
        });

        // Show current step
        const currentStepEl = document.getElementById(`step${step}`);
        if (currentStepEl) {
            currentStepEl.classList.remove('hidden');
        }

        // Update progress dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            if (index < step) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update next button text
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.textContent = step === 3 ? 'Get Started' : 'Next';
        }
    }

    skipOnboarding() {
        this.closeOnboarding();
    }

    completeOnboarding() {
        this.isOnboardingComplete = true;
        this.closeOnboarding();
        this.showNotification('Welcome to Smart Trading Assistant!', 'Your trading patterns have been analyzed and automation suggestions are ready.', 'success');
    }

    closeOnboarding() {
        const modal = document.getElementById('onboardingModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Chart Initialization
    initChart() {
        const ctx = document.getElementById('tradingChart');
        if (!ctx) return;

        // Generate sample candlestick data
        const data = this.generateSampleChartData();

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'NIFTY 21500 CE',
                    data: data.prices,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        position: 'right',
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                },
                onHover: (event, elements) => {
                    const chartOverlay = document.getElementById('chartOverlay');
                    if (elements.length > 0 && chartOverlay) {
                        chartOverlay.classList.remove('hidden');
                    }
                }
            }
        });

        // Hide overlay when mouse leaves chart
        ctx.addEventListener('mouseleave', () => {
            const chartOverlay = document.getElementById('chartOverlay');
            if (chartOverlay) {
                chartOverlay.classList.add('hidden');
            }
        });
    }

    generateSampleChartData() {
        const labels = [];
        const prices = [];
        let basePrice = 45.50;

        for (let i = 0; i < 50; i++) {
            const time = new Date();
            time.setMinutes(time.getMinutes() - (50 - i));
            labels.push(time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

            // Generate realistic price movement
            const change = (Math.random() - 0.5) * 2;
            basePrice += change;
            prices.push(Math.max(30, Math.min(60, basePrice)));
        }

        return { labels, prices };
    }

    // Event Bindings
    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.textContent.toLowerCase();
                this.showTab(tabName);
            });
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.getAttribute('href'));
            });
        });

        // Timeframe buttons
        document.querySelectorAll('.timeframe').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timeframe').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChart(e.target.textContent);
            });
        });

        // Watchlist form
        const watchlistForm = document.getElementById('watchlistForm');
        if (watchlistForm) {
            watchlistForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('watchlistInput');
                if (input && input.value.trim()) {
                    this.addWatchlistItem(input.value.trim().toUpperCase());
                    input.value = '';
                }
            });
        }

        // Export CSV
        const exportBtn = document.getElementById('exportCsvBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportPositionsCsv());
        }

        // Dark mode toggle
        const darkToggle = document.getElementById('darkModeToggle');
        if (darkToggle) {
            darkToggle.addEventListener('click', () => this.toggleDarkMode());
        }

        // Take tour
        const takeTourBtn = document.getElementById('takeTourBtn');
        if (takeTourBtn) {
            takeTourBtn.addEventListener('click', () => this.startTour());
        }
    }

    /* Watchlist Features */
    initWatchlist() {
        // Load from localStorage or DEMO_DATA
        const saved = localStorage.getItem('nubra_watchlist');
        try {
            this.watchlist = saved ? JSON.parse(saved) : (DEMO_DATA.watchlist || []).map(w => w.symbol || w);
        } catch (e) {
            this.watchlist = (DEMO_DATA.watchlist || []).map(w => w.symbol || w);
        }
        this.renderWatchlist();
    }

    saveWatchlist() {
        localStorage.setItem('nubra_watchlist', JSON.stringify(this.watchlist));
    }

    renderWatchlist() {
        const container = document.getElementById('watchlistItems');
        if (!container) return;
        container.innerHTML = '';
        this.watchlist.forEach(symbol => {
            const li = document.createElement('li');
            li.className = 'watchlist-item';
            li.innerHTML = `
                <span class="watch-symbol">${symbol}</span>
                <div class="watch-actions">
                    <button class="btn btn--ghost btn--sm" data-symbol="${symbol}">View</button>
                    <button class="btn btn--outline btn--sm" data-remove="${symbol}">Remove</button>
                </div>
            `;
            container.appendChild(li);

            li.querySelectorAll('[data-remove]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const s = e.target.getAttribute('data-remove');
                    this.removeWatchlistItem(s);
                });
            });
        });
    }

    addWatchlistItem(symbol) {
        if (!symbol) return;
        if (this.watchlist.includes(symbol)) {
            this.showNotification('Watchlist', `${symbol} is already in your watchlist.`, 'info');
            return;
        }
        this.watchlist.unshift(symbol);
        if (this.watchlist.length > 20) this.watchlist.pop();
        this.saveWatchlist();
        this.renderWatchlist();
        this.showNotification('Watchlist', `${symbol} added to watchlist.`, 'success');
    }

    removeWatchlistItem(symbol) {
        this.watchlist = this.watchlist.filter(s => s !== symbol);
        this.saveWatchlist();
        this.renderWatchlist();
        this.showNotification('Watchlist', `${symbol} removed from watchlist.`, 'info');
    }

    /* Export Positions as CSV */
    exportPositionsCsv() {
        const rows = [];
        // header
        rows.push(["Symbol", "Qty", "Price", "P&L", "Type"]);

        const positionRows = document.querySelectorAll('.positions-table .table-row');
        positionRows.forEach(row => {
            const cols = Array.from(row.querySelectorAll('span, .symbol'));
            // fallback: read known order
            const symbol = row.querySelector('.symbol') ? row.querySelector('.symbol').textContent.trim() : cols[0] && cols[0].textContent.trim();
            const qty = cols[1] ? cols[1].textContent.trim() : '';
            const price = cols[2] ? cols[2].textContent.trim() : '';
            const pnl = cols[3] ? cols[3].textContent.trim() : '';
            const type = row.getAttribute('data-type') || '';
            rows.push([symbol, qty, price, pnl, type]);
        });

        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `positions_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.showNotification('Export', 'Positions exported as CSV.', 'success');
    }

    /* Dark Mode */
    applySavedTheme() {
        const theme = localStorage.getItem('nubra_theme') || 'light';
        if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        this.updateDarkToggleLabel();
    }

    toggleDarkMode() {
        const current = document.documentElement.getAttribute('data-theme');
        if (current === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('nubra_theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('nubra_theme', 'dark');
        }
        this.updateDarkToggleLabel();
    }

    updateDarkToggleLabel() {
        const label = document.getElementById('darkModeLabel');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (label) label.textContent = isDark ? 'Light' : 'Dark';
    }

    /* Simple Guided Tour */
    startTour() {
        const steps = [
            { el: '.header', text: 'This is the header. Access navigation and account actions here.' },
            { el: '.sidebar', text: 'Assistant panel: detected patterns, suggestions and progress.' },
            { el: '.chart-section', text: 'Live chart with quick trade overlay.' },
            { el: '.positions-section', text: 'View positions, orders and algorithms here.' }
        ];

        let idx = 0;
        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        overlay.innerHTML = `
            <div class="tour-card">
                <p id="tourText"></p>
                <div class="tour-controls">
                    <button id="tourPrev" class="btn btn--outline btn--sm">Prev</button>
                    <button id="tourNext" class="btn btn--primary btn--sm">Next</button>
                    <button id="tourClose" class="btn btn--ghost btn--sm">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const showStep = (i) => {
            idx = i;
            const step = steps[idx];
            const target = document.querySelector(step.el);
            const tourText = document.getElementById('tourText');
            if (!tourText) return;
            tourText.textContent = `${idx+1}. ${step.text}`;

            // position overlay card near element if possible
            const card = overlay.querySelector('.tour-card');
            if (target && card) {
                const rect = target.getBoundingClientRect();
                card.style.top = Math.max(10, rect.top + window.scrollY + 10) + 'px';
                card.style.left = Math.max(10, rect.left + window.scrollX + 10) + 'px';
            } else if (card) {
                card.style.top = '80px';
                card.style.left = '50%';
                card.style.transform = 'translateX(-50%)';
            }
        };

        showStep(0);

        overlay.querySelector('#tourNext').addEventListener('click', () => {
            if (idx < steps.length - 1) showStep(idx + 1);
            else this.endTour(overlay);
        });
        overlay.querySelector('#tourPrev').addEventListener('click', () => {
            if (idx > 0) showStep(idx - 1);
        });
        overlay.querySelector('#tourClose').addEventListener('click', () => this.endTour(overlay));
    }

    endTour(overlay) {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    // Tab Management
    showTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.textContent.toLowerCase() === tabName) {
                tab.classList.add('active');
            }
        });

        // Show/hide tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.remove('hidden');
        }

        this.currentTab = tabName;
    }

    // Navigation
    handleNavigation(href) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const targetLink = document.querySelector(`[href="${href}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        // Handle different sections
        switch (href) {
            case '#learn':
                this.showEducationSection();
                break;
            case '#dashboard':
                this.showDashboard();
                break;
            default:
                this.showNotification('Navigation', `Navigating to ${href.replace('#', '')} section`, 'info');
        }
    }

    showEducationSection() {
        const educationSection = document.getElementById('educationSection');
        const dashboardContainer = document.querySelector('.dashboard-container');

        if (educationSection && dashboardContainer) {
            dashboardContainer.style.display = 'none';
            educationSection.classList.remove('hidden');
        }
    }

    showDashboard() {
        const educationSection = document.getElementById('educationSection');
        const dashboardContainer = document.querySelector('.dashboard-container');

        if (educationSection && dashboardContainer) {
            educationSection.classList.add('hidden');
            dashboardContainer.style.display = 'flex';
        }
    }

    // Pattern Analysis
    showPatternDetails(patternId) {
        const pattern = this.tradingData.patterns.find(p => p.id === patternId);
        if (!pattern) return;

        const modal = document.getElementById('patternModal');
        const title = document.getElementById('patternTitle');
        const content = document.getElementById('patternContent');

        if (modal && title && content) {
            title.textContent = pattern.type + ' Analysis';

            content.innerHTML = `
                <div style="margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.5rem;">Pattern Overview</h4>
                    <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">${pattern.details.analysis}</p>
                </div>

                <div style="margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.5rem;">Performance Metrics</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                        <div style="text-align: center; padding: 1rem; background: var(--success-50); border-radius: var(--radius-md);">
                            <strong style="display: block; font-size: 20px; color: var(--success-600);">${pattern.details.performance.winRate}%</strong>
                            <small style="color: var(--color-text-secondary);">Win Rate</small>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: var(--primary-50); border-radius: var(--radius-md);">
                            <strong style="display: block; font-size: 20px; color: var(--primary-600);">+${pattern.details.performance.avgReturn}%</strong>
                            <small style="color: var(--color-text-secondary);">Avg Return</small>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.5rem;">Smart Suggestions</h4>
                    <ul style="margin-left: 1rem;">
                        ${pattern.details.suggestions.map(suggestion => `<li style="margin-bottom: 0.5rem;">${suggestion}</li>`).join('')}
                    </ul>
                </div>

                ${pattern.automatable ? `
                    <div style="text-align: center; margin-top: 1.5rem;">
                        <button class="btn btn--success" onclick="automatePattern('${pattern.id}')">
                            ⚡ Automate This Pattern
                        </button>
                    </div>
                ` : `
                    <div style="text-align: center; margin-top: 1.5rem; padding: 1rem; background: var(--warning-50); border-radius: var(--radius-md);">
                        <p style="color: var(--warning-700); margin: 0;">This pattern requires manual judgment and cannot be automated.</p>
                    </div>
                `}
            `;

            modal.classList.remove('hidden');
        }
    }

    closePatternModal() {
        const modal = document.getElementById('patternModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Automation Functions
    automatePattern(patternId) {
        const pattern = this.tradingData.patterns.find(p => p.id === patternId);
        if (!pattern) return;

        this.showNotification(
            'Pattern Automated!',
            `Successfully automated ${pattern.type}. The algorithm will monitor market conditions and execute trades based on your patterns.`,
            'success'
        );

        // Update UI to show pattern is now automated
        const patternElement = document.querySelector(`[onclick*="${patternId}"]`);
        if (patternElement) {
            const button = patternElement.querySelector('.automate-btn');
            if (button) {
                button.textContent = '✓ Active';
                button.style.backgroundColor = 'var(--success-600)';
                button.disabled = true;
            }
        }

        this.closePatternModal();
    }

    implementSuggestion(suggestionId) {
        const suggestions = {
            'rsi-auto': 'RSI Automation strategy has been implemented successfully!',
            'ma-alerts': 'Moving Average alerts have been configured and activated!'
        };

        const message = suggestions[suggestionId] || 'Suggestion implemented successfully!';
        this.showNotification('Implementation Complete', message, 'success');

        // Update automation rate
        this.updateAutomationRate();
    }

    suggestAutomation(symbol) {
        this.showNotification(
            'Automation Suggestion',
            `Based on your trading history with ${symbol}, we suggest setting up automatic stop-loss at 15% and take-profit at 25%.`,
            'info'
        );
    }

    updateAutomationRate() {
        const rateElement = document.querySelector('.stat-card:last-child .stat-value');
        if (rateElement) {
            let currentRate = parseInt(rateElement.textContent);
            const newRate = Math.min(100, currentRate + 10);
            rateElement.textContent = newRate + '%';
        }
    }

    // Trading Functions
    quickTrade(type) {
        const action = type === 'buy' ? 'BUY' : 'SELL';
        const price = type === 'buy' ? '₹45.50' : '₹45.30';

        this.showNotification(
            `${action} Order Placed`,
            `Market order to ${action} NIFTY 21500 CE at ${price} has been queued for execution.`,
            'success'
        );

        // Hide the overlay
        const overlay = document.getElementById('chartOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }

        // Simulate order execution after delay
        setTimeout(() => {
            this.showNotification(
                'Order Executed',
                `Your ${action} order has been successfully executed at ${price}.`,
                'success'
            );
            this.updatePortfolioData();
        }, 2000);
    }

    updatePortfolioData() {
        // Update P&L randomly
        const pnlElement = document.querySelector('.stat-card.positive .stat-value');
        if (pnlElement) {
            const currentPnL = parseFloat(pnlElement.textContent.replace(/[₹,]/g, ''));
            const change = Math.floor(Math.random() * 500) + 100;
            pnlElement.textContent = `+₹${(currentPnL + change).toLocaleString('en-IN')}`;
        }
    }

    // Chart Updates
    updateChart(timeframe) {
        if (!this.chartInstance) return;

        // Generate new data based on timeframe
        const data = this.generateSampleChartData();

        this.chartInstance.data.labels = data.labels;
        this.chartInstance.data.datasets[0].data = data.prices;
        this.chartInstance.update();

        this.showNotification('Chart Updated', `Switched to ${timeframe} timeframe`, 'info');
    }

    // Real-time Data Updates
    startDataSimulation() {
        // Simulate real-time price updates
        setInterval(() => {
            if (this.chartInstance && this.chartInstance.data.datasets[0].data.length > 0) {
                const lastIndex = this.chartInstance.data.datasets[0].data.length - 1;
                const lastPrice = this.chartInstance.data.datasets[0].data[lastIndex];
                const change = (Math.random() - 0.5) * 1;
                const newPrice = Math.max(30, Math.min(60, lastPrice + change));

                // Update last point
                this.chartInstance.data.datasets[0].data[lastIndex] = newPrice;
                this.chartInstance.update('none');
            }
        }, 1000);

        // Simulate portfolio updates
        setInterval(() => {
            this.simulatePortfolioUpdates();
        }, 5000);
    }

    simulatePortfolioUpdates() {
        const positions = document.querySelectorAll('.table-row .pnl');
        positions.forEach(pnlEl => {
            if (pnlEl) {
                const currentPnL = parseFloat(pnlEl.textContent.replace(/[₹,+-]/g, ''));
                const change = (Math.random() - 0.5) * 100;
                const newPnL = currentPnL + change;

                pnlEl.textContent = (newPnL >= 0 ? '+₹' : '-₹') + Math.abs(newPnL).toLocaleString('en-IN');
                pnlEl.className = 'pnl ' + (newPnL >= 0 ? 'positive' : 'negative');
            }
        });
    }

    updateRealTimeData() {
        // This would connect to real WebSocket feeds in production
        console.log('Real-time data simulation started');
    }

    // Notification System
    showNotification(title, message, type = 'info') {
        const container = document.getElementById('notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <h5>${title}</h5>
            <p>${message}</p>
        `;

        container.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Global Functions (called from HTML)
let app;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    app = new SmartTradingAssistant();

    // Make functions available globally for onclick handlers
    window.closeOnboarding = () => app.closeOnboarding();
    window.nextStep = () => app.nextStep();
    window.skipOnboarding = () => app.skipOnboarding();
    window.showPatternDetails = (id) => app.showPatternDetails(id);
    window.closePatternModal = () => app.closePatternModal();
    window.automatePattern = (id) => app.automatePattern(id);
    window.implementSuggestion = (id) => app.implementSuggestion(id);
    window.suggestAutomation = (symbol) => app.suggestAutomation(symbol);
    window.quickTrade = (type) => app.quickTrade(type);
    window.showTab = (tab) => app.showTab(tab);
});

// Additional utility functions
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

function formatPercentage(value) {
    return (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
}

function getRandomPrice(base, volatility = 1) {
    return base + (Math.random() - 0.5) * volatility;
}

function simulateNetworkDelay() {
    return new Promise(resolve => {
        setTimeout(resolve, Math.random() * 1000 + 500);
    });
}

// Demo data for development
const DEMO_DATA = {
    watchlist: [
        { symbol: 'NIFTY', price: 21450, change: +1.2 },
        { symbol: 'BANKNIFTY', price: 46200, change: -0.8 },
        { symbol: 'RELIANCE', price: 2450, change: +2.1 },
        { symbol: 'TCS', price: 3820, change: -0.5 }
    ],
    strategies: [
        {
            name: 'RSI Mean Reversion',
            status: 'active',
            pnl: 12500,
            trades: 23,
            winRate: 74
        },
        {
            name: 'Momentum Breakout',
            status: 'paused',
            pnl: -2300,
            trades: 8,
            winRate: 38
        }
    ]
};

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartTradingAssistant;
}
