document.addEventListener('DOMContentLoaded', () => {
    // ty cloudflare workers for my safe discord api integration
    const WORKER_URL = 'https://tabbyhelper.mail-115.workers.dev';

    async function fetchDiscordAvatars() {
        const staffCards = document.querySelectorAll('.staff-member[data-discord-id]');

        for (const card of staffCards) {
            let userId = card.dataset.discordId.replace(/[^0-9]/g, '');
            const avatarElement = card.querySelector('.staff-avatar');
            // Delete element name if we dont need it anymore...

            if (!userId || userId.length < 17) {
                // If ID is incorrect - we skip that shit
                continue;
            }

            const requestUrl = `${WORKER_URL}/${userId}`;

            try {
                const response = await fetch(requestUrl);
                if (!response.ok) throw new Error(`Worker responded with status ${response.status}`);
                
                const data = await response.json();

                // Check if there is an avatar link
                if (data && data.avatar_url) {
                    avatarElement.src = data.avatar_url;
                } else {
                     throw new Error('Avatar URL not found in worker response');
                }

            } catch (error) {
                console.error(`Failed to process user ID ${userId}:`, error);
                // If something went wrong - I load Tabby Tavern logo instead of avatar
            }
        }
    }

    // --- Light-Dark theme changer ---
    const themeToggleButton = document.getElementById('theme-toggle');
    if(themeToggleButton) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleButton.textContent = '☀️';
        }
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            let theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            themeToggleButton.textContent = theme === 'dark' ? '☀️' : '🌙';
            localStorage.setItem('theme', theme);
        });
    }

    // --- Filters ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const staffCardsList = document.querySelectorAll('.staff-list .staff-member');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active-filter'));
                button.classList.add('active-filter');
                const filter = button.dataset.filter;
                staffCardsList.forEach(card => {
                    card.style.display = (filter === 'all' || card.dataset.role === filter) ? 'flex' : 'none';
                });
            });
        });
    }

    fetchDiscordAvatars();
	
	    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            // Show button. You scrolled too deep.
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
    }
});