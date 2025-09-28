// script.js — Black Force 007 Quiz Game (Ready-to-Use Updated Version)

/* Modern Quiz Engine: Settings Save, LocalStorage, Leaderboard, Sound, Timer */

const Q_SRC = 'questions.json';

// UI Elements const startScreen = document.getElementById('startScreen'); const startBtn = document.getElementById('startBtn'); const difficulty = document.getElementById('difficulty'); const quizScreen = document.getElementById('quizScreen'); const questionText = document.getElementById('questionText'); const optionsList = document.getElementById('optionsList'); const timerDisplay = document.getElementById('timerDisplay'); const scoreDisplay = document.getElementById('scoreDisplay'); const progressFill = document.getElementById('progressFill'); const qcounter = document.getElementById('qcounter'); const resultScreen = document.getElementById('resultScreen'); const finalScore = document.getElementById('finalScore'); const bestScore = document.getElementById('bestScore'); const replayBtn = document.getElementById('replayBtn'); const shareBtn = document.getElementById('shareBtn'); const leaderBtn = document.getElementById('leaderBtn'); const leaderBoard = document.getElementById('leaderboard'); const leaderList = document.getElementById('leaderList'); const closeLeader = document.getElementById('closeLeader'); const settingsBtn = document.getElementById('settingsBtn'); const settingsModal = document.getElementById('settingsModal'); const closeSettings = document.getElementById('closeSettings'); const saveSettings = document.getElementById('saveSettings'); const settingsTimer = document.getElementById('settingsTimer'); const settingsCount = document.getElementById('settingsCount'); const settingsSound = document.getElementById('settingsSound'); const toast = document.getElementById('toast'); const prevBtn = document.getElementById('prevBtn'); const nextBtn = document.getElementById('nextBtn');

let questions = []; let order = []; let currentIdx = 0; let timePerQuestion = 15; let timer = null; let timeLeft = 0; let score = 0; let streak = 0; let totalToShow = 50; let soundEnabled = true;

// Sounds (tiny embedded beep) const soundCorrect = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA='); const soundWrong = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=');

// Helpers const $ = sel => document.querySelector(sel); function showToast(msg, time = 2000){ toast.textContent = msg; toast.classList.remove('hidden'); setTimeout(()=>toast.classList.add('hidden'), time); }

function saveSettingsToLocal(){ const s = { timer: parseInt(settingsTimer.value), count: parseInt(settingsCount.value), sound: settingsSound.checked }; localStorage.setItem('bf007_settings', JSON.stringify(s)); }

function loadSettingsFromLocal(){ const s = JSON.parse(localStorage.getItem('bf007_settings') || '{}'); if(s.timer) settingsTimer.value = s.timer; if(s.count) settingsCount.value = s.count; if(typeof s.sound === 'boolean') settingsSound.checked = s.sound; }

async function loadQuestions(){ try{ const res = await fetch(Q_SRC); const data = await res.json(); questions = data.slice(); }catch(e){ console.error('Failed to load questions', e); } }

function startGame(){ timePerQuestion = parseInt(settingsTimer.value); totalToShow = Math.max(5, Math.min(50, parseInt(settingsCount.value))); soundEnabled = settingsSound.checked;

order = shuffle(Array.from({length: questions.length}, (_,i)=>i)).slice(0,totalToShow); currentIdx = 0; score = 0; streak = 0;

startScreen.classList.add('hidden'); quizScreen.classList.remove('hidden'); resultScreen.classList.add('hidden'); renderQuestion(); }

function renderQuestion(){ if(currentIdx >= order.length){ endGame(); return; } const qi = questions[ order[currentIdx] ]; questionText.textContent = ${currentIdx+1}. ${qi.question}; optionsList.innerHTML = ''; qi.options.forEach((opt, idx) =>{ const li = document.createElement('li'); li.tabIndex = 0; li.innerHTML = <span>${String.fromCharCode(65+idx)}.</span> <span>${opt}</span>; li.addEventListener('click', ()=>chooseAnswer(li, idx, qi.answer)); li.addEventListener('keydown', (e)=>{ if(e.key==='Enter') chooseAnswer(li, idx, qi.answer); }); optionsList.appendChild(li); });

qcounter.textContent = ${currentIdx+1} / ${order.length}; progressFill.style.width = ${Math.round(((currentIdx)/order.length)*100)}%; startTimer(timePerQuestion); }

