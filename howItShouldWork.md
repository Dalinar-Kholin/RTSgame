### plan
stworzenie RTS 1 vs 1, lub jak da radę to na więcej graczy

to musi być zaimplementowane Weppo

    Dla użytkownika bez zalogowania
    - możliwość ustawienia własnego nicku
    - przeglądanie listy pokoii w których toczy się gra
    - założenie nowego pokoju
    - dołącznie do pokoju gdzie ktoś czeka na grę
    - mozliwość zagrania w grę
    
    użytkownik zalogowany
    - tworzenie konta i logowanie się
    - wgląd w statystyki -- bardzo ogólne

na cloud Computing

    - postawienie wszystkiego na AWS
    - CI/CD z git Actions
    - połączenie z DynamoDB
    - wszystko musi działać na mikroserwisach


jak ma to działać

backend
jesteśmy połączeni socketami z obydwoma graczami

komunikacja z backendem jest robiona za pomocą raw obiektów o typach Pakietów(pakiet ataku, pakiet budowy)


ustalamy tickrate serwera na 100

co 10ms otrzymujemy od użytkownika informacje o akcjach danego gracza

co 10ms wysyłamy userowi dane o które prosi np
 - atak na dane jednostki
 - budowa danego budynku
 - odkrycie terenu

server przetrzymuje stan gry i na podstawie inputów i zapytań graczy zwraca im informacje na temat gry
server będzie validował czy dana akcja jest wykonwywalna



zakładam że przy pingu 30 to nie będzie problem - pakietu powinny być szybkie

jak działa frontend

frontend jest taktowany zegrem 10 ms do którego można rejestrować akcje
 - idź jednostką z pola \[0,0] na pole \[5,5] akcją jest co powiedźmy sekundę przemieścić w stronę docelową a w przypadku dojścia do celu wyrejestrować akcje
 - każdy cykl zegara będzie przekazywał dane serverowi i odbierał dane od servera

jak handlować informacjami graczy??? 