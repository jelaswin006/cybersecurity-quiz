import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCHYUcVDVQ6naZaUKzDiRbzsTQgsKlD7OY",
    authDomain: "jelaswin-cybersecurity.firebaseapp.com",
    projectId: "jelaswin-cybersecurity",
    storageBucket: "jelaswin-cybersecurity.appspot.com",
    messagingSenderId: "145813394754",
    appId: "1:145813394754:web:18816f4ec711b585ace4db",
    measurementId: "G-3657FN5YT8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appState = {
    quizData: {},
    currentUser: null,
    currentLevel: 1,
    currentQuestionIndex: 0,
    userAnswers: [],
    userProgress: {
        level1: { score: 0, completed: false },
        level2: { score: 0, completed: false },
        level3: { score: 0, completed: false },
        overallComplete: false
    }
};

const DOMElements = {
    loadingSpinner: document.getElementById('loadingSpinner'),
    pages: document.querySelectorAll('.page'),
    mainContainer: document.getElementById('mainContainer'),
    progressToggle: document.getElementById('progressToggle'),
    progressSidebar: document.getElementById('progressSidebar'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    showRegisterLink: document.getElementById('showRegisterLink'),
    showLoginLink: document.getElementById('showLoginLink'),
    logoutBtns: [document.getElementById('logoutBtn'), document.getElementById('feedbackLogoutBtn')],
    loginFeedback: document.getElementById('loginFeedback'),
    registerFeedback: document.getElementById('registerFeedback'),
    userName: document.getElementById('userName'),
    introCard: document.getElementById('introCard'),
    level1Progress: document.getElementById('level1Progress'),
    level2Progress: document.getElementById('level2Progress'),
    level3Progress: document.getElementById('level3Progress'),
    level2Btn: document.getElementById('level2Btn'),
    level3Btn: document.getElementById('level3Btn'),
    overallProgress: document.getElementById('overallProgress'),
    overallStats: document.getElementById('overallStats'),
    startLevelBtns: document.querySelectorAll('.start-level-btn'),
    levelTitle: document.getElementById('levelTitle'),
    quizProgress: document.getElementById('quizProgress'),
    questionText: document.getElementById('questionText'),
    questionImage: document.getElementById('questionImage'),
    learnMoreContainer: document.getElementById('learnMoreContainer'),
    optionsForm: document.getElementById('optionsForm'),
    prevQuestionBtn: document.getElementById('prevQuestionBtn'),
    checkAnswerBtn: document.getElementById('checkAnswerBtn'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),
    feedbackUserName: document.getElementById('feedbackUserName'),
    finalScore: document.getElementById('finalScore'),
    finalProgress: document.getElementById('finalProgress'),
    level1Score: document.getElementById('level1Score'),
    level2Score: document.getElementById('level2Score'),
    level3Score: document.getElementById('level3Score'),
    backToDashboardBtn: document.getElementById('backToDashboardBtn'),
    animationBg: document.getElementById('animation-bg'),
    sidebarLevel1Progress: document.getElementById('sidebarLevel1Progress'),
    sidebarLevel2Progress: document.getElementById('sidebarLevel2Progress'),
    sidebarLevel3Progress: document.getElementById('sidebarLevel3Progress'),
    sidebarLevel1Score: document.getElementById('sidebarLevel1Score'),
    sidebarLevel2Score: document.getElementById('sidebarLevel2Score'),
    sidebarLevel3Score: document.getElementById('sidebarLevel3Score'),
    sidebarOverallScore: document.getElementById('sidebarOverallScore'),
    sidebarOverallProgress: document.getElementById('sidebarOverallProgress'),
    level1Status: document.getElementById('level1Status'),
    level2Status: document.getElementById('level2Status'),
    level3Status: document.getElementById('level3Status'),
    cyberWarriorBadge: document.getElementById('cyberWarriorBadge')
};

const toggleSidebar = () => {
    const isOpen = DOMElements.progressSidebar.classList.contains('show');
    if (isOpen) {
        DOMElements.progressSidebar.classList.remove('show');
        DOMElements.mainContainer.classList.remove('sidebar-open');
        DOMElements.progressToggle.classList.remove('active');
        DOMElements.progressToggle.textContent = '📊';
    } else {
        DOMElements.progressSidebar.classList.add('show');
        DOMElements.mainContainer.classList.add('sidebar-open');
        DOMElements.progressToggle.classList.add('active');
        DOMElements.progressToggle.textContent = '✕';
        updateSidebarProgress();
    }
};

const updateSidebarProgress = () => {
    const progress = appState.userProgress;
    let totalScore = 0;
    let totalPossibleScore = 0;

    for (let i = 1; i <= 3; i++) {
        const levelProgress = progress[`level${i}`] || { score: 0, completed: false };
        const levelQuestionCount = appState.quizData[i]?.questions.length || 0;
        totalPossibleScore += levelQuestionCount;
        totalScore += levelProgress.score;

        const progressFill = document.getElementById(`sidebarLevel${i}Progress`);
        const scoreElement = document.getElementById(`sidebarLevel${i}Score`);
        const statusElement = document.getElementById(`level${i}Status`);

        if (progressFill) {
            const progressPercent = (levelProgress.score / (levelQuestionCount || 1)) * 100;
            progressFill.style.width = progressPercent + '%';
        }

        if (scoreElement) {
            scoreElement.textContent = `${levelProgress.score}/${levelQuestionCount}`;
        }

        if (statusElement) {
            statusElement.className = 'level-status';
            if (levelProgress.completed) {
                statusElement.classList.add('completed');
                statusElement.textContent = '✓';
            } else if (i === 1 || progress[`level${i - 1}`]?.completed) {
                statusElement.classList.add('in-progress');
                statusElement.textContent = i;
            } else {
                statusElement.classList.add('locked');
                statusElement.textContent = '🔒';
            }
        }
    }

    const overallProgressPercent = (totalScore / (totalPossibleScore || 1)) * 100;
    if (DOMElements.sidebarOverallProgress) {
        DOMElements.sidebarOverallProgress.style.width = overallProgressPercent + '%';
    }
    if (DOMElements.sidebarOverallScore) {
        DOMElements.sidebarOverallScore.textContent = `${totalScore}/${totalPossibleScore}`;
    }

    if (progress.overallComplete && DOMElements.cyberWarriorBadge) {
        DOMElements.cyberWarriorBadge.classList.add('show');
    }
};

const generateParticles = (count, content, particleClass = 'particle') => {
    const bg = DOMElements.animationBg;
    bg.innerHTML = '';
    let particlesHTML = '';
    for (let i = 0; i < count; i++) {
        const style = `
                    left: ${Math.random() * 100}%;
                    font-size: ${1 + Math.random() * 1.5}em;
                    animation-delay: ${Math.random() * 8}s;
                    animation-duration: ${8 + Math.random() * 12}s;
                `;
        let currentContent = Array.isArray(content) ? content[Math.floor(Math.random() * content.length)] : content;
        let currentClass = particleClass;
        if (typeof currentContent === 'object') {
            currentClass += ` ${currentContent.class}`;
            currentContent = currentContent.char;
        }
        particlesHTML += `<span class="${currentClass}" style="${style}">${currentContent}</span>`;
    }
    bg.innerHTML = particlesHTML;
};

const updateBackgroundAnimation = () => {
    const level = appState.currentLevel;
    const qIndex = appState.currentQuestionIndex;
    document.body.className = '';

    switch (level) {
        case 1:
            document.body.classList.add('bg-phishing');
            generateParticles(20, [{ char: '✉️', class: '' }, { char: '📧', class: 'threat' }]);
            break;
        case 2:
            document.body.classList.add('bg-social-engineering');
            const socialIcons = ['📞', '💾', '👤', '👁️'];
            generateParticles(20, socialIcons[qIndex % socialIcons.length]);
            break;
        case 3:
            document.body.classList.add('bg-password');
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
            generateParticles(50, chars.split(''));
            break;
        default:
            document.body.classList.add('bg-default');
            generateParticles(20, ['🔑', '🛡️', '🔒']);
            break;
    }
};

const showPage = (pageId) => {
    DOMElements.pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    if (pageId !== 'quizPage') {
        document.body.className = 'bg-default';
        generateParticles(20, ['🔑', '🛡️', '🔒']);
    }

    const showToggle = pageId !== 'loginPage' && pageId !== 'registerPage' && appState.currentUser;
    DOMElements.progressToggle.style.display = showToggle ? 'flex' : 'none';

    if (showToggle) {
        updateSidebarProgress();
    }
};

const showFeedback = (element, message, isError = true) => {
    element.textContent = message;
    element.className = 'feedback-message';
    element.classList.add(isError ? 'error' : 'success');
};

const clearFeedback = (...elements) => {
    elements.forEach(el => {
        el.textContent = '';
        el.className = 'feedback-message';
    });
};

const setLoading = (isLoading) => {
    DOMElements.loadingSpinner.style.display = isLoading ? 'flex' : 'none';
};

const triggerConfetti = () => {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
};

const updateDashboardUI = () => {
    const progress = appState.userProgress;
    if (!appState.currentUser) return;

    DOMElements.userName.textContent = appState.currentUser.displayName || appState.currentUser.email;

    DOMElements.introCard.innerHTML = `
                <h2 style="color: var(--primary-color);">Did you know?</h2>
                <p><strong>59%</strong> of organizations globally experienced a ransomware attack in 2024. Many of these start with a Social Engineering attack—a method cyber criminals use to trick people into giving up confidential data.</p>
                <p>This quiz contains three levels. We just need <strong>10-15 minutes</strong> of your valuable time to transit you from a 'Warrior' to a 'Cyber Warrior'.</p>
                <p style="margin-top: 10px;"><strong>The toughest part is you must answer all questions in a level correctly to advance!</strong></p>
                <p style="text-align:center; font-weight: bold; margin-top: 15px;">Are you ready? Let's go!</p>`;

    let totalScore = 0;
    let totalPossibleScore = 0;

    if (Object.keys(appState.quizData).length > 0) {
        for (let i = 1; i <= 3; i++) {
            const levelProgress = progress[`level${i}`] || { score: 0, completed: false };
            const levelQuestionCount = appState.quizData[i]?.questions.length || 0;
            totalPossibleScore += levelQuestionCount;
            totalScore += levelProgress.score;
            const progressFill = document.getElementById(`level${i}Progress`);
            if (progressFill) {
                progressFill.style.width = (levelProgress.score / (levelQuestionCount || 1)) * 100 + '%';
            }
        }
        DOMElements.level2Btn.disabled = !progress.level1.completed;
        DOMElements.level3Btn.disabled = !progress.level2.completed;
    }

    const overallProgressPercent = (totalScore / (totalPossibleScore || 1)) * 100;
    DOMElements.overallProgress.style.width = overallProgressPercent + '%';
    DOMElements.overallStats.textContent = `Overall Score: ${totalScore}/${totalPossibleScore}. ${progress.overallComplete ? 'You are a Cyber Warrior!' : 'Keep going!'}`;

    if (progress.overallComplete) {
        showFinalFeedbackPage();
    }

    updateSidebarProgress();
};

const renderQuestion = () => {
    const levelData = appState.quizData[appState.currentLevel];
    const question = levelData.questions[appState.currentQuestionIndex];

    DOMElements.levelTitle.textContent = levelData.title;
    const progress = ((appState.currentQuestionIndex + 1) / levelData.questions.length) * 100;
    DOMElements.quizProgress.style.width = `${progress}%`;
    DOMElements.questionText.textContent = `Question ${appState.currentQuestionIndex + 1}: ${question.text}`;

    if (question.imageUrl) {
        DOMElements.questionImage.innerHTML = `<img src="${question.imageUrl}" alt="Image for the quiz scenario">`;
    } else {
        DOMElements.questionImage.innerHTML = '';
    }

    if (question.explanation) {
        DOMElements.learnMoreContainer.innerHTML = `
                    <details class="learn-more-details">
                        <summary>Learn More About This Scenario</summary>
                        <p>${question.explanation}</p>
                    </details>
                `;
    } else {
        DOMElements.learnMoreContainer.innerHTML = '';
    }

    let optionsHTML = '';
    if (question.type === 'single' || question.type === 'multiple') {
        const inputType = question.type === 'multiple' ? 'checkbox' : 'radio';
        question.options.forEach((option, index) => {
            optionsHTML += `<label class="option" data-index="${index}"><input type="${inputType}" name="option" value="${index}"><span>${option}</span></label>`;
        });
    } else if (question.type === 'knowledge-check') {
        question.subQuestions.forEach((sub, index) => {
            optionsHTML += `
                        <div class="knowledge-check-item" data-index="${index}">
                            <p>${sub}</p>
                            <div class="yes-no-buttons">
                                <button type="button" class="btn-yn" data-value="yes">Yes</button>
                                <button type="button" class="btn-yn" data-value="no">No</button>
                            </div>
                        </div>`;
        });
    }

    DOMElements.optionsForm.innerHTML = optionsHTML;
    DOMElements.optionsForm.classList.remove('disabled');
    DOMElements.prevQuestionBtn.style.display = appState.currentQuestionIndex > 0 ? 'inline-block' : 'none';
    DOMElements.checkAnswerBtn.style.display = 'inline-block';
    DOMElements.nextQuestionBtn.style.display = 'none';
    DOMElements.checkAnswerBtn.disabled = true;

    if (question.type === 'knowledge-check') {
        const items = DOMElements.optionsForm.querySelectorAll('.knowledge-check-item');
        items.forEach(item => {
            item.querySelectorAll('.btn-yn').forEach(button => {
                button.addEventListener('click', () => {
                    item.querySelectorAll('.btn-yn').forEach(b => b.classList.remove('selected'));
                    button.classList.add('selected');
                    const allAnswered = Array.from(items).every(i => i.querySelector('.selected'));
                    DOMElements.checkAnswerBtn.disabled = !allAnswered;
                });
            });
        });
    } else {
        DOMElements.optionsForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => DOMElements.checkAnswerBtn.disabled = false);
        });
    }
    updateBackgroundAnimation();
};

const showFinalFeedbackPage = () => {
    const progress = appState.userProgress;
    let totalScore = 0;
    let totalPossibleScore = 0;

    for (let i = 1; i <= 3; i++) {
        const levelProgress = progress[`level${i}`] || { score: 0 };
        const levelQuestionCount = appState.quizData[i]?.questions.length || 0;
        totalPossibleScore += levelQuestionCount;
        totalScore += levelProgress.score;
        document.getElementById(`level${i}Score`).textContent = `${levelProgress.score}/${levelQuestionCount}`;
    }

    DOMElements.feedbackUserName.textContent = appState.currentUser.displayName || appState.currentUser.email;
    DOMElements.finalScore.textContent = `${totalScore}/${totalPossibleScore}`;
    DOMElements.finalProgress.style.width = `${(totalScore / (totalPossibleScore || 1)) * 100}%`;
    showPage('feedbackPage');
    triggerConfetti();
};

const fetchQuizData = async () => {
    setLoading(true);
    try {
        const q = query(collection(db, "quizzes"), orderBy("levelOrder"));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.error("Quiz collection is empty or could not be fetched.");
            return false;
        }
        const fetchedQuizzes = {};
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedQuizzes[data.levelOrder] = { id: doc.id, ...data };
        });
        appState.quizData = fetchedQuizzes;
        return true;
    } catch (error) {
        console.error("Error fetching quiz data:", error);
        alert("Could not load the training modules. Please check your internet connection and try again.");
        return false;
    } finally {
        setLoading(false);
    }
};

const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = DOMElements.loginForm.loginEmail.value;
    const password = DOMElements.loginForm.loginPassword.value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        clearFeedback(DOMElements.loginFeedback);
    } catch (error) {
        showFeedback(DOMElements.loginFeedback, error.message);
    } finally {
        setLoading(false);
    }
};

const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const name = DOMElements.registerForm.registerName.value;
    const email = DOMElements.registerForm.registerEmail.value;
    const password = DOMElements.registerForm.registerPassword.value;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const initialProgress = {
            level1: { score: 0, completed: false },
            level2: { score: 0, completed: false },
            level3: { score: 0, completed: false },
            overallComplete: false
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: name,
            email: email,
            progress: initialProgress
        });
        clearFeedback(DOMElements.registerFeedback);
    } catch (error) {
        showFeedback(DOMElements.registerFeedback, error.message);
    } finally {
        setLoading(false);
    }
};

const handleLogout = async () => {
    await signOut(auth);
    appState.currentUser = null;
    appState.userProgress = { level1: {}, level2: {}, level3: {} };
    DOMElements.progressSidebar.classList.remove('show');
    DOMElements.mainContainer.classList.remove('sidebar-open');
    DOMElements.progressToggle.classList.remove('active');
    showPage('loginPage');
};

const fetchUserProgress = async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        const data = userDoc.data();
        const defaultProgress = {
            level1: { score: 0, completed: false },
            level2: { score: 0, completed: false },
            level3: { score: 0, completed: false },
            overallComplete: false
        };
        appState.userProgress = { ...defaultProgress, ...data.progress };
    }
    updateDashboardUI();
};

