'use strict';

/* 
  Theme-håndtering:
  Bytter mellom light- og dark-theme dersom theme-knappen finnes på siden
*/
const switcher = document.querySelector('.btn');

if (switcher) {
  switcher.addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');

    const className = document.body.className;
    this.textContent = className === "light-theme" ? "Dark" : "Light";
  });
}

/* 
  Produktnavigasjon:
  Gjør listeelementer klikkbare, og navigerer til angitt mappe
*/
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    window.location.href = item.dataset.target;
  });
});

/* 
  Handlekurv:
  Leser lagrede produkter fra localStorage, eller starter tom
*/
let cart = JSON.parse(localStorage.getItem('cart')) || [];

/* 
  Oppdaterer antall produkter i handlekurv-ikonet
*/
const cartCount = document.getElementById('cart-count');
if (cartCount) {
  cartCount.textContent = cart.length;
}

/* 
  Viser / skjuler handlekurv-panelet når brukeren klikker på handlekurven
*/
const cartButton = document.getElementById('cart');
const cartPanel = document.getElementById('cart-panel');

if (cartButton && cartPanel) {
  cartButton.addEventListener('click', () => {
    cartPanel.classList.toggle('hidden');
    renderCart();
  });
}

/* 
  Referanse til listen som viser produktene i handlekurven
*/
const cartItems = document.getElementById('cart-items');

/* 
  Renderer handlekurvens innhold basert på nåværende cart-array
*/
function renderCart() {
  if (!cartItems) return;

  cartItems.innerHTML = '';

  cart.forEach((produkt, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${produkt}
      <button onclick="fjern(${index})">✖</button>
    `;
    cartItems.appendChild(li);
  });
}

/* 
  Fjerner ett produkt fra handlekurven basert på indeks
*/
function fjern(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));

  if (cartCount) {
    cartCount.textContent = cart.length;
  }

  renderCart();
}

/* 
  Tømmer hele handlekurven
*/
const clearBtn = document.getElementById('clear-cart');

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    cart = [];
    localStorage.removeItem('cart');

    if (cartCount) {
      cartCount.textContent = 0;
    }

    // Vis notification-melding
    const notification = document.getElementById('notification');
    if (notification) {
      notification.textContent = 'Handlekurven er tom.';
      notification.classList.remove('hidden');
      
      // Skjul meldingen etter 3 sekunder
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }

    renderCart();
  });
}

/* 
  Legger til et produkt i handlekurven og oppdaterer visning og lagring
*/
function leggTil(produkt) {
  cart.push(produkt);
  localStorage.setItem('cart', JSON.stringify(cart));

  if (cartCount) {
    cartCount.textContent = cart.length;
  }

  // Vis notification-melding
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = `${produkt} lagt til i handlekurven`;
    notification.classList.remove('hidden');
    
    // Skjul meldingen etter 3 sekunder
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }

  renderCart();
}

async function checkout() {
  if (cart.length === 0) {
    alert("Handlekurven er tom");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: cart
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Noe gikk galt");
    }

    alert(`Bestilling fullført! Ordre-ID: ${data.orderId}`);

    // Tøm handlekurv lokalt
    cart = [];
    localStorage.removeItem("cart");

    if (cartCount) cartCount.textContent = 0;
    renderCart();

  } catch (err) {
    console.error(err);
    alert("Kunne ikke fullføre kjøpet");
  }
}

/*
  Kontaktskjema:
  Håndterer innsending av kontaktskjemaet
*/
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    try {
      // Sender data til backend
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      if (response.ok) {
        alert('Takk for meldingen! Vi kontakter deg så snart som mulig.');
        contactForm.reset();
      } else {
        alert('En feil oppstod ved innsending. Prøv igjen senere.');
      }
    } catch (err) {
      console.error('Feil ved kontaktskjema-innsending:', err);
      alert('En feil oppstod. Vennligst prøv igjen.');
    }
  });
}

// Hamburger - Navbar

  const nav = document.querySelector('.topnav');
  const toggle = document.querySelector('.menu-toggle');

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });



