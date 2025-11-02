# Intro
Act as a expert senior full stack developer. You are also very skilled software architect. We will discuss architecture and design for an attendance system application, that will serve for employees to write and track down their working hours for company. Employer will have another options like tracking employees work hours on project, create reports and statistic about project efficiency, can calculate some financial statistics based on those data. I will write you some points I would like the application to have, but you can suggest some improvements along the way, so we create mini internal system for company where financial interactions between employers and employees can be done seamlessly.

Important thing is that application is multi-language. Slovak and English. In document I will mark Slovak translation of value/description shown on UI as "SK:" followed by required text. For example if you see SK: Dátum it means I want to have description or value for this case as "Date" in English and "Dátum" in Slovak language

# Available UI screens
We have 7 different UI screens that are available for different users. Possible UI screens are:
- Employee
- Data
- Overtime
- Work Report
- Work list
- Admin

## Employee
SK:Zamestnanec

Simple balances overview of vacation and selected category statistics.

- Vacation remaining days are stored in database (`Dovolenka`) and shown directly.
- Doctor/Accompaniment categories are not quota-based in DB; show year-to-date hours consumed (computed from work records).
### Displayed items
- Holiday -> remaining days (from DB)
- Doctor -> year-to-date hours (computed)
- Doctor accompaniment -> year-to-date hours (computed)
- Doctor accompaniment disabled -> year-to-date hours (computed)

## Data
Most important screen. Overview / table with work records written in database is displayed here. This is the major object on this screen. Filtering of displayed information is important. The default init filter is last 31 days. But user can extend this filter to whatever interval he likes. All work records for each user are saved in external database.

Data storage (legacy, authoritative):
- Each employee has a dedicated table named `t_{FirstNameNoDiacritics}_{LastNameNoDiacritics}` storing his/her work records.
- When a new employee is created or renamed, the respective per-user table is created/renamed and the union view `AllTData` is regenerated.
- Record columns: `ID`, `CinnostTypID`, `StartDate`, `ProjectID`, `HourTypeID`, `HourTypesID`, `StartTime`, `EndTime`, `Description`, `km`, `Lock`, `DlhodobaSC`.
- Hours are auto-computed; if EndTime < StartTime (work passes midnight), add 24 hours to the difference.

Filtering must be users friendly. There must be option to choose option - display whole month - and then whole month that is set in filter (start of the interval) is shown. For example, if the filter is set to Oct 13 2025 - Dec 12 2025 and the option display whole month is checked, then the filter is automatically changed to Oct 1 2025 - Oct 30 2025.
Editing constraints:
- Records with `Lock = true` cannot be edited.
- Records with date ≤ employee `Zamknuté k` cannot be edited.

There must be an option to add new work records here. The UI for this must be very users friendly and must have possibility to:
 - Automatically suggest next work day based on last record, but must take in consideration that weekends and National and Public holiday in Slovak republic. These days are not working days. For example, if last record is on Thursday Aug 28 2025, the next suggested work record should occur on Monday Sep 1 2025, because on Friday Aug 29 national holiday takes place and Saturday Aug 30 2025 - Sunday Aug 31 2025 is weekend.
 - There must be possibility to easily add/copy records if user works on the same task for several days -> must very users friendly and easy to understand process.
 - For the current filtered data the must be option to export this table into csv file. Pop up window with possibility to chose desired path for file to besave is displayed.
### Work record (one record of activity on a project on a specific date and time)
Most important part of attendance worklist system is record for each activity that is registered. This is the information that is shown in table on Data screen. Table must be presented in clean easy to understand way. Every single record must consist of following information:
1. *absence* -> SK:Neprítomnosť
2. *date* -> SK:Dátum
3. *project* -> SK:Projekt
4. *productivity* -> SK:Produktivita
5. *type of work* -> SK:Druh činnosti
6. *start time* -> SK:Začiatok
7. *end time* -> SK:Koniec
8. *hours* -> SK:Hodiny
9. *description* -> SK:Popis
10. *traveled distance* -> SK:Precestované km
11. *long-term business trip* -> SK:Dlohodobá ZSC
#### absence
**Possible values:**
- pritomnost -> SK:Prítomnosť
- pn -> SK:PN
- paragraf -> SK:Paragraf
- rd -> SK:Rodinné dôvody
- ocr -> SK:OČR
- sc -> SK:Služobná cesta
- nv -> SK:Náhradné voľno
- lekar -> SK:Lekár
- doprovod -> SK:Doprovod
- doprovodZp -> SK:Doprovod ZP
#### date
**Possible values:**
- Users friendly date picker, that fits the design scheme
#### project
**Possible values:**
- project id/project name from database (i.e. "P2021_034_05/Yunex_Wallonia tunnels (HQ)")
#### productivity
**Possible values:**
- produktivne -> SK:Produktívne
- produktivneZ -> SK:Produktívne zahraničie
- produktivne70 -> SK:Produktívne 70
- neproduktivne -> SK:Neproduktívne
- neproduktivneZ -> SK:Neproduktívne zahraničie
#### type of work
**Possible values:**
- rezia
- cestovanie
- studiumPodkladov
- porada
- programovanie
- navrhRiesenia
- bugFix
- pracaNaPonukach
- programovaniePlc
- programovanieScada
- programovanieHmi
- sysDoc
- pracaNaZavaznomZadani
- pracaNaTestCasoch
- ozivenieKonfiguracieStavba
- testovanieIoStavba
- ladenieAutomatikStavba
- testovanieSoZakaznikomSatSctStavba
- doprovodVyrobySopOptStavba
- fatSoZakaznikom
- firemneIt
- iot
- tunnelModel
- generator
#### start time
**Possible values:**
- time in 24h format hh:mm -> minimum allowed step for time set is 30 min -> we can set time to 8:00 or 8:30 but not to 8:15 or 8:45 or smaller iterations
#### end time
**Possible values:**
- time in 24h format hh:mm -> minimum allowed step for time set is 30 min -> we can set time to 8:00 or 8:30 but not to 8:15 or 8:45 or smaller iterations - MUST NEVER BE SMALLER THAN START TIME
#### hours
**Possible values:**
 - automatically counted sum of hours -> end time - start time -> float value
#### description
**Possible values:**
- free text
#### traveled distance
**Possible values:**
- integer -> traveled distance in kilometers [km]
#### long-term business trip
**Possible values:**
- true false statement - could be checkbox or something similar to present the state

## Overtime
Not available for freelancer account type. Automatically calculated overtime hours for **EMPLOYEE**. Calculation uses the employee type standard hours (`FondPracovnehoCasu`) as the daily threshold. If daily hours exceed this threshold, surplus is recorded. For example: If threshold is 8h and I work 8:00 - 20:00, then 4:00 overtime is saved.
*Columns for Overtime table:*
- Date -> DD.MM.YYYY
- Overtime -> hh:mm
- Type -> default value: Flexi (supported: Flexi, Neplatený nadčas, SC SK Cesta, SC Zahraničie)
- Approved by -> default value: Application
- Note -> default value: Calculated Automatically

Every value is filled automatically. But manager or employer may edit values. To reset/decline overtime, a deduction entry is added (negative overtime), with approver recorded and a mandatory note (date auto-prefilled). The overtime column shows a negative value, e.g., -03:00.

## Work Report
This is a screen with recording of working hours according to the law *$99 č. 311/2001 Z.z. Zákonník práce v z.n.p.*. There is a table with Working records and some info above the table. This screen is used for official printing of working hours as document. Information presented here is taken from database.
#### Info above the table
- Date from to of the chosen month (Oct 1 - Oct 30)
- Count of work days that employee was actually working in the given month
- Count of hours according to given filter (i.e. (Oct 1 - Oct 30))
#### Table
In this table records from database are presented according to chosen filter to present information based on the law requirement.
**Columns of table:**
- name
- Weekday -> i.e. Wednesday
- Date -> DD.MM.YYYY
- Time from -> start time of work for the day (hh:mm)
- Time till -> end time of work for the day (hh:mm)
- Count of work hours
- Reason of absence -> could be empty if no absence

