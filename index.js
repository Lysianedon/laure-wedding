
const EMAILJS_PUBLIC_KEY="0wgAWkIczpwsZkkdx";
const emailService = "service_0jcy2de";
const emailTemplate = "template_ovscezx";


// -----------------------CONDITIONAL DISPLAY -----------------------

// Configuration initiale avec GSAP
gsap.set(".cardWrapper", {perspective: 800});
gsap.set(".card", {transformStyle: "preserve-3d"});
gsap.set(".back", {rotationY: -180});
gsap.set([".back", ".front"], {backfaceVisibility: "hidden"});

document.addEventListener("DOMContentLoaded", function () {
    const cardWrapper = document.querySelector(".cardWrapper");
    const card = cardWrapper.querySelector(".card");
    const closeBtn = document.getElementById("closeBtn");
    const form = document.getElementById("rsvpForm");
    const submitBtn = document.getElementById("submitBtn");

    initCardFlip(cardWrapper, card, closeBtn);
    initFormValidation(form, submitBtn);
    initConditionalDisplay(form);

    emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY,
    });

    if (isFormValid(form)) {
        enableSubmitButton(submitBtn);
    } else {
        disableSubmitButton(submitBtn);
    }
});

function initCardFlip(cardWrapper, card, closeBtn) {
    cardWrapper.addEventListener('click', function(event) {
        if (event.target !== closeBtn && !card.classList.contains('flipped')) {
            flipCard(card);
        }
    });

    closeBtn.addEventListener('click', function() {
        flipCard(card); // Retourne la carte au recto
    });
}

function flipCard(card) {
    const isFlipped = card.classList.contains('flipped');
    const rotationY = isFlipped ? 0 : 180;
    gsap.to(card, {duration: 1, rotationY: rotationY});
    card.classList.toggle('flipped');
}

function initFormValidation(form, submitBtn) {
    form.addEventListener("input", function (event) {
        if (event.target.id !== "message"){
            setTimeout(function() {
                if (isFormValid(form)) {
                    enableSubmitButton(submitBtn);
                } else {
                    disableSubmitButton(submitBtn);
                }
            }, 20);
        }
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (isFormValid(form)) {
            submitForm(form, submitBtn);
        }
    });
}

function isFormValid(form) {
    let isValid = true;

    // Check if the name is valid
    const name = form.name.value.trim();
    if (name === "") {
        return false;
    }

    // Check attendance if visible
    if (isElementVisible('.guests-block')) {
        const attendance = form.querySelector('input[name="attendance"]:checked');
        if (!attendance) {
            return false;
        } else {
            const guests = form.guests.value.trim();
            if (guests === "" || guests <= 0) {
                return false;
            }
        }
    }

    // Check children if visible
    if (isElementVisible('.children-block')) {
        const children = form.children.value.trim();
        if (children === "" || children < 0) {
            return false;
        }
    }

    // Check brunch if visible
    if (isElementVisible('.brunch-block')) {
        const brunch = form.querySelector('input[name="brunch"]:checked');
        if (!brunch) {
            return false;
        }
    }

    // Check accommodation if visible
    if (isElementVisible('.accommodation-block')) {
        const accommodation = form.querySelector('input[name="accommodation"]:checked');
        if (!accommodation) {
            return false;
        }
    }

    // Check diet if visible
    if (isElementVisible('.food-diet-block')) {
        const diet = form.diet.value.trim();
        if (diet === "") {
            return false;
        }
    }

    return isValid;
}

function enableSubmitButton(submitBtn) {
    submitBtn.classList.remove("disabled-btn");
    submitBtn.classList.add("submit-btn");
    submitBtn.disabled = false;
}

function disableSubmitButton(submitBtn) {
    submitBtn.classList.remove("submit-btn");
    submitBtn.classList.add("disabled-btn");
    submitBtn.disabled = true;
}

