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

let selectedTime = null;

const buttons = document.querySelectorAll(".times button");
const result = document.getElementById("result");
const dateInput = document.getElementById("date");
const bookBtn = document.getElementById("bookBtn");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;

    buttons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedTime = btn.textContent.trim();
  });
});

function makeSlotId(date, time) {
  return `${date}_${time.replace(":", "-")}`;
}

function resetOrari() {
  buttons.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("occupied");
    btn.classList.remove("selected");
  });
  selectedTime = null;
}

function caricaOrariOccupati(date) {
  resetOrari();

  if (!date) return;

  db.collection("prenotazioni")
    .where("data", "==", date)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const prenotazione = doc.data();
        const orarioOccupato = prenotazione.orario;

        buttons.forEach((btn) => {
          if (btn.textContent.trim() === orarioOccupato) {
            btn.disabled = true;
            btn.classList.add("occupied");
          }
        });
      });
    })
    .catch((error) => {
      console.error("Errore caricamento orari occupati:", error);
      result.textContent = "❌ Errore nel caricamento degli orari.";
    });
}

dateInput.addEventListener("change", () => {
  caricaOrariOccupati(dateInput.value);
});

bookBtn.addEventListener("click", () => {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const service = document.getElementById("service").value;
  const date = document.getElementById("date").value;

  if (!name || !phone || !date || !selectedTime) {
    result.textContent = "❌ Compila tutti i campi e seleziona un orario.";
    return;
  }

  const slotId = makeSlotId(date, selectedTime);
  const slotRef = db.collection("prenotazioni").doc(slotId);

  result.textContent = "Controllo disponibilità...";

  db.runTransaction((transaction) => {
    return transaction.get(slotRef).then((doc) => {
      if (doc.exists) {
        throw new Error("SLOT_OCCUPATO");
      }

      transaction.set(slotRef, {
        nome: name,
        telefono: phone,
        servizio: service,
        data: date,
        orario: selectedTime,
        creatoIl: new Date().toISOString()
      });
    });
  })
    .then(() => {
      result.textContent = `✅ Prenotazione confermata: ${service} il ${date} alle ${selectedTime}`;

      document.getElementById("name").value = "";
      document.getElementById("phone").value = "";
      document.getElementById("service").selectedIndex = 0;
      document.getElementById("date").value = "";

      resetOrari();
    })
    .catch((error) => {
      console.error("Errore prenotazione:", error);

      if (error.message === "SLOT_OCCUPATO") {
        result.textContent = "❌ Questo orario è già occupato.";
        caricaOrariOccupati(date);
      } else {
        result.textContent = "❌ Errore durante la prenotazione.";
      }
    });
});