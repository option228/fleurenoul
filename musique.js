/* musique de fond, commune à toutes les pages
   deux façons de faire :
   - avec un mp3   : <audio id="musique" src="nom-du-fichier.mp3" loop></audio>
   - avec YouTube  : une <iframe id="video-musique" src="https://www.youtube.com/embed/...&enablejsapi=1">
   puis <script src="musique.js"></script> juste avant </body>
   le volume choisi est retenu d'une page à l'autre */

(function () {
  var audio = document.getElementById("musique");
  var iframe = document.getElementById("video-musique");
  if (!audio && !iframe) return;

  // style des contrôles
  var style = document.createElement("style");
  style.textContent =
    ".controle-musique{position:fixed;right:12px;bottom:12px;z-index:1002;display:flex;flex-direction:column;align-items:flex-end;gap:6px}" +
    ".controle-musique button{width:18px;height:18px;border:none;border-radius:2px;background:#24c924;box-shadow:0 2px 4px rgba(0,0,0,.5);cursor:pointer;padding:0}" +
    ".controle-musique button.coupe{background:#c92424}" +
    ".controle-musique button.absente{background:#777;cursor:help}" +
    ".controle-musique input{width:90px;margin:0;accent-color:#24c924;cursor:pointer}" +
    ".info-son{font-size:12px;opacity:.8;margin:6px 0 0}";
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

  var coupe = false;      // coupé par la personne avec le carré
  var demarre = false;    // mp3 : déjà lancé ?
  var sonBloque = !audio; // YouTube : la vidéo démarre en muet, le son vient après
  var player = null;
  var pret = false;
  var info = null;

  function absente(texte) {
    bouton.classList.add("absente");
    bouton.title = texte;
  }

  function message(texte) {
    if (!info) return;
    info.textContent = texte;
    info.hidden = !texte;
  }

  // applique le volume et le muet au lecteur
  function appliquer() {
    if (audio) {
      audio.muted = coupe;
      audio.volume = curseur.value / 100;
    } else if (pret) {
      player.setVolume(Number(curseur.value));
      if (coupe || sonBloque) player.mute(); else player.unMute();
    }
    bouton.classList.toggle("coupe", coupe);
    bouton.setAttribute("aria-label", coupe ? "Remettre la musique" : "Couper la musique");
  }

  // ===== mode mp3 =====
  function lancerAudio() {
    if (demarre) return;
    demarre = true;
    audio.play().catch(function () { demarre = false; });
  }

  if (audio) {
    appliquer();
    audio.addEventListener("error", function () {
      absente("Fichier introuvable : " + audio.getAttribute("src"));
    });
  }

  // ===== mode YouTube =====
  if (iframe) {
    info = document.createElement("p");
    info.className = "info-son";
    var zone = iframe.parentElement.classList.contains("video-musique") ? iframe.parentElement : iframe;
    zone.insertAdjacentElement("afterend", info);

    // YouTube refuse de marcher quand on ouvre le fichier en double-cliquant dessus
    if (location.protocol === "file:") {
      message("La vidéo ne marche pas quand on ouvre la page directement depuis l'ordinateur : il faut que le site soit en ligne (ou ouvert avec Live Server).");
      absente("YouTube ne marche pas en ouvrant le fichier directement");
    } else {
      message("(clique n'importe où sur la page pour avoir le son)");
    }

    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player(iframe, {
        events: {
          onReady: function () {
            pret = true;
            if (location.protocol !== "file:") {
              // on tente le son tout de suite (ça marche si le navigateur l'autorise)
              sonBloque = false;
              appliquer();
              player.playVideo();
              setTimeout(function () {
                var etat = player.getPlayerState();
                var joue = etat === YT.PlayerState.PLAYING || etat === YT.PlayerState.BUFFERING;
                if (!coupe && (!joue || player.isMuted())) {
                  // refusé : on repart en muet, le son viendra au premier clic
                  sonBloque = true;
                  appliquer();
                  player.playVideo();
                } else {
                  message("");
                }
              }, 1200);
            } else {
              appliquer();
            }
          },
          onError: function () {
            absente("La vidéo YouTube ne peut pas être lue ici");
          }
        }
      });
    };

    var script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = function () { absente("YouTube n'a pas pu être chargé"); };
    document.head.appendChild(script);
  }

  // ===== premier clic / première touche : on lance le son =====
  function premierGeste() {
    if (audio) {
      lancerAudio();
    } else if (pret && sonBloque && !coupe) {
      sonBloque = false;
      appliquer();
      player.playVideo();
      message("");
    }
  }

  document.addEventListener("click", premierGeste);
  document.addEventListener("keydown", premierGeste);
  document.addEventListener("touchstart", premierGeste, { passive: true });

  // le carré : vert = musique, rouge = coupée
  bouton.addEventListener("click", function (e) {
    e.stopPropagation();
    if (audio && !demarre) {
      coupe = false;
      lancerAudio();
    } else if (iframe && sonBloque) {
      sonBloque = false;
      coupe = false;
      message("");
      if (pret) player.playVideo();
    } else {
      coupe = !coupe;
    }
    appliquer();
  });

  // la barre de volume
  curseur.addEventListener("input", function () {
    if (coupe && curseur.value > 0) coupe = false;
    appliquer();
    try { localStorage.setItem("fleurenoul-volume", curseur.value); } catch (e) {}
  });

  curseur.addEventListener("click", function (e) {
    e.stopPropagation();
    premierGeste();
  });
})();
