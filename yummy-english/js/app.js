// --- Data Kosakata ---
    const vocabulary = [
        { id: 'spring_roll', en: 'spring roll', emoji: '🌯', type: 'appetizer' },
        { id: 'vegetable_salad', en: 'vegetable salad', emoji: '🥗', type: 'appetizer' },
        { id: 'fried_tofu', en: 'fried tofu', emoji: '🟨', type: 'appetizer' },
        { id: 'fried_rice', en: 'fried rice', emoji: '🍛', type: 'main' },
        { id: 'grilled_chicken', en: 'grilled chicken', emoji: '🍗', type: 'main' },
        { id: 'meatball_soup', en: 'meatball soup', emoji: '🍲', type: 'main' },
        { id: 'burger', en: 'burger', emoji: '🍔', type: 'main' },
        { id: 'spaghetti_bolognese', en: 'spaghetti bolognese', emoji: '🍝', type: 'main' },
        { id: 'chicken_noodle_soup', en: 'chicken noodle soup', emoji: '🍜', type: 'main' },
        { id: 'fried_noodles', en: 'fried noodles', emoji: '🍝', type: 'main' },
        { id: 'chicken_katsu', en: 'chicken katsu', emoji: '🍛', type: 'main' },
        { id: 'chicken_satay', en: 'chicken satay', emoji: '🍢', type: 'main' },
        { id: 'french_fries', en: 'french fries', emoji: '🍟', type: 'side' },
        { id: 'garlic_bread', en: 'garlic bread', emoji: '🥖', type: 'side' },
        { id: 'green_salad', en: 'green salad', emoji: '🥗', type: 'side' },
        { id: 'chocolate_pudding', en: 'chocolate pudding', emoji: '🍮', type: 'dessert' },
        { id: 'ice_cream', en: 'ice cream', emoji: '🍨', type: 'dessert' },
        { id: 'fruit_salad', en: 'fruit salad', emoji: '🍓', type: 'dessert' },
        { id: 'iced_tea', en: 'iced tea', emoji: '🧋', type: 'beverage' },
        { id: 'orange_juice', en: 'orange juice', emoji: '🍊', type: 'beverage' },
        { id: 'strawberry_milk', en: 'strawberry milk', emoji: '🍓🥛', type: 'beverage' },
        { id: 'chocolate_drink', en: 'chocolate drink', emoji: '🍫☕', type: 'beverage' },
        { id: 'iced_milk', en: 'iced milk', emoji: '🥛', type: 'beverage' },
        { id: 'hot_tea', en: 'hot tea', emoji: '☕', type: 'beverage' }
    ];

    function menuImagePath(item) {
        const imageName = item.en === 'chocolate drink' ? 'chocolate milk' : item.en;
        return `../assets/images/menu/${encodeURIComponent(imageName)}.png`;
    }

    // --- State Management ---
    const stateKey = 'yummy-english-state';
    const savedState = JSON.parse(sessionStorage.getItem(stateKey) || '{}');
    let currentQuiz = Array.isArray(savedState.currentQuiz) ? savedState.currentQuiz : [];
    let currentQuestionIndex = Number.isInteger(savedState.currentQuestionIndex) ? savedState.currentQuestionIndex : 0;
    let studentName = typeof savedState.studentName === 'string' ? savedState.studentName : '';
    const quizLengths = { listening: 10, speaking: 10, writing: 10 };
    const maxQuestions = quizLengths.speaking;
    const preparedListeningItems = [
        { id: 'burger' },
        { id: 'chicken_noodle_soup' },
        { id: 'chicken_katsu' },
        { id: 'french_fries' },
        { id: 'fried_noodles' },
        { id: 'garlic_bread' },
        { id: 'green_salad' },
        { id: 'iced_milk' },
        { id: 'iced_tea' },
        { id: 'orange_juice' },
        { id: 'spring_roll' },
        { id: 'strawberry_milk' }
    ];
    let currentTarget = null;
    let listeningAudio = null;
    let menuAudio = null;
    let scores = { listening: 0, speaking: 0, writing: 0, ...savedState.scores };
    const currentPage = document.body.dataset.page;

    function getListeningQuiz() {
        return preparedListeningItems
            .map(item => vocabulary.find(v => v.id === item.id))
            .filter(Boolean);
    }

    function getListeningAudioUrl(item) {
        const fileMap = {
            burger: 'listening_burger',
            chicken_noodle_soup: 'listening_chickennoodlesoup',
            chicken_katsu: 'listening_chickenkatsu',
            french_fries: 'listening_frenchfries',
            fried_noodles: 'listening_friednoodles',
            garlic_bread: 'listening_garlicbread',
            green_salad: 'listening_greensalad',
            iced_milk: 'listenig_icedmilk',
            iced_tea: 'listening_iced tea',
            orange_juice: 'listening_orangejuice',
            spring_roll: 'listening_springroll',
            strawberry_milk: 'listening_strawberry milk'
        };

        const fileName = fileMap[item.id];
        if (!fileName) return '';
        return `../assets/audio/${encodeURIComponent(fileName)}.mp3`;
    }

    function saveState() {
        sessionStorage.setItem(stateKey, JSON.stringify({ currentQuiz, currentQuestionIndex, scores, studentName }));
    }

    // --- Navigation & Modals ---
    function navigateTo(url) {
        const destination = new URL(url, window.location.href);
        const gameContainer = document.getElementById('game-container');

        if (document.fullscreenElement === gameContainer) {
            let pageFrame = gameContainer.querySelector('.fullscreen-page-frame');
            if (!pageFrame) {
                pageFrame = document.createElement('iframe');
                pageFrame.className = 'fullscreen-page-frame';
                pageFrame.title = 'Halaman permainan';
                pageFrame.allowFullscreen = true;
                pageFrame.allow = 'microphone';
                gameContainer.appendChild(pageFrame);
            }
            pageFrame.src = destination.href;
            return;
        }

        window.location.href = destination.href;
    }

    function goToScreen(screenId) {
        if (currentPage === 'speaking') {
            cancelSpeakingAttempt();
        }

        const destinations = {
            'screen-home': currentPage === 'home' ? 'index.html' : '../index.html',
            'screen-menu': currentPage === 'home' ? 'pages/menu2.html' : 'menu2.html'
        };
        if (destinations[screenId]) {
            navigateTo(destinations[screenId]);
        }
    }

    function openStartNameModal() {
        const modal = document.getElementById('modal-start-name');
        const nameInput = document.getElementById('student-name-input');
        if (!modal || !nameInput) return;

        nameInput.value = studentName;
        modal.style.display = 'flex';
        nameInput.focus();
    }

    function startLearning(event) {
        event.preventDefault();
        const nameInput = document.getElementById('student-name-input');
        const name = nameInput.value.trim();
        if (!name) {
            nameInput.focus();
            return;
        }

        studentName = name;
        saveState();
        closeModals();
        goToScreen('screen-menu');
    }

    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    function closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    }

    function showAlertModal(message, onClose = () => {}) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay app-alert-modal';
        modal.style.display = 'flex';
        modal.setAttribute('role', 'alertdialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'app-alert-title');
        modal.tabIndex = -1;

        const content = document.createElement('div');
        content.className = 'modal-content app-alert-content';

        const title = document.createElement('h2');
        title.id = 'app-alert-title';
        title.className = 'app-alert-title';
        title.textContent = 'Informasi';

        const messageText = document.createElement('p');
        messageText.className = 'app-alert-message';
        messageText.textContent = message;

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'app-alert-close';
        closeButton.textContent = 'OK';

        const close = () => {
            modal.removeEventListener('keydown', handleKeydown);
            modal.remove();
            onClose();
        };
        const handleKeydown = event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                close();
            }
        };

        closeButton.addEventListener('click', close);
        modal.addEventListener('keydown', handleKeydown);
        content.append(title, messageText, closeButton);
        modal.appendChild(content);

        const modalHost = document.getElementById('game-container') || document.body;
        modalHost.appendChild(modal);
        closeButton.focus();
    }

    function getFullscreenDocument() {
        if (window.top === window) return document;

        try {
            const topDocument = window.top.document;
            return topDocument.getElementById('game-container') ? topDocument : document;
        } catch {
            return document;
        }
    }

    function ensureFullscreenButton() {
        if (document.querySelector('.fullscreen-button')) return;

        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'fullscreen-button fullscreen-button-page';
        button.setAttribute('onclick', 'toggleFullscreen()');
        button.setAttribute('aria-label', 'Aktifkan fullscreen');
        button.title = 'Aktifkan fullscreen';

        const image = document.createElement('img');
        image.src = '../assets/images/fullscreen.png';
        image.alt = '';
        button.appendChild(image);

        const pageToolbar = gameContainer.querySelector('.certificate-toolbar')
            || gameContainer.querySelector('.screen.active > .flex.justify-between.items-center');
        if (pageToolbar) {
            button.classList.add('fullscreen-button-inline');
            pageToolbar.appendChild(button);
        } else {
            gameContainer.appendChild(button);
        }
    }

    async function toggleFullscreen() {
        const fullscreenDocument = getFullscreenDocument();
        const gameContainer = fullscreenDocument.getElementById('game-container')
            || document.getElementById('game-container');

        try {
            if (fullscreenDocument.fullscreenElement) {
                await fullscreenDocument.exitFullscreen();
                return;
            }

            if (!gameContainer?.requestFullscreen) {
                showAlertModal('Browser tidak mendukung mode fullscreen.');
                return;
            }

            await gameContainer.requestFullscreen();
        } catch (error) {
            console.error('Gagal mengubah mode fullscreen:', error);
            showAlertModal('Mode fullscreen tidak dapat diubah di browser ini.');
        }
    }

    function updateFullscreenButton() {
        const button = document.querySelector('.fullscreen-button');
        if (!button) return;

        const fullscreenDocument = getFullscreenDocument();
        const isFullscreen = Boolean(fullscreenDocument.fullscreenElement);
        const label = isFullscreen
            ? 'Keluar dari fullscreen'
            : 'Aktifkan fullscreen';
        button.classList.toggle('fullscreen-button-exit', isFullscreen);
        button.setAttribute('aria-label', label);
        button.title = label;
        const image = button.querySelector('img');
        const fullscreenImageSrc = image.dataset.fullscreenSrc || image.getAttribute('src');
        image.dataset.fullscreenSrc = fullscreenImageSrc;
        image.src = isFullscreen
            ? fullscreenImageSrc.replace(/fullscreen\.png$/, 'exit-fullscreen.png')
            : fullscreenImageSrc;
    }

    getFullscreenDocument().addEventListener('fullscreenchange', updateFullscreenButton);
    ensureFullscreenButton();
    updateFullscreenButton();

    function toggleMenuPage() {
        const p1 = document.getElementById('menu-page-1');
        const p2 = document.getElementById('menu-page-2');
        if (p1.classList.contains('hidden')) {
            p1.classList.remove('hidden'); p1.classList.add('flex');
            p2.classList.add('hidden'); p2.classList.remove('flex');
        } else {
            p1.classList.add('hidden'); p1.classList.remove('flex');
            p2.classList.remove('hidden'); p2.classList.add('flex');
        }
    }

    let feedbackAudio = null;
    function playFeedbackAudio(isCorrect) {
        const soundPath = isCorrect ? '../assets/audio/correct.wav' : '../assets/audio/wrong.mp3';
        if (!feedbackAudio) feedbackAudio = new Audio();
        feedbackAudio.pause();
        feedbackAudio.src = soundPath;
        feedbackAudio.currentTime = 0;
        feedbackAudio.volume = 0.8;
        feedbackAudio.play().catch(error => {
            console.error(`Gagal memutar audio feedback (${soundPath}):`, error);
        });
    }

    function showFeedback(isCorrect, text) {
        const modal = document.getElementById('feedback-modal');
        const content = document.getElementById('feedback-content');
        const icon = document.getElementById('fb-icon');
        const title = document.getElementById('fb-title');
        const textEl = document.getElementById('fb-text');

        if(isCorrect) {
            content.style.backgroundColor = '#dcfce7'; // green-100
            content.style.borderColor = '#22c55e'; // green-500
            icon.innerText = '🌟'; title.innerText = 'Benar!'; title.style.color = '#15803d';
        } else {
            content.style.backgroundColor = '#fee2e2'; // red-100
            content.style.borderColor = '#ef4444'; // red-500
            icon.innerText = '🤔'; title.innerText = 'Oops, Salah!'; title.style.color = '#b91c1c';
        }
        textEl.innerText = text;
        playFeedbackAudio(isCorrect);
        modal.style.display = 'flex';
    }

    function closeFeedback() {
        document.getElementById('feedback-modal').style.display = 'none';
    }

    // --- Text to Speech (Web Speech API) ---
    function speak(text) {
        if (currentPage === 'menu') {
            playMenuAudio(text);
            return;
        }

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // stop current
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9; // Slightly slower for kids
            window.speechSynthesis.speak(utterance);
        }
    }

    function playMenuAudio(text) {
        const fileMap = {
            'spring roll': 'a spring roll',
            'vegetable salad': 'a vegetable salad',
            'fried tofu': 'a fried tofu',
            'fried rice': 'a fried rice',
            'grilled chicken': 'a grilled chicken',
            'meatball soup': 'a meatball soup',
            burger: 'a burger',
            'spaghetti bolognese': 'a spaghetti',
            'chicken noodle soup': 'a chicken noodles soup',
            'fried noodles': 'a fried noodles',
            'chicken katsu': 'a chicken katsu',
            'chicken satay': 'a chicken satay',
            'french fries': 'a french fries',
            'garlic bread': 'a garlic bread',
            'green salad': 'a green salad',
            'chocolate pudding': 'a chocolate puding',
            'ice cream': 'a ice cream',
            'fruit salad': 'a fruit salad',
            'iced tea': 'a iced tea',
            'orange juice': 'a orange juice',
            'strawberry milk': 'a strawberry milk',
            'chocolate drink': 'a chocolate drink',
            'iced milk': 'a iced milk',
            'hot tea': 'a hot tea'
        };
        const fileName = fileMap[text];
        if (!fileName) throw new Error(`Audio menu tidak ditemukan untuk: ${text}`);

        const audioPath = `../assets/audio/menu/${encodeURIComponent(fileName)}.mp3`;
        if (!menuAudio) menuAudio = new Audio();
        menuAudio.pause();
        menuAudio.src = audioPath;
        menuAudio.currentTime = 0;
        menuAudio.play().catch(error => {
            console.error(`Gagal memutar audio menu (${audioPath}):`, error);
        });
    }

    // --- Helper Array Shuffle ---
    function shuffle(array) {
        let currentIndex = array.length,  randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // --- Quiz Generators ---
    function startQuiz(type) {
        if (!['listening', 'speaking', 'writing'].includes(type)) return;

        currentQuestionIndex = 0;
        scores[type] = 0;

        if (type === 'listening') {
            currentQuiz = shuffle(getListeningQuiz()).slice(0, quizLengths.listening);
        } else {
            currentQuiz = shuffle([...vocabulary]).slice(0, quizLengths[type]);
        }

        saveState();
        navigateTo(`${type}.html`);
    }

    // --- UJI LISTENING ---
    function initListening() {
        if (listeningAudio) {
            listeningAudio.pause();
            listeningAudio = null;
        }

        const questionCount = quizLengths.listening;
        if(currentQuestionIndex >= questionCount) { finishQuiz('Listening', scores.listening); return; }
        
        document.getElementById('list-q-num').innerText = `${currentQuestionIndex + 1}/${questionCount}`;
        currentTarget = currentQuiz[currentQuestionIndex];
        
        // Generate options (1 correct, 3 random wrong)
        let options = [currentTarget];
        let pool = vocabulary.filter(v => v.id !== currentTarget.id);
        pool = shuffle(pool);
        options.push(pool[0], pool[1], pool[2]);
        options = shuffle(options);

        const container = document.getElementById('listening-options');
        container.innerHTML = '';
        const labels = ['A', 'B', 'C', 'D'];
        
        options.forEach((opt, idx) => {
            const btn = document.createElement('div');
            btn.className = 'bg-white border-2 border-gray-200 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm';
            btn.onclick = () => checkListening(opt.id, currentTarget.id, btn);
            btn.innerHTML = `
                <div class="self-start bg-red-400 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow mb-1">${labels[idx]}</div>
                <img src="${menuImagePath(opt)}" alt="${opt.en}" class="w-24 h-20 object-contain mb-2">
                <div class="bg-pink-100 w-full text-center rounded text-sm font-bold text-gray-700 py-1">${opt.en}</div>
            `;
            container.appendChild(btn);
        });

        const audioPath = getListeningAudioUrl(currentTarget);
        if (!audioPath) {
            throw new Error(`Audio listening tidak ditemukan untuk: ${currentTarget.id}`);
        }
        listeningAudio = new Audio(audioPath);
        listeningAudio.addEventListener('timeupdate', updateListeningAudioProgress);
        listeningAudio.addEventListener('durationchange', updateListeningAudioProgress);
        listeningAudio.addEventListener('play', updateListeningAudioButton);
        listeningAudio.addEventListener('pause', updateListeningAudioButton);
        listeningAudio.addEventListener('ended', updateListeningAudioButton);
        listeningAudio.addEventListener('error', () => {
            document.getElementById('list-audio-status').innerText =
                `Audio ${currentTarget.en} gagal dimuat. Coba putar kembali.`;
        });
        updateListeningAudioProgress();
        updateListeningAudioButton();

        // Dots indicator
        const dotsContainer = document.getElementById('list-dots');
        dotsContainer.innerHTML = '';
        for(let i=0; i<questionCount; i++){
            dotsContainer.innerHTML += `<div class="w-3 h-3 rounded-full ${i <= currentQuestionIndex ? 'bg-blue-500' : 'bg-gray-300'}"></div>`;
        }
        
        // Auto play
        playListeningAudio();
    }

    function playListeningAudio() {
        if (!listeningAudio || !listeningAudio.paused) return;
        if (listeningAudio.ended) listeningAudio.currentTime = 0;
        listeningAudio.play().catch(error => {
            console.error('Gagal memutar audio listening:', error);
            document.getElementById('list-audio-status').innerText = 'Audio belum bisa diputar. Tekan play untuk mencoba lagi.';
        });
    }

    function toggleListeningAudio() {
        if (!listeningAudio) return;
        if (listeningAudio.paused) {
            playListeningAudio();
        } else {
            listeningAudio.pause();
        }
    }

    function formatAudioTime(seconds) {
        if (!Number.isFinite(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    }

    function updateListeningAudioProgress() {
        if (!listeningAudio) return;

        const duration = Number.isFinite(listeningAudio.duration) ? listeningAudio.duration : 0;
        const currentTime = listeningAudio.currentTime || 0;
        const progress = duration ? (currentTime / duration) * 100 : 0;
        document.getElementById('list-audio-bar').style.width = `${progress}%`;
        document.getElementById('list-audio-time').innerText =
            `${formatAudioTime(currentTime)} / ${formatAudioTime(duration)}`;
    }

    function updateListeningAudioButton() {
        const button = document.getElementById('list-audio-toggle');
        const icon = document.getElementById('list-audio-icon');
        if (!button || !icon || !listeningAudio) return;

        const isPlaying = !listeningAudio.paused;
        icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play ml-1';
        button.setAttribute('aria-label', isPlaying ? 'Jeda audio listening' : 'Putar audio listening');
        document.getElementById('list-audio-status').innerText = listeningAudio.ended
            ? 'Audio selesai'
            : isPlaying ? 'Sedang diputar' : 'Audio dijeda';
    }

    let listAnswered = false;
    function checkListening(selectedId, targetId, btnEl) {
        if(listAnswered) return;
        listAnswered = true;
        if (listeningAudio) listeningAudio.pause();
        
        if(selectedId === targetId) {
            btnEl.classList.add('bg-green-100', 'border-green-500');
            scores.listening++;
            saveState();
            showFeedback(true, `Itu adalah ${currentTarget.en}!`);
        } else {
            btnEl.classList.add('bg-red-100', 'border-red-500');
            showFeedback(false, `Jawaban benar: ${currentTarget.en}`);
        }
    }

    function nextListening() {
        const questionCount = quizLengths.listening;
        if(!listAnswered && currentQuestionIndex < questionCount) {
            showAlertModal('Pilih jawaban dulu ya!'); return;
        }
        listAnswered = false;
        currentQuestionIndex++;
        saveState();
        initListening();
    }


    // --- UJI SPEAKING ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isRecording = false;
    let isStartingRecording = false;
    let isRecognitionStarting = false;
    let speakingAttemptId = 0;
    let activeRecognitionAttemptId = 0;
    let evaluatedRecognitionAttemptId = 0;
    let recognitionErrorMessage = '';
    let latestRecognitionTranscript = '';
    let latestInterimTranscript = '';
    let latestRecognitionAlternatives = [];

    const normalizeSpeakingTranscript = value => value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/^(a |an |the )+/, '')
        .replace(/\b(please|um|uh)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    function speakingSimilarity(left, right) {
        if (!left || !right) return 0;
        if (left === right) return 1;

        const rows = left.length + 1;
        const columns = right.length + 1;
        const distances = Array.from({ length: rows }, () => Array(columns).fill(0));
        for (let row = 0; row < rows; row++) distances[row][0] = row;
        for (let column = 0; column < columns; column++) distances[0][column] = column;

        for (let row = 1; row < rows; row++) {
            for (let column = 1; column < columns; column++) {
                distances[row][column] = Math.min(
                    distances[row - 1][column] + 1,
                    distances[row][column - 1] + 1,
                    distances[row - 1][column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1)
                );
            }
        }

        const longest = Math.max(left.length, right.length);
        return longest ? 1 - (distances[left.length][right.length] / longest) : 0;
    }

    function evaluateSpeakingTranscript(transcript, alternatives = []) {
        if (activeRecognitionAttemptId !== speakingAttemptId
            || speakAnswered
            || evaluatedRecognitionAttemptId === activeRecognitionAttemptId
            || !transcript) {
            return;
        }

        const target = normalizeSpeakingTranscript(currentTarget.en);
        const candidates = [...alternatives, transcript]
            .map(normalizeSpeakingTranscript)
            .filter(Boolean);
        const isCorrect = candidates.some(candidate => {
            if (candidate === target) return true;
            if (candidate.includes(target) || target.includes(candidate)) {
                const shorter = candidate.length < target.length ? candidate : target;
                if (shorter.length <= 3) return candidate === target;
            }
            return speakingSimilarity(candidate, target) >= 0.82;
        });

        evaluatedRecognitionAttemptId = activeRecognitionAttemptId;
        const resultElement = document.getElementById('record-result');
        resultElement.className = isCorrect
            ? 'text-lg font-bold text-green-600 whitespace-pre-wrap'
            : 'text-lg font-bold text-red-600 whitespace-pre-wrap';
        resultElement.innerText = isCorrect
            ? `Benar! Terdengar: "${transcript}"`
            : `Belum tepat. Terdengar: "${transcript}"`;

        if (isCorrect) {
            speakAnswered = true;
            scores.speaking++;
            saveState();
            showFeedback(true, 'Nama makanan/minuman dikenali dengan benar!');
        } else {
            showFeedback(false, `Terdengar "${transcript}". Ucapkan "${currentTarget.en}" secara lengkap, lalu coba lagi.`);
        }
    }

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.maxAlternatives = 5;

        recognition.onstart = function() {
            if (activeRecognitionAttemptId !== speakingAttemptId) {
                try {
                    recognition.abort();
                } catch (error) {
                    console.error('Gagal menghentikan pengenalan suara:', error);
                }
                return;
            }

            isStartingRecording = false;
            isRecognitionStarting = false;
            isRecording = true;
            const recordButton = document.getElementById('btn-record');
            recordButton.disabled = false;
            recordButton.classList.add('mic-recording');
            document.getElementById('record-status').innerText = 'Mendengarkan... Klik mic untuk berhenti.';
        };

        recognition.onsoundstart = function() {
            if (activeRecognitionAttemptId === speakingAttemptId) {
                document.getElementById('record-status').innerText = 'Suara terdeteksi...';
            }
        };

        recognition.onspeechstart = function() {
            if (activeRecognitionAttemptId === speakingAttemptId) {
                document.getElementById('record-status').innerText = 'Sedang mengenali ucapan...';
            }
        };

        recognition.onresult = function(event) {
            if (activeRecognitionAttemptId !== speakingAttemptId || speakAnswered) return;

            const results = Array.from(event.results);
            const transcript = results
                .map(result => result[0]?.transcript || '')
                .join(' ')
                .trim();
            const finalResults = results.filter(result => result.isFinal);
            const finalTranscript = finalResults
                .map(result => result[0]?.transcript || '')
                .join(' ')
                .trim();
            const alternatives = finalResults
                .flatMap(result => Array.from(result)
                    .map(alternative => (alternative.transcript || '').trim()))
                .filter(Boolean);

            if (finalTranscript) {
                latestRecognitionTranscript = finalTranscript;
                latestInterimTranscript = '';
                latestRecognitionAlternatives = [...new Set(alternatives)];
            } else {
                latestInterimTranscript = transcript;
            }

            const resultElement = document.getElementById('record-result');
            resultElement.className = 'text-lg font-bold text-blue-700 whitespace-pre-wrap';
            resultElement.innerText = transcript
                ? `${finalTranscript ? 'Terdengar' : 'Sedang mengenali'}: "${transcript}"`
                : '';

            if (finalTranscript) {
                evaluateSpeakingTranscript(finalTranscript, latestRecognitionAlternatives);
                if (evaluatedRecognitionAttemptId === activeRecognitionAttemptId) {
                    try {
                        recognition.stop();
                    } catch (error) {
                        console.error('Gagal menghentikan pengenalan suara:', error);
                    }
                }
            }
        };

        recognition.onerror = function(event) {
            if (activeRecognitionAttemptId !== speakingAttemptId) return;

            isRecognitionStarting = false;
            const messages = {
                'not-allowed': 'Izin mikrofon/pengenalan suara ditolak.',
                'audio-capture': 'Mikrofon tidak ditemukan.',
                'no-speech': 'Suara belum dikenali. Coba rekam lagi.',
                nomatch: 'Suara terdengar, tetapi teks tidak dikenali. Coba ucapkan lebih jelas.',
                network: 'Pengenalan suara gagal. Periksa koneksi internet.'
            };
            recognitionErrorMessage = messages[event.error] || 'Pengenalan suara gagal. Coba rekam lagi.';
            document.getElementById('record-status').innerText = recognitionErrorMessage;
        };

        recognition.onnomatch = function() {
            if (activeRecognitionAttemptId !== speakingAttemptId) return;
            recognitionErrorMessage = latestInterimTranscript
                ? 'Teks sementara ditampilkan. Coba ucapkan sekali lagi dengan jelas.'
                : 'Browser mendengar suara, tetapi tidak mengirim teks. Coba rekam lagi.';
            document.getElementById('record-status').innerText = recognitionErrorMessage;
            if (latestInterimTranscript) {
                const resultElement = document.getElementById('record-result');
                resultElement.className = 'text-lg font-bold text-blue-700 whitespace-pre-wrap';
                resultElement.innerText = `Teks sementara: "${latestInterimTranscript}"`;
            }
        };

        recognition.onend = function() {
            if (activeRecognitionAttemptId !== speakingAttemptId) return;

            isRecording = false;
            isStartingRecording = false;
            isRecognitionStarting = false;
            const recordButton = document.getElementById('btn-record');
            recordButton.classList.remove('mic-recording');
            recordButton.disabled = speakAnswered;
            document.getElementById('record-status').innerText = recognitionErrorMessage
                || (speakAnswered
                    ? 'Jawaban benar. Kamu bisa lanjut ke soal berikutnya.'
                    : latestRecognitionTranscript
                        ? 'Teks berhasil dikenali. Klik mic untuk merekam ulang jika perlu.'
                        : 'Teks belum dikenali. Klik mic untuk mencoba lagi.');
        };
    }

    function cancelSpeakingAttempt() {
        const shouldAbortRecognition = activeRecognitionAttemptId === speakingAttemptId
            && (isRecognitionStarting || isRecording);
        speakingAttemptId++;
        activeRecognitionAttemptId = 0;
        isStartingRecording = false;
        isRecognitionStarting = false;
        isRecording = false;
        latestRecognitionTranscript = '';
        latestInterimTranscript = '';
        latestRecognitionAlternatives = [];
        evaluatedRecognitionAttemptId = 0;

        if (recognition && shouldAbortRecognition) {
            try {
                recognition.abort();
            } catch (error) {
                console.error('Gagal menghentikan pengenalan suara:', error);
            }
        }

    }

    function startSpeakingAttempt() {
        const recordButton = document.getElementById('btn-record');
        if (!SpeechRecognition) {
            document.getElementById('record-status').innerText =
                'Pengenalan suara otomatis tidak didukung browser ini. Gunakan Chrome.';
            return;
        }
        if (!window.isSecureContext) {
            document.getElementById('record-status').innerText =
                'Buka situs lewat HTTPS agar pengenalan suara dapat digunakan.';
            return;
        }

        const attemptId = ++speakingAttemptId;
        activeRecognitionAttemptId = attemptId;
        recognitionErrorMessage = '';
        isStartingRecording = true;
        latestRecognitionTranscript = '';
        latestInterimTranscript = '';
        latestRecognitionAlternatives = [];
        evaluatedRecognitionAttemptId = 0;
        recordButton.disabled = true;
        document.getElementById('record-status').innerText = 'Meminta izin mikrofon...';
        document.getElementById('record-result').innerText = '';

        try {
            isRecognitionStarting = true;
            recognition.start();
        } catch (error) {
            if (attemptId === speakingAttemptId) {
                speakingAttemptId++;
                activeRecognitionAttemptId = 0;
                isStartingRecording = false;
                isRecognitionStarting = false;
                isRecording = false;
                if (recognition) {
                    try {
                        recognition.abort();
                    } catch (recognitionError) {
                        console.error('Gagal menghentikan pengenalan suara:', recognitionError);
                    }
                }
                recordButton.disabled = false;
                document.getElementById('record-status').innerText =
                    error.name === 'NotAllowedError'
                        ? 'Izin mikrofon ditolak. Aktifkan izin mikrofon di pengaturan browser.'
                        : error.name === 'NotFoundError'
                            ? 'Mikrofon tidak ditemukan. Sambungkan mikrofon lalu coba lagi.'
                            : 'Pengenalan suara tidak dapat dimulai. Coba lagi.';
            }
            console.error('Gagal memulai rekaman speaking:', error);
        }
    }

    function playSpeakingExample() {
        if (!currentTarget) return;
        if (!('speechSynthesis' in window)) {
            document.getElementById('record-status').innerText =
                'Browser ini tidak mendukung audio contoh.';
            return;
        }
        speak(currentTarget.en);
    }

    function initSpeaking() {
        if(currentQuestionIndex >= maxQuestions) { finishQuiz('Speaking', scores.speaking); return; }
        
        document.getElementById('speak-q-num').innerText = `${currentQuestionIndex + 1}/${maxQuestions}`;
        currentTarget = currentQuiz[currentQuestionIndex];
        evaluatedRecognitionAttemptId = 0;
        
        const targetImage = document.getElementById('speak-target-image');
        targetImage.src = menuImagePath(currentTarget);
        targetImage.alt = currentTarget.en;
        document.getElementById('speak-target-text').innerText = currentTarget.en;
        
        document.getElementById('record-result').innerText = "";
        document.getElementById('record-status').innerText = "Klik mic untuk mulai";
        document.getElementById('btn-record').disabled = false;
        speakAnswered = false;
        latestRecognitionTranscript = '';
        latestInterimTranscript = '';
        latestRecognitionAlternatives = [];
        evaluatedRecognitionAttemptId = 0;
    }

    function toggleRecord() {
        if (isStartingRecording) return;
        if (isRecording) {
            document.getElementById('btn-record').disabled = true;
            document.getElementById('record-status').innerText = 'Menyelesaikan pengenalan suara...';
            recognition.stop();
            return;
        }
        startSpeakingAttempt();
    }

    let speakAnswered = false;
    function nextSpeaking() {
        if (!speakAnswered) {
            showAlertModal('Rekam suaramu dan ucapkan nama yang benar terlebih dahulu!');
            return;
        }
        cancelSpeakingAttempt();
        currentQuestionIndex++;
        saveState();
        initSpeaking();
    }


    // --- UJI WRITING ---
    function initWriting() {
        if(currentQuestionIndex >= maxQuestions) { finishQuiz('Writing', scores.writing); return; }
        
        document.getElementById('write-q-num').innerText = `${currentQuestionIndex + 1}/${maxQuestions}`;
        currentTarget = currentQuiz[currentQuestionIndex];
        
        const targetImage = document.getElementById('write-target-image');
        targetImage.src = menuImagePath(currentTarget);
        targetImage.alt = currentTarget.en;
        const inputEl = document.getElementById('write-input');
        inputEl.value = '';
        inputEl.disabled = false;
        document.getElementById('write-feedback').innerText = '';
        writeHintsUsed = 0;
        updateWritingHint();
        document.querySelectorAll('.writing-hint-btn').forEach(button => {
            const level = Number(button.dataset.hintLevel);
            button.disabled = level !== 1;
            button.innerText = `Petunjuk ${level}`;
            button.onclick = () => useWritingHint(level);
        });
        
        // Setup Word Bank (1 correct + 5 random wrong)
        let words = [currentTarget.en];
        let pool = shuffle(vocabulary.filter(v => v.id !== currentTarget.id)).slice(0,5);
        pool.forEach(p => words.push(p.en));
        words = shuffle(words);

        const bank = document.getElementById('word-bank-list');
        bank.innerHTML = '';
        words.forEach(w => {
            const btn = document.createElement('button');
            btn.className = 'bg-yellow-100 text-yellow-800 font-bold py-1 px-2 rounded-lg border border-yellow-300 text-sm hover:bg-yellow-200';
            btn.innerText = w;
            btn.onclick = () => { inputEl.value = w; }; // Click word bank to fill input
            bank.appendChild(btn);
        });
        
        writeAnswered = false;
    }

    function setupWritingImagePreview() {
        const trigger = document.getElementById('write-image-preview-trigger');
        const preview = document.getElementById('writing-image-preview');
        const previewImage = document.getElementById('writing-image-preview-image');
        const closeButton = document.getElementById('writing-image-preview-close');
        if (!trigger || !preview || !previewImage || !closeButton) return;

        const closePreview = () => {
            preview.hidden = true;
            preview.setAttribute('aria-hidden', 'true');
            trigger.focus();
        };

        trigger.addEventListener('click', () => {
            const targetImage = document.getElementById('write-target-image');
            previewImage.src = targetImage.src;
            previewImage.alt = targetImage.alt;
            preview.hidden = false;
            preview.setAttribute('aria-hidden', 'false');
            closeButton.focus();
        });
        closeButton.addEventListener('click', closePreview);
        preview.addEventListener('click', event => {
            if (event.target === preview) closePreview();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !preview.hidden) closePreview();
        });
    }

    let writeAnswered = false;
    let writeHintsUsed = 0;

    function updateWritingHint() {
        const answer = currentTarget.en.toLowerCase();
        const letterCount = answer.replace(/[^a-z]/g, '').length;
        const visibleLetters = Math.min(letterCount - 1, Math.ceil(letterCount * writeHintsUsed / 4));
        let letterIndex = 0;
        const pattern = answer.split(' ').map(word =>
            [...word].map(letter => {
                letterIndex++;
                return letterIndex <= visibleLetters ? letter : '_';
            }).join(' ')
        ).join('   ');

        document.getElementById('write-hint-pattern').innerText = pattern;
    }

    function useWritingHint(level) {
        if (writeAnswered || level !== writeHintsUsed + 1) return;

        writeHintsUsed = level;
        updateWritingHint();
        document.querySelectorAll('.writing-hint-btn').forEach(button => {
            const buttonLevel = Number(button.dataset.hintLevel);
            button.disabled = buttonLevel !== writeHintsUsed + 1;
            if (buttonLevel === level) button.innerText = `Petunjuk ${level} ✓`;
        });
    }

    function checkWriting() {
        if(writeAnswered) return;
        
        const input = document.getElementById('write-input').value.trim().toLowerCase();
        const target = currentTarget.en.toLowerCase();
        const feedback = document.getElementById('write-feedback');

        if (input === target) {
            feedback.innerText = "Benar! 🌟";
            feedback.className = "mt-2 font-bold min-h-[24px] text-center text-green-600";
            scores.writing++;
            saveState();
            document.getElementById('write-input').disabled = true;
            writeAnswered = true;
            document.querySelectorAll('.writing-hint-btn').forEach(button => {
                button.disabled = true;
            });
            showFeedback(true, "Ejaanmu tepat!");
        } else {
            feedback.innerText = "Coba lagi! 🤔";
            feedback.className = "mt-2 font-bold min-h-[24px] text-center text-red-600";
        }
    }

    function nextWriting() {
        if(!writeAnswered && document.getElementById('write-input').value === '') {
             showAlertModal('Isi jawaban atau pilih dari Word Bank dulu ya!'); return;
        }
        currentQuestionIndex++;
        saveState();
        initWriting();
    }

    // --- Finish Quiz ---
    function finishQuiz(type, score) {
        const totalQuestions = quizLengths[type.toLowerCase()] || maxQuestions;
        saveState();
        showAlertModal(`Uji ${type} Selesai!
Skor kamu: ${score} dari ${totalQuestions}`, () => goToScreen('screen-menu'));
    }

    function initCertificate() {
        const namePreview = document.getElementById('certificate-student-name');
        const scorePreview = document.getElementById('certificate-final-score');
        const datePreview = document.getElementById('certificate-date');

        if (!namePreview || !scorePreview || !datePreview) return;

        namePreview.textContent = studentName || 'Nama Siswa';
        const totalScore = Number(scores.listening || 0) + Number(scores.speaking || 0) + Number(scores.writing || 0);
        scorePreview.textContent = String(totalScore);
        datePreview.textContent = new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date());
    }

    function initializePage() {
        if (currentPage === 'menu' || currentPage === 'menu2') {
            if (scores.listening > 0 || scores.speaking > 0 || scores.writing > 0) {
                const certificateButton = document.getElementById('btn-sertifikat');
                certificateButton.classList.remove('hidden');
            }
            return;
        }

        if (currentPage === 'certificate') {
            initCertificate();
            return;
        }

        const initializers = {
            listening: initListening,
            speaking: initSpeaking,
            writing: initWriting
        };
        const initializeQuiz = initializers[currentPage];
        if (!initializeQuiz) return;

        const expectedQuestions = quizLengths[currentPage] || maxQuestions;
        if (currentQuiz.length !== expectedQuestions) {
            showAlertModal('Mulai kuis dari halaman menu terlebih dahulu ya!', () => goToScreen('screen-menu'));
            return;
        }
        initializeQuiz();
    }

    setupWritingImagePreview();
    initializePage();