### Official PDF report
Based on data from table there will be possibility to print pdf document with official form. The PDF will have 2 pages.
#### First page
It is basically just copy of *Report* screen shown to user.
#### Second page
There will be 4 tables - Summary of work hours, Work during weekend, Work during holiday, Business trips.
Each table consists of two columns -> first column is reserved for description of work hour type, second is count of hours for respective work hour type. Following rows will be part of each table:
- Prítomný v práci
- Mimo pracoviska
- Dovolenka
- Práce neschopnosť
- Ošetrenie člena rodiny
- Lekár
- Lekár doprovod
- Lekár dopr. zdrav. postih.
- Paragraf
- Spolu

You will when database architecture is finished which values from database are counted for these statistics.
In the second page at the bottom there will be two placeholders for signatures. One with description *Odovzdal* another with description *Schválil*.

## Work list
On this screen project specific hour statistics are displayed. The screen has title ("Výkaz práca za rok YYYY" -> current year is shown instead of YYYY). Next shown info is chosen month and name of the user for which work list is generated. Under those information table is shown. The table presents data taken from database. 
**Contents of the table:**
- Číslo zákazky -> order ID
- Produktívne SK -> summary of hours that matches order ID nad value from database that is also presented on **Data** screen under option for *productivity* column ("produktivne")
- Neproduktívne SK -> summary of hours that matches order ID nad value from database that is also presented on **Data** screen under option for *productivity* column ("neproduktivne")
- Produktívne Z -> summary of hours that matches order ID nad value from database that is also presented on **Data** screen under option for *productivity* column ("produktivneZ")
- Neproduktívne Z -> summary of hours that matches order ID nad value from database that is also presented on **Data** screen under option for *productivity* column ("neproduktivneZ")
- Produktívne 70 -> summary of hours that matches order ID nad value from database that is also presented on **Data** screen under option for *productivity* column ("produktivne70")
- KM
- Projekt manažér
- Podpis

### Official pdf report
Similar to UI screen Work Report, it will be available to print the current filtered page into PDF document. No additional fields just the screen from UI printed to PDF.

## Admin
This screen will be available only for Employer and Manager users. This info will be also stored and polled from database. 
### Tab Employees
**Contents of the table:**
1. **Table Header**:
    - The table includes the following columns:
        - **ID**: An identifier for each record.
        - **Meno (Name)**: The employee's first name.
        - **Priezvisko (Surname)**: The employee's surname.
        - **Titul pred (Prefix)**: Academic or professional title (e.g., Ing.).
        - **Titul za (Suffix)**: Academic or professional suffix (e.g., Bc.).
        - **Dovolenka (Vacation)**: The amount of vacation time.
        - **Nadčas v plate [h/rok] (Overtime hours/year)**: Hours worked beyond standard hours within the year. Here are overtime hours that are counted for salary
        - **Je admin (Is Admin)**: A checkbox indicating if the employee is an administrator.
        - **Typ (Type)**: The employment type (e.g., Zamestnanec, Brigádnik, Student).
        - **Celkový nadčas [h] (Total Overtime hours)**: Total overtime hours worked. Here are all overtime hours regardless if they were counted in salary or not  
        - **Posledný záznam (Last Record)**: The most recent record date.
        - **Zamknuté k (Locked until)**: A locked date after which the record cannot be modified.
2. **Data Rows**:
    - Each row represents an employee and their respective details under the columns.
    - The data is editable, allowing changes to specific fields:  *Meno (Name)*, *Priezvisko (Surname)*, *Titul pred (Prefix)*, *Titul za (Suffix)*, *Je admin (Is Admin)*, *Typ (Type)*. Other field are filled automatically.
    - Some rows contain checkboxes (e.g., **Je admin**) that can be checked or unchecked. Also comboboxes are present for *Typ (Type)* field. Pre-defined entries will be here.
    - Specific dates are displayed, such as the **Posledný záznam** and **Zamknuté k** dates, indicating when the last update occurred and when further modifications are locked.
