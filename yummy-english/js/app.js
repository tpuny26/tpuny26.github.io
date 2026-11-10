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

    // --- State Management ---
    const stateKey = 'yummy-english-state';
    const savedState = JSON.parse(sessionStorage.getItem(stateKey) || '{}');
    let currentQuiz = Array.isArray(savedState.currentQuiz) ? savedState.currentQuiz : [];
    let currentQuestionIndex = Number.isInteger(savedState.currentQuestionIndex) ? savedState.currentQuestionIndex : 0;
    const maxQuestions = 10;
    let currentTarget = null;
    let scores = { listening: 0, speaking: 0, writing: 0, ...savedState.scores };
    const currentPage = document.body.dataset.page;

    function saveState() {
        sessionStorage.setItem(stateKey, JSON.stringify({ currentQuiz, currentQuestionIndex, scores }));
    }

    // --- Navigation & Modals ---
    function goToScreen(screenId) {
        if(recognition && isRecording) { recognition.stop(); }

        const destinations = {
            'screen-home': currentPage === 'home' ? 'index.html' : '../index.html',
            'screen-menu': currentPage === 'home' ? 'pages/menu.html' : 'menu.html'
        };
        if (destinations[screenId]) {
            window.location.href = new URL(destinations[screenId], window.location.href).href;
        }
    }

    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    function closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
    }

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
        modal.style.display = 'flex';
    }

    function closeFeedback() {
        document.getElementById('feedback-modal').style.display = 'none';
    }

    // --- Text to Speech (Web Speech API) ---
    function speak(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // stop current
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9; // Slightly slower for kids
            window.speechSynthesis.speak(utterance);
        }
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
        // Generate 10 random questions from vocabulary
        currentQuiz = shuffle([...vocabulary]).slice(0, maxQuestions);
        saveState();
        window.location.href = new URL(`${type}.html`, window.location.href).href;
    }

    // --- UJI LISTENING ---
    function initListening() {
        if(currentQuestionIndex >= maxQuestions) { finishQuiz('Listening', scores.listening); return; }
        
        document.getElementById('list-q-num').innerText = `${currentQuestionIndex + 1}/${maxQuestions}`;
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
                <div class="text-5xl mb-2">${opt.emoji}</div>
                <div class="bg-pink-100 w-full text-center rounded text-sm font-bold text-gray-700 py-1">${opt.en}</div>
            `;
            container.appendChild(btn);
        });

        // Animation for progress bar
        const bar = document.getElementById('list-audio-bar');
        bar.style.width = '0%'; bar.style.transition = 'none';

        // Dots indicator
        const dotsContainer = document.getElementById('list-dots');
        dotsContainer.innerHTML = '';
        for(let i=0; i<maxQuestions; i++){
            dotsContainer.innerHTML += `<div class="w-3 h-3 rounded-full ${i <= currentQuestionIndex ? 'bg-blue-500' : 'bg-gray-300'}"></div>`;
        }
        
        // Auto play
        setTimeout(() => playListeningAudio(), 500);
    }

    function playListeningAudio() {
        speak(currentTarget.en);
        const bar = document.getElementById('list-audio-bar');
        bar.style.transition = 'width 1s linear';
        bar.style.width = '100%';
        setTimeout(() => { bar.style.transition = 'none'; bar.style.width = '0%'; }, 1000);
    }

    let listAnswered = false;
    function checkListening(selectedId, targetId, btnEl) {
        if(listAnswered) return;
        listAnswered = true;
        
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
        if(!listAnswered && currentQuestionIndex < maxQuestions) {
            alert("Pilih jawaban dulu ya!"); return;
        }
        listAnswered = false;
        currentQuestionIndex++;
        saveState();
        initListening();
    }


    // --- UJI SPEAKING ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let isRecording = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function() {
            isRecording = true;
            document.getElementById('btn-record').classList.add('mic-recording');
            document.getElementById('record-status').innerText = "Mendengarkan...";
            document.getElementById('record-result').innerText = "";
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase().replace(/[^a-z\s]/gi, '').trim();
            const targetWord = currentTarget.en.toLowerCase();
            const resEl = document.getElementById('record-result');
            
            resEl.innerText = `"${transcript}"`;
            
            if (transcript.includes(targetWord) || targetWord.includes(transcript)) {
                resEl.className = "mt-2 text-lg font-bold text-green-600";
                scores.speaking++;
                saveState();
                showFeedback(true, "Pengucapan sempurna!");
                speakAnswered = true;
            } else {
                resEl.className = "mt-2 text-lg font-bold text-red-600";
                showFeedback(false, `Coba lagi! Seharusnya "${currentTarget.en}"`);
            }
        };

        recognition.onend = function() {
            isRecording = false;
            document.getElementById('btn-record').classList.remove('mic-recording');
            document.getElementById('record-status').innerText = "Klik mic untuk ulang";
        }
    }

    function initSpeaking() {
        if(currentQuestionIndex >= maxQuestions) { finishQuiz('Speaking', scores.speaking); return; }
        
        document.getElementById('speak-q-num').innerText = `${currentQuestionIndex + 1}/${maxQuestions}`;
        currentTarget = currentQuiz[currentQuestionIndex];
        
        document.getElementById('speak-target-emoji').innerText = currentTarget.emoji;
        document.getElementById('speak-target-text').innerText = currentTarget.en;
        
        document.getElementById('record-result').innerText = "";
        document.getElementById('record-status').innerText = "Klik mic untuk mulai";
        speakAnswered = false;
    }

    function toggleRecord() {
        if(!SpeechRecognition) {
            alert("Maaf, browser kamu tidak mendukung fitur suara. Coba gunakan Chrome.");
            return;
        }
        if(isRecording) { recognition.stop(); } 
        else { try { recognition.start(); } catch(e){} }
    }

    let speakAnswered = false;
    function nextSpeaking() {
        // Allow passing even if failed or no mic
        currentQuestionIndex++;
        saveState();
        initSpeaking();
    }


    // --- UJI WRITING ---
    function initWriting() {
        if(currentQuestionIndex >= maxQuestions) { finishQuiz('Writing', scores.writing); return; }
        
        document.getElementById('write-q-num').innerText = `${currentQuestionIndex + 1}/${maxQuestions}`;
        currentTarget = currentQuiz[currentQuestionIndex];
        
        document.getElementById('write-target-emoji').innerText = currentTarget.emoji;
        const inputEl = document.getElementById('write-input');
        inputEl.value = '';
        inputEl.disabled = false;
        document.getElementById('write-feedback').innerText = '';
        
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

    let writeAnswered = false;
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
            showFeedback(true, "Ejaanmu tepat!");
        } else {
            feedback.innerText = "Coba lagi! 🤔";
            feedback.className = "mt-2 font-bold min-h-[24px] text-center text-red-600";
        }
    }

    function nextWriting() {
        if(!writeAnswered && document.getElementById('write-input').value === '') {
             alert("Isi jawaban atau pilih dari Word Bank dulu ya!"); return;
        }
        currentQuestionIndex++;
        saveState();
        initWriting();
    }

    // --- Finish Quiz ---
    function finishQuiz(type, score) {
        alert(`Uji ${type} Selesai!
Skor kamu: ${score} dari ${maxQuestions}`);
        saveState();
        goToScreen('screen-menu');
    }

    function showCertificateScores() {
        alert(`Selamat!
Nilai Akhir:
Listening: ${scores.listening}
Speaking: ${scores.speaking}
Writing: ${scores.writing}

(Fitur download PDF sertifikat akan tersedia nanti)`);
    }

    function initializePage() {
        if (currentPage === 'menu') {
            if (scores.listening > 0 || scores.speaking > 0 || scores.writing > 0) {
                const certificateButton = document.getElementById('btn-sertifikat');
                certificateButton.classList.remove('hidden');
                certificateButton.onclick = showCertificateScores;
            }
            return;
        }

        const initializers = {
            listening: initListening,
            speaking: initSpeaking,
            writing: initWriting
        };
        const initializeQuiz = initializers[currentPage];
        if (!initializeQuiz) return;

        if (currentQuiz.length !== maxQuestions) {
            alert('Mulai kuis dari halaman menu terlebih dahulu ya!');
            goToScreen('screen-menu');
            return;
        }
        initializeQuiz();
    }

    initializePage();
