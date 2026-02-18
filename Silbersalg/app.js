'use strict';

const API_BASE_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : '';

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

/* Bytter mellom light/dark theme. */
const switcher = document.querySelector('.btn');

if (switcher) {
  switcher.addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');

    const className = document.body.className;
    this.textContent = className === "light-theme" ? "Dark" : "Light";
  });
}

/* Navigerer til valgt produktside. */
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    window.location.href = item.dataset.target;
  });
});

/* Leser handlekurv fra localStorage. */
let cart = JSON.parse(localStorage.getItem('cart')) || [];

/* Oppdaterer antall i handlekurv-ikonet. */
const cartCount = document.getElementById('cart-count');
if (cartCount) {
  cartCount.textContent = cart.length;
}

/* Viser/skjuler handlekurv-panelet. */
const cartButton = document.getElementById('cart');
const cartPanel = document.getElementById('cart-panel');

if (cartButton && cartPanel) {
  cartButton.addEventListener('click', () => {
    cartPanel.classList.toggle('hidden');
    cartButton.setAttribute('aria-expanded', String(!cartPanel.classList.contains('hidden')));
    renderCart();
  });
}

/* Listeelement for varer i handlekurven. */
const cartItems = document.getElementById('cart-items');

/* Tegner innholdet i handlekurven. */
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

/* Fjerner ett produkt fra handlekurven. */
function fjern(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));

  if (cartCount) {
    cartCount.textContent = cart.length;
  }

  renderCart();
}

/* Tømmer hele handlekurven. */
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
      
      // Skjul melding etter 3 sekunder
      setTimeout(() => {
        notification.classList.add('hidden');
      }, 3000);
    }

    renderCart();
  });
}

/* Legger til produkt i handlekurven. */
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
    
    // Skjul melding etter 3 sekunder
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }

  renderCart();
}

/* Sender bestilling til backend. */
async function checkout() {
  if (cart.length === 0) {
    alert("Handlekurven er tom");
    return;
  }

  try {
    const response = await fetch(apiUrl('/checkout'), {
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

/* Sender kontaktskjema til backend. */
const contactForm = document.getElementById('contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    try {
      // Sender data til backend
      const response = await fetch(apiUrl('/api/contact'), {
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

/* Åpner/lukker mobilmeny i toppnavigasjon. */
const nav = document.querySelector('.topnav');
const toggle = document.querySelector('.menu-toggle');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