const saveLevelProgress = async (level, score) => {
    if (!appState.currentUser) return;

    const levelKey = `level${level}`;
    const questionCount = appState.quizData[level].questions.length;
    const completed = score === questionCount;

    appState.userProgress[levelKey] = { score, completed };

    if (completed) {
        triggerConfetti();
    }

    let allLevelsComplete = true;
    for (let i = 1; i <= 3; i++) {
        if (!appState.userProgress[`level${i}`]?.completed) {
            allLevelsComplete = false;
            break;
        }
    }
    appState.userProgress.overallComplete = allLevelsComplete;

    try {
        await updateDoc(doc(db, 'users', appState.currentUser.uid), {
            progress: appState.userProgress
        });
    } catch (error) {
        console.error("Error saving progress: ", error);
    }

    updateDashboardUI();

    if (appState.userProgress.overallComplete) {
        showFinalFeedbackPage();
    } else {
        showPage('homePage');
    }
};

const handleStartLevel = (level) => {
    appState.currentLevel = level;
    appState.currentQuestionIndex = 0;
    appState.userAnswers = new Array(appState.quizData[level].questions.length);
    showPage('quizPage');
    renderQuestion();
};

const handleCheckAnswer = () => {
    const levelData = appState.quizData[appState.currentLevel];
    const question = levelData.questions[appState.currentQuestionIndex];
    const optionsForm = DOMElements.optionsForm;

    optionsForm.classList.add('disabled');
    DOMElements.checkAnswerBtn.style.display = 'none';
    DOMElements.nextQuestionBtn.style.display = 'inline-block';

    if (question.type === 'multiple') {
        const selectedAnswers = Array.from(optionsForm.querySelectorAll('input:checked')).map(input => parseInt(input.value));
        appState.userAnswers[appState.currentQuestionIndex] = selectedAnswers;
        Array.from(optionsForm.querySelectorAll('.option')).forEach((label, index) => {
            const isSelected = selectedAnswers.includes(index);
            const isCorrect = question.correct.includes(index);
            if (isCorrect) label.classList.add('correct');
            else if (isSelected && !isCorrect) label.classList.add('incorrect');
        });
    } else if (question.type === 'single') {
        const selectedAnswer = optionsForm.querySelector('input:checked');
        const answerValue = selectedAnswer ? parseInt(selectedAnswer.value) : -1;
        appState.userAnswers[appState.currentQuestionIndex] = answerValue;
        Array.from(optionsForm.querySelectorAll('.option')).forEach((label, index) => {
            if (index === question.correct) label.classList.add('correct');
            else if (index === answerValue) label.classList.add('incorrect');
        });
    } else if (question.type === 'knowledge-check') {
        const userChoices = [];
        const items = DOMElements.optionsForm.querySelectorAll('.knowledge-check-item');
        items.forEach((item, index) => {
            const selectedBtn = item.querySelector('.btn-yn.selected');
            const choice = selectedBtn ? selectedBtn.dataset.value : null;
            userChoices.push(choice);
            const isCorrect = choice === question.correct[index];
            item.classList.add(isCorrect ? 'correct' : 'incorrect');
        });
        appState.userAnswers[appState.currentQuestionIndex] = userChoices;
    }
};