function startTimer(seconds){ clearInterval(timer); timeLeft = seconds; timerDisplay.textContent = ⏳ ${timeLeft}; timer = setInterval(()=>{ timeLeft--; timerDisplay.textContent = ⏳ ${timeLeft}; if(timeLeft<=0){ clearInterval(timer); autoNext(); } },1000); }

function chooseAnswer(li, idx, correctIdx){ if(li.classList.contains('done')) return; clearInterval(timer); li.classList.add('done'); const items = optionsList.querySelectorAll('li');

if(idx === correctIdx){ li.classList.add('correct'); streak++; const base = 10; const timeBonus = Math.max(0,timeLeft); const streakBonus = streak>1?Math.min(20,streak*2):0; score += base+timeBonus+streakBonus; scoreDisplay.textContent = score; if(soundEnabled) soundCorrect.play().catch(()=>{}); showToast('সঠিক! +' + (base+timeBonus+streakBonus)); }else{ li.classList.add('wrong'); streak=0; if(items[correctIdx]) items[correctIdx].classList.add('correct'); if(soundEnabled) soundWrong.play().catch(()=>{}); showToast('ভুল!'); } setTimeout(()=>{ currentIdx++; progressFill.style.width = ${Math.round((currentIdx/order.length)*100)}%; renderQuestion(); },1200); }

function autoNext(){ streak=0; const qi = questions[order[currentIdx]]; const items = optionsList.querySelectorAll('li'); if(items[qi.answer]) items[qi.answer].classList.add('correct'); showToast('সময় শেষ!'); setTimeout(()=>{ currentIdx++; progressFill.style.width = ${Math.round((currentIdx/order.length)*100)}%; renderQuestion(); },900); }

function endGame(){ clearInterval(timer); quizScreen.classList.add('hidden'); resultScreen.classList.remove('hidden'); finalScore.textContent = score; const best = Math.max(parseInt(localStorage.getItem('bf007_best')||0), score); localStorage.setItem('bf007_best', best); bestScore.textContent = best; saveToLeaderBoard({score, date:new Date().toISOString()}); }

function saveToLeaderBoard(entry){ const list = JSON.parse(localStorage.getItem('bf007_leader')||'[]'); list.push(entry); list.sort((a,b)=>b.score-a.score); localStorage.setItem('bf007_leader', JSON.stringify(list.slice(0,10))); }

function showLeader(){ leaderBoard.classList.remove('hidden'); const list = JSON.parse(localStorage.getItem('bf007_leader')||'[]'); leaderList.innerHTML = ''; if(list.length===0) leaderList.innerHTML='<li>কোনো রেকর্ড নেই</li>'; list.forEach(item=>{ const li=document.createElement('li'); li.textContent=${item.score} — ${new Date(item.date).toLocaleString()}; leaderList.appendChild(li); }); }

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

// DOMContentLoaded init document.addEventListener('DOMContentLoaded', async ()=>{ await loadQuestions(); loadSettingsFromLocal();

startBtn.addEventListener('click', startGame); replayBtn.addEventListener('click', ()=>{ startScreen.classList.remove('hidden'); resultScreen.classList.add('hidden'); }); leaderBtn.addEventListener('click', showLeader); closeLeader.addEventListener('click', ()=>leaderBoard.classList.add('hidden'));

settingsBtn.addEventListener('click', ()=>{ loadSettingsFromLocal(); settingsModal.classList.remove('hidden'); }); closeSettings.addEventListener('click', ()=>settingsModal.classList.add('hidden')); saveSettings.addEventListener('click', ()=>{ saveSettingsToLocal(); settingsModal.classList.add('hidden'); showToast('Settings saved!'); timePerQuestion=parseInt(settingsTimer.value); totalToShow=parseInt(settingsCount.value); soundEnabled=settingsSound.checked; });

prevBtn.addEventListener('click

