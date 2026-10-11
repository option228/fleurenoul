/* musique de fond, commune à toutes les pages
   chaque page a juste besoin de :  <audio id="musique" src="nom-du-fichier.mp3" loop></audio>
   puis <script src="musique.js"></script> juste avant </body>
   le volume choisi est retenu d'une page à l'autre */

(function () {
  var musique = document.getElementById("musique");
  if (!musique) return;

  // style des contrôles
  var style = document.createElement("style");
  style.textContent =
    ".controle-musique{position:fixed;right:12px;bottom:12px;z-index:1002;display:flex;flex-direction:column;align-items:flex-end;gap:6px}" +
    ".controle-musique button{width:18px;height:18px;border:none;border-radius:2px;background:#24c924;box-shadow:0 2px 4px rgba(0,0,0,.5);cursor:pointer;padding:0}" +
    ".controle-musique button.coupe{background:#c92424}" +
    ".controle-musique button.absente{background:#777;cursor:help}" +
    ".controle-musique input{width:90px;margin:0;accent-color:#24c924;cursor:pointer}";
  document.head.appendChild(style);

  // le carré + la barre de volume
  var boite = document.createElement("div");
  boite.className = "controle-musique";
  boite.innerHTML =
    '<button type="button" aria-label="Couper la musique"></button>' +
    '<input type="range" min="0" max="100" aria-label="Volume de la musique">';
  document.body.appendChild(boite);

  var bouton = boite.querySelector("button");
  var curseur = boite.querySelector("input");

  // volume retenu (50 par défaut)
  var volume = 50;
  try {
    var v = localStorage.getItem("fleurenoul-volume");
    if (v !== null) volume = Number(v);
  } catch (e) {}
  curseur.value = volume;
  musique.volume = volume / 100;

  var lancee = false;

  function lancer() {
    if (lancee) return;
    lancee = true;
    musique.play().catch(function () { lancee = false; });
  }

  // les navigateurs bloquent le son tant qu'on a pas cliqué
  document.addEventListener("click", lancer);
  document.addEventListener("keydown", lancer);

  bouton.addEventListener("click", function (e) {
    e.stopPropagation();
    if (!lancee) {
      musique.muted = false;
      lancer();
    } else {
      musique.muted = !musique.muted;
    }
    bouton.classList.toggle("coupe", musique.muted);
    bouton.setAttribute("aria-label", musique.muted ? "Remettre la musique" : "Couper la musique");
  });

  curseur.addEventListener("input", function () {
    musique.volume = curseur.value / 100;
    if (musique.muted && curseur.value > 0) {
      musique.muted = false;
      bouton.classList.remove("coupe");
    }
    try { localStorage.setItem("fleurenoul-volume", curseur.value); } catch (e) {}
  });

  // cliquer sur le curseur lance aussi la musique
  curseur.addEventListener("click", function (e) { e.stopPropagation(); lancer(); });

  // si le fichier est introuvable, le carré devient gris
  musique.addEventListener("error", function () {
    bouton.classList.add("absente");
    bouton.title = "Fichier introuvable : " + musique.getAttribute("src");
  });
})();
