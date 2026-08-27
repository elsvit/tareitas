#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '..', 'src', 'assets', 'translation');
const enPath = path.join(translationsDir, 'en.json');

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const deepMergeMissing = (target, source) => {
  if (typeof source === 'string') {
    return typeof target === 'string' ? target : source;
  }

  if (Array.isArray(source)) {
    return Array.isArray(target) ? target : [...source];
  }

  if (!isObject(source)) {
    return target ?? source;
  }

  const nextTarget = isObject(target) ? { ...target } : {};

  for (const [key, value] of Object.entries(source)) {
    if (!(key in nextTarget)) {
      nextTarget[key] = value;
      continue;
    }

    nextTarget[key] = deepMergeMissing(nextTarget[key], value);
  }

  return nextTarget;
};

const deepSet = (root, keyPath, value) => {
  let node = root;
  for (let index = 0; index < keyPath.length - 1; index += 1) {
    const key = keyPath[index];
    if (!isObject(node[key])) {
      node[key] = {};
    }
    node = node[key];
  }
  node[keyPath[keyPath.length - 1]] = value;
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const writeJson = (filePath, json) => {
  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
};

const getNodeAtPath = (root, pathParts) => {
  let node = root;
  for (const part of pathParts) {
    if (!isObject(node?.[part])) {
      return null;
    }
    node = node[part];
  }
  return node;
};

const getEnglishValueAtPath = (pathParts) => getNodeAtPath(englishJson, pathParts);

const copyReferenceSubtree = (target, source, pathParts = []) => {
  if (typeof source === 'string') {
    return;
  }

  if (!isObject(source)) {
    return;
  }

  let targetNode = target;
  let sourceNode = source;

  for (const part of pathParts) {
    if (!isObject(targetNode[part])) {
      targetNode[part] = {};
    }
    targetNode = targetNode[part];
    sourceNode = sourceNode[part];
  }

  const englishNode = getEnglishValueAtPath(pathParts);

  for (const [key, value] of Object.entries(sourceNode)) {
    const englishValue = isObject(englishNode) ? englishNode[key] : undefined;
    const shouldReplace =
      !(key in targetNode)
      || (typeof value === 'string' && typeof targetNode[key] === 'string' && targetNode[key] === englishValue);

    if (shouldReplace) {
      targetNode[key] = value;
      continue;
    }

    if (isObject(value) && isObject(targetNode[key])) {
      copyReferenceSubtree(target, source, [...pathParts, key]);
    }
  }
};

const apiErrorsByLang = {
  bg: {
    UNKNOWN_ERROR: 'Нещо се обърка. Моля, опитайте отново.',
    INTERNAL_ERROR: 'Нещо се обърка. Моля, опитайте отново.',
    VALIDATION_ERROR: 'Невалидна заявка. Моля, проверете въведените данни.',
    NOT_FOUND: 'Ресурсът не е намерен.',
    FORBIDDEN: 'Нямате разрешение да извършите това действие.',
    UNAUTHORIZED: 'Не сте оторизирани. Моля, влезте отново.',
    TASK_NOT_FOUND: 'Задачата не е намерена.',
    TASK_NOT_ALLOWED: 'Не можете да промените тази задача.',
    TASK_INVALID_STATUS: 'Тази задача не може да бъде актуализирана в текущото ѝ състояние.',
    TASK_ALREADY_EXISTS: 'Тази задача вече съществува.',
    REWARD_NOT_ALLOWED: 'Не можете да промените тази награда.',
    REWARD_INACTIVE: 'Тази награда вече не е налична.',
    REWARD_INSUFFICIENT_BALANCE: 'Няма достатъчно звезди за тази награда.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Тази награда не може да бъде актуализирана в текущото ѝ състояние.',
  },
  cs: {
    UNKNOWN_ERROR: 'Něco se pokazilo. Zkuste to prosím znovu.',
    INTERNAL_ERROR: 'Něco se pokazilo. Zkuste to prosím znovu.',
    VALIDATION_ERROR: 'Neplatný požadavek. Zkontrolujte prosím zadané údaje.',
    NOT_FOUND: 'Zdroj nebyl nalezen.',
    FORBIDDEN: 'Nemáte oprávnění provést tuto akci.',
    UNAUTHORIZED: 'Nejste autorizováni. Přihlaste se prosím znovu.',
    TASK_NOT_FOUND: 'Úkol nebyl nalezen.',
    TASK_NOT_ALLOWED: 'Tento úkol nemůžete upravit.',
    TASK_INVALID_STATUS: 'Tento úkol nelze v aktuálním stavu aktualizovat.',
    TASK_ALREADY_EXISTS: 'Tento úkol již existuje.',
    REWARD_NOT_ALLOWED: 'Tuto odměnu nemůžete upravit.',
    REWARD_INACTIVE: 'Tato odměna již není k dispozici.',
    REWARD_INSUFFICIENT_BALANCE: 'Na tuto odměnu nemáte dost hvězdiček.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Tuto odměnu nelze v aktuálním stavu aktualizovat.',
  },
  da: {
    UNKNOWN_ERROR: 'Noget gik galt. Prøv igen.',
    INTERNAL_ERROR: 'Noget gik galt. Prøv igen.',
    VALIDATION_ERROR: 'Ugyldig anmodning. Tjek dine indtastninger.',
    NOT_FOUND: 'Ressource ikke fundet.',
    FORBIDDEN: 'Du har ikke tilladelse til at udføre denne handling.',
    UNAUTHORIZED: 'Du er ikke autoriseret. Log ind igen.',
    TASK_NOT_FOUND: 'Opgave ikke fundet.',
    TASK_NOT_ALLOWED: 'Du kan ikke ændre denne opgave.',
    TASK_INVALID_STATUS: 'Denne opgave kan ikke opdateres i dens nuværende tilstand.',
    TASK_ALREADY_EXISTS: 'Denne opgave findes allerede.',
    REWARD_NOT_ALLOWED: 'Du kan ikke ændre denne belønning.',
    REWARD_INACTIVE: 'Denne belønning er ikke længere tilgængelig.',
    REWARD_INSUFFICIENT_BALANCE: 'Ikke nok stjerner til denne belønning.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Denne belønning kan ikke opdateres i dens nuværende tilstand.',
  },
  de: {
    UNKNOWN_ERROR: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    INTERNAL_ERROR: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    VALIDATION_ERROR: 'Ungültige Anfrage. Bitte überprüfen Sie Ihre Eingabe.',
    NOT_FOUND: 'Ressource nicht gefunden.',
    FORBIDDEN: 'Sie haben keine Berechtigung, diese Aktion auszuführen.',
    UNAUTHORIZED: 'Sie sind nicht autorisiert. Bitte melden Sie sich erneut an.',
    TASK_NOT_FOUND: 'Aufgabe nicht gefunden.',
    TASK_NOT_ALLOWED: 'Sie können diese Aufgabe nicht ändern.',
    TASK_INVALID_STATUS: 'Diese Aufgabe kann in ihrem aktuellen Zustand nicht aktualisiert werden.',
    TASK_ALREADY_EXISTS: 'Diese Aufgabe existiert bereits.',
    REWARD_NOT_ALLOWED: 'Sie können diese Belohnung nicht ändern.',
    REWARD_INACTIVE: 'Diese Belohnung ist nicht mehr verfügbar.',
    REWARD_INSUFFICIENT_BALANCE: 'Nicht genug Sterne für diese Belohnung.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Diese Belohnung kann in ihrem aktuellen Zustand nicht aktualisiert werden.',
  },
  el: {
    UNKNOWN_ERROR: 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.',
    INTERNAL_ERROR: 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.',
    VALIDATION_ERROR: 'Μη έγκυρο αίτημα. Ελέγξτε τα δεδομένα που εισάγατε.',
    NOT_FOUND: 'Ο πόρος δεν βρέθηκε.',
    FORBIDDEN: 'Δεν έχετε άδεια να εκτελέσετε αυτή την ενέργεια.',
    UNAUTHORIZED: 'Δεν είστε εξουσιοδοτημένοι. Συνδεθείτε ξανά.',
    TASK_NOT_FOUND: 'Η εργασία δεν βρέθηκε.',
    TASK_NOT_ALLOWED: 'Δεν μπορείτε να τροποποιήσετε αυτή την εργασία.',
    TASK_INVALID_STATUS: 'Αυτή η εργασία δεν μπορεί να ενημερωθεί στην τρέχουσα κατάστασή της.',
    TASK_ALREADY_EXISTS: 'Αυτή η εργασία υπάρχει ήδη.',
    REWARD_NOT_ALLOWED: 'Δεν μπορείτε να τροποποιήσετε αυτή την ανταμοιβή.',
    REWARD_INACTIVE: 'Αυτή η ανταμοιβή δεν είναι πλέον διαθέσιμη.',
    REWARD_INSUFFICIENT_BALANCE: 'Δεν υπάρχουν αρκετά αστέρια για αυτή την ανταμοιβή.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Αυτή η ανταμοιβή δεν μπορεί να ενημερωθεί στην τρέχουσα κατάστασή της.',
  },
  et: {
    UNKNOWN_ERROR: 'Midagi läks valesti. Proovige uuesti.',
    INTERNAL_ERROR: 'Midagi läks valesti. Proovige uuesti.',
    VALIDATION_ERROR: 'Vigane päring. Kontrollige sisestatud andmeid.',
    NOT_FOUND: 'Ressurssi ei leitud.',
    FORBIDDEN: 'Teil pole luba seda toimingut teha.',
    UNAUTHORIZED: 'Te pole autoriseeritud. Logige uuesti sisse.',
    TASK_NOT_FOUND: 'Ülesannet ei leitud.',
    TASK_NOT_ALLOWED: 'Te ei saa seda ülesannet muuta.',
    TASK_INVALID_STATUS: 'Seda ülesannet ei saa praeguses olekus uuendada.',
    TASK_ALREADY_EXISTS: 'See ülesanne on juba olemas.',
    REWARD_NOT_ALLOWED: 'Te ei saa seda auhinda muuta.',
    REWARD_INACTIVE: 'See auhind pole enam saadaval.',
    REWARD_INSUFFICIENT_BALANCE: 'Selle auhinna jaoks pole piisavalt tähti.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Seda auhinda ei saa praeguses olekus uuendada.',
  },
  fi: {
    UNKNOWN_ERROR: 'Jokin meni pieleen. Yritä uudelleen.',
    INTERNAL_ERROR: 'Jokin meni pieleen. Yritä uudelleen.',
    VALIDATION_ERROR: 'Virheellinen pyyntö. Tarkista syöttämäsi tiedot.',
    NOT_FOUND: 'Resurssia ei löytynyt.',
    FORBIDDEN: 'Sinulla ei ole oikeutta suorittaa tätä toimintoa.',
    UNAUTHORIZED: 'Et ole valtuutettu. Kirjaudu sisään uudelleen.',
    TASK_NOT_FOUND: 'Tehtävää ei löytynyt.',
    TASK_NOT_ALLOWED: 'Et voi muokata tätä tehtävää.',
    TASK_INVALID_STATUS: 'Tätä tehtävää ei voi päivittää sen nykyisessä tilassa.',
    TASK_ALREADY_EXISTS: 'Tämä tehtävä on jo olemassa.',
    REWARD_NOT_ALLOWED: 'Et voi muokata tätä palkintoa.',
    REWARD_INACTIVE: 'Tämä palkinto ei ole enää saatavilla.',
    REWARD_INSUFFICIENT_BALANCE: 'Tähän palkintoon ei ole tarpeeksi tähtiä.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Tätä palkintoa ei voi päivittää sen nykyisessä tilassa.',
  },
  fr: {
    UNKNOWN_ERROR: "Une erreur s'est produite. Veuillez réessayer.",
    INTERNAL_ERROR: "Une erreur s'est produite. Veuillez réessayer.",
    VALIDATION_ERROR: 'Requête invalide. Veuillez vérifier vos données.',
    NOT_FOUND: 'Ressource introuvable.',
    FORBIDDEN: "Vous n'avez pas la permission d'effectuer cette action.",
    UNAUTHORIZED: 'Vous n\'êtes pas autorisé. Veuillez vous reconnecter.',
    TASK_NOT_FOUND: 'Tâche introuvable.',
    TASK_NOT_ALLOWED: 'Vous ne pouvez pas modifier cette tâche.',
    TASK_INVALID_STATUS: 'Cette tâche ne peut pas être mise à jour dans son état actuel.',
    TASK_ALREADY_EXISTS: 'Cette tâche existe déjà.',
    REWARD_NOT_ALLOWED: 'Vous ne pouvez pas modifier cette récompense.',
    REWARD_INACTIVE: "Cette récompense n'est plus disponible.",
    REWARD_INSUFFICIENT_BALANCE: "Pas assez d'étoiles pour cette récompense.",
    REWARD_REDEMPTION_INVALID_STATUS: 'Cette récompense ne peut pas être mise à jour dans son état actuel.',
  },
  hr: {
    UNKNOWN_ERROR: 'Nešto je pošlo po krivu. Pokušajte ponovno.',
    INTERNAL_ERROR: 'Nešto je pošlo po krivu. Pokušajte ponovno.',
    VALIDATION_ERROR: 'Nevaljan zahtjev. Provjerite unesene podatke.',
    NOT_FOUND: 'Resurs nije pronađen.',
    FORBIDDEN: 'Nemate dopuštenje za izvođenje ove radnje.',
    UNAUTHORIZED: 'Niste autorizirani. Prijavite se ponovno.',
    TASK_NOT_FOUND: 'Zadatak nije pronađen.',
    TASK_NOT_ALLOWED: 'Ne možete izmijeniti ovaj zadatak.',
    TASK_INVALID_STATUS: 'Ovaj zadatak nije moguće ažurirati u trenutnom stanju.',
    TASK_ALREADY_EXISTS: 'Ovaj zadatak već postoji.',
    REWARD_NOT_ALLOWED: 'Ne možete izmijeniti ovu nagradu.',
    REWARD_INACTIVE: 'Ova nagrada više nije dostupna.',
    REWARD_INSUFFICIENT_BALANCE: 'Nema dovoljno zvjezdica za ovu nagradu.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Ovu nagradu nije moguće ažurirati u trenutnom stanju.',
  },
  hu: {
    UNKNOWN_ERROR: 'Valami hiba történt. Próbálja újra.',
    INTERNAL_ERROR: 'Valami hiba történt. Próbálja újra.',
    VALIDATION_ERROR: 'Érvénytelen kérés. Ellenőrizze a megadott adatokat.',
    NOT_FOUND: 'Az erőforrás nem található.',
    FORBIDDEN: 'Nincs jogosultsága ehhez a művelethez.',
    UNAUTHORIZED: 'Nincs engedélyezve. Jelentkezzen be újra.',
    TASK_NOT_FOUND: 'A feladat nem található.',
    TASK_NOT_ALLOWED: 'Ezt a feladatot nem módosíthatja.',
    TASK_INVALID_STATUS: 'Ez a feladat jelenlegi állapotában nem frissíthető.',
    TASK_ALREADY_EXISTS: 'Ez a feladat már létezik.',
    REWARD_NOT_ALLOWED: 'Ezt a jutalmat nem módosíthatja.',
    REWARD_INACTIVE: 'Ez a jutalom már nem érhető el.',
    REWARD_INSUFFICIENT_BALANCE: 'Nincs elég csillag ehhez a jutalomhoz.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Ez a jutalom jelenlegi állapotában nem frissíthető.',
  },
  it: {
    UNKNOWN_ERROR: 'Qualcosa è andato storto. Riprova.',
    INTERNAL_ERROR: 'Qualcosa è andato storto. Riprova.',
    VALIDATION_ERROR: 'Richiesta non valida. Controlla i dati inseriti.',
    NOT_FOUND: 'Risorsa non trovata.',
    FORBIDDEN: 'Non hai il permesso di eseguire questa azione.',
    UNAUTHORIZED: 'Non sei autorizzato. Accedi di nuovo.',
    TASK_NOT_FOUND: 'Attività non trovata.',
    TASK_NOT_ALLOWED: 'Non puoi modificare questa attività.',
    TASK_INVALID_STATUS: 'Questa attività non può essere aggiornata nel suo stato attuale.',
    TASK_ALREADY_EXISTS: 'Questa attività esiste già.',
    REWARD_NOT_ALLOWED: 'Non puoi modificare questa ricompensa.',
    REWARD_INACTIVE: 'Questa ricompensa non è più disponibile.',
    REWARD_INSUFFICIENT_BALANCE: 'Non ci sono abbastanza stelle per questa ricompensa.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Questa ricompensa non può essere aggiornata nel suo stato attuale.',
  },
  lt: {
    UNKNOWN_ERROR: 'Kažkas nutiko. Bandykite dar kartą.',
    INTERNAL_ERROR: 'Kažkas nutiko. Bandykite dar kartą.',
    VALIDATION_ERROR: 'Netinkama užklausa. Patikrinkite įvestus duomenis.',
    NOT_FOUND: 'Išteklius nerastas.',
    FORBIDDEN: 'Neturite leidimo atlikti šį veiksmą.',
    UNAUTHORIZED: 'Nesate autorizuoti. Prisijunkite dar kartą.',
    TASK_NOT_FOUND: 'Užduotis nerasta.',
    TASK_NOT_ALLOWED: 'Negalite keisti šios užduoties.',
    TASK_INVALID_STATUS: 'Šios užduoties negalima atnaujinti esama būsena.',
    TASK_ALREADY_EXISTS: 'Ši užduotis jau egzistuoja.',
    REWARD_NOT_ALLOWED: 'Negalite keisti šio apdovanojimo.',
    REWARD_INACTIVE: 'Šis apdovanojimas nebepasiekiamas.',
    REWARD_INSUFFICIENT_BALANCE: 'Nepakanka žvaigždučių šiam apdovanojimui.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Šio apdovanojimo negalima atnaujinti esama būsena.',
  },
  lv: {
    UNKNOWN_ERROR: 'Kaut kas nogāja greizi. Mēģiniet vēlreiz.',
    INTERNAL_ERROR: 'Kaut kas nogāja greizi. Mēģiniet vēlreiz.',
    VALIDATION_ERROR: 'Nederīgs pieprasījums. Pārbaudiet ievadītos datus.',
    NOT_FOUND: 'Resurss nav atrasts.',
    FORBIDDEN: 'Jums nav atļaujas veikt šo darbību.',
    UNAUTHORIZED: 'Jūs neesat autorizēts. Pierakstieties vēlreiz.',
    TASK_NOT_FOUND: 'Uzdevums nav atrasts.',
    TASK_NOT_ALLOWED: 'Jūs nevarat mainīt šo uzdevumu.',
    TASK_INVALID_STATUS: 'Šo uzdevumu nevar atjaunināt tā pašreizējā stāvoklī.',
    TASK_ALREADY_EXISTS: 'Šis uzdevums jau pastāv.',
    REWARD_NOT_ALLOWED: 'Jūs nevarat mainīt šo balvu.',
    REWARD_INACTIVE: 'Šī balva vairs nav pieejama.',
    REWARD_INSUFFICIENT_BALANCE: 'Nav pietiekami daudz zvaigžņu šai balvai.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Šo balvu nevar atjaunināt tā pašreizējā stāvoklī.',
  },
  nl: {
    UNKNOWN_ERROR: 'Er is iets misgegaan. Probeer het opnieuw.',
    INTERNAL_ERROR: 'Er is iets misgegaan. Probeer het opnieuw.',
    VALIDATION_ERROR: 'Ongeldige aanvraag. Controleer je invoer.',
    NOT_FOUND: 'Bron niet gevonden.',
    FORBIDDEN: 'Je hebt geen toestemming om deze actie uit te voeren.',
    UNAUTHORIZED: 'Je bent niet geautoriseerd. Meld je opnieuw aan.',
    TASK_NOT_FOUND: 'Taak niet gevonden.',
    TASK_NOT_ALLOWED: 'Je kunt deze taak niet wijzigen.',
    TASK_INVALID_STATUS: 'Deze taak kan in de huidige staat niet worden bijgewerkt.',
    TASK_ALREADY_EXISTS: 'Deze taak bestaat al.',
    REWARD_NOT_ALLOWED: 'Je kunt deze beloning niet wijzigen.',
    REWARD_INACTIVE: 'Deze beloning is niet meer beschikbaar.',
    REWARD_INSUFFICIENT_BALANCE: 'Niet genoeg sterren voor deze beloning.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Deze beloning kan in de huidige staat niet worden bijgewerkt.',
  },
  pl: {
    UNKNOWN_ERROR: 'Coś poszło nie tak. Spróbuj ponownie.',
    INTERNAL_ERROR: 'Coś poszło nie tak. Spróbuj ponownie.',
    VALIDATION_ERROR: 'Nieprawidłowe żądanie. Sprawdź wprowadzone dane.',
    NOT_FOUND: 'Nie znaleziono zasobu.',
    FORBIDDEN: 'Nie masz uprawnień do wykonania tej czynności.',
    UNAUTHORIZED: 'Nie jesteś autoryzowany. Zaloguj się ponownie.',
    TASK_NOT_FOUND: 'Nie znaleziono zadania.',
    TASK_NOT_ALLOWED: 'Nie możesz zmodyfikować tego zadania.',
    TASK_INVALID_STATUS: 'Tego zadania nie można zaktualizować w bieżącym stanie.',
    TASK_ALREADY_EXISTS: 'To zadanie już istnieje.',
    REWARD_NOT_ALLOWED: 'Nie możesz zmodyfikować tej nagrody.',
    REWARD_INACTIVE: 'Ta nagroda nie jest już dostępna.',
    REWARD_INSUFFICIENT_BALANCE: 'Za mało gwiazdek na tę nagrodę.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Tej nagrody nie można zaktualizować w bieżącym stanie.',
  },
  pt: {
    UNKNOWN_ERROR: 'Algo correu mal. Tente novamente.',
    INTERNAL_ERROR: 'Algo correu mal. Tente novamente.',
    VALIDATION_ERROR: 'Pedido inválido. Verifique os dados introduzidos.',
    NOT_FOUND: 'Recurso não encontrado.',
    FORBIDDEN: 'Não tem permissão para realizar esta ação.',
    UNAUTHORIZED: 'Não está autorizado. Inicie sessão novamente.',
    TASK_NOT_FOUND: 'Tarefa não encontrada.',
    TASK_NOT_ALLOWED: 'Não pode modificar esta tarefa.',
    TASK_INVALID_STATUS: 'Esta tarefa não pode ser atualizada no estado atual.',
    TASK_ALREADY_EXISTS: 'Esta tarefa já existe.',
    REWARD_NOT_ALLOWED: 'Não pode modificar esta recompensa.',
    REWARD_INACTIVE: 'Esta recompensa já não está disponível.',
    REWARD_INSUFFICIENT_BALANCE: 'Não há estrelas suficientes para esta recompensa.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Esta recompensa não pode ser atualizada no estado atual.',
  },
  ro: {
    UNKNOWN_ERROR: 'Ceva nu a mers bine. Încercați din nou.',
    INTERNAL_ERROR: 'Ceva nu a mers bine. Încercați din nou.',
    VALIDATION_ERROR: 'Cerere invalidă. Verificați datele introduse.',
    NOT_FOUND: 'Resursa nu a fost găsită.',
    FORBIDDEN: 'Nu aveți permisiunea de a efectua această acțiune.',
    UNAUTHORIZED: 'Nu sunteți autorizat. Conectați-vă din nou.',
    TASK_NOT_FOUND: 'Sarcina nu a fost găsită.',
    TASK_NOT_ALLOWED: 'Nu puteți modifica această sarcină.',
    TASK_INVALID_STATUS: 'Această sarcină nu poate fi actualizată în starea actuală.',
    TASK_ALREADY_EXISTS: 'Această sarcină există deja.',
    REWARD_NOT_ALLOWED: 'Nu puteți modifica această recompensă.',
    REWARD_INACTIVE: 'Această recompensă nu mai este disponibilă.',
    REWARD_INSUFFICIENT_BALANCE: 'Nu sunt suficiente stele pentru această recompensă.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Această recompensă nu poate fi actualizată în starea actuală.',
  },
  sk: {
    UNKNOWN_ERROR: 'Niečo sa pokazilo. Skúste to znova.',
    INTERNAL_ERROR: 'Niečo sa pokazilo. Skúste to znova.',
    VALIDATION_ERROR: 'Neplatná požiadavka. Skontrolujte zadané údaje.',
    NOT_FOUND: 'Zdroj sa nenašiel.',
    FORBIDDEN: 'Nemáte oprávnenie vykonať túto akciu.',
    UNAUTHORIZED: 'Nie ste autorizovaní. Prihláste sa znova.',
    TASK_NOT_FOUND: 'Úloha sa nenašla.',
    TASK_NOT_ALLOWED: 'Túto úlohu nemôžete upraviť.',
    TASK_INVALID_STATUS: 'Túto úlohu nie je možné aktualizovať v aktuálnom stave.',
    TASK_ALREADY_EXISTS: 'Táto úloha už existuje.',
    REWARD_NOT_ALLOWED: 'Túto odmenu nemôžete upraviť.',
    REWARD_INACTIVE: 'Táto odmena už nie je k dispozícii.',
    REWARD_INSUFFICIENT_BALANCE: 'Na túto odmenu nemáte dosť hviezd.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Túto odmenu nie je možné aktualizovať v aktuálnom stave.',
  },
  sl: {
    UNKNOWN_ERROR: 'Nekaj je šlo narobe. Poskusite znova.',
    INTERNAL_ERROR: 'Nekaj je šlo narobe. Poskusite znova.',
    VALIDATION_ERROR: 'Neveljavna zahteva. Preverite vnesene podatke.',
    NOT_FOUND: 'Vir ni bil najden.',
    FORBIDDEN: 'Nimate dovoljenja za izvedbo tega dejanja.',
    UNAUTHORIZED: 'Niste avtorizirani. Prijavite se znova.',
    TASK_NOT_FOUND: 'Naloga ni bila najdena.',
    TASK_NOT_ALLOWED: 'Te naloge ne morete spremeniti.',
    TASK_INVALID_STATUS: 'Te naloge ni mogoče posodobiti v trenutnem stanju.',
    TASK_ALREADY_EXISTS: 'Ta naloga že obstaja.',
    REWARD_NOT_ALLOWED: 'Te nagrade ne morete spremeniti.',
    REWARD_INACTIVE: 'Ta nagrada ni več na voljo.',
    REWARD_INSUFFICIENT_BALANCE: 'Ni dovolj zvezdic za to nagrado.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Te nagrade ni mogoče posodobiti v trenutnem stanju.',
  },
  sv: {
    UNKNOWN_ERROR: 'Något gick fel. Försök igen.',
    INTERNAL_ERROR: 'Något gick fel. Försök igen.',
    VALIDATION_ERROR: 'Ogiltig begäran. Kontrollera dina uppgifter.',
    NOT_FOUND: 'Resursen hittades inte.',
    FORBIDDEN: 'Du har inte behörighet att utföra denna åtgärd.',
    UNAUTHORIZED: 'Du är inte auktoriserad. Logga in igen.',
    TASK_NOT_FOUND: 'Uppgift hittades inte.',
    TASK_NOT_ALLOWED: 'Du kan inte ändra den här uppgiften.',
    TASK_INVALID_STATUS: 'Den här uppgiften kan inte uppdateras i sitt nuvarande tillstånd.',
    TASK_ALREADY_EXISTS: 'Den här uppgiften finns redan.',
    REWARD_NOT_ALLOWED: 'Du kan inte ändra den här belöningen.',
    REWARD_INACTIVE: 'Den här belöningen är inte längre tillgänglig.',
    REWARD_INSUFFICIENT_BALANCE: 'Inte tillräckligt med stjärnor för den här belöningen.',
    REWARD_REDEMPTION_INVALID_STATUS: 'Den här belöningen kan inte uppdateras i sitt nuvarande tillstånd.',
  },
};

const sharedPatchesByLang = {
  bg: {
    'settings.account.sync_try_later': 'Синхронизацията не успя. Опитайте отново след малко.',
    'tasks.delete_only_pending': 'Могат да се изтриват само чакащи задачи.',
    'tasks.status_locked_closed_period': 'Статусът не може да се промени — този месец е затворен в историята на наградите',
    'tasks.recurring_delete_title': 'Изтриване',
    'tasks.recurring_delete_only_this': 'Само тази задача',
    'tasks.recurring_delete_only_this_desc': 'Изтриване само на избрания ден',
    'tasks.recurring_delete_following': 'Тази задача и следващите',
    'tasks.recurring_delete_following_desc': 'Изтриване от този ден нататък',
    'tasks.recurring_delete_all': 'Всички задачи',
    'tasks.recurring_delete_all_desc': 'Изтриване на цялата серия',
    'rewards.previous_reward_template': 'Използване на предишна награда',
    'rewards.no_completed': 'Все още няма завършени награди',
    'rewards.tabs.completed': 'Завършени',
    'rewards.status.completed': 'Завършено',
    'onboarding.login.error_empty_family': 'Влязохте, но не бяха намерени членове на семейството. Опитайте отново.',
  },
  cs: {
    'settings.account.sync_try_later': 'Synchronizace se nyní nezdařila. Zkuste to za chvíli znovu.',
    'tasks.delete_only_pending': 'Smazat lze pouze nevyřízené úkoly.',
    'tasks.status_locked_closed_period': 'Stav nelze změnit — tento měsíc je uzavřen v historii odměn',
    'tasks.recurring_delete_title': 'Smazat',
    'tasks.recurring_delete_only_this': 'Pouze tento úkol',
    'tasks.recurring_delete_only_this_desc': 'Smazat pouze vybraný den',
    'tasks.recurring_delete_following': 'Tento úkol a následující',
    'tasks.recurring_delete_following_desc': 'Smazat od tohoto dne dále',
    'tasks.recurring_delete_all': 'Všechny úkoly',
    'tasks.recurring_delete_all_desc': 'Smazat celou sérii',
    'rewards.previous_reward_template': 'Použít předchozí odměnu',
    'rewards.no_completed': 'Zatím žádné dokončené odměny',
    'rewards.tabs.completed': 'Dokončené',
    'rewards.status.completed': 'Dokončeno',
    'onboarding.login.error_empty_family': 'Přihlášení proběhlo, ale nebyli nalezeni členové rodiny. Zkuste to znovu.',
  },
  da: {
    'more.help_center': 'Hjælpecenter',
    'users.admin': 'Administrator',
    'tasks.filter': 'Filter',
    'tasks.baseTasks.stretch': 'Strækøvelser',
    'tasks.baseTasks.pushUps': 'Armbøjninger',
    'baseRewards.playstation_30_min': 'PlayStation 30 min',
    'onboarding.login.admin': 'Administrator',
    'settings.account.title': 'Skysynkronisering',
    'settings.account.signed_in': 'Logget ind',
    'settings.account.sign_in': 'Log ind',
    'settings.account.sign_out': 'Log ud',
    'settings.account.session_expired': 'Din session er udløbet. Log ind igen for at synkronisere.',
    'settings.account.sync_try_later': 'Kunne ikke synkronisere nu. Prøv igen om et øjeblik.',
    'settings.account.login_screen_title': 'Log ind',
    'settings.account.login_screen_subtitle': 'Log ind for at synkronisere din familie på tværs af enheder.',
    'users.change_group': 'Skift gruppe',
    'tasks.delete_only_pending': 'Kun afventende opgaver kan slettes.',
    'tasks.status_locked_closed_period': 'Status kan ikke ændres — denne måned er lukket i belønningshistorikken',
    'tasks.recurring_delete_title': 'Slet',
    'tasks.recurring_delete_only_this': 'Kun denne opgave',
    'tasks.recurring_delete_only_this_desc': 'Slet kun den valgte dag',
    'tasks.recurring_delete_following': 'Denne opgave og følgende',
    'tasks.recurring_delete_following_desc': 'Slet fra denne dag og frem',
    'tasks.recurring_delete_all': 'Alle opgaver',
    'tasks.recurring_delete_all_desc': 'Slet hele serien',
    'rewards.previous_reward_template': 'Brug tidligere belønning',
    'rewards.no_completed': 'Ingen afsluttede belønninger endnu',
    'rewards.tabs.completed': 'Afsluttede',
    'rewards.status.completed': 'Afsluttet',
    'onboarding.login.error_empty_family': 'Logget ind, men ingen familiemedlemmer blev fundet. Prøv igen.',
  },
  de: {
    'more.help_center': 'Hilfezentrum',
    'common.optional': 'optional',
    'users.admin': 'Administrator',
    'users.login': 'Anmelden',
    'tasks.filter': 'Filter',
    'tasks.baseTasks.pushUps': 'Liegestütze',
    'onboarding.account.header': 'Konto',
    'onboarding.login.admin': 'Administrator',
    'settings.account.title': 'Cloud-Synchronisierung',
    'settings.account.signed_in': 'Angemeldet',
    'settings.account.sign_in': 'Anmelden',
    'settings.account.sign_out': 'Abmelden',
    'settings.account.session_expired': 'Ihre Sitzung ist abgelaufen. Melden Sie sich erneut an, um zu synchronisieren.',
    'settings.account.sync_try_later': 'Synchronisierung gerade nicht möglich. Bitte versuchen Sie es gleich erneut.',
    'settings.account.login_screen_title': 'Anmelden',
    'settings.account.login_screen_subtitle': 'Melden Sie sich an, um Ihre Familie geräteübergreifend zu synchronisieren.',
    'users.change_group': 'Gruppe wechseln',
    'tasks.delete_only_pending': 'Nur ausstehende Aufgaben können gelöscht werden.',
    'tasks.status_locked_closed_period': 'Status kann nicht geändert werden — dieser Monat ist in der Belohnungshistorie geschlossen',
    'tasks.recurring_delete_title': 'Löschen',
    'tasks.recurring_delete_only_this': 'Nur diese Aufgabe',
    'tasks.recurring_delete_only_this_desc': 'Nur den ausgewählten Tag löschen',
    'tasks.recurring_delete_following': 'Diese Aufgabe und folgende',
    'tasks.recurring_delete_following_desc': 'Ab diesem Tag löschen',
    'tasks.recurring_delete_all': 'Alle Aufgaben',
    'tasks.recurring_delete_all_desc': 'Die gesamte Serie löschen',
    'rewards.previous_reward_template': 'Vorherige Belohnung verwenden',
    'rewards.no_completed': 'Noch keine abgeschlossenen Belohnungen',
    'rewards.tabs.completed': 'Abgeschlossen',
    'rewards.status.completed': 'Abgeschlossen',
    'onboarding.login.error_empty_family': 'Angemeldet, aber keine Familienmitglieder gefunden. Bitte erneut versuchen.',
  },
  el: {
    'more.help_center': 'Κέντρο βοήθειας',
    'settings.show_login_name': 'Εμφάνιση ονόματος σύνδεσης',
    'settings.parents': 'Γονείς',
    'users.unique_username': 'Μοναδικό όνομα σύνδεσης',
    'onboarding.login.admin': 'Διαχειριστής',
    'settings.account.title': 'Συγχρονισμός cloud',
    'settings.account.signed_in': 'Συνδεδεμένος',
    'settings.account.sign_in': 'Σύνδεση',
    'settings.account.sign_out': 'Αποσύνδεση',
    'settings.account.session_expired': 'Η συνεδρία σας έληξε. Συνδεθείτε ξανά για συγχρονισμό.',
    'settings.account.sync_try_later': 'Δεν ήταν δυνατός ο συγχρονισμός τώρα. Δοκιμάστε ξανά σε λίγο.',
    'settings.account.login_screen_title': 'Σύνδεση',
    'settings.account.login_screen_subtitle': 'Συνδεθείτε για να συγχρονίσετε την οικογένειά σας σε όλες τις συσκευές.',
    'users.change_group': 'Αλλαγή ομάδας',
    'tasks.delete_only_pending': 'Μπορούν να διαγραφούν μόνο εκκρεμείς εργασίες.',
    'tasks.status_locked_closed_period': 'Δεν μπορεί να αλλάξει η κατάσταση — αυτός ο μήνας είναι κλειστός στο ιστορικό ανταμοιβών',
    'tasks.recurring_delete_title': 'Διαγραφή',
    'tasks.recurring_delete_only_this': 'Μόνο αυτή η εργασία',
    'tasks.recurring_delete_only_this_desc': 'Διαγραφή μόνο της επιλεγμένης ημέρας',
    'tasks.recurring_delete_following': 'Αυτή η εργασία και οι επόμενες',
    'tasks.recurring_delete_following_desc': 'Διαγραφή από αυτή την ημέρα και μετά',
    'tasks.recurring_delete_all': 'Όλες οι εργασίες',
    'tasks.recurring_delete_all_desc': 'Διαγραφή ολόκληρης της σειράς',
    'rewards.previous_reward_template': 'Χρήση προηγούμενης ανταμοιβής',
    'rewards.no_completed': 'Δεν υπάρχουν ακόμα ολοκληρωμένες ανταμοιβές',
    'rewards.tabs.completed': 'Ολοκληρωμένες',
    'rewards.status.completed': 'Ολοκληρωμένη',
    'onboarding.login.error_empty_family': 'Συνδεθήκατε, αλλά δεν βρέθηκαν μέλη οικογένειας. Δοκιμάστε ξανά.',
  },
  et: {
    'settings.account.sync_try_later': 'Sünkroniseerimine ebaõnnestus. Proovige hetke pärast uuesti.',
    'tasks.delete_only_pending': 'Kustutada saab ainult ootel ülesandeid.',
    'tasks.status_locked_closed_period': 'Olekut ei saa muuta — see kuu on auhindade ajaloos suletud',
    'tasks.recurring_delete_title': 'Kustuta',
    'tasks.recurring_delete_only_this': 'Ainult see ülesanne',
    'tasks.recurring_delete_only_this_desc': 'Kustuta ainult valitud päev',
    'tasks.recurring_delete_following': 'See ülesanne ja järgmised',
    'tasks.recurring_delete_following_desc': 'Kustuta alates sellest päevast',
    'tasks.recurring_delete_all': 'Kõik ülesanded',
    'tasks.recurring_delete_all_desc': 'Kustuta kogu seeria',
    'rewards.previous_reward_template': 'Kasuta eelmist auhinda',
    'rewards.no_completed': 'Lõpetatud auhindu pole veel',
    'rewards.tabs.completed': 'Lõpetatud',
    'rewards.status.completed': 'Lõpetatud',
    'onboarding.login.error_empty_family': 'Sisse logitud, kuid pereliikmeid ei leitud. Proovige uuesti.',
  },
  fi: {
    'settings.account.sync_try_later': 'Synkronointi epäonnistui. Yritä hetken kuluttua uudelleen.',
    'tasks.delete_only_pending': 'Vain odottavat tehtävät voidaan poistaa.',
    'tasks.status_locked_closed_period': 'Tilaa ei voi muuttaa — tämä kuukausi on suljettu palkintohistoriassa',
    'tasks.recurring_delete_title': 'Poista',
    'tasks.recurring_delete_only_this': 'Vain tämä tehtävä',
    'tasks.recurring_delete_only_this_desc': 'Poista vain valittu päivä',
    'tasks.recurring_delete_following': 'Tämä tehtävä ja seuraavat',
    'tasks.recurring_delete_following_desc': 'Poista tästä päivästä eteenpäin',
    'tasks.recurring_delete_all': 'Kaikki tehtävät',
    'tasks.recurring_delete_all_desc': 'Poista koko sarja',
    'rewards.previous_reward_template': 'Käytä edellistä palkintoa',
    'rewards.no_completed': 'Ei vielä suoritettuja palkintoja',
    'rewards.tabs.completed': 'Suoritetut',
    'rewards.status.completed': 'Suoritettu',
    'onboarding.login.error_empty_family': 'Kirjautuminen onnistui, mutta perheenjäseniä ei löytynyt. Yritä uudelleen.',
  },
  fr: {
    'settings.account.sync_try_later': 'Impossible de synchroniser pour le moment. Réessayez dans un instant.',
    'tasks.delete_only_pending': 'Seules les tâches en attente peuvent être supprimées.',
    'tasks.status_locked_closed_period': 'Le statut ne peut pas être modifié — ce mois est clos dans l\'historique des récompenses',
    'tasks.recurring_delete_title': 'Supprimer',
    'tasks.recurring_delete_only_this': 'Cette tâche uniquement',
    'tasks.recurring_delete_only_this_desc': 'Supprimer uniquement le jour sélectionné',
    'tasks.recurring_delete_following': 'Cette tâche et les suivantes',
    'tasks.recurring_delete_following_desc': 'Supprimer à partir de ce jour',
    'tasks.recurring_delete_all': 'Toutes les tâches',
    'tasks.recurring_delete_all_desc': 'Supprimer toute la série',
    'rewards.previous_reward_template': 'Utiliser la récompense précédente',
    'rewards.no_completed': 'Aucune récompense terminée pour le moment',
    'rewards.tabs.completed': 'Terminées',
    'rewards.status.completed': 'Terminée',
    'onboarding.login.error_empty_family': 'Connecté, mais aucun membre de la famille trouvé. Réessayez.',
  },
  hr: {
    'settings.account.sync_try_later': 'Sinkronizacija trenutno nije uspjela. Pokušajte ponovno za trenutak.',
    'tasks.delete_only_pending': 'Mogu se brisati samo zadaci na čekanju.',
    'tasks.status_locked_closed_period': 'Status se ne može promijeniti — ovaj mjesec je zatvoren u povijesti nagrada',
    'tasks.recurring_delete_title': 'Izbriši',
    'tasks.recurring_delete_only_this': 'Samo ovaj zadatak',
    'tasks.recurring_delete_only_this_desc': 'Izbriši samo odabrani dan',
    'tasks.recurring_delete_following': 'Ovaj zadatak i sljedeći',
    'tasks.recurring_delete_following_desc': 'Izbriši od ovog dana nadalje',
    'tasks.recurring_delete_all': 'Svi zadaci',
    'tasks.recurring_delete_all_desc': 'Izbriši cijelu seriju',
    'rewards.previous_reward_template': 'Koristi prethodnu nagradu',
    'rewards.no_completed': 'Još nema dovršenih nagrada',
    'rewards.tabs.completed': 'Dovršeno',
    'rewards.status.completed': 'Dovršeno',
    'onboarding.login.error_empty_family': 'Prijavljeni ste, ali članovi obitelji nisu pronađeni. Pokušajte ponovno.',
  },
  hu: {
    'settings.account.sync_try_later': 'A szinkronizálás most nem sikerült. Próbálja újra egy pillanat múlva.',
    'tasks.delete_only_pending': 'Csak a függőben lévő feladatok törölhetők.',
    'tasks.status_locked_closed_period': 'Az állapot nem módosítható — ez a hónap le van zárva a jutalmak előzményeiben',
    'tasks.recurring_delete_title': 'Törlés',
    'tasks.recurring_delete_only_this': 'Csak ez a feladat',
    'tasks.recurring_delete_only_this_desc': 'Csak a kiválasztott nap törlése',
    'tasks.recurring_delete_following': 'Ez a feladat és a következők',
    'tasks.recurring_delete_following_desc': 'Törlés ettől a naptól',
    'tasks.recurring_delete_all': 'Minden feladat',
    'tasks.recurring_delete_all_desc': 'Az egész sorozat törlése',
    'rewards.previous_reward_template': 'Előző jutalom használata',
    'rewards.no_completed': 'Még nincsenek befejezett jutalmak',
    'rewards.tabs.completed': 'Befejezett',
    'rewards.status.completed': 'Befejezve',
    'onboarding.login.error_empty_family': 'Bejelentkezett, de nem találhatók családtagok. Próbálja újra.',
  },
  it: {
    'home.title': 'Inizio',
    'menu.title': 'Menu',
    'more.language': 'Lingua',
    'users.avatar': 'Avatar',
    'users.login': 'Accedi',
    'users.logout': 'Esci',
    'users.password': 'Password',
    'users.familyRole.reviewee': 'Recensito',
    'tasks.delete_task': 'Elimina attività',
    'tasks.reset_base_tasks': 'Reimposta attività base',
    'tasks.description': 'Descrizione',
    'tasks.subtasks': 'Sotto-attività',
    'tasks.subtask_label': 'Sotto-attività',
    'tasks.recurring_edit_title': 'Applica modifiche a',
    'tasks.baseTasks.doMorningExercises': 'Fare esercizi mattutini',
    'tasks.taskStatus.in_progress': 'In corso',
    'onboarding.account.header': 'Profilo',
    'onboarding.account.email': 'E-mail',
    'onboarding.login.admin': 'Amministratore',
    'onboarding.login.email': 'E-mail',
    'settings.account.sync_try_later': 'Impossibile sincronizzare ora. Riprova tra un momento.',
    'tasks.delete_only_pending': 'Possono essere eliminate solo le attività in sospeso.',
    'tasks.status_locked_closed_period': 'Lo stato non può essere modificato — questo mese è chiuso nella cronologia ricompense',
    'tasks.recurring_delete_title': 'Elimina',
    'tasks.recurring_delete_only_this': 'Solo questa attività',
    'tasks.recurring_delete_only_this_desc': 'Elimina solo il giorno selezionato',
    'tasks.recurring_delete_following': 'Questa attività e le successive',
    'tasks.recurring_delete_following_desc': 'Elimina da questo giorno in poi',
    'tasks.recurring_delete_all': 'Tutte le attività',
    'tasks.recurring_delete_all_desc': 'Elimina l\'intera serie',
    'rewards.previous_reward_template': 'Usa ricompensa precedente',
    'rewards.no_completed': 'Nessuna ricompensa completata',
    'rewards.tabs.completed': 'Completate',
    'rewards.status.completed': 'Completata',
    'onboarding.login.error_empty_family': 'Accesso effettuato, ma nessun membro della famiglia trovato. Riprova.',
  },
  lt: {
    'settings.account.sync_try_later': 'Dabar nepavyko sinchronizuoti. Bandykite dar kartą po akimirkos.',
    'tasks.delete_only_pending': 'Galima ištrinti tik laukiančias užduotis.',
    'tasks.status_locked_closed_period': 'Būsenos keisti negalima — šis mėnuo uždarytas apdovanojimų istorijoje',
    'tasks.recurring_delete_title': 'Ištrinti',
    'tasks.recurring_delete_only_this': 'Tik šią užduotį',
    'tasks.recurring_delete_only_this_desc': 'Ištrinti tik pasirinktą dieną',
    'tasks.recurring_delete_following': 'Šią užduotį ir vėlesnes',
    'tasks.recurring_delete_following_desc': 'Ištrinti nuo šios dienos',
    'tasks.recurring_delete_all': 'Visas užduotis',
    'tasks.recurring_delete_all_desc': 'Ištrinti visą seriją',
    'rewards.previous_reward_template': 'Naudoti ankstesnį apdovanojimą',
    'rewards.no_completed': 'Dar nėra užbaigtų apdovanojimų',
    'rewards.tabs.completed': 'Užbaigti',
    'rewards.status.completed': 'Užbaigta',
    'onboarding.login.error_empty_family': 'Prisijungta, bet šeimos narių nerasta. Bandykite dar kartą.',
  },
  lv: {
    'settings.account.sync_try_later': 'Tagad neizdevās sinhronizēt. Mēģiniet vēlreiz pēc brīža.',
    'tasks.delete_only_pending': 'Var dzēst tikai gaidošos uzdevumus.',
    'tasks.status_locked_closed_period': 'Statusu nevar mainīt — šis mēnesis ir slēgts balvu vēsturē',
    'tasks.recurring_delete_title': 'Dzēst',
    'tasks.recurring_delete_only_this': 'Tikai šo uzdevumu',
    'tasks.recurring_delete_only_this_desc': 'Dzēst tikai izvēlēto dienu',
    'tasks.recurring_delete_following': 'Šo uzdevumu un nākamos',
    'tasks.recurring_delete_following_desc': 'Dzēst no šīs dienas',
    'tasks.recurring_delete_all': 'Visus uzdevumus',
    'tasks.recurring_delete_all_desc': 'Dzēst visu sēriju',
    'rewards.previous_reward_template': 'Izmantot iepriekšējo balvu',
    'rewards.no_completed': 'Vēl nav pabeigtu balvu',
    'rewards.tabs.completed': 'Pabeigtie',
    'rewards.status.completed': 'Pabeigts',
    'onboarding.login.error_empty_family': 'Pierakstījāties, bet ģimenes locekļi netika atrasti. Mēģiniet vēlreiz.',
  },
  nl: {
    'settings.account.sync_try_later': 'Synchroniseren is nu niet gelukt. Probeer het zo meteen opnieuw.',
    'tasks.delete_only_pending': 'Alleen openstaande taken kunnen worden verwijderd.',
    'tasks.status_locked_closed_period': 'Status kan niet worden gewijzigd — deze maand is gesloten in de beloningsgeschiedenis',
    'tasks.recurring_delete_title': 'Verwijderen',
    'tasks.recurring_delete_only_this': 'Alleen deze taak',
    'tasks.recurring_delete_only_this_desc': 'Alleen de geselecteerde dag verwijderen',
    'tasks.recurring_delete_following': 'Deze taak en volgende',
    'tasks.recurring_delete_following_desc': 'Verwijderen vanaf deze dag',
    'tasks.recurring_delete_all': 'Alle taken',
    'tasks.recurring_delete_all_desc': 'De hele reeks verwijderen',
    'rewards.previous_reward_template': 'Vorige beloning gebruiken',
    'rewards.no_completed': 'Nog geen voltooide beloningen',
    'rewards.tabs.completed': 'Voltooid',
    'rewards.status.completed': 'Voltooid',
    'onboarding.login.error_empty_family': 'Ingelogd, maar geen gezinsleden gevonden. Probeer het opnieuw.',
  },
  pl: {
    'settings.account.sync_try_later': 'Synchronizacja nie powiodła się. Spróbuj ponownie za chwilę.',
    'tasks.delete_only_pending': 'Można usuwać tylko oczekujące zadania.',
    'tasks.status_locked_closed_period': 'Nie można zmienić statusu — ten miesiąc jest zamknięty w historii nagród',
    'tasks.recurring_delete_title': 'Usuń',
    'tasks.recurring_delete_only_this': 'Tylko to zadanie',
    'tasks.recurring_delete_only_this_desc': 'Usuń tylko wybrany dzień',
    'tasks.recurring_delete_following': 'To zadanie i kolejne',
    'tasks.recurring_delete_following_desc': 'Usuń od tego dnia',
    'tasks.recurring_delete_all': 'Wszystkie zadania',
    'tasks.recurring_delete_all_desc': 'Usuń całą serię',
    'rewards.previous_reward_template': 'Użyj poprzedniej nagrody',
    'rewards.no_completed': 'Brak ukończonych nagród',
    'rewards.tabs.completed': 'Ukończone',
    'rewards.status.completed': 'Ukończona',
    'onboarding.login.error_empty_family': 'Zalogowano, ale nie znaleziono członków rodziny. Spróbuj ponownie.',
  },
  pt: {
    'menu.title': 'Menu',
    'common.stepIndicator': 'Passo {{step}} de {{totalSteps}}',
    'common.title': 'Título',
    'users.admin': 'Administrador',
    'users.avatar': 'Avatar',
    'users.children': 'Crianças',
    'users.color': 'Cor',
    'tasks.base_task_template': 'Usar tarefa base',
    'tasks.done': 'Concluído',
    'tasks.cannot_edit_approved_period_fields': 'Não é possível alterar a data de início, recompensa ou bónus de tarefas em meses aprovados',
    'tasks.taskStatus.in_progress': 'Em progresso',
    'rewards.base_reward_template': 'Usar recompensa base',
    'rewards.status.available': 'Disponível',
    'baseRewards.special_time_with_parents': 'Momento especial a sós com os pais',
    'baseRewards.ice_cream': 'Ir tomar gelado',
    'baseRewards.playstation_30_min': 'PlayStation 30 min',
    'onboarding.login.admin': 'Administrador',
    'tasks.baseTasks.dirtyClothesToBinDescription': 'Coloque roupa suja no cesto ou na máquina de lavar',
    'tasks.delete_only_pending': 'Só podem ser eliminadas tarefas pendentes.',
    'tasks.status_locked_closed_period': 'Não é possível alterar o estado — este mês está fechado no histórico de recompensas',
    'tasks.recurring_delete_title': 'Eliminar',
    'tasks.recurring_delete_only_this': 'Só esta tarefa',
    'tasks.recurring_delete_only_this_desc': 'Eliminar apenas o dia selecionado',
    'tasks.recurring_delete_following': 'Esta tarefa e as seguintes',
    'tasks.recurring_delete_following_desc': 'Eliminar a partir deste dia',
    'tasks.recurring_delete_all': 'Todas as tarefas',
    'tasks.recurring_delete_all_desc': 'Eliminar toda a série',
    'rewards.previous_reward_template': 'Usar recompensa anterior',
    'rewards.no_completed': 'Ainda não há recompensas concluídas',
    'rewards.tabs.completed': 'Concluídas',
    'rewards.status.completed': 'Concluída',
    'onboarding.login.error_empty_family': 'Sessão iniciada, mas não foram encontrados membros da família. Tente novamente.',
  },
  ro: {
    'settings.account.sync_try_later': 'Nu s-a putut sincroniza acum. Încercați din nou peste un moment.',
    'tasks.delete_only_pending': 'Pot fi șterse doar sarcinile în așteptare.',
    'tasks.status_locked_closed_period': 'Starea nu poate fi schimbată — luna aceasta este închisă în istoricul recompenselor',
    'tasks.recurring_delete_title': 'Șterge',
    'tasks.recurring_delete_only_this': 'Doar această sarcină',
    'tasks.recurring_delete_only_this_desc': 'Șterge doar ziua selectată',
    'tasks.recurring_delete_following': 'Această sarcină și următoarele',
    'tasks.recurring_delete_following_desc': 'Șterge de la această zi înainte',
    'tasks.recurring_delete_all': 'Toate sarcinile',
    'tasks.recurring_delete_all_desc': 'Șterge întreaga serie',
    'rewards.previous_reward_template': 'Folosește recompensa anterioară',
    'rewards.no_completed': 'Nu există încă recompense finalizate',
    'rewards.tabs.completed': 'Finalizate',
    'rewards.status.completed': 'Finalizată',
    'onboarding.login.error_empty_family': 'Autentificat, dar nu s-au găsit membri ai familiei. Încercați din nou.',
  },
  sk: {
    'settings.account.sync_try_later': 'Synchronizácia teraz zlyhala. Skúste to o chvíľu znova.',
    'tasks.delete_only_pending': 'Odstrániť možno len čakajúce úlohy.',
    'tasks.status_locked_closed_period': 'Stav nemožno zmeniť — tento mesiac je uzavretý v histórii odmien',
    'tasks.recurring_delete_title': 'Odstrániť',
    'tasks.recurring_delete_only_this': 'Len túto úlohu',
    'tasks.recurring_delete_only_this_desc': 'Odstrániť len vybraný deň',
    'tasks.recurring_delete_following': 'Túto úlohu a nasledujúce',
    'tasks.recurring_delete_following_desc': 'Odstrániť od tohto dňa',
    'tasks.recurring_delete_all': 'Všetky úlohy',
    'tasks.recurring_delete_all_desc': 'Odstrániť celú sériu',
    'rewards.previous_reward_template': 'Použiť predchádzajúcu odmenu',
    'rewards.no_completed': 'Zatiaľ žiadne dokončené odmeny',
    'rewards.tabs.completed': 'Dokončené',
    'rewards.status.completed': 'Dokončené',
    'onboarding.login.error_empty_family': 'Prihlásený, ale nenašli sa členovia rodiny. Skúste to znova.',
  },
  sl: {
    'settings.account.sync_try_later': 'Sinhronizacija zdaj ni uspela. Poskusite znova čez trenutek.',
    'tasks.delete_only_pending': 'Izbrisati je mogoče samo naloge v teku.',
    'tasks.status_locked_closed_period': 'Stanja ni mogoče spremeniti — ta mesec je zaprt v zgodovini nagrad',
    'tasks.recurring_delete_title': 'Izbriši',
    'tasks.recurring_delete_only_this': 'Samo to nalogo',
    'tasks.recurring_delete_only_this_desc': 'Izbriši samo izbrani dan',
    'tasks.recurring_delete_following': 'To nalogo in naslednje',
    'tasks.recurring_delete_following_desc': 'Izbriši od tega dne naprej',
    'tasks.recurring_delete_all': 'Vse naloge',
    'tasks.recurring_delete_all_desc': 'Izbriši celotno serijo',
    'rewards.previous_reward_template': 'Uporabi prejšnjo nagrado',
    'rewards.no_completed': 'Še ni dokončanih nagrad',
    'rewards.tabs.completed': 'Dokončane',
    'rewards.status.completed': 'Dokončano',
    'onboarding.login.error_empty_family': 'Prijavljeni, vendar družinskih članov ni bilo mogoče najti. Poskusite znova.',
  },
  sv: {
    'settings.account.sync_try_later': 'Kunde inte synka just nu. Försök igen om en stund.',
    'tasks.delete_only_pending': 'Endast väntande uppgifter kan raderas.',
    'tasks.status_locked_closed_period': 'Status kan inte ändras — den här månaden är stängd i belöningshistoriken',
    'tasks.recurring_delete_title': 'Radera',
    'tasks.recurring_delete_only_this': 'Endast denna uppgift',
    'tasks.recurring_delete_only_this_desc': 'Radera endast den valda dagen',
    'tasks.recurring_delete_following': 'Denna uppgift och följande',
    'tasks.recurring_delete_following_desc': 'Radera från denna dag och framåt',
    'tasks.recurring_delete_all': 'Alla uppgifter',
    'tasks.recurring_delete_all_desc': 'Radera hela serien',
    'rewards.previous_reward_template': 'Använd tidigare belöning',
    'rewards.no_completed': 'Inga avslutade belöningar ännu',
    'rewards.tabs.completed': 'Avslutade',
    'rewards.status.completed': 'Avslutad',
    'onboarding.login.error_empty_family': 'Inloggad, men inga familjemedlemmar hittades. Försök igen.',
  },
  uk: {
    'settings.title': 'Налаштування',
    'settings.language': 'Мова',
    'settings.system_language': 'Мова системи',
    'settings.children': 'Діти',
    'settings.child_password_obligatory': 'Потрібен пароль дитини',
    'settings.show_login_name': 'Показувати ім\'я для входу',
    'settings.parents': 'Батьки',
    'settings.account.title': 'Хмарна синхронізація',
    'settings.account.signed_in': 'Увійшли',
    'settings.account.sign_in': 'Увійти',
    'settings.account.sign_out': 'Вийти',
    'settings.account.session_expired': 'Сесія закінчилася. Увійдіть знову для синхронізації.',
    'settings.account.login_screen_title': 'Увійти',
    'settings.account.login_screen_subtitle': 'Увійдіть, щоб синхронізувати родину між пристроями.',
    'users.unique_username': 'Унікальне ім\'я для входу',
    'common.loading': 'Завантаження...',
    'common.optional': 'необов\'язково',
    'more.loaded_images_empty': 'Немає завантажених фото',
    'users.edit': 'Редагувати користувача',
    'users.change_group': 'Змінити групу',
    'settings.account.system_language': 'Мова системи',
    'settings.account.sync_try_later': 'Не вдалося синхронізувати зараз. Спробуйте ще раз через хвилину.',
    'tasks.delete_only_pending': 'Видалити можна лише очікуючі завдання.',
    'tasks.status_locked_closed_period': 'Статус не можна змінити — цей місяць закрито в історії нагород',
    'tasks.recurring_delete_title': 'Видалити',
    'tasks.recurring_delete_only_this': 'Лише це завдання',
    'tasks.recurring_delete_only_this_desc': 'Видалити лише обраний день',
    'tasks.recurring_delete_following': 'Це завдання та наступні',
    'tasks.recurring_delete_following_desc': 'Видалити з цього дня',
    'tasks.recurring_delete_all': 'Усі завдання',
    'tasks.recurring_delete_all_desc': 'Видалити всю серію',
    'tasks.taskStatus.in_progress': 'В процесі',
    'rewards.edit_reward': 'Редагувати нагороду',
    'rewards.previous_reward_template': 'Використати попередню нагороду',
    'rewards.no_completed': 'Ще немає завершених нагород',
    'rewards.tabs.completed': 'Завершені',
    'rewards.status.not_enough_stars': 'Недостатньо зірок',
    'rewards.status.completed': 'Завершено',
    'onboarding.login.error_empty_family': 'Ви увійшли, але членів родини не знайдено. Спробуйте ще раз.',
  },
};

const baseTasksReferenceByLang = {
  da: 'sv',
  de: 'nl',
  el: 'fr',
  uk: 'bg',
};

const subtreeReferenceByLang = {
  da: ['sv', ['helpCenter', 'onboarding']],
  de: ['nl', ['helpCenter', 'onboarding']],
  el: ['fr', ['helpCenter', 'onboarding']],
  uk: ['bg', ['onboarding', 'settings']],
};

const capitalizeTitle = (str) => {
  if (!str || typeof str !== 'string') return str;
  const trimmed = str.trim();
  if (!trimmed) return str;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const capitalizeBaseTasks = (node) => {
  if (typeof node === 'string') return capitalizeTitle(node);
  if (!isObject(node)) return node;

  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string') {
      const isTitle = key === 'title' || (!key.endsWith('Description') && !/^subtask\d+$/.test(key) && key !== 'description');
      out[key] = isTitle ? capitalizeTitle(value) : value;
    } else if (isObject(value)) {
      const nested = {};
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        nested[nestedKey] = typeof nestedValue === 'string' && nestedKey === 'title'
          ? capitalizeTitle(nestedValue)
          : nestedValue;
      }
      out[key] = nested;
    } else {
      out[key] = value;
    }
  }
  return out;
};

const applyPatches = (json, lang) => {
  const apiErrors = apiErrorsByLang[lang];
  if (apiErrors) {
    json.apiErrors = { ...(json.apiErrors ?? {}), ...apiErrors };
  }

  const patches = sharedPatchesByLang[lang] ?? {};
  for (const [keyPath, value] of Object.entries(patches)) {
    deepSet(json, keyPath.split('.'), value);
  }
};

let englishJson = readJson(enPath);

for (const fileName of fs.readdirSync(translationsDir).filter((name) => name.endsWith('.json'))) {
  const lang = fileName.replace('.json', '');
  if (lang === 'en') {
    continue;
  }

  const filePath = path.join(translationsDir, fileName);
  let json = readJson(filePath);

  json = deepMergeMissing(json, englishJson);

  const baseTasksRef = baseTasksReferenceByLang[lang];
  if (baseTasksRef) {
    const refJson = readJson(path.join(translationsDir, `${baseTasksRef}.json`));
    if (refJson.tasks?.baseTasks) {
      copyReferenceSubtree(json, { tasks: { baseTasks: refJson.tasks.baseTasks } }, ['tasks', 'baseTasks']);
    }
  }

  const subtreeRef = subtreeReferenceByLang[lang];
  if (subtreeRef) {
    const [refLang, sections] = subtreeRef;
    const refJson = readJson(path.join(translationsDir, `${refLang}.json`));
    for (const section of sections) {
      if (refJson[section]) {
        copyReferenceSubtree(json, { [section]: refJson[section] }, [section]);
      }
    }
  }

  applyPatches(json, lang);

  if (json.tasks?.baseTasks) {
    json.tasks.baseTasks = capitalizeBaseTasks(json.tasks.baseTasks);
  }

  writeJson(filePath, json);
  console.log(`patched ${fileName}`);
}

const enJson = readJson(enPath);
if (enJson.tasks?.baseTasks?.singASong) {
  enJson.tasks.baseTasks.singASong = 'Sing a song';
}
if (enJson.tasks?.baseTasks) {
  enJson.tasks.baseTasks = capitalizeBaseTasks(enJson.tasks.baseTasks);
}
writeJson(enPath, enJson);
console.log('patched en.json');
