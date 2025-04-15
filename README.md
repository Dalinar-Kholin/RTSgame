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

przy połączeniu się z serwerem otwieramy połączenie webSocket, na razie nie jesteśmy połączeni z żadnym graczem

pobieramy aktywne pokoje gier, do których możemy wejść, jednocześnie łącząc się webSocketem z użytkownikiem w tym pokoju, możemy wysyłać sobie IRT wiadomości tekstowe

każdy z graczy wysyła pakiet start Game, gra się zaczyna

przesyłanie danych gry między frontendem a backendem odbywa się za pomocą webSocket, gdzie dane przesyłane są w formie binarnej, w predefiniowanych Ramkach danych
nazywanych Frame i zdefiniowanych w katalogu ActionFrame

serwer nie ingeruje w przesyłane dane, ufamy użytkownikom że nie oszukują


gracz przesyła dane gdy coś się zmini i odbiera dane gdy coś się zmieni - zminimalizowane transferu danych po łączu


jak działa frontend

gra chodzi na canvas gdzie rysowana jest aktualna część mapy gry

wszystkie wydarzenia w grze i całym frontendzdie przechodzą przez EventAggregatora który jest singletonem
gra reaguje na zachowania graczy emitując spredefiniowane eventy, które następnie odbierane są przez zarejestrowanych słuchaczy danego eventu

niestety TypeScript nie pozwala na składnie EA jak w C# gdzie już klasa wydarzenia może być mapowana na słuchacza
więc musimy stworzyć enumerator eventów