const handleNextQuestion = () => {
    const levelData = appState.quizData[appState.currentLevel];
    if (appState.currentQuestionIndex < levelData.questions.length - 1) {
        appState.currentQuestionIndex++;
        renderQuestion();
    } else {
        let score = 0;
        levelData.questions.forEach((q, i) => {
            const userAnswer = appState.userAnswers[i];
            let isCorrect = false;
            if (q.type === 'multiple') {
                isCorrect = JSON.stringify((userAnswer || []).sort()) === JSON.stringify(q.correct.sort());
            } else if (q.type === 'single') {
                isCorrect = userAnswer === q.correct;
            } else if (q.type === 'knowledge-check') {
                isCorrect = JSON.stringify(userAnswer) === JSON.stringify(q.correct);
            }
            if (isCorrect) score++;
        });
        saveLevelProgress(appState.currentLevel, score);
    }
};

const handlePrevQuestion = () => {
    if (appState.currentQuestionIndex > 0) {
        appState.currentQuestionIndex--;
        renderQuestion();
    }
};

const init = () => {
    DOMElements.progressToggle.addEventListener('click', toggleSidebar);
    DOMElements.loginForm.addEventListener('submit', handleLogin);
    DOMElements.registerForm.addEventListener('submit', handleRegister);
    DOMElements.logoutBtns.forEach(btn => btn.addEventListener('click', handleLogout));
    DOMElements.showRegisterLink.addEventListener('click', () => {
        clearFeedback(DOMElements.loginFeedback);
        showPage('registerPage');
    });
    DOMElements.showLoginLink.addEventListener('click', () => {
        clearFeedback(DOMElements.registerFeedback);
        showPage('loginPage');
    });
    DOMElements.backToDashboardBtn.addEventListener('click', () => showPage('homePage'));
    DOMElements.startLevelBtns.forEach(btn => {
        btn.addEventListener('click', () => handleStartLevel(parseInt(btn.dataset.level)));
    });
    DOMElements.checkAnswerBtn.addEventListener('click', handleCheckAnswer);
    DOMElements.nextQuestionBtn.addEventListener('click', handleNextQuestion);
    DOMElements.prevQuestionBtn.addEventListener('click', handlePrevQuestion);

    document.addEventListener('click', (e) => {
        if (!DOMElements.progressSidebar.contains(e.target) &&
            !DOMElements.progressToggle.contains(e.target) &&
            DOMElements.progressSidebar.classList.contains('show')) {
            toggleSidebar();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768 && DOMElements.progressSidebar.classList.contains('show')) {
            DOMElements.mainContainer.classList.remove('sidebar-open');
        }
    });

    onAuthStateChanged(auth, async (user) => {
        setLoading(true);
        if (user) {
            const quizReady = await fetchQuizData();
            if (quizReady) {
                appState.currentUser = user;
                await fetchUserProgress(user.uid);
                showPage('homePage');
            } else {
                alert("The training modules are currently unavailable. Please try again later or contact support if the problem persists.");
                handleLogout();
            }
        } else {
            appState.currentUser = null;
            DOMElements.loginForm.reset();
            DOMElements.registerForm.reset();
            showPage('loginPage');
        }
        setLoading(false);
    });

    updateBackgroundAnimation();
};

document.addEventListener('DOMContentLoaded', init);