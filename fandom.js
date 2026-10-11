/* ===== Code commun à toutes les pages fandom =====
   Il lit l'objet FANDOM défini dans chaque page et remplit la page.
   Normalement tu n'as pas besoin de toucher à ce fichier. */

(function () {
  const F = window.FANDOM;
  const $ = (id) => document.getElementById(id);

  document.title = F.titre + " – Dossier de Fleurenoul";
  $("preuve-num").textContent = F.preuve || "";
  $("titre").textContent = F.titre;
  $("intro").textContent = F.intro || "";
  $("note").textContent = F.note || "";
  if (!F.note) $("note").remove();
  $("dialogue").textContent = F.dialogue || "";
  if (!F.dialogue) $("dialogue").remove();

  function aCompleter(texte) {
    const div = document.createElement("div");
    div.className = "a-completer";
    div.innerHTML = texte;
    return div;
  }

  /* --- Persos / membres --- */
  const persos = F.persos || [];
  $("titre-persos").textContent = F.titrePersos || "Persos préférés";
  if (!persos.length) {
    $("bloc-persos").remove();
  } else {
    persos.forEach((p) => {
      const carte = document.createElement("article");
      carte.className = "perso";

      const photo = document.createElement("div");
      photo.className = "perso-photo";
      const initiale = p.nom.charAt(0).toUpperCase();
      if (p.image) {
        const img = document.createElement("img");
        img.src = p.image;
        img.alt = p.nom;
        img.onerror = () => { photo.textContent = initiale; };
        photo.appendChild(img);
      } else {
        photo.textContent = initiale;
      }

      const infos = document.createElement("div");
      infos.className = "perso-infos";
      infos.innerHTML = '<div class="perso-nom"></div><div class="perso-role"></div><p class="perso-phrase"></p>';
      infos.querySelector(".perso-nom").textContent = p.nom;
      infos.querySelector(".perso-role").textContent = p.role || "";
      infos.querySelector(".perso-phrase").textContent = p.phrase || "";
      if (!p.role) infos.querySelector(".perso-role").remove();
      if (!p.phrase) infos.querySelector(".perso-phrase").remove();

      carte.appendChild(photo);
      carte.appendChild(infos);
      $("persos").appendChild(carte);
    });
  }

  /* --- Vidéos YouTube : on colle juste le lien normal --- */
  function idYoutube(lien) {
    const m = String(lien).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  const videos = (F.videos || []).map(idYoutube).filter(Boolean);
  if (videos.length) {
    videos.forEach((id) => {
      const div = document.createElement("div");
      div.className = "video";
      const iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id;
      iframe.title = "Vidéo";
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      div.appendChild(iframe);
      $("videos").appendChild(div);
    });
  } else if (F.modeEdition) {
    $("videos").appendChild(aCompleter(
      "Colle des liens YouTube dans <code>videos: [ ]</code> en haut de la page."));
  } else {
    $("bloc-videos").remove();
  }

  /* --- Musique Spotify : on colle juste le lien normal --- */
  function lienSpotify(lien) {
    const m = String(lien).match(/open\.spotify\.com\/(?:intl-\w+\/)?(playlist|album|track|artist)\/(\w+)/);
    return m ? "https://open.spotify.com/embed/" + m[1] + "/" + m[2] : null;
  }

  const spotify = F.spotify ? lienSpotify(F.spotify) : null;
  if (spotify) {
    const iframe = document.createElement("iframe");
    iframe.src = spotify;
    iframe.title = "Musique";
    iframe.loading = "lazy";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    $("musique").appendChild(iframe);
  } else if (F.modeEdition) {
    $("musique").appendChild(aCompleter(
      "Colle un lien Spotify (playlist, album ou titre) dans <code>spotify: \"\"</code> en haut de la page."));
  } else {
    $("bloc-musique").remove();
  }
})();
