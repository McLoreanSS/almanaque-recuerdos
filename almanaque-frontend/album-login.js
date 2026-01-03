const loginBtn = document.getElementById("loginBtn");
const pinInput = document.getElementById("pinInput");
const errorMsg = document.getElementById("errorMsg");

loginBtn.addEventListener("click", async () => {
  const pin = pinInput.value.trim();

  if (!pin) {
    errorMsg.textContent = "Ingresá el código.";
    return;
  }

  try {
    const response = await fetch("https://almanaque-recuerdos-1.onrender.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin }),
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = "album-dashboard.html";
    } else {
      errorMsg.textContent = data.message || "Código incorrecto.";
    }
  } catch (error) {
    errorMsg.textContent = "No se pudo conectar con el servidor.";
  }
});
