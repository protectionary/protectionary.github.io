
const DISCORD_USER_ID = '1303056358844665969';
const LANYARD_WS_URL = 'wss://api.lanyard.rest/socket';
const tracks = [
    'Husband.m4a',
    'Lifestyle.m4a',
];

let socket = null;
let heartbeatInterval = null;
let spotifyUpdateInterval = null;
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let isTyping = false;

let currentTrack = 0;
const audio = new Audio();
audio.src = tracks[currentTrack];
audio.play().catch(err => console.log('Autoplay blocked:', err));
audio.addEventListener('ended', () => {
    currentTrack++;
    if (currentTrack >= tracks.length) {
        currentTrack = 0;
    }
    audio.src = tracks[currentTrack];
    audio.play().catch(err => console.log('Autoplay blocked:', err));
});
window.addEventListener('load', () => {
    audio.play().catch(err => console.log('Autoplay blocked:', err));
});

document.addEventListener('DOMContentLoaded', function() {
    initSmoothScroll();
    initCustomCursor();
    initTypingEffect();
    createParticles();
    connectToLanyard();
    initCopyFeature();
});


function initSmoothScroll() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
}


function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const cursorDot = cursor.querySelector('.cursor-dot');
    const cursorRing = cursor.querySelector('.cursor-ring');
    

    const interactiveElements = document.querySelectorAll(
        'a, button, .card, .skill-tag, .skill-expand, .avatar, .link-item'
    );
    

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    

    function animateCursor() {
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;
        
        cursorX += dx * 0.2;
        cursorY += dy * 0.2;
        
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
        
        cursorRing.style.left = cursorX + 'px';
        cursorRing.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    

    document.addEventListener('mousedown', () => {
        cursor.classList.add('click');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('click');
    });
    

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}


function initTypingEffect() {
    const typingElement = document.getElementById('typing-text');
    const text = 'protectionary';
    let i = 0;
    
    function typeWriter() {
        if (i < text.length) {
            typingElement.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 150);
        }
    }
    
    setTimeout(typeWriter, 1000);
}


function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        

        particle.style.opacity = Math.random() * 0.1 + 0.05;
        
        particlesContainer.appendChild(particle);
    }
}


function connectToLanyard() {
    if (socket) {
        socket.close();
    }

    socket = new WebSocket(LANYARD_WS_URL);

    socket.onopen = function() {
        console.log('🔗 Connected to Lanyard');
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.op === 1) {

            heartbeatInterval = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ op: 3 }));
                }
            }, data.d.heartbeat_interval);
            

            socket.send(JSON.stringify({
                op: 2,
                d: {
                    subscribe_to_id: DISCORD_USER_ID
                }
            }));
        } else if (data.op === 0) {
            updateDiscordStatus(data.d);
        }
    };

    socket.onclose = function() {
        console.log('❌ Disconnected from Lanyard');
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
        }
        if (spotifyUpdateInterval) {
            clearInterval(spotifyUpdateInterval);
        }
        

        setTimeout(connectToLanyard, 5000);
    };

    socket.onerror = function(error) {
        console.error('🚨 Lanyard WebSocket error:', error);
    };
}


function updateDiscordStatus(data) {
    const avatarElement = document.getElementById('avatar');
    const statusDot = document.getElementById('status-dot');
    const statusBadge = document.getElementById('status-badge');
    const discordCard = document.getElementById('discord-card');
    const discordActivity = document.getElementById('discord-activity');
    const spotifyCard = document.getElementById('spotify-card');


    if (data.discord_user && data.discord_user.avatar) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=256`;
        avatarElement.src = avatarUrl;
    }


    if (data.discord_status) {
        statusDot.className = `status-dot ${data.discord_status}`;
        statusBadge.className = `status-badge ${data.discord_status}`;
        
        const statusTexts = {
            'online': 'Online',
            'idle': 'Away',
            'dnd': 'Do Not Disturb',
            'offline': 'Offline'
        };
        
        statusBadge.textContent = statusTexts[data.discord_status] || 'Unknown';
    }


    if (data.activities && data.activities.length > 0) {
        const activity = data.activities.find(a => a.type !== 4 && a.name !== 'Spotify');
        
        if (activity) {
            displayDiscordActivity(activity);
        } else {
            hideDiscordActivity();
        }
    } else {
        hideDiscordActivity();
    }

    if (data.spotify) {
        spotifyCard.style.display = 'block';
        updateSpotifyInfo(data.spotify);
        
        if (spotifyUpdateInterval) {
            clearInterval(spotifyUpdateInterval);
        }
        
        spotifyUpdateInterval = setInterval(() => {
            updateSpotifyProgress(data.spotify);
        }, 1000);
    } else {
        spotifyCard.style.display = 'none';
        if (spotifyUpdateInterval) {
            clearInterval(spotifyUpdateInterval);
        }
    }
}


function displayDiscordActivity(activity) {
    const discordActivity = document.getElementById('discord-activity');
    const activityImage = document.getElementById('activity-image');
    const activityName = document.getElementById('activity-name');
    const activityDetails = document.getElementById('activity-details');
    
    discordActivity.style.display = 'flex';
    
    if (activity.assets && activity.assets.large_image && activity.application_id) {
        let iconUrl;
        if (activity.assets.large_image.startsWith('mp:')) {
            iconUrl = `https://media.discordapp.net/${activity.assets.large_image.slice(3)}`;
        } else {
            iconUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
        }
        
        activityImage.src = iconUrl;
        activityImage.style.display = 'block';
    } else {
        activityImage.style.display = 'none';
    }
    

    activityName.textContent = activity.name;
    activityDetails.textContent = activity.state || activity.details || 'Playing';
}

function hideDiscordActivity() {
    const discordActivity = document.getElementById('discord-activity');
    discordActivity.style.display = 'none';
}

function updateSpotifyInfo(spotify) {
    const albumCover = document.getElementById('album-cover');
    const trackTitle = document.getElementById('track-title');
    const trackArtist = document.getElementById('track-artist');
    
    if (spotify.album_art_url) {
        albumCover.src = spotify.album_art_url;
    }
    
    trackTitle.textContent = spotify.song || 'Unknown Track';
    trackArtist.textContent = spotify.artist || 'Unknown Artist';
}


function updateSpotifyProgress(spotify) {
    const progressBar = document.getElementById('progress-bar');
    const currentTime = document.getElementById('current-time');
    const totalTime = document.getElementById('total-time');
    
    if (spotify.timestamps) {
        const now = Date.now();
        const elapsed = now - spotify.timestamps.start;
        const total = spotify.timestamps.end - spotify.timestamps.start;
        const progress = Math.min((elapsed / total) * 100, 100);
        
        progressBar.style.width = progress + '%';
        
        currentTime.textContent = formatTime(elapsed);
        totalTime.textContent = formatTime(total);
    }
}


function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}


function initCopyFeature() {
    const copyElements = document.querySelectorAll('[data-copy]');
    
    copyElements.forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const textToCopy = element.getAttribute('data-copy');
            const type = element.getAttribute('data-type') || 'Text';
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification(`${type} copié dans le presse-papiers`);
            }).catch(() => {
                showNotification('Erreur lors de la copie');
            });
        });
    });
}


function showNotification(message) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);

}


