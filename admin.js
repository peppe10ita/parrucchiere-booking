const adminUser = "piopio";
const adminPass = "Leo e Fedele";

function login(){

let user = document.getElementById("username").value;
let pass = document.getElementById("password").value;

if(user === adminUser && pass === adminPass){

document.getElementById("login-box").style.display = "none";

document.getElementById("admin-panel").style.display = "block";

}else{

document.getElementById("login-error").innerText = "Username o password sbagliati";

}

}

const firebaseConfig = {
  apiKey: "AIzaSyCd1a1QVONQs43sDXyRaNA3zsXyX5w2kws",
  authDomain: "parrucchiere-booking.firebaseapp.com",
  projectId: "parrucchiere-booking",
  storageBucket: "parrucchiere-booking.firebasestorage.app",
  messagingSenderId: "792959744154",
  appId: "1:792959744154:web:f3e3f5fe9dd84ce0eb8723"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const lista = document.getElementById("lista-prenotazioni");

db.collection("prenotazioni").onSnapshot(
  (snapshot) => {
    lista.innerHTML = "";

    if (snapshot.empty) {
      lista.innerHTML = "<p>Nessuna prenotazione trovata.</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const prenotazione = doc.data();

      const card = document.createElement("div");
      card.className = "prenotazione-item";
      card.innerHTML = `
        <p><strong>Nome:</strong> ${prenotazione.nome}</p>
<p><strong>Servizio:</strong> ${prenotazione.servizio}</p>
<p><strong>Data:</strong> ${prenotazione.data}</p>
<p><strong>Orario:</strong> ${prenotazione.orario}</p>
      `;

      lista.appendChild(card);
    });
  },
  (error) => {
    console.error("Errore lettura prenotazioni:", error);
    lista.innerHTML = `<p>Errore nel caricamento: ${error.message}</p>`;
  }
);