3. **User Interaction**:
    - **Editable Fields**: The user can update specific fields. Upon updating, the system should save the changes in the database and reflect them in real-time.
    - **Checkboxes**: A checkbox toggle should allow marking if an employee is an admin. This should also update the database and have an immediate effect.
    - **Data Entry Validation**: The system should validate that only authorized personnel can modify specific columns, like **Je admin** or the **Zamknuté k** date.
    - **Locking Mechanism**: The **Zamknuté k** date shows when the record was locked. Once the locked date is reached, no further modifications should be allowed for records with date ≤ this value. Per-record `Lock` also prevents edits.
    - **Save and Lock Actions**: There should be options to save any changes made and lock the attendance records. The **Uzamknúť dochádzku ku dni (Lock attendance to date)** button sets the **Zamknuté k** field and marks affected per-user records as locked.
    - **Per-user tables**: Creating a new employee creates a per-user work table; renaming an employee renames that per-user table; the union view is regenerated.
4. **Additional Functionalities**:
    - **Data Export**: The system should allow users to export the table data in format like JSON, as seen in the top-left corner.
    - **Refresh**: Data on the page is refreshed and latest info is presented.
5. **Visual Design Considerations**:
    - The **Zamknuté k** column should be visually highlighted when the record is locked, with a clear indication of the lock status.
#### Database Structure:
The data is stored in a database with columns matching the table headers. The database should support:
- **CRUD operations** (Create, Read, Update, Delete) for modifying employee information.
- **Role-based access control (RBAC)** to ensure only authorized users can update sensitive fields (like **Je admin** and **Zamknuté k**).
- **Date constraints** to manage locked fields.
    
#### Expected Behavior:
1. **Save and Lock**: When the **Uzamknúť dochádzku ku dnu** button is clicked, the system will lock the records and prevent further modifications. Editable Date for this button is present, too 
2. **Export Data**: Users should be able to export the data inJSON format using the "Generuj json" or other similar options provided on the page.

### Tab Projects
This page serves as a central interface for managing and tracking various projects, showing important details such as project names, responsible individuals, associated countries, and project managers. Users should be able to filter, update, and navigate through projects efficiently.

#### Key Features:
1. **Data Table Overview:**  
    The page displays a table that contains multiple rows and columns. Each row corresponds to a different project, with details about the project visible in the respective columns.
2. **Columns:**
    - **ID:** An identifier for each record.
    - **Name (Meno):** A clickable column showing project names or titles, which links to detailed project views or task details.
    - **Project number (Číslo projektu):** Project number used for recognition of the project.
    - **Description (Popis):** A brief description or title of the project, outlining key objectives or scope.
    - **Active Project (Aktívny):** Checkbox if the project is currently active (maps to `AllowAssignWorkingHours`).
    - **Country (Krajina):** This field shows the country where the project is being implemented or associated with.
    - **Manager (Manažér):** The name(s) of the individual(s) managing or overseeing the project. This could be displayed as a dropdown or text field for editing.

3. **Interactivity:**
    - **Checkbox for Active Projects:** A checkbox allows users to filter or select only active projects.
    - **Sorting and Filtering:** The user can sort projects based on any column (e.g., by date, manager, or country). The page should allow filtering by manager, date, country, or project status.
    - **Dynamic Updates:** The page should allow for real-time or near-real-time updates to the project statuses, assigned hours, or other relevant data.
4. **Navigation and Details:**
    - **Multi-User Support:** The table is intended to be used by multiple users (likely project managers or team members), so user permissions must control who can edit specific data.
5. **Data Integrity and Validation:**
    - Ensure that any project information, including dates and manager assignments, is correctly validated before being saved or updated.
    - Each field should provide clear error or success messages to confirm changes.
6. **Export and Reporting:**
    - The ability to export this project list into JSON.
    - The export function should allow selecting specific columns or all data to be included in the export.


# Users
There will be 3 types of accounts. Employee, freelancer, manager, employer. Each account will have different permissions and different possible screens that will be shown-available for them.

1. **Employee:** Employee, Data, Overtime, Work Report, Work list
2. **Freelancer:** Available screens: Data, Work Report, Work list
3. **Manager:** Available screens: Employee, Data, Overtime, Work Report, Work list, Admin
4. **Employer:** Available screens: Employee, Data, Overtime, Work Report, Work list, Admin
