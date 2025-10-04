// Script pour vider le localStorage et forcer une reconnexion
// À exécuter dans la console du navigateur

console.log("Clearing localStorage...")
localStorage.clear()
console.log("localStorage cleared. Please refresh the page and login again.")

// Optionnel: rediriger vers la page de login
// window.location.href = '/login'