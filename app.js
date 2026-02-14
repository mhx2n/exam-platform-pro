import { auth, db } from './firebase.js';
import { collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let exams = [];
let currentExam = null;
let userAnswers = {};
let timerInterval;
let timeLeft;

async function loadCategories(){
  const snapshot = await getDocs(collection(db,"exams"));
  exams = [];
  snapshot.forEach(docSnap=>{
    exams.push({id:docSnap.id, ...docSnap.data()});
  });

  let subjects = [...new Set(exams.map(e=>e.subject))];

  let html="<div class='card'><h3>Select Subject</h3>";
  subjects.forEach(s=>{
    html += `<button onclick="showExams('${s}')">${s}</button><br><br>`;
  });
  html+="</div>";

  document.getElementById("categorySection").innerHTML=html;
}

window.showExams = function(subject){

  let filtered = exams.filter(e=>e.subject===subject);

  let html+=`<div class="card">
    <h3>${e.title}</h3>
    <p>${e.subject} | ${e.university}</p>
    <p>Mode: ${e.mode}</p>
    <button onclick="startExam('${e.id}')">Start Exam</button>
    </div>`;
  filtered.forEach(e=>{
    html+=`
      <div class="card">
        <b>${e.title}</b><br>
        Mode: ${e.mode}<br>
        <button onclick="startExam('${e.id}')">Start</button>
      </div>
    `;
  });

  html+="</div>";
  document.getElementById("examSection").innerHTML=html;
}

window.startExam = function(id){

  currentExam = exams.find(e=>e.id===id);

  let html=`
    <div class="card">
      <h3>${currentExam.title}</h3>
      <input type="text" id="studentName" placeholder="Enter Your Name"><br><br>
  `;

  if(currentExam.mode==="live"){
    html+=`<input type="text" id="liveCode" placeholder="Enter Live Code"><br><br>`;
  }

  html+=`<button onclick="beginExam()">Begin</button></div>`;

  document.getElementById("examArea").innerHTML=html;
}

window.beginExam = function(){

  const name = document.getElementById("studentName").value;
  if(!name) return alert("Enter Name");

  if(currentExam.mode==="live"){
    const code = document.getElementById("liveCode").value;
    if(code!==currentExam.liveCode){
      return alert("Invalid Live Code");
    }
  }

  renderQuestions();
  startTimer();
}

function renderQuestions(){

  let questions = [...currentExam.questions];

  if(currentExam.shuffle){
    questions.sort(()=>Math.random()-0.5);
  }

  let html="<div class='card'><h3>Exam Started</h3>";

  questions.forEach((q,i)=>{
    html+=`<div id="q${i}">
      <p><b>${i+1}. ${q.questions}</b></p>`;

    for(let j=1;j<=5;j++){
      if(q["option"+j]){
        html+=`
          <label>
          <input type="radio" name="q${i}" value="${j}">
          ${q["option"+j]}
          </label><br>
        `;
      }
    }

    html+="</div><hr>";
  });

  html+=`<button onclick="submitExam()">Submit</button></div>`;

  document.getElementById("examArea").innerHTML=html;
}

function startTimer(){

  let timerBox = document.createElement("div");
  timerBox.className="timerBox";
  timerBox.id="timerBox";
  document.body.appendChild(timerBox);

  timeLeft = currentExam.timer * 60;

  timerInterval = setInterval(()=>{
    timeLeft--;

    let minutes = Math.floor(timeLeft/60);
    let seconds = timeLeft%60;
    seconds = seconds<10 ? "0"+seconds : seconds;

    document.getElementById("timerBox").innerText=
      "⏱ "+minutes+":"+seconds;

    if(timeLeft<=0){
      submitExam();
    }

  },1000);
}

window.submitExam = async function(){

  clearInterval(timerInterval);

  let score=0;

  currentExam.questions.forEach((q,i)=>{
    let selected = document.querySelector(`input[name="q${i}"]:checked`);
    if(selected){
      if(parseInt(selected.value)===parseInt(q.answer)){
        score++;
      }else{
        score-=currentExam.negative;
      }
    }
  });

  document.getElementById("resultArea").innerHTML=
    `<div class="card"><h3>Your Score: ${score}</h3></div>`;

  await addDoc(collection(db,"results"),{
    examId: currentExam.id,
    name: document.getElementById("studentName").value,
    score: score,
    createdAt: new Date()
  });

  showLeaderboard(currentExam.id);
}

async function showLeaderboard(examId){

  const q = query(collection(db,"results"), where("examId","==",examId));
  const snapshot = await getDocs(q);

  let results=[];
  snapshot.forEach(docSnap=>{
    results.push(docSnap.data());
  });

  results.sort((a,b)=>b.score-a.score);

  let html="<div class='card'><h3>🏆 Leaderboard</h3>";

  results.slice(0,10).forEach((r,i)=>{
    html+=`
      <div class="leaderboard-item">
        ${i+1}. <b>${r.name}</b> — ${r.score}
      </div>
    `;
  });

  html+="</div>";

  document.getElementById("resultArea").innerHTML+=html;
}
window.onload = loadCategories;
