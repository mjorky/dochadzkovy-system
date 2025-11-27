# Analýza Funkcionality Nadčasov (Overtime)

Tento dokument detailne popisuje funkcionalitu modulu pre správu nadčasov v aplikácii `dochadzka`. Cieľom je poskytnúť kompletný prehľad pre replikáciu funkcionality.

## 1. Prehľad

Modul slúži na:
1.  **Zobrazenie sumáru nadčasov** pre používateľa rozdelených podľa typu (Flexi, Cesta, Zahraničie, Neplatené).
2.  **Manuálnu úpravu** (korekciu) nadčasov – možnosť pripočítať alebo odpočítať hodiny k určitému dátumu s poznámkou.
3.  **Automatický výpočet** nadčasov na základe dennej dochádzky (realizované v `MainWindow`).

## 2. Databázová Vrstva (PostgreSQL)

Dáta sú perzistentne uložené v PostgreSQL databáze.

### 2.1 Tabuľky

#### `Nadcasy`
Hlavná tabuľka ukladajúca jednotlivé záznamy o nadčasoch.
*   **ZamestnanecID** (`bigint`): FK na používateľa.
*   **Datum** (`date`): Dátum, ku ktorému sa nadčas viaže.
*   **Nadcas** (`interval`): Hodnota času (môže byť kladná aj záporná).
*   **Typ** (`varchar`): Typ nadčasu (FK na `NadcasyTyp`).
*   **Schvalil** (`bigint`, nullable): ID používateľa, ktorý nadčas schválil/upravil (1 = Automatický výpočet).
*   **Poznamka** (`text`, nullable): Textová poznámka.
*   **Odpocet** (`boolean`): Príznak, či ide o manuálny odpočet/úpravu (používa sa v `NadcasWindow` na rozlíšenie manuálnych zásahov).

#### `NadcasyTyp`
Číselník typov nadčasov.
*   **TypNadcasu** (`varchar`): PK (napr. 'Flexi', 'SCSKCesta', 'SCZahranicie', 'Neplateny').

### 2.2 Metódy prístupu k dátam (`PostgreSQLobjects.cs`)

Trieda `PostgreSQL` obsahuje metódy na prácu s týmito tabuľkami:

*   **`NadcasSumGet(userID, datumOd, datumDo, nadcasTyp)`**:
    *   Vykonáva SQL agregáciu: `SELECT SUM("Nadcas") ... GROUP BY "Typ"`.
    *   Vráti celkový počet hodín (`double`) pre daný typ a obdobie.
*   **`NadcasSet(...)`**:
    *   Vkladá nový záznam: `INSERT INTO "Nadcasy" ...`.
    *   Prijíma parametre ako ID, dátum, hodnota (konvertovaná na `TimeSpan`), typ, schválil, poznámka, odpočet.
    *   Rieši duplicitu (ak už záznam existuje, vráti chybu/false, ktorú logika aplikácie následne rieši cez Update).
*   **`NadcasUpdate(...)`**:
    *   Aktualizuje existujúci záznam.
    *   **Dôležité:** Ak je nová hodnota nadčasu **0**, záznam z databázy **vymaže** (`DELETE`). Inak vykoná `UPDATE`.
*   **`NadcasRemoveBulk(...)`**:
    *   Hromadné mazanie automaticky generovaných nadčasov (`Schvalil = 1`, `Odpocet = false`) pre zoznam dátumov. Používa sa pri prepočte dochádzky, aby sa odstránili staré vypočítané hodnoty pred zápisom nových.

## 3. Používateľské Rozhranie (UI) - `NadcasWindow.xaml`

Okno je rozdelené na dve hlavné časti:

### 3.1 Tabuľka sumárov (`DataGrid`)
*   Zobrazuje zoznam typov nadčasov a ich aktuálny sumár od začiatku roka.
*   **Zdroj dát:** Metóda `NacitajNadcas()` v kóde na pozadí (`.cs`).
*   **Stĺpce:**
    *   `Typ nadčasu` (napr. Flexi).
    *   `Sumár [h]` (formátované číslo na 1 desatinné miesto).

### 3.2 Panel úprav (`GroupBox`)
*   Slúži na manuálnu korekciu vybraného typu nadčasu.
*   **Prvky:**
    *   **Rádio buttony:** "Odpočítať" / "Pripočítať" (určujú znamienko operácie).
    *   **Input:** TextBox pre zadanie počtu hodín (`txtOdpocitaj`).
    *   **Dátum:** DatePicker pre výber dňa, ku ktorému sa úprava zapíše (`dpUpravaNadcasuDatum`).
    *   **Poznámka:** TextBox pre dôvod úpravy.
    *   **Tlačidlo:** "Odpočítaj" (alebo "Pripočítaj" podľa kontextu) spustí akciu.
*   **Interaktivita:**
    *   Po kliknutí na riadok v tabuľke sa automaticky predvyplní formulár.
    *   Ak je aktuálny sumár kladný, predvolí sa "Odpočítať". Ak je záporný, "Pripočítať".
    *   Zobrazuje sa predpokladaný zostatok po úprave v reálnom čase (`lblZostatokNadcasu`).

## 4. Aplikačná Logika

### 4.1 Načítanie dát (`NadcasWindow.xaml.cs`)
Pri otvorení okna (`Loaded` event) alebo po uložení:
1.  Zavolá sa `NacitajNadcas()`.
2.  Vytvorí sa zoznam `NadcasSumare` (List n-tíc `Tuple<string, double>`).
3.  Pre každý typ (`Flexi`, `SCSKCesta`, `SCZahranicie`, `Neplateny`) sa zavolá DB metóda `NadcasSumGet` pre obdobie **od 1.1. aktuálneho roka do dnešného dátumu**.
4.  Dáta sa nastavia ako `ItemsSource` pre DataGrid.

### 4.2 Uloženie úpravy (`btnOdpocitaj_Click`)
1.  Načíta sa hodnota z inputu. Aplikuje sa znamienko podľa rádio buttonu (odpočítať = záporné číslo).
2.  Skontroluje sa, či pre daný deň, užívateľa, typ a príznak `Odpocet=true` už existuje záznam v DB.
    *   **SQL:** `SELECT * FROM "Nadcasy" WHERE ... AND "Odpocet" = true`
3.  **Ak neexistuje:** Zavolá sa `NadcasSet` (INSERT).
4.  **Ak existuje:**
    *   Načíta sa stará hodnota.
    *   Nová hodnota sa pripočíta k starej.
    *   Pôvodná poznámka sa spojí s novou.
    *   Zavolá sa `NadcasUpdate` (UPDATE).
5.  Po úspešnom uložení sa tabuľka sumárov obnoví (`NacitajNadcas()`).

### 4.3 Automatický výpočet (`MainWindow.xaml.cs`)
Táto logika beží mimo okna `NadcasWindow`, zvyčajne pri spracovaní denného výkazu:
1.  Vypočíta sa rozdiel odpracovaného času voči fondu (zvyčajne 8h).
2.  Rozlišujú sa typy:
    *   Cesta v rámci SR -> `SCSKCesta`.
    *   Zahraničná cesta -> `SCZahranicie`.
    *   Bežný nadčas -> `Flexi`.
3.  Pred uložením sa pre daný deň vymažú staré automatické záznamy (`NadcasRemoveBulk`).
4.  Nové hodnoty sa zapíšu do DB (`NadcasSet` / `NadcasUpdate`) s príznakom `Odpocet=false` a `Schvalil=1` (systémový užívateľ).

## 5. Ako replikovať (Krok za krokom)

1.  **Databáza:**
    *   Vytvorte tabuľku `NadcasyTyp` a naplňte ju hodnotami.
    *   Vytvorte tabuľku `Nadcasy` s cudzím kľúčom na `NadcasyTyp` a `Users`.
2.  **Backend (C#):**
    *   Implementujte metódy `NadcasSumGet`, `NadcasSet`, `NadcasUpdate` využívajúce `Npgsql` (alebo iný driver).
    *   Dbajte na logiku "nulový nadčas = DELETE".
3.  **Frontend (XAML):**
    *   Vytvorte okno s DataGridom a formulárom.
    *   DataGrid stĺpce nabindujte na vlastnosti objektu (napr. `Item1` pre názov, `Item2` pre hodnotu).
4.  **Frontend Logic (Code-behind):**
    *   V konštruktore inicializujte spojenie s DB a ID užívateľa.
    *   Metóda `Refresh` na stiahnutie sumárov cez SQL `SUM`.
    *   Event handler na tlačidlo "Uložiť", ktorý vykoná logiku "Insert or Update" popísanú v bode 4.2.

Tento systém umožňuje flexibilnú evidenciu, kde sa miešajú automaticky vypočítané denné nadčasy s manuálnymi mesačnými/ročným korekciami.
