// Chemin du fichier chiffré encodé en base64 (ex : généré par GitHub Action)
const FILE_URL = "./parcours.enc";
const KEY_HEX = "<CLÉ_HEX_A_REMPLACER>"; // remplacée dynamiquement via GitHub Secret

// Déchiffrement AES-256-GCM
async function decryptYAML(base64Data, keyHex) {
  const binary = atob(base64Data);
  const raw = new Uint8Array([...binary].map(c => c.charCodeAt(0)));

  const iv = raw.slice(0, 12);
  const tag = raw.slice(-16);
  const encrypted = raw.slice(12, -16);

  const key = Uint8Array.from(keyHex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
  const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-GCM", false, ["decrypt"]);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    new Uint8Array([...encrypted, ...tag])
  );

  return new TextDecoder().decode(decrypted);
}

// Affichage dynamique du parcours
function renderTimeline(data) {
  const container = document.getElementById("timeline");

  data.experiences.forEach((exp, index) => {
    const block = document.createElement("div");
    block.className = "timeline-block";
    block.style.marginBottom = "40px";

    block.innerHTML = `
      <h3>${exp.titre} <span style="opacity:0.7">@ ${exp.entreprise}</span></h3>
      <small>${exp.date}</small>
      <p>${exp.description}</p>
    `;

    container.appendChild(block);
  });
}

// Chargement principal
fetch(FILE_URL)
  .then(res => res.text())
  .then(data => decryptYAML(data, KEY_HEX))
  .then(text => jsyaml.load(text))
  .then(data => renderTimeline(data))
  .catch(err => {
    console.error("Erreur de chargement ou de déchiffrement :", err);
    const container = document.getElementById("timeline");
    container.innerHTML = `<p style="color:red">Impossible de charger les données. Contactez l'administrateur.</p>`;
  });
