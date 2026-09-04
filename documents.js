/* ══════════════════════════════════════════════════════════════════════════
   Hopeful Days Mental Health Services — fabrication du consentement
   ──────────────────────────────────────────────────────────────────────────
   Le document est desormais fabrique ICI, dans le navigateur, deja signe, au
   moment ou le patient valide. Il l'etait auparavant par n8n, qui copiait un
   modele Google Docs, y remplacait des marqueurs, y inserait la photo et la
   signature en plusieurs appels, exportait en PDF, puis effaçait ses fichiers
   intermediaires : soixante-cinq noeuds pour une page.

   Trois choses changent pour le patient.

   1. Il repart avec son exemplaire **meme si l'envoi echoue**, parce que le
      document existe sur son telephone avant de partir.
   2. Il ne recoit plus de lien Drive. Un lien de document medical qui circule
      est un document medical qui fuit.
   3. L'attente tombe de plusieurs dizaines de secondes a moins d'une.

   Le texte est repris **mot pour mot** du modele Google Docs du cabinet
   (`1xcN2rskRumCZmjCCANB_H71fiP_jesYjbmtH8lbgmUw`). Rien n'a ete reformule :
   ce que le patient lit a l'ecran est ce qu'il signe.
   ══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* Les couleurs sont celles du formulaire du cabinet, relevees dans sa
     feuille de style : le document doit se reconnaitre au premier coup d'oeil
     comme venant de la meme maison.

     Une seule liberte prise : l'accent est un or assombri (#B8801E) et non le
     #E8A838 de l'ecran. L'accent porte du texte de 7 a 9 points sur fond
     blanc ; l'or clair y passe mal, et disparait a la photocopie. Un
     consentement signe se photocopie. */
  var BLEU = [13, 75, 110];      /* #0D4B6E */
  var BLEU_SOMBRE = [9, 54, 79]; /* #09364F */
  var OR = [184, 128, 30];       /* #B8801E, l'or du cabinet assombri */
  var GRIS = [90, 112, 128];     /* #5A7080 */
  var ENCRE = [26, 43, 60];      /* #1A2B3C */
  var LIGNE = [196, 217, 230];   /* #C4D9E6 */
  var DOUX = [238, 244, 248];    /* #EEF4F8 */

  var CABINET = {
    nom: 'HOPEFUL DAYS MENTAL HEALTH SERVICES LLC',
    adresse: '4690 Millennium Dr. Suite 300, Belcamp MD 21017',
    contact: ''
  };

  var L = 54, LARG = 612, HAUT = 792;
  var UTILE = LARG - L * 2;

  var THEME_HOPEFUL = {
    style: 'hopeful',
    primaire: BLEU, second: BLEU_SOMBRE, accent: OR,
    gris: GRIS, encre: ENCRE, ligne: LIGNE, doux: DOUX,
    pied: CABINET.nom
  };

  /* Le logo est deja charge en base64 dans la page ; on le relit plutot que
     de le retelecharger au moment ou le patient attend. */
  function logoHopeful() {
    if (typeof document === 'undefined') return null;
    var img = document.getElementById('bannerLogo');
    return (img && img.src && img.src.indexOf('data:image') === 0) ? img.src : null;
  }

  function nonVide(v) {
    if (v === null || v === undefined) return '';
    v = String(v).trim();
    return (v === 'N/A' || v === 'undefined' || v === 'null') ? '' : v;
  }

  function estOui(v) {
    return String(v || '').trim().toLowerCase() === 'yes';
  }

  /* Une photo de carte d'assurance pese souvent plusieurs megaoctets. Telle
     quelle elle alourdirait le PDF autant que l'envoi. On la redimensionne
     avant de l'incruster : le texte de la carte reste lisible a 1400 px. */
  function preparerImage(dataUri, maxCote) {
    return new Promise(function (resolve) {
      if (!dataUri || dataUri.indexOf('data:image') !== 0) { resolve(null); return; }
      var img = new Image();
      img.onload = function () {
        try {
          var ech = Math.min(1, maxCote / Math.max(img.width, img.height));
          var w = Math.max(1, Math.round(img.width * ech));
          var h = Math.max(1, Math.round(img.height * ech));
          var c = document.createElement('canvas');
          c.width = w; c.height = h;
          var g = c.getContext('2d');
          g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
          g.drawImage(img, 0, 0, w, h);
          resolve({ uri: c.toDataURL('image/jpeg', 0.82), w: w, h: h, format: 'JPEG' });
        } catch (e) { resolve(null); }
      };
      img.onerror = function () { resolve(null); };
      img.src = dataUri;
    });
  }

  /* ────────────────────────────────────────────────────────────────────────
     Le gabarit : bandeau, pied de page, et les briques de mise en page.
     Les dix documents ne font qu'empiler ces briques.
     ──────────────────────────────────────────────────────────────────────── */
  function nouvellePage(titre, sousTitre, theme) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: 'pt', format: 'letter', compress: true });
    var etat = { y: 0 };
    var logo = logoHopeful();

    /* Les briques ci-dessous ne connaissent que ces sept noms. En les
       redeclarant ici on rebadge tout le gabarit d'un seul coup, sans toucher
       a une seule ligne de contenu. */
    var T = theme || THEME_HOPEFUL;
    var FOREST = T.primaire, SAGE = T.second, GOLD = T.accent;
    var GREY = T.gris, INK = T.encre, LIGNE = T.ligne, DOUX = T.doux;

    function bandeau() {
      doc.setFillColor(FOREST[0], FOREST[1], FOREST[2]);
      doc.rect(0, 0, LARG, 6, 'F');
      doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.rect(0, 6, LARG, 1.6, 'F');
      var y = 30, x = L;
      if (logo) {
        try { doc.addImage(logo, 'PNG', L, y, 62, 62); x = L + 78; } catch (e) { x = L; }
      }
      doc.setFont('times', 'bold'); doc.setFontSize(15);
      doc.setTextColor(FOREST[0], FOREST[1], FOREST[2]);
      var lgT = doc.splitTextToSize(titre, LARG - L - x);
      doc.text(lgT[0], x, y + 18);
      doc.setFont('times', 'normal'); doc.setFontSize(10);
      doc.setTextColor(GREY[0], GREY[1], GREY[2]);
      doc.text(doc.splitTextToSize(sousTitre || '', LARG - L - x)[0] || '', x, y + 33);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.2);
      doc.setTextColor(FOREST[0], FOREST[1], FOREST[2]);
      doc.text(CABINET.nom, x, y + 50);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6);
      doc.setTextColor(GREY[0], GREY[1], GREY[2]);
      doc.text(CABINET.adresse, x, y + 60);
      doc.text(CABINET.contact, x, y + 70);
      etat.y = 112;
      doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]); doc.setLineWidth(0.8);
      doc.line(L, etat.y, LARG - L, etat.y);
      etat.y += 22;
    }

    /* Ouvre le document suivant du dossier relie : nouvelle page, nouveau
       bandeau, nouveau titre. C'est ce qui permet d'enchainer les dix
       documents dans un seul fichier sans reecrire leur contenu. */
    function entete(t, st) {
      doc.addPage();
      titre = t; sousTitre = st || '';
      etat.y = 0;
      bandeau();
    }

    function pied() {
      var n = doc.internal.getNumberOfPages();
      for (var i = 1; i <= n; i++) {
        doc.setPage(i);
        doc.setDrawColor(LIGNE[0], LIGNE[1], LIGNE[2]); doc.setLineWidth(0.6);
        doc.line(L, HAUT - 44, LARG - L, HAUT - 44);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2);
        doc.setTextColor(155, 165, 158);
        doc.text('Confidential — protected health information.', L, HAUT - 31);
        doc.text(T.pied + '  ·  Page ' + i + ' of ' + n, LARG - L, HAUT - 31, { align: 'right' });
      }
    }
    function place(h) {
      if (etat.y + h > HAUT - 62) { doc.addPage(); etat.y = 52; return true; }
      return false;
    }
    function saut() { doc.addPage(); etat.y = 52; }

    /* Bandeau de grande section (A, B, C, D) : il doit se voir au feuilletage. */
    function section(lettre, titre, chapeau) {
      place(80);
      var h = 34;
      doc.setFillColor(FOREST[0], FOREST[1], FOREST[2]);
      doc.rect(L, etat.y - 12, UTILE, h, 'F');
      doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.rect(L, etat.y - 12, 4, h, 'F');
      doc.setFont('helvetica', 'bold');
      if (lettre) {
        doc.setFontSize(8);
        doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.text('SECTION ' + lettre, L + 16, etat.y + 1);
      }
      doc.setFontSize(11); doc.setTextColor(255, 255, 255);
      doc.text(titre.toUpperCase(), L + 16, lettre ? etat.y + 15 : etat.y + 9);
      etat.y += h + 6;
      if (chapeau) {
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8.2);
        doc.setTextColor(GREY[0], GREY[1], GREY[2]);
        var lg = doc.splitTextToSize(chapeau, UTILE);
        for (var i = 0; i < lg.length; i++) { doc.text(lg[i], L, etat.y); etat.y += 11; }
        etat.y += 6;
      }
    }

    /* `hSuite` : la hauteur de ce qui suit immediatement. Sans elle, un titre
       pouvait tomber en bas de page et ses images partir a la suivante, ce qui
       donne un intitule seul au-dessus du vide. Un document medical se relit
       en diagonale : un titre sans contenu ressemble a une piece manquante. */
    function titreSection(t, num, hSuite) {
      place(44 + (hSuite || 0));
      etat.y += 6;
      if (num) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.4);
        doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
        doc.text(String(num), L, etat.y);
      }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.4);
      doc.setTextColor(FOREST[0], FOREST[1], FOREST[2]);
      doc.text(t.toUpperCase(), num ? L + 26 : L, etat.y);
      etat.y += 6;
      doc.setDrawColor(LIGNE[0], LIGNE[1], LIGNE[2]); doc.setLineWidth(0.6);
      doc.line(L, etat.y, LARG - L, etat.y);
      etat.y += 14;
    }

    function paragraphe(txt, opts) {
      opts = opts || {};
      doc.setFont('helvetica', opts.gras ? 'bold' : (opts.italique ? 'italic' : 'normal'));
      doc.setFontSize(opts.taille || 9.2);
      var c = opts.couleur || INK;
      doc.setTextColor(c[0], c[1], c[2]);
      var lignes = doc.splitTextToSize(txt, opts.largeur || UTILE);
      var il = opts.interligne || 12.5;
      for (var i = 0; i < lignes.length; i++) {
        place(il);
        doc.text(lignes[i], opts.x || L, etat.y);
        etat.y += il;
      }
      etat.y += (opts.apres === undefined ? 8 : opts.apres);
    }

    function puces(items) {
      for (var i = 0; i < items.length; i++) {
        var lg = doc.splitTextToSize(items[i], UTILE - 16);
        place(lg.length * 11.6 + 2);
        doc.setFillColor(SAGE[0], SAGE[1], SAGE[2]);
        doc.circle(L + 3, etat.y - 3, 1.8, 'F');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
        doc.setTextColor(INK[0], INK[1], INK[2]);
        for (var j = 0; j < lg.length; j++) {
          if (j > 0) place(11.6);
          doc.text(lg[j], L + 16, etat.y);
          etat.y += 11.6;
        }
        etat.y += 2;
      }
      etat.y += 4;
    }

    function liste(items) {
      var indent = 18;
      for (var i = 0; i < items.length; i++) {
        var lg = doc.splitTextToSize(items[i], UTILE - indent);
        place(lg.length * 12.5 + 4);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9.2);
        doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
        doc.text(String(i + 1) + '.', L, etat.y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(INK[0], INK[1], INK[2]);
        for (var j = 0; j < lg.length; j++) {
          if (j > 0) place(12.5);
          doc.text(lg[j], L + indent, etat.y);
          etat.y += 12.5;
        }
        etat.y += 4;
      }
      etat.y += 4;
    }

    /* Champs en deux colonnes : libelle discret, valeur soulignee.
       Une valeur vide laisse un trait a remplir a la main. */
    function champs(paires, colonnes) {
      var nb = colonnes || 2;
      var colonne = UTILE / nb;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.2);
      for (var i = 0; i < paires.length; i += nb) {
        /* Un libelle long tient sur deux lignes plutot que d'etre tronque :
           « IF AUTHORIZED REPRESENTATIVE, RELATIONSHIP TO » sans son
           dernier mot ne veut plus rien dire sur un document juridique. */
        var lignesEtiq = 1;
        for (var e = 0; e < nb; e++) {
          var pe = paires[i + e];
          if (!pe || !pe[0]) continue;
          var n = doc.splitTextToSize(pe[0].toUpperCase(), colonne - 16).length;
          if (n > lignesEtiq) lignesEtiq = Math.min(n, 2);
        }
        var hEtiq = lignesEtiq * 9;

        /* Et la valeur pareillement. « 2417 Greenmount Avenue, Apt 3B,
           Baltimore, MD 21218 » coupe apres « MD » n'est plus une adresse :
           on ne peut ni y envoyer un courrier, ni verifier une couverture.
           Le libelle avait ete corrige, la valeur souffrait du meme mal. */
        var lignesVal = 1;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9.6);
        for (var v = 0; v < nb; v++) {
          var pv = paires[i + v];
          if (!pv || !pv[0]) continue;
          var nv = doc.splitTextToSize(nonVide(pv[1]), colonne - 16).length;
          if (nv > lignesVal) lignesVal = Math.min(nv, 2);
        }
        var hVal = (lignesVal - 1) * 11;

        place(hEtiq + hVal + 27);
        for (var k = 0; k < nb; k++) {
          var p = paires[i + k];
          if (!p || !p[0]) continue;
          var x = L + k * colonne, larg = colonne - 16;
          doc.setFont('helvetica', 'bold'); doc.setFontSize(7.2);
          doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
          var lg = doc.splitTextToSize(p[0].toUpperCase(), larg);
          for (var j = 0; j < lignesEtiq && j < lg.length; j++) {
            doc.text(lg[j], x, etat.y + j * 9);
          }
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9.6);
          doc.setTextColor(INK[0], INK[1], INK[2]);
          var lv = doc.splitTextToSize(nonVide(p[1]), larg);
          for (var w = 0; w < lignesVal && w < lv.length; w++) {
            doc.text(lv[w], x, etat.y + hEtiq + 5 + w * 11);
          }
          doc.setDrawColor(LIGNE[0], LIGNE[1], LIGNE[2]); doc.setLineWidth(0.7);
          doc.line(x, etat.y + hEtiq + hVal + 10, x + larg, etat.y + hEtiq + hVal + 10);
        }
        etat.y += hEtiq + hVal + 27;
      }
      etat.y += 2;
    }

    /* Question ouverte : l'intitule au-dessus, la reponse dessous, sur toute
       la largeur. Une reponse vide affiche "Not provided" plutot que rien :
       un blanc laisse croire a un oubli de generation. */
    function question(q, r, opts) {
      opts = opts || {};
      var val = nonVide(r);
      var lgQ = doc.splitTextToSize(q, UTILE);
      var lgR = doc.splitTextToSize(val || 'Not provided', UTILE - 12);
      place(lgQ.length * 11 + lgR.length * 12 + 14);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.4);
      doc.setTextColor(FOREST[0], FOREST[1], FOREST[2]);
      for (var i = 0; i < lgQ.length; i++) { doc.text(lgQ[i], L, etat.y); etat.y += 11; }
      etat.y += 3;
      doc.setFont('helvetica', val ? 'normal' : 'italic'); doc.setFontSize(9.4);
      if (val) doc.setTextColor(INK[0], INK[1], INK[2]);
      else doc.setTextColor(GREY[0], GREY[1], GREY[2]);
      for (var j = 0; j < lgR.length; j++) {
        place(12);
        doc.text(lgR[j], L + 12, etat.y);
        etat.y += 12;
      }
      etat.y += (opts.apres === undefined ? 8 : opts.apres);
    }

    /* Question fermee : intitule a gauche, reponse a droite, sur une ligne. */
    function questionCourte(q, r) {
      var val = nonVide(r) || '—';
      var largeQ = UTILE - 110;
      var lg = doc.splitTextToSize(q, largeQ);
      place(lg.length * 11.5 + 8);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.8);
      doc.setTextColor(INK[0], INK[1], INK[2]);
      var yDebut = etat.y;
      for (var i = 0; i < lg.length; i++) {
        if (i > 0) place(11.5);
        doc.text(lg[i], L, etat.y);
        etat.y += 11.5;
      }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.8);
      doc.setTextColor(estOui(val) ? GOLD[0] : SAGE[0], estOui(val) ? GOLD[1] : SAGE[1],
                       estOui(val) ? GOLD[2] : SAGE[2]);
      doc.text(val, LARG - L, yDebut, { align: 'right' });
      doc.setDrawColor(LIGNE[0], LIGNE[1], LIGNE[2]); doc.setLineWidth(0.5);
      doc.line(L, etat.y + 1, LARG - L, etat.y + 1);
      etat.y += 9;
    }

    function caseACocher(coche, texte) {
      var lg = doc.splitTextToSize(texte, UTILE - 22);
      place(lg.length * 12 + 6);
      var yb = etat.y - 8;
      doc.setDrawColor(SAGE[0], SAGE[1], SAGE[2]); doc.setLineWidth(0.9);
      doc.rect(L, yb, 10, 10);
      if (coche) {
        doc.setFillColor(SAGE[0], SAGE[1], SAGE[2]);
        doc.rect(L + 2, yb + 2, 6, 6, 'F');
      }
      doc.setFont('helvetica', coche ? 'bold' : 'normal'); doc.setFontSize(9);
      var c = coche ? INK : GREY;
      doc.setTextColor(c[0], c[1], c[2]);
      for (var i = 0; i < lg.length; i++) {
        if (i > 0) place(12);
        doc.text(lg[i], L + 20, etat.y);
        etat.y += 12;
      }
      etat.y += 6;
    }

    /* Grille de cases a cocher sur trois colonnes, comme la liste de symptomes
       du formulaire papier : on garde les non coches, leur absence est une
       information clinique. */
    function grilleCases(items, colonnes) {
      var nb = colonnes || 3;
      var colonne = UTILE / nb;
      for (var i = 0; i < items.length; i += nb) {
        place(20);
        for (var k = 0; k < nb; k++) {
          var it = items[i + k];
          if (!it) continue;
          var x = L + k * colonne;
          doc.setDrawColor(SAGE[0], SAGE[1], SAGE[2]); doc.setLineWidth(0.8);
          doc.rect(x, etat.y - 7.5, 8.5, 8.5);
          if (it.coche) {
            doc.setFillColor(SAGE[0], SAGE[1], SAGE[2]);
            doc.rect(x + 1.8, etat.y - 5.7, 4.9, 4.9, 'F');
          }
          doc.setFont('helvetica', it.coche ? 'bold' : 'normal'); doc.setFontSize(7.8);
          var c = it.coche ? INK : GREY;
          doc.setTextColor(c[0], c[1], c[2]);
          doc.text(doc.splitTextToSize(it.texte, colonne - 20)[0], x + 13, etat.y);
        }
        etat.y += 16;
      }
      etat.y += 6;
    }

    /* Tableau simple : en-tetes sur fond vert, lignes alternees. */
    function tableau(entetes, lignes, parts) {
      var total = parts.reduce(function (a, b) { return a + b; }, 0);
      var largeurs = parts.map(function (p) { return UTILE * p / total; });
      function ligne(cellules, opt) {
        var hauteurs = cellules.map(function (c, i) {
          return doc.splitTextToSize(String(c === undefined ? '' : c), largeurs[i] - 10).length;
        });
        var nbl = Math.max.apply(null, hauteurs);
        var h = nbl * 10.5 + 8;
        place(h);
        if (opt.entete) {
          doc.setFillColor(FOREST[0], FOREST[1], FOREST[2]);
          doc.rect(L, etat.y - 9, UTILE, h, 'F');
        } else if (opt.paire) {
          doc.setFillColor(DOUX[0], DOUX[1], DOUX[2]);
          doc.rect(L, etat.y - 9, UTILE, h, 'F');
        }
        var x = L;
        for (var i = 0; i < cellules.length; i++) {
          doc.setFont('helvetica', opt.entete ? 'bold' : 'normal');
          doc.setFontSize(opt.entete ? 7.6 : 8.4);
          if (opt.entete) doc.setTextColor(255, 255, 255);
          else doc.setTextColor(INK[0], INK[1], INK[2]);
          var lg = doc.splitTextToSize(String(cellules[i] === undefined ? '' : cellules[i]),
                                       largeurs[i] - 10);
          for (var j = 0; j < lg.length; j++) doc.text(lg[j], x + 5, etat.y + j * 10.5);
          x += largeurs[i];
        }
        doc.setDrawColor(LIGNE[0], LIGNE[1], LIGNE[2]); doc.setLineWidth(0.5);
        doc.line(L, etat.y + h - 9, LARG - L, etat.y + h - 9);
        etat.y += h;
      }
      ligne(entetes, { entete: true });
      for (var r = 0; r < lignes.length; r++) ligne(lignes[r], { paire: r % 2 === 1 });
      etat.y += 8;
    }

    /* Une piece jointe (carte d'assurance, piece d'identite) posee dans le
       document : c'est la seule copie conservee, elle doit rester lisible. */
    function piece(img, legende) {
      var largeMax = UTILE * 0.62, hautMax = 210;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.6);
      doc.setTextColor(SAGE[0], SAGE[1], SAGE[2]);
      if (!img) {
        place(26);
        doc.text(legende.toUpperCase(), L, etat.y);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8.4);
        doc.setTextColor(GREY[0], GREY[1], GREY[2]);
        doc.text('Not provided', L + 200, etat.y);
        etat.y += 18;
        return;
      }
      var ech = Math.min(largeMax / img.w, hautMax / img.h, 1);
      var w = img.w * ech, h = img.h * ech;
      place(h + 30);
      doc.text(legende.toUpperCase(), L, etat.y);
      etat.y += 8;
      try { doc.addImage(img.uri, img.format, L, etat.y, w, h); } catch (e) { }
      doc.setDrawColor(LIGNE[0], LIGNE[1], LIGNE[2]); doc.setLineWidth(0.8);
      doc.rect(L, etat.y, w, h);
      etat.y += h + 16;
    }

    /* Bloc de signature : image si elle existe, sinon une ligne vierge a
       signer a la main. C'est ce qui laisse sa place a Caroline Bonu tant
       qu'elle n'a pas enregistre la sienne. */
    function signature(opts) {
      /* 96 points ne suffisent pas : avec le nom imprime et la qualite du
         signataire, le bloc en fait 110 et venait frotter le pied de page.
         On reserve la hauteur reelle plutot que celle du cas le plus court. */
      place(118);
      var larg = UTILE * 0.52;
      var yImg = etat.y;
      if (opts.image) {
        try { doc.addImage(opts.image, 'PNG', L, yImg, 150, 46); } catch (e) { }
      }
      var yl = yImg + 50;
      doc.setDrawColor(INK[0], INK[1], INK[2]); doc.setLineWidth(0.8);
      doc.line(L, yl, L + larg, yl);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4);
      doc.setTextColor(GREY[0], GREY[1], GREY[2]);
      doc.text(opts.libelle, L, yl + 11);

      var xd = L + larg + 30, largD = LARG - L - xd;
      doc.setDrawColor(INK[0], INK[1], INK[2]);
      doc.line(xd, yl, xd + largD, yl);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.6);
      doc.setTextColor(INK[0], INK[1], INK[2]);
      if (nonVide(opts.date)) doc.text(opts.date, xd, yl - 6);
      doc.setFontSize(7.4); doc.setTextColor(GREY[0], GREY[1], GREY[2]);
      doc.text(opts.libelleDate || 'DATE SIGNED (MM/DD/YYYY)', xd, yl + 11);

      etat.y = yl + 26;
      if (nonVide(opts.nomImprime)) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9.2);
        doc.setTextColor(INK[0], INK[1], INK[2]);
        doc.text(opts.nomImprime, L, etat.y); etat.y += 12;
      }
      if (nonVide(opts.sousTitre)) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.4);
        doc.setTextColor(GREY[0], GREY[1], GREY[2]);
        doc.text(opts.sousTitre, L, etat.y); etat.y += 12;
      }
      etat.y += 10;
    }

    function encadre(texte) {
      var lg = doc.splitTextToSize(texte, UTILE - 28);
      var h = lg.length * 11.5 + 20;
      place(h + 8);
      doc.setFillColor(DOUX[0], DOUX[1], DOUX[2]);
      doc.roundedRect(L, etat.y - 10, UTILE, h, 6, 6, 'F');
      doc.setDrawColor(SAGE[0], SAGE[1], SAGE[2]); doc.setLineWidth(2);
      doc.line(L, etat.y - 10, L, etat.y - 10 + h);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.4);
      doc.setTextColor(INK[0], INK[1], INK[2]);
      var yy = etat.y + 4;
      for (var i = 0; i < lg.length; i++) { doc.text(lg[i], L + 14, yy); yy += 11.5; }
      etat.y += h + 4;
    }

    bandeau();
    return {
      doc: doc, etat: etat, place: place, saut: saut, section: section,
      titreSection: titreSection, paragraphe: paragraphe, puces: puces, liste: liste,
      champs: champs, question: question, questionCourte: questionCourte,
      caseACocher: caseACocher, grilleCases: grilleCases, tableau: tableau,
      piece: piece, signature: signature, encadre: encadre,
      entete: entete, pied: pied
    };
  }

  /* ────────────────────────────────────────────────────────────────────────
     Le texte du consentement, mot pour mot.
     ────────────────────────────────────────────────────────────────────────
     Il est la source unique : le PDF le lit ici, et le banc d'essai verifie
     que la page a l'ecran dit exactement la meme chose. Un consentement dont
     le texte affiche et le texte signe divergent ne vaut rien.
     ──────────────────────────────────────────────────────────────────────── */

  var SECTIONS = [
    {
      titre: 'Purpose of Services',
      corps: ['I understand that I am seeking psychiatric–mental health services, which may '
        + 'include evaluation, diagnosis, treatment planning, psychotherapy, medication '
        + 'management, and/or other mental health interventions provided by a qualified '
        + 'mental health professional.']
    },
    {
      titre: 'Nature of Treatment',
      corps: ['I understand that psychiatric–mental health treatment may involve:'],
      puces: [
        'Clinical interviews and mental health assessments',
        'Psychotherapy or counseling',
        'Prescription and management of psychiatric medications (if applicable)',
        'Coordination of care with other healthcare providers',
        'Review of my medical, psychological, and social history'
      ],
      apres: ['The specific treatment approach will be discussed with me and may change based '
        + 'on my individual needs.']
    },
    {
      titre: 'Benefits and Risks',
      corps: ['I understand that potential benefits of treatment may include improvement in '
        + 'symptoms, functioning, and overall well-being.',
        'I also understand that there may be risks, including but not limited to:'],
      puces: [
        'Emotional discomfort when discussing sensitive topics',
        'Possible side effects of medications',
        'No guarantee of improvement'
      ],
      apres: ['These risks and benefits have been explained to me, and I have had the '
        + 'opportunity to ask questions.']
    },
    {
      titre: 'Alternatives to Treatment',
      corps: ['I understand that alternatives may include declining treatment, seeking '
        + 'services from another provider, or using non-psychiatric interventions. I '
        + 'understand that I may discuss these alternatives with my provider.']
    },
    {
      titre: 'Medications (if applicable)',
      corps: ['If medications are prescribed, I understand:'],
      puces: [
        'The purpose of the medication',
        'Possible benefits and side effects',
        'Risks of not taking the medication as prescribed',
        'My responsibility to report side effects or concerns'
      ]
    },
    {
      titre: 'Confidentiality',
      corps: ['I understand that information shared during treatment is confidential and '
        + 'protected by law. Exceptions to confidentiality include, but are not limited to:'],
      puces: [
        'Risk of harm to myself or others',
        'Suspected abuse or neglect of a child, elderly person, or dependent adult',
        'Court orders or other legal requirements'
      ],
      apres: ['These limits to confidentiality have been explained to me.']
    },
    {
      titre: 'Client Rights and Responsibilities',
      corps: ['I understand that I have the right to:'],
      puces: [
        'Ask questions about my treatment',
        'Participate actively in treatment decisions',
        'Withdraw consent or discontinue treatment at any time'
      ],
      apres: ['I understand that I am responsible for providing accurate information and '
        + 'participating honestly in my care.']
    },
    {
      titre: 'Consent',
      corps: ['I acknowledge that:'],
      puces: [
        'I have read and understood this consent form',
        'My questions have been answered to my satisfaction',
        'I voluntarily consent to receive psychiatric–mental health services'
      ]
    }
  ];

  window.TEXTE_CONSENTEMENT_HOPEFUL = SECTIONS;

  /* ════════════════════════════════════════════════════════════════════════
     Le document
     ════════════════════════════════════════════════════════════════════════ */

  function nomComplet(d) {
    var c = d.client || {};
    return nonVide(c.fullName)
      || (nonVide(c.firstName) + ' ' + nonVide(c.lastName)).trim();
  }

  /* Le modele affiche la date de naissance telle qu'elle est saisie, en
     AAAA-MM-JJ. Sur un document americain c'est deroutant : on la rend en
     MM/JJ/AAAA, sans rien inventer quand le format n'est pas reconnu. */
  function dateUS(v) {
    var s = nonVide(v);
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    return m ? (m[2] + '/' + m[3] + '/' + m[1]) : s;
  }

  function documentConsentement(d, photo) {
    var c = d.client || {};
    var g = d.guardian || null;
    var dateJour = nonVide(d.dateSignature) || new Date().toLocaleDateString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric', timeZone: 'America/New_York'
    });

    var p = nouvellePage('INFORMED CONSENT',
      'For Psychiatric and Mental Health Services', THEME_HOPEFUL);

    p.champs([
      ['Client Name', nomComplet(d)],
      ['Date of Birth', dateUS(c.dateOfBirth)],
      ['Medical Record Number (if applicable)', c.medicalRecordNumber],
      ['Phone Number', c.phoneNumber],
      ['Date', dateJour]
    ]);

    p.titreSection('Client Photo', null, 240);
    p.piece(photo, 'Client photograph');

    for (var i = 0; i < SECTIONS.length; i++) {
      var s = SECTIONS[i];
      p.titreSection(s.titre, String(i + 1));
      for (var j = 0; j < (s.corps || []).length; j++) p.paragraphe(s.corps[j]);
      if (s.puces && s.puces.length) p.puces(s.puces);
      for (var k = 0; k < (s.apres || []).length; k++) p.paragraphe(s.apres[k]);
    }

    p.titreSection('Client Signature', null, 130);
    p.signature({
      image: c.signature,
      date: dateJour,
      libelle: 'CLIENT SIGNATURE',
      nomImprime: nonVide(c.printedName) || nomComplet(d),
      sousTitre: 'Client',
      libelleDate: 'DATE SIGNED (MM/DD/YYYY)'
    });

    /* Le bloc tuteur n'existe que s'il y a un tuteur. Le modele Google Docs
       le laissait apparaitre vide sur les dossiers d'adultes, avec ses lignes
       a signer : une page qui semble incomplete alors qu'elle ne l'est pas. */
    if (g && (nonVide(g.fullName) || nonVide(g.signature))) {
      p.titreSection('Legal Guardian or Authorized Representative', null, 130);
      p.champs([
        ['Guardian Name', nonVide(g.fullName)
          || (nonVide(g.firstName) + ' ' + nonVide(g.lastName)).trim()],
        ['Relationship to Client', g.relationshipToClient]
      ]);
      p.signature({
        image: g.signature,
        date: dateJour,
        libelle: 'GUARDIAN SIGNATURE',
        nomImprime: nonVide(g.fullName)
          || (nonVide(g.firstName) + ' ' + nonVide(g.lastName)).trim(),
        sousTitre: nonVide(g.relationshipToClient) || 'Legal guardian',
        libelleDate: 'DATE SIGNED (MM/DD/YYYY)'
      });
    }

    p.pied();
    return p.doc;
  }

  function nomFichier(nom) {
    var base = nonVide(nom).replace(/[^A-Za-z0-9 _-]/g, '').trim().replace(/\s+/g, '_');
    if (!base) base = 'Client';
    var d = new Date();
    return base + '_Informed_Consent_' + d.getFullYear()
      + String(d.getMonth() + 1).padStart(2, '0')
      + String(d.getDate()).padStart(2, '0') + '_'
      + String(d.getHours()).padStart(2, '0')
      + String(d.getMinutes()).padStart(2, '0') + '.pdf';
  }

  /* Prend le payload que le formulaire compose deja, sans le remanier : le
     but est de changer l'endroit ou le document est fabrique, pas la forme
     des donnees. */
  window.construireConsentementHopeful = async function (d) {
    var photo = await preparerImage((d.client || {}).photo, 1200);
    var doc = documentConsentement(d, photo);
    return {
      pdf: doc.output('datauristring').split(',')[1],
      pdfFileName: nomFichier(nomComplet(d)),
      _doc: doc
    };
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SECTIONS: SECTIONS, THEME_HOPEFUL: THEME_HOPEFUL };
  }
})();
