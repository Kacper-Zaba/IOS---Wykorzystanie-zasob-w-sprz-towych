# IOS---Wykorzystanie-zasob-w-sprz-towych
# Dokumentacja projektu: Pogoda "Tu i Teraz"

### 1. Opis celu aplikacji
Głównym celem miniaplikacji jest dostarczenie użytkownikowi natychmiastowej informacji o aktualnej temperaturze i warunkach atmosferycznych panujących w jego fizycznej lokalizacji oraz prezentacja godzinowej prognozy opadów i temperatur na najbliższą dobę.

### 2. Opis wykorzystanych danych z urządzenia
Projekt w pełni wykorzystuje sprzętowy moduł GPS urządzenia mobilnego za pośrednictwem biblioteki SDK Expo (`expo-location`). Pobierane są precyzyjne współrzędne geograficzne (szerokość geograficzna `latitude` oraz długość `longitude`) po uprzednim uzyskaniu formalnej zgody od użytkownika.

### 3. Opis wykorzystanych bibliotek i API
* **expo-location** – natywny moduł do zarządzania uprawnieniami systemowymi i pobierania koordinatów GPS.
* **Open-Meteo API** – publiczny, otwarty serwis meteorologiczny wykorzystujący współrzędne geograficzne w celu dynamicznego wyliczenia modeli pogodowych (zarówno stan aktualny, jak i tablice danych asynchronicznych `hourly`).

### 4. Opis przepływu danych w aplikacji
1. Uruchomienie aplikacji -> Wywołanie `useEffect`.
2. Żądanie przyznania uprawnień lokalizacji -> W przypadku odmowy następuje przerwanie i wyświetlenie komunikatu błędu.
3. Pobranie współrzędnych z modułu lokalizacji -> Zapis do stanu `locationCoords`.
4. Wykonanie asynchronicznego zapytania sieciowego `fetch()` (metoda GET) do API Open-Meteo przy użyciu pozyskanych współrzędnych.
5. Parsowanie strumienia JSON -> Filtrowanie tablic asynchronicznych (pobranie pierwszych 24 godzin z sekcji godzinowej prognozy).
6. Przekazanie przetworzonej tablicy do komponentu `FlatList` oraz renderowanie interfejsu.

### 5. Lista ograniczeń i problemów napotkanych podczas realizacji
Największym wyzwaniem była asynchroniczność i kolejność wykonywania zadań. API pogodowe nie mogło zostać wywołane przed ostatecznym zakończeniem pobierania danych GPS, ponieważ groziłoby to wysłaniem wartości `null` lub `undefined`. Problem ten rozwiązałem poprzez zastosowanie operatorów `await` wymuszających synchroniczne oczekiwanie na pobranie pozycji satelitarnej, a dopiero potem otwarcie połączenia sieciowego.