function submitForm(form, submitBtn) {
    const formData = new FormData(form);

    const keyTranslations = {
        name: "nom",
        attendance: "presenceJourJ",
        guests: "nombreParticipants",
        children: "nombreEnfants",
        transport: "modeTransport",
        brunch: "presenceBrunch",
        accommodation: "besoinHebergement",
        diet: "restrictionsAlimentaires",
        message: "commentaires"
    };
    const data = {};
    

    // Parcourir chaque paire clé-valeur dans formData
    for (let [name, value] of formData.entries()) {
        // Filtrer ou traiter les données si nécessaire
        if (value.trim() !== "") { // Ignorer les champs vides
            data[keyTranslations[name]] = value.trim();
        }
    }

    // Pour l'instant, nous affichons les données dans une alerte
    // alert("Formulaire soumis avec succès !\nDonnées :\n" + JSON.stringify(data, null, 2));

    console.log(JSON.stringify(data, null, 2));
    const stringified_form = JSON.stringify(data, null, 2);
   
    const emailData = {
    nom: data.nom || "",
    message: stringified_form,
    from_name: "Laure",
    reply_to: "l.mirroir.wedding@gmail.com",
    };


  emailjs.send(emailService, emailTemplate, emailData)
  .then(() => {
      const cardWrapper = document.querySelector(".cardWrapper");
      const card = cardWrapper.querySelector(".card");
      const notification = document.querySelector('.notification');
      notification.style.visibility = 'visible';

    setTimeout(() => {
        notification.style.visibility = 'hidden'; 
        flipCard(card);
    }, 2000);

  }, (error) => {

      console.log('FAILED...', error);
  });

    // Réinitialiser le formulaire
    form.reset();
    disableSubmitButton(submitBtn);
    resetConditionalDisplay();
}

function initConditionalDisplay(form) {
    const attendanceInputs = form.querySelectorAll('input[name="attendance"]');
    const brunchInputs = form.querySelectorAll('input[name="brunch"]');
    const guestsInput = form.querySelectorAll('input[name="guests"]');
    
    // hideElement('.guests-block');
    hideElement('.children-block');
    // hideElement('.transport-block');
    hideElement('.brunch-block');
    hideElement('.accommodation-block');
    hideElement('.food-diet-block');

    attendanceInputs.forEach(input => {
        input.addEventListener('change', function() {
            handleAttendanceChange(input.value);
        });
    });

    brunchInputs.forEach(input => {
        input.addEventListener('change', function() {
            handleBrunchChange(input.value);
        });
    });

    guestsInput.forEach(input => {
        input.addEventListener('change', function() {
            handleNumberOfParticipants(input.value);
        });
    });
}

function handleAttendanceChange(attendanceValue) {
    if (attendanceValue === 'yes') {
        showElement('.guests-block');
        showElement('.brunch-block');
        showElement('.transport-block');
    } else {
        hideElement('.guests-block');
        hideElement('.children-block');
        hideElement('.brunch-block');
        hideElement('.accommodation-block');
        hideElement('.transport-block');
        hideElement('.food-diet-block');
    }
}

function handleNumberOfParticipants(nb){
    if(nb > 1){
        showElement('.children-block');
    } else {
        hideElement('.children-block');
    }
}

function handleBrunchChange(brunchValue) {
    if (brunchValue === 'yes') {
        showElement('.accommodation-block');
    } else {
        hideElement('.accommodation-block');
    }
}

function showElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = 'block';
        
        // Ajouter l'attribut required aux éléments pertinents
        const requiredElements = element.querySelectorAll('[required]');
        requiredElements.forEach(el => el.setAttribute('required', 'required'));
    }
}

function hideElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = 'none';
        
        // Supprimer l'attribut required des éléments masqués
        const requiredElements = element.querySelectorAll('[required]');
        requiredElements.forEach(el => el.removeAttribute('required'));

        // Réinitialiser les valeurs des champs masqués
        const inputs = element.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.checked = false;  // Décocher les cases à cocher et boutons radio
            } else {
                input.value = '';  // Réinitialiser la valeur des champs texte, select, textarea
            }
        });
    }
}


function resetConditionalDisplay() {
    hideElement('.guests-block');
    hideElement('.children-block');
    hideElement('.brunch-block');
    hideElement('.accommodation-block');
}

function isElementVisible(selector) {
    const element = document.querySelector(selector);
    return element && window.getComputedStyle(element).display !== 'none';
}




