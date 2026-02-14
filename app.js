import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let questions = [];

window.adminLogin = async function(){
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  try{
    await signInWithEmailAndPassword(auth, email, pass);
    document.getElementById("loginCard").style.display="none";
    document.getElementById("dashboard").style.display="block";
    loadExams();
  }catch(e){
    alert("Login Failed");
  }
}

document.addEventListener("change", function(e){
  if(e.target.id === "csvFile"){
    const file = e.target.files[0];
    Papa.parse(file,{
      header:true,
      skipEmptyLines:true,
      complete:function(results){
        questions = results.data;
        alert("CSV Loaded");
      }
    });
  }
});

window.createExam = async function(){

  const mode = document.getElementById("mode").value;

  const exam = {
    title: title.value,
    subject: subject.value,
    university: university.value,
    department: department.value,
    timer: parseInt(timer.value),
    negative: parseFloat(negative.value),
    shuffle: shuffle.checked,
    mode: mode,
    liveCode: mode==="live" ? Math.floor(100000+Math.random()*900000).toString() : null,
    questions: questions,
    createdAt: new Date()
  };

  await addDoc(collection(db,"exams"), exam);
  alert("Exam Published!");
  loadExams();
}

async function loadExams(){
  const snapshot = await getDocs(collection(db,"exams"));
  let html="";
  snapshot.forEach(docSnap=>{
    const data = docSnap.data();
    html += `
      <div class="card">
        <b>${data.title}</b><br>
        ${data.subject} | ${data.mode}<br>
        ${data.mode==="live" ? "Live Code: "+data.liveCode : ""}
        <br><button onclick="deleteExam('${docSnap.id}')">Delete</button>
      </div>
    `;
  });
  document.getElementById("examList").innerHTML = html;
}

window.deleteExam = async function(id){
  await deleteDoc(doc(db,"exams",id));
  loadExams();
}
