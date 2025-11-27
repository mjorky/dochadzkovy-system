using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Data;
using System.IO;
using System.Linq;
using System.Printing;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Microsoft.Win32;
using Serilog;
using static System.Runtime.InteropServices.JavaScript.JSType;

//pre automaticke generovanie verzie
//[assembly: AssemblyVersion("1.0.*")]

namespace dochadzka
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        #region Options
        private class DochadzkaOptions
        {
            public long User { get; set; } = 0;
            public DateTime ReminderCancelled { get; set; } = DateTime.MinValue;
            public string CSVDirectory { get; set; } = string.Empty;
        }
        #endregion

        #region Constants
        private const string constOptionsFileName = "dochadzka.json";

        private const string constMessageErrorCaption = "CHYBA";
        private const string constMessageWarningCaption = "UPOZORNENIE";
        private const string constMessageQuestionCaption = "OTÁZKA";

        private const string constAno = "Áno";

        /// <summary>
        /// na nevyhnutne potrebný čas, najviac na sedem dní v kalendárnom roku, ak vyšetrenie alebo ošetrenie nebolo možné vykonať mimo pracovného času;
        /// </summary>
        private const int constMaxLekar = 7 * 8;
        /// <summary>
        /// na sprevádzanie rodinného príslušníka do zdravotníckeho zariadenia na vyšetrenie alebo ošetrenie pri náhlom ochorení alebo úraze a na vopred určené vyšetrenie, ošetrenie alebo liečenie;
        /// pracovné voľno s náhradou mzdy sa poskytne len jednému z rodinných príslušníkov na nevyhnutne potrebný čas, najviac na sedem dní v kalendárnom roku, ak bolo sprevádzanie nevyhnutné a uvedené úkony nebolo možné vykonať mimo pracovného času;
        /// </summary>
        private const int constMaxDoprovod = 7 * 8;
        /// <summary>
        /// na sprevádzanie zdravotne postihnutého dieťaťa do zariadenia sociálnej starostlivosti alebo špeciálnej školy;
        /// pracovné voľno s náhradou mzdy sa poskytne len jednému z rodinných príslušníkov na nevyhnutne potrebný čas, najviac na desať dní v kalendárnom roku
        /// </summary>
        private const int constMaxDoprovodZP = 10 * 8;

        private const int constReminderDays = 14;
        #endregion

        #region ObservableCollections - koli DataGrid
        public ObservableCollection<string> CasoveIntervaly { get; set; }
        public ObservableCollection<VykazDataObject> VykazData { get; set; }
        public ObservableCollection<SumarHodinObject> SumarHodin { get; set; }
        public ObservableCollection<VikendySviatkyObject> Vikendy { get; set; }
        public ObservableCollection<VikendySviatkyObject> Sviatky { get; set; }
        public ObservableCollection<VikendySviatkyObject> Sluzobky { get; set; }
        #endregion

        private readonly string AppPath;
        private readonly Version AppVersion;
        private readonly DochadzkaOptions Options = new();
        PostgreSQL myPostgreSQL = new();
        DB_User CurrentUser;
        DB_User ShownUser;
        //ObservableCollection<DB_t_User> CurrentDataGridData = new();
        Grid ActualVisiblePrintGridPage;
        TabItem LastActualMainTabItem;
        TabItem LastActualAdminTabItem;

        string PovodneMeno;
        string PovodnePriezvisko;

        Brush DochadzkaBrush;
        Thickness DochadzkaThickness;

        string StartTimeValue;
        List<Tuple<string, double>> NadcasSums = new List<Tuple<string, double>>();

        public MainWindow()
        {
            CasoveIntervaly = new() {
                "00:00", "00:30",
                "01:00", "01:30",
                "02:00", "02:30",
                "03:00", "03:30",
                "04:00", "04:30",
                "05:00", "05:30",
                "06:00", "06:30",
                "07:00", "07:30",
                "08:00", "08:30",
                "09:00", "09:30",
                "10:00", "10:30",
                "11:00", "11:30",
                "12:00", "12:30",
                "13:00", "13:30",
                "14:00", "14:30",
                "15:00", "15:30",
                "16:00", "16:30",
                "17:00", "17:30",
                "18:00", "18:30",
                "19:00", "19:30",
                "20:00", "20:30",
                "21:00", "21:30",
                "22:00", "22:30",
                "23:00", "23:30"
            };

            //AppPath = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            AppPath = Environment.CurrentDirectory;
            AppVersion = Assembly.GetEntryAssembly().GetName().Version;

            InitializeComponent();

            DochadzkaBrush = dgDochadzka.BorderBrush;
            DochadzkaThickness = dgDochadzka.BorderThickness;

            Log.Logger = new LoggerConfiguration()
#if DEBUG
                .MinimumLevel.Debug()
#elif RELEASE
                .MinimumLevel.Information()
#endif
                .WriteTo.File("logs/log_.txt", rollingInterval: RollingInterval.Day)
                .CreateLogger();

            Version versionFromDB = GetVersionFromDB();
            Log.Information(Environment.NewLine);
            Log.Information("--------------------------------------------------------------------------------");
            Log.Information($" Current versions:");
            Log.Information($"       OS: {Environment.OSVersion.Version}");
            Log.Information($"      App: {AppVersion}");
            Log.Debug($"       DB: {versionFromDB}");
            Log.Debug($"     .NET: {Environment.Version}");
            Log.Information("--------------------------------------------------------------------------------");

            if (!File.Exists(constOptionsFileName))
                //using (FileStream stream = new FileStream(constOptionsFileName, FileMode.CreateNew))
                //    JsonSerializer.Serialize(stream, new DochadzkaOptions());
                SaveUserOptions();

            using (FileStream stream = new(constOptionsFileName, FileMode.Open))
            {
                try
                {
                    Options = (DochadzkaOptions)JsonSerializer.Deserialize(stream, typeof(DochadzkaOptions));
                }
                catch (JsonException ex)
                {
                    Log.Error(ex, "MainWindow()");
                    Close();
                    return;
                }
            }

#if RELEASE
            if (AppVersion < versionFromDB)
            {
                MessageBox.Show($"Je novšia verzia! ({versionFromDB})", constMessageWarningCaption, MessageBoxButton.OK, MessageBoxImage.Information);
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "https://emstsro.sharepoint.com/:f:/r/sites/EMSTInterne242/Zdielane%20dokumenty/General/Evidencia%20cinnosti/Dochadzka%20Source?csf=1&web=1&e=qqmwPo",

                    UseShellExecute = true
                });
                Close();
                return;
            }

#endif
            if ((CurrentUser = myPostgreSQL.DB_UserGet(Options.User)) == null)
            {
                Log.Warning("Aktuálny uživateľ neexistuje v DB ({User})", Options.User);
                MessageBox.Show(this, $"Aktuálny uživateľ neexistuje v DB ({Options.User})", constMessageErrorCaption, MessageBoxButton.OK, MessageBoxImage.Error);
                Close();
            }
            else
                ShownUser = CurrentUser;
        }

        #region User methods
        private bool IsReminderTime(out DateTime currentQuarter)
        {
            DateTime now = DateTime.Now.Date;
            int y = now.Year;
            int m = now.Quarter() * 3 + 1;
            if (m > 12)
            {
                y++;
                m -= 12;
            }
            currentQuarter = new DateTime(y, m, 1).AddDays(-1);

            return (Options.ReminderCancelled == DateTime.MinValue || Options.ReminderCancelled.Quarter() != now.Quarter())
                && now.AddDays(constReminderDays) > currentQuarter;
        }

        private void SaveUserOptions(DateTime? reminderCancel = null, DochadzkaOptions? otherOptions = null)
        {
            if (reminderCancel != null)
                Options.ReminderCancelled = reminderCancel.Value;
            if (otherOptions is null)
                otherOptions = Options;

            using (FileStream stream = new FileStream(constOptionsFileName, FileMode.Create))
                JsonSerializer.Serialize(stream, otherOptions);
        }

        private bool IsFullMonth(DateTime dateFrom, DateTime dateTo)
        {
            if (dateFrom.Day != 1)
                return false;

            if (dateTo.AddDays(1).Day != 1)
                return false;


            return true;
        }

        private void ProcessVykaz(bool zakonny, TimeSpan? startFromHour = null)
        {
            if (startFromHour is null)
                startFromHour = TimeSpan.FromHours(14);

            DateTime dateFrom = dpDateFrom.SelectedDate.Value;
            DateTime dateTo = dpDateTo.SelectedDate.Value;
            int workingDays = dateFrom.GetWorkingDays(dateTo.AddDays(1), GetHolidays(dateFrom, dateTo));

            txtVykazUser.Text = GetFullUserName(ShownUser);
            lblEvidencia.Content =
                (IsFullMonth(dateFrom, dateTo) ?
                    $"Evidencia za mesiac: \t{dateFrom.Month}/{dateFrom.Year} \t\t " :
                    $"Evidencia: {dateFrom:dd.MM.yyyy}-{dateTo:dd.MM.yyyy} \t"
                    ) +
                $"Prac. dní: \t{workingDays}\t" +
                //$"Hod.: \t{workingDays * CurrentUser.FondPracovnehoCasu}";
                $"Hod.: \t{workingDays * ShownUser.FondPracovnehoCasu}";

            List<DateTime> nahradneVolna;
            FillVykazData(myPostgreSQL.GetDataTable(
                $"SELECT " +
                $"\"CinnostTyp\".\"Alias\", " +
                $"\"StartDate\", " +
                $"\"StartTime\", " +
                //$"(\"EndTime\" - \"StartTime\") as \"Odpracovane\", " +
                $"CASE WHEN \"EndTime\" = '00:00:00' THEN '24:00:00' - \"StartTime\" ELSE \"EndTime\" - \"StartTime\" END AS \"Odpracovane\", " +
                $"\"HourTypes\".\"HourType\" = 'Cestovanie' as \"Cestovanie\", " +
                $"\"HourType\".\"HourType\", " +
                $"\"Projects\".\"CountryCode\" = 'SVK' as \"Slovensko\", " +
                $"\"Lock\" " +
                //$"FROM \"{CurrentUser.TableFullName}\" " +
                $"FROM \"{ShownUser.TableFullName}\" " +
                $"LEFT JOIN " +
                $"\"CinnostTyp\" ON " +
                $"\"CinnostTyp\".\"ID\" = \"CinnostTypID\" " +
                $"LEFT JOIN \"HourTypes\" ON \"HourTypes\".\"ID\" = \"HourTypesID\" " +
                $"LEFT JOIN \"HourType\" ON \"HourType\".\"ID\" = \"HourTypeID\" " +
                $"LEFT JOIN \"Projects\" ON \"Projects\".\"ID\" = \"ProjectID\" " +
                $"WHERE " +
                $"\"StartDate\" >= TO_DATE('{dateFrom:dd.MM.yyyy}','DD.MM.YYYY') AND \"StartDate\" <= TO_DATE('{dateTo:dd.MM.yyyy}','DD.MM.YYYY') " +
                $"ORDER BY " +
                $"\"StartDate\" ASC, " +
                $"\"StartTime\" ASC "
                ),
                out nahradneVolna);

            if (zakonny)
            {
                //double maxFondPracovnehoCasu = workingDays * CurrentUser.FondPracovnehoCasu;
                double maxFondPracovnehoCasu = workingDays * ShownUser.FondPracovnehoCasu;
                double realFondPracovnehoCasu = VykazData.Sum(vd => vd.Odpracovane);

                List<DateTime> holidays = GetHolidays(dateFrom, dateTo);
                ObservableCollection<VykazDataObject> novyVykazData = new();
                string fullName = GetFullUserName(ShownUser);
                int daysTotalCounter = 0;
                double odpracovane;
                bool prepocitavam = realFondPracovnehoCasu < maxFondPracovnehoCasu;
                int currentComputedWeek;
                //int realFondToZDays = (int)realFondPracovnehoCasu / CurrentUser.FondPracovnehoCasu + 1;
                int realFondToZDays = (int)realFondPracovnehoCasu / ShownUser.FondPracovnehoCasu + 1;
                if (realFondToZDays == 0) realFondToZDays = 1;
                int pocetWTyzdnov = workingDays / 5;
                if (pocetWTyzdnov == 0) pocetWTyzdnov = 1;
                int pocetZDniNaTyzden = realFondToZDays / pocetWTyzdnov;
                if (pocetZDniNaTyzden == 0) pocetZDniNaTyzden = 1;
                int[] pocetZapisanychZDniNaTyzden = new int[pocetWTyzdnov + 1];//+1 koli pripadnemu neuplnemu tyzdnu navyse

                for (DateTime date = dateFrom; date <= dateTo; date = date.AddDays(1))
                {
                    daysTotalCounter++;
                    currentComputedWeek = daysTotalCounter / 7;

                    if (date.DayOfWeek == DayOfWeek.Sunday || date.DayOfWeek == DayOfWeek.Saturday || holidays.Contains(date))
                        continue;

                    if (prepocitavam)
                    {
                        //treba rovnomerne po tyzdnoch vkladat pracovne dni
                        if (pocetZapisanychZDniNaTyzden[currentComputedWeek] < pocetZDniNaTyzden)
                            pocetZapisanychZDniNaTyzden[currentComputedWeek]++;
                        else
                            continue;

                        //if (realFondPracovnehoCasu > CurrentUser.FondPracovnehoCasu)
                        if (realFondPracovnehoCasu > ShownUser.FondPracovnehoCasu)
                            //odpracovane = CurrentUser.FondPracovnehoCasu;
                            odpracovane = ShownUser.FondPracovnehoCasu;
                        else //posledny den nemusi byt cely fond pracovneho casu
                            odpracovane = realFondPracovnehoCasu;
                        realFondPracovnehoCasu -= odpracovane;
                    }
                    else
                    {
                        //neriesim nic, len pre vsetky workingDays dam CurrentUser.FondPracovnehoCasu
                        //odpracovane = CurrentUser.FondPracovnehoCasu;
                        odpracovane = ShownUser.FondPracovnehoCasu;
                    }

                    novyVykazData.Add(
                        new()
                        {
                            Meno = fullName,
                            Datum = date,
                            Den = date.DayOfWeek.ToSK(),
                            Dovod = string.Empty,
                            Od = startFromHour.Value,
                            Odpracovane = odpracovane
                        });

                    if (realFondPracovnehoCasu <= 0)
                        break;
                }

                VykazData = novyVykazData;
            }
            else
            {
                if (VykazData.Count > 0)
                    VykazData = UpravVykazData(dateFrom, dateTo, nahradneVolna);
            }
            dgVykaz.ItemsSource = VykazData;

            //if (CurrentUser.Typ == ZamestnanecTyp.Zamestnanec)
            if (ShownUser.Typ == ZamestnanecTyp.Zamestnanec)
            {
                //double nadcasAktualny = myPostgreSQL.NadcasGet(Options.User, dateFrom, dateTo);
                double nadcasAktualny = myPostgreSQL.NadcasGet(ShownUser.ID, dateFrom, dateTo);
                DateTime MinulyMesiacTo = dateTo.AddDays(-dateTo.Day);
                //double nadcasMinMesiac = myPostgreSQL.NadcasGet(Options.User, MinulyMesiacTo.AddDays(1).AddMonths(-1), MinulyMesiacTo);
                double nadcasMinMesiac = myPostgreSQL.NadcasGet(ShownUser.ID, MinulyMesiacTo.AddDays(1).AddMonths(-1), MinulyMesiacTo);
                //double nadcasZaRok = myPostgreSQL.NadcasGet(Options.User, new DateTime(dateTo.Year, 1, 1), new DateTime(dateTo.Year, 12, 31), true);
                double nadcasZaRok = myPostgreSQL.NadcasGet(ShownUser.ID, new DateTime(dateTo.Year, 1, 1), new DateTime(dateTo.Year, 12, 31), true);
                lblVNadcas.Content = $"Flexi nadcas:  za výkaz: {nadcasAktualny:N2}h / za minulý mesiac: {nadcasMinMesiac:N2}h / za rok {dateTo.Year}: {nadcasZaRok:N2}h";
                lblVNadcas.Visibility = Visibility.Visible;
            }
            else
                lblVNadcas.Visibility = Visibility.Hidden;

            if (VykazData.Count > 0)
                FillSumar();

            double rozdiel = 0;
            //if (CurrentUser.Typ == ZamestnanecTyp.Zamestnanec && (rozdiel = VykazData.Sum(vd => vd.Odpracovane) - workingDays * CurrentUser.FondPracovnehoCasu) < 0)
            if (ShownUser.Typ == ZamestnanecTyp.Zamestnanec && (rozdiel = VykazData.Sum(vd => vd.Odpracovane) - workingDays * ShownUser.FondPracovnehoCasu) < 0)
                MessageBox.Show(this, $"Nenaplnený fond pracovného času! ({rozdiel:#.##}h)", constMessageErrorCaption, MessageBoxButton.OK, MessageBoxImage.Error);

        }
        private Version GetVersionFromDB()
        {
            DataTable dataTable = myPostgreSQL.GetDataTable("SELECT * FROM \"Verzia\"");

            return new Version(
                (int)dataTable.Rows[0]["Major"],
                (int)dataTable.Rows[0]["Minor"],
                (int)dataTable.Rows[0]["Build"],
                (int)dataTable.Rows[0]["Revision"]);
        }
        private List<WorklistObject> UpravWorklistData(DataTable table)
        {
            List<WorklistObject> ret = new();

            foreach (DataRow row in table.Rows)
            {
                WorklistObject wlo = new(row);
                WorklistObject? found;
                if ((found = ret.Find(w => w.CisloZakazky == wlo.CisloZakazky)) != null)
                {
                    if (wlo.Produktivne > 0)
                        found.Produktivne += wlo.Produktivne;
                    if (wlo.Neproduktivne > 0)
                        found.Neproduktivne += wlo.Neproduktivne;
                    if (wlo.NeproduktivneZ > 0)
                        found.NeproduktivneZ += wlo.NeproduktivneZ;
                    if (wlo.ProduktivneZ > 0)
                        found.ProduktivneZ += wlo.ProduktivneZ;
                    if (wlo.Produktivne70 > 0)
                        found.Produktivne70 += wlo.Produktivne70;
                    if (wlo.KM > 0)
                        found.KM += wlo.KM;
                }
                else
                    ret.Add(wlo);
            }

            return ret;
        }
        private bool IsDateInLockInterval(DateTime date)
        {
            return date <= myPostgreSQL.ZamknuteKGet(ShownUser.ID);
        }
        private bool IsDataRowOK(DataRow dataRow, DataRowType dataRowType)
        {
            try
            {
                switch (dataRowType)
                {
                    case DataRowType.DBUser:
                        DB_User u = new(dataRow);
                        break;

                    case DataRowType.DBtUser:
                        DB_t_User t = new(dataRow);
                        if (t.StartTime >= t.EndTime && t.EndTime != TimeSpan.FromSeconds(0))
                        {
                            MessageBox.Show("'StartTime' musí byť menší ako 'EndTime'.", constMessageWarningCaption);
                            return false;
                        }
                        if (IsDateInLockInterval(t.StartDate))
                        {
                            MessageBox.Show("'StartDate' je v už uzamknutom intervale.");
                            return false;
                        }
                        //ak sa snazim zapisat nieco ine ako pracu/SC na vikend alebo sviatok
                        if ((t.CinnostTypID != 1 && t.CinnostTypID != 6) && (t.StartDate.DayOfWeek == DayOfWeek.Saturday || t.StartDate.DayOfWeek == DayOfWeek.Sunday || GetHolidays(t.StartDate).Count > 0))
                        {
                            MessageBox.Show("Zadaný dátum nie je pracovný deň.");
                            return false;
                        }
                        //if (!myPostgreSQL.GetDataTable($"SELECT \"ID\" FROM \"ActiveProjects\"")
                        //    .Rows.Cast<DataRow>().Select(r => (long)r[0]).ToList()
                        //    .Any(id => id == t.ProjectID))
                        //{
                        //    MessageBox.Show("Zadaný projekt nie je aktívny.");
                        //    return false;
                        //}
                        break;

                    case DataRowType.DBProjekt:
                        DB_Projekt p = new(dataRow);
                        break;

                    default:
                        Log.Warning($"IsDataRowOK: {dataRowType}");
                        return false;
                }

                return true;
            }
            catch
            {
                switch (dataRowType)
                {
                    case DataRowType.DBUser:
                        MessageBox.Show("'Meno', 'Priezvisko', 'Je admin' a 'Typ' musia byť zadané.", constMessageWarningCaption);
                        break;

                    case DataRowType.DBtUser:
                        MessageBox.Show("'CinnostTyp', 'StartDate', 'StartTime' a 'EndTime' musia byť zadané.", constMessageWarningCaption);
                        break;

                    case DataRowType.DBProjekt:
                        MessageBox.Show("Všetký stĺpce musia byť zadané.", constMessageWarningCaption);
                        break;
                }

                return false;
            }
        }

        #region NacitajCSV
        private class CinnostTypObject
        {
            public readonly long ID;
            public readonly string Typ;
            public readonly string Alias;

            public CinnostTypObject(long id, string typ, string alias)
            {
                ID = id;
                Typ = typ;
                Alias = alias;
            }
        }
        private class ProjectsObject
        {
            public readonly long ID;
            public readonly string Name;
            public readonly string Number;
            public readonly string Description;
            public readonly bool AllowAWH;
            public readonly string Country;
            public readonly long Manazer;

            public ProjectsObject(long iD, string name, string number, string description, bool allowAWH, string country, long manazer)
            {
                ID = iD;
                Name = name;
                Number = number;
                Description = description;
                AllowAWH = allowAWH;
                Country = country;
                Manazer = manazer;
            }
        }
        private class HourTypeSObject
        {
            public readonly long ID;
            public readonly string HourType;

            public HourTypeSObject(long iD, string hourType)
            {
                ID = iD;
                HourType = hourType;
            }
        }
        private void NacitajCSV(string fileName, string userMeno, string userPriezvisko, bool vymazatDataPredPridanim, long userID, ZamestnanecTyp userType)
        {

            List<CinnostTypObject> CinnostTypIDs = myPostgreSQL.GetDataTable("SELECT * FROM \"CinnostTyp\" ORDER BY \"ID\" ASC")
                .Rows.Cast<DataRow>().Select(r => new CinnostTypObject((long)r[0], (string)r[1], (string)r[2])).ToList();
            List<ProjectsObject> ProjectIDs = myPostgreSQL.GetDataTable($"SELECT * FROM \"{Application.Current.Resources["TABLE_PROJEKT"]}\" ORDER BY \"ID\" ASC")
                .Rows.Cast<DataRow>().Select(r => new ProjectsObject((long)r[0], (string)r[1], (string)r[2], (string)r[3], (bool)r[4], (string)r[5], (long)r[6])).ToList();
            List<HourTypeSObject> HourTypeIDs = myPostgreSQL.GetDataTable("SELECT * FROM \"HourType\" ORDER BY \"ID\" ASC")
                .Rows.Cast<DataRow>().Select(r => new HourTypeSObject((long)r[0], (string)r[1])).ToList();
            List<HourTypeSObject> HourTypesIDs = myPostgreSQL.GetDataTable("SELECT * FROM \"HourTypes\" ORDER BY \"ID\" ASC")
                .Rows.Cast<DataRow>().Select(r => new HourTypeSObject((long)r[0], (string)r[1])).ToList();

            string[] lines = File.ReadAllLines(fileName);
            IEnumerable<DB_t_User?> dochadzka = new DB_t_User[0];
            switch (userType)
            {
                case ZamestnanecTyp.Zamestnanec:
                case ZamestnanecTyp.Brigadnik:
                case ZamestnanecTyp.Student:
                    dochadzka = lines.Select(
                        line =>
                        {
                            string[] data = line.Split(';');
                            switch (data.Length)
                            {
                                case 9:
                                    return new DB_t_User(
                                        0,
                                        CinnostTypIDs.Find(o => o.Typ == data[0]).ID,
                                        Convert.ToDateTime(data[1]),
                                        TimeSpan.Parse(data[5]),
                                        TimeSpan.Parse(data[6]),
                                        ProjectIDs.Find(o => o.Number == data[2]) == null ? 0 : ProjectIDs.Find(o => o.Number == data[2]).ID,
                                        HourTypeIDs.Find(o => o.HourType == data[3]) == null ? 0 : HourTypeIDs.Find(o => o.HourType == data[3]).ID,
                                        HourTypesIDs.Find(o => o.HourType == data[4]) == null ? 0 : HourTypesIDs.Find(o => o.HourType == data[4]).ID,
                                        data[7],
                                        Convert.ToInt32(data[8] == string.Empty ? "0" : data[8])
                                        );

                                case 7:
                                case 8:
                                    return new DB_t_User(
                                        0,
                                        CinnostTypIDs.Find(o => o.Typ == data[0]).ID,
                                        Convert.ToDateTime(data[1]),
                                        TimeSpan.Parse(data[4]),
                                        TimeSpan.Parse(data[5]),
                                        ProjectIDs.Find(o => o.Number == data[2]) == null ? 0 : ProjectIDs.Find(o => o.Number == data[2]).ID,
                                        1,
                                        HourTypesIDs.Find(o => o.HourType == data[3]).ID,
                                        data[6],
                                        data.Length == 7 ? 0 : Convert.ToInt32(data[7] == string.Empty ? "0" : data[7])
                                        );

                                default:
                                    return null;
                            }
                        });
                    break;

                case ZamestnanecTyp.SZCO:
                    dochadzka = ProcessLines(lines, ProjectIDs, HourTypeIDs, HourTypesIDs);
                    break;

                default:
                    break;
            }
            myPostgreSQL.DB_t_UserAdd(dochadzka, $"t_{userMeno.RemoveDiacritics()}_{userPriezvisko.RemoveDiacritics()}", vymazatDataPredPridanim, userID);
        }
        private IEnumerable<DB_t_User?> ProcessLines(string[] lines, List<ProjectsObject> projectIDs, List<HourTypeSObject> hourTypeIDs, List<HourTypeSObject> hourTypesIDs)
        {
            List<DB_t_User?> ret = new();
            DateTime lastDate = DateTime.MinValue;

            double zaciatok = 8;
            foreach (string line in lines)
            {
                try
                {
                    string[] data = line.Split(';');
                    DateTime date = Convert.ToDateTime(data[0]);
                    if (lastDate != date)
                        zaciatok = 8;

                    ret.Add(new(
                        0,
                        1,
                        date,
                        TimeSpan.FromHours(zaciatok),
                        TimeSpan.FromHours(zaciatok + double.Parse(data[3])),
                        projectIDs.Find(o => o.Number == data[1]) == null ? 0 : projectIDs.Find(o => o.Number == data[1]).ID,
                        hourTypeIDs.Find(o => o.HourType == data[2]) == null ? 0 : hourTypeIDs.Find(o => o.HourType == data[2]).ID,
                        hourTypesIDs.Find(o => o.HourType == data[4]) == null ? 0 : hourTypesIDs.Find(o => o.HourType == data[4]).ID,
                        data[6],
                        Convert.ToInt32(data[5] == string.Empty ? "0" : data[5])
                        ));

                    zaciatok += double.Parse(data[3]);
                }
                catch (Exception ex)
                {
                    Log.Warning(ex, $"NacitajCSV: ProcessLines: Line import error for line:'{line}'. Line skipped!");
                    continue;
                }
            }

            return ret.ToArray();
        }
        #endregion

        protected List<DateTime> GetHolidays(DateTime date) => GetHolidays(date, date);
        protected List<DateTime> GetHolidays(DateTime dateFrom, DateTime dateTo)
        {
            return myPostgreSQL.GetDataTable($"SELECT * FROM \"Holidays\" WHERE \"Den\" >= TO_DATE('{dateFrom:dd.MM.yyyy}','DD.MM.YYYY') AND \"Den\" <= TO_DATE('{dateTo:dd.MM.yyyy}','DD.MM.YYYY')")
                .Rows.Cast<DataRow>().Select(r => (DateTime)r[0]).ToList();

            //List<DateTime> ret = new();

            //foreach (DataRow row in myPostgreSQL.GetDataTable($"SELECT * FROM \"Holidays\" WHERE \"Den\" >= TO_DATE('{dateFrom:dd.MM.yyyy}','DD.MM.YYYY') AND \"Den\" <= TO_DATE('{dateTo:dd.MM.yyyy}','DD.MM.YYYY')").Rows)
            //    ret.Add((DateTime)row["Den"]);

            //return ret;
        }

        protected void LoadDochadzkaData(int year, int month)
            => LoadDochadzkaData(new DateTime(year, month, 1), new DateTime(year, month, 1).AddMonths(1).AddDays(-1));
        protected void LoadDochadzkaData(DateTime dateFrom, DateTime dateTo)
        {
            try
            {
                dgcCinnostTyp.ItemsSource = myPostgreSQL.GetDataTable("SELECT * FROM \"CinnostTyp\" WHERE \"Zmazane\" != true ORDER BY \"ID\" ASC").DefaultView;
                dgcCinnostTyp.SelectedValuePath = "ID";
                dgcCinnostTyp.DisplayMemberPath = "Typ";
                ////dgcProject.ItemsSource = myPostgreSQL.GetDataTable($"SELECT * FROM \"{Application.Current.Resources["TABLE_PROJEKT"]}\" WHERE \"AllowAssignWorkingHours\" ORDER BY \"ID\" ASC").DefaultView;
                ////!!! ked sa vyradi projekt tak zmizne aj zo zoznamu v Data -> mozno skusit dat vsetky a pri vybere kontrolovat a pridat len ked je aktivny?
                ////dgcProject.ItemsSource = myPostgreSQL.GetDataTable($"SELECT * FROM \"ActiveProjects\" ORDER BY \"NumberName\" ASC").DefaultView;
                //dgcProject.ItemsSource = myPostgreSQL.GetDataTable($"SELECT *, concat(\"Number\", '/', \"Name\") AS \"NumberName\" FROM \"Projects\" ORDER BY \"Number\" ASC").DefaultView;
                //dgcProject.SelectedValuePath = "ID";
                //dgcProject.DisplayMemberPath = "NumberName";

                dgcHourType.ItemsSource = myPostgreSQL.GetDataTable("SELECT * FROM \"HourType\" ORDER BY \"ID\" ASC").DefaultView;
                dgcHourType.SelectedValuePath = "ID";
                dgcHourType.DisplayMemberPath = "HourType";
                dgcHourTypes.ItemsSource = myPostgreSQL.GetDataTable("SELECT * FROM \"HourTypes\" ORDER BY \"ID\" ASC").DefaultView;
                dgcHourTypes.SelectedValuePath = "ID";
                dgcHourTypes.DisplayMemberPath = "HourType";

                //dgDochadzka.ItemsSource = myPostgreSQL.GetDataTable($"SELECT *, (\"EndTime\" - \"StartTime\") as \"WorkTime\" FROM \"{CurrentUser.TableFullName}\" WHERE \"StartDate\" >= TO_DATE('{dateFrom:dd.MM.yyyy}','DD.MM.YYYY') AND \"StartDate\" <= TO_DATE('{dateTo:dd.MM.yyyy}','DD.MM.YYYY') ORDER BY \"StartDate\" ASC, \"StartTime\" ASC").DefaultView;
                dgDochadzka.ItemsSource = myPostgreSQL.GetDataTable($"SELECT \"{ShownUser.TableFullName}\".*, \"CountryCode\", CASE WHEN \"EndTime\" = '00:00:00' THEN '24:00:00' - \"StartTime\" ELSE \"EndTime\" - \"StartTime\" END AS \"WorkTime\", concat(\"Projects\".\"Number\", '/', \"Projects\".\"Name\") AS \"NumberName\" FROM \"{ShownUser.TableFullName}\" LEFT JOIN \"Projects\" ON \"Projects\".\"ID\" = \"ProjectID\" WHERE \"StartDate\" >= TO_DATE('{dateFrom:dd.MM.yyyy}','DD.MM.YYYY') AND \"StartDate\" <= TO_DATE('{dateTo:dd.MM.yyyy}','DD.MM.YYYY') ORDER BY \"StartDate\" ASC, \"StartTime\" ASC").DefaultView;

                if ((dgDochadzka.ItemsSource as DataView).Count > 0)
                    dpDataKopirovanie.SelectedDate = ((DateTime)((dgDochadzka.ItemsSource as DataView).Cast<DataRowView>()).Max(v => v["StartDate"])).AddDays(1);

                if (ShownUser.ID != CurrentUser.ID)
                {
                    wndMain.Title = $"Dochádzka ({AppVersion}) - {GetFullUserName()}   > {GetFullUserName(ShownUser)} <";
                    dgDochadzka.BorderBrush = Brushes.Red;
                    dgDochadzka.BorderThickness = new Thickness(3);
                    dgDochadzka.Foreground = Brushes.DarkRed;
                }
                else
                {
                    wndMain.Title = $"Dochádzka ({AppVersion}) - {GetFullUserName()}";
                    dgDochadzka.BorderBrush = DochadzkaBrush;
                    dgDochadzka.BorderThickness = DochadzkaThickness;
                    dgDochadzka.Foreground = Brushes.Black;
                }
#if DEBUG
                wndMain.Title += $"   [{myPostgreSQL.DataSourceConnectionString}]";
#endif

                wndMain.BorderBrush = dgDochadzka.BorderBrush;
                wndMain.BorderThickness = dgDochadzka.BorderThickness;

                FillUser(ShownUser);

                //tiVykaz.IsEnabled = CurrentUser.Typ != ZamestnanecTyp.SZCO && CurrentUser.ID == ShownUser.ID;
                //tiWorklist.IsEnabled = CurrentUser.ID == ShownUser.ID;
                //tiCestak.IsEnabled = tiVykaz.IsEnabled;
                tiVykaz.IsEnabled = ShownUser.Typ != ZamestnanecTyp.SZCO;
                tiWorklist.IsEnabled = true;

            }
            catch (Exception ex)
            {
                Log.Error(ex, "LoadDochadzkaData");
            }
        }

        protected void FillUser(DB_User user)
        {
            if (CurrentUser != null)
            {
                if (!wndMain.Title.Contains('-'))
                    wndMain.Title = $"Dochádzka ({AppVersion}) - {GetFullUserName()}";

                tiZamestnanec.IsEnabled = false;
                tiData.IsEnabled = CurrentUser.ID > 1;
                tiNadcas.IsEnabled = false;
                tiVykaz.IsEnabled = false;
                tiWorklist.IsEnabled = false;
                tiSpravca.IsEnabled = CurrentUser.IsAdmin;

                if (user.ID == 1)
                {
                    tiSpravca.IsSelected = true;
                }
                else if (user.Typ == ZamestnanecTyp.Zamestnanec)
                {
                    List<double> zostatky = GetZostatky(user, DateTime.Now.Year);
                    lblDovolenkaZ.Content = $"{(user.Dovolenka - zostatky[0] / 8d):#.#} dni";
                    lblLekarZ.Content = $"{constMaxLekar - zostatky[1]} h";
                    lblLekarDoprovodZ.Content = $"{constMaxDoprovod - zostatky[2]} h";
                    lblLekarDoprovodZPZ.Content = $"{constMaxDoprovodZP - zostatky[3]} h";

                    tiZamestnanec.IsEnabled = true;
                    //tiNadcas.IsEnabled = CurrentUser.ID == ShownUser.ID;
                    tiNadcas.IsEnabled = true;
                }
                else
                {
                }

                if (LastActualMainTabItem == null)
                    tiData.IsSelected = true;
            }
        }

        /// <summary>
        /// Vrati zostatky v poradi: Dovolenka, Lekar, Doprovod, Doprovod ZP
        /// </summary>
        /// <param name="user">zamestnanec, ktoreho zostatky potrebujeme</param>
        /// <param name="rok">rok, pre ktory potrebujeme zostatky</param>
        /// <returns>pocet hodin</returns>
        private List<double> GetZostatky(DB_User user, int rok)
        {
            return new()
            {
                myPostgreSQL.ZostatokGet(user, "RD", rok),
                myPostgreSQL.ZostatokGet(user, "Lekár", rok),
                myPostgreSQL.ZostatokGet(user, "Doprovod", rok),
                myPostgreSQL.ZostatokGet(user, "DoprovodZP", rok)
            };
        }

        private string GetFullUserName()
            => GetFullUserName(CurrentUser);

        private string GetFullUserName(DB_User? user)
        {
            string ret = string.Empty;

            if (user != null)
            {
                if (user.TitulPred != string.Empty)
                    ret += $"{user.TitulPred} ";

                ret += $"{user.Meno} {user.Priezvisko}";

                if (user.TitulZa != string.Empty)
                    ret += $", {user.TitulZa}";
            }

            return ret;
        }

        public string GetFullUserName(long id) => GetFullUserName(myPostgreSQL.DB_UserGet(id));

        private void FillSumar()
        {
            SumarHodin = new()
            {
                new((string)Application.Current.Resources["DOCH_PRIT"], VykazData.Where(vd => vd.Dovod == string.Empty).Sum(vd => vd.Odpracovane)),
                new((string)Application.Current.Resources["DOCH_SC"], VykazData.Where(vd => vd.Dovod == (string)Application.Current.Resources["DOCH_SC"]).Sum(vd => vd.Odpracovane)),
                new((string)Application.Current.Resources["DOCH_DOV"], VykazData.Where(vd => vd.Dovod == (string)Application.Current.Resources["DOCH_DOV"]).Sum(vd => vd.Odpracovane)),
                new((string)Application.Current.Resources["DOCH_PN"], VykazData.Where(vd => vd.Dovod == (string)Application.Current.Resources["DOCH_PN"]).Sum(vd => vd.Odpracovane)),
                new((string)Application.Current.Resources["DOCH_OCR"], VykazData.Where(vd => vd.Dovod == (string)Application.Current.Resources["DOCH_OCR"]).Sum(vd => vd.Odpracovane)),
                new((string)Application.Current.Resources["DOCH_LEK"], VykazData.Where(vd => vd.Dovod == (string)Application.Current.Resources["DOCH_LEK"]).Sum(vd => vd.Odpracovane)),
                new((string)Application.Current.Resources["DOCH_LEKD"], VykazData.Where(vd => vd.Dovod == (string)Application.Current.Resources["DOCH_LEKD"]).Sum(vd => vd.Odpracovane)),
                new((string)Application.Current.Resources["DOCH_LEKDZP"], VykazData.Where(vd => vd.Dovod == (string)Application.Current.Resources["DOCH_LEKDZP"]).Sum(vd => vd.Odpracovane)),
                new((string)Application.Current.Resources["DOCH_PAR"], VykazData.Where(vd => vd.Dovod == (string)Application.Current.Resources["DOCH_PAR"]).Sum(vd => vd.Odpracovane)),
                new("Spolu", VykazData.Sum(vd => vd.Odpracovane))
            };
            dgSumar.ItemsSource = SumarHodin;

            Vikendy = ZratajVykendySviatkySluzobky(VykazData.Where(vd => vd.Datum.DayOfWeek == DayOfWeek.Sunday || vd.Datum.DayOfWeek == DayOfWeek.Saturday).ToList());
            dgVikendy.ItemsSource = Vikendy;
            List<DateTime> holidays = GetHolidays(VykazData.Min(vd => vd.Datum), VykazData.Max(vd => vd.Datum));
            Sviatky = ZratajVykendySviatkySluzobky(VykazData.Where(vd => holidays.Contains(vd.Datum)).ToList());
            //Sviatky = ZratajVykendySviatkySluzobky(VykazData.Where(vd => GetHolidays(DateTime.MinValue, DateTime.MaxValue).Contains(vd.Datum)).ToList());
            dgSviatky.ItemsSource = Sviatky;

            Sluzobky = ZratajVykendySviatkySluzobky(VykazData.Where(vd => vd.Dovod == (string)Application.Current.Resources["DOCH_SC"]).ToList());
            dgSluzobky.ItemsSource = Sluzobky;

        }
        ObservableCollection<VikendySviatkyObject> ZratajVykendySviatkySluzobky(List<VykazDataObject> vdos)
        {
            ObservableCollection<VikendySviatkyObject> ret = new();

            VykazDataObject prevVDO = null;
            foreach (VykazDataObject vdo in vdos)
            {
                if (prevVDO == null)
                {
                    prevVDO = new(vdo);
                    continue;
                }
                if (prevVDO.Datum == vdo.Datum)
                {
                    prevVDO.Odpracovane += vdo.Odpracovane;
                }
                else
                {
                    ret.Add(new(prevVDO.Datum, prevVDO.Odpracovane));
                    prevVDO = new(vdo);
                }
            }
            if (prevVDO != null)
                ret.Add(new(prevVDO.Datum, prevVDO.Odpracovane));

            for (int i = ret.Count; i < 10; i++) //pocet zobrazenych riadkov (10 aby sedelo s prvym stlpcom)
                ret.Add(new(DateTime.MinValue, 0));

            return ret;
        }
        /// <summary>
        /// Upravi inVDOs a zluci do jedneho zaznamu SK SC (spolu aj cesta aj praca) a vrati novy zoznam a tiez sumar za cestu aj pracu
        /// </summary>
        /// <param name="inVDOs">Vstupny zoznam - vsetky VykazData za jeden den</param>
        /// <param name="casCesta">Sumar za SK SC cestu</param>
        /// <param name="casPraca">Sumar za SK SC pracu</param>
        /// <returns>Upraveny zoznam inVDOs</returns>
        private List<VykazDataObject> UpravVykazDataDen(List<VykazDataObject> inVDOs, ref List<DateTime> datesToRemove, List<DateTime> nahradneVolna /*, out List<Tuple<NadcasTyp, double>> nadcasyTentoDen*/)
        {
            //nadcasyTentoDen = new();
            List<Tuple<NadcasTyp, double>> nadcasyTentoDen = new();
            List<VykazDataObject> ret = new();
            VykazDataObject vkladaneVDO = new();
            double posun = 0;

            double zahrSCcas = inVDOs.Where(vd => vd.Dovod == (string)Application.Current.Resources["DOCH_SC"] && !vd.IsSlovensko).Sum(vd => vd.Odpracovane);
            //je tam narok na zahr. sc 
            if (zahrSCcas >= 4)
            {
                vkladaneVDO = new();
                foreach (VykazDataObject vdo in inVDOs)
                {
                    //ak je to zahr. sc 
                    if (vdo.Dovod == (string)Application.Current.Resources["DOCH_SC"] && !vdo.IsSlovensko)
                    {
                        if (vkladaneVDO.Odpracovane == 0)
                            vkladaneVDO = new(vdo);
                        else
                            vkladaneVDO.Odpracovane += vdo.Odpracovane; //!!! tu by som sa nemal dostat
                    }
                    //zrusene od 1.3.2 - ak je narok na zsc, tak ostatne sa nerata
                    ////ak to nie je zhar. sc -> do nadcasu
                    //else
                    //{
                    //    //zistim typ nadcasu
                    //    NadcasTyp nadcasTyp = NadcasTyp.Unknown;
                    //    if (vdo.Dovod == (string)Application.Current.Resources["DOCH_SC"] && vdo.IsCestovanie)
                    //        nadcasTyp = NadcasTyp.SCSKCesta;
                    //    else
                    //        nadcasTyp = NadcasTyp.Flexi;

                    //    nadcasyTentoDen.Add(new(nadcasTyp, vdo.Odpracovane));
                    //}
                }

                //nadcas za zahr. sc -> 2h
                nadcasyTentoDen.Add(new(NadcasTyp.SCZahranicie, 2));

                //od 1.3.2
                ////ak viac ako 10h odpracovanych, rozdiel do fondu
                //if (vkladaneVDO.Odpracovane > 10)
                //    nadcasyTentoDen.Add(new(NadcasTyp.Neplateny, vkladaneVDO.Odpracovane - 10));
                //ak viac ako 10h odpracovanych, rozdiel do fondu
                double celkovyOdpracovanyCasZaDen = inVDOs.Sum(vd => vd.Odpracovane);
                if (celkovyOdpracovanyCasZaDen > 10)
                    nadcasyTentoDen.Add(new(NadcasTyp.Neplateny, celkovyOdpracovanyCasZaDen - 10));

                //nastavit 8h pre vykaz
                vkladaneVDO.Odpracovane = 8;
                ret.Add(vkladaneVDO);
            }
            else
            {
                //najprv poupravovat ranne casy
                List<VykazDataObject> tmp = new();
                double nadcas = inVDOs.Sum(vd => vd.Odpracovane) - 8 - zahrSCcas;
                foreach (VykazDataObject vdo in inVDOs)
                {
                    vkladaneVDO = new(vdo);

                    //ak je zahr. sc, tak je <4h a teda ide do fondu a nie do vykazu
                    if (vkladaneVDO.Dovod == (string)Application.Current.Resources["DOCH_SC"] && !vdo.IsSlovensko)
                    {
                        nadcasyTentoDen.Add(new(NadcasTyp.Neplateny, vkladaneVDO.Odpracovane));
                        continue;
                    }

                    //zapamatam si prvy posun - ak kladny, tak posuvam inak nic
                    if (posun == 0)
                        posun = TimeSpan.FromHours(8).TotalHours - vdo.Od.TotalHours;

                    //mam nadcas - viac ako 8h odrobene
                    if (nadcas > 0)
                    {
                        //je praca pred 8.00
                        if (posun > 0)
                        {
                            //zistim typ nadcasu
                            NadcasTyp nadcasTyp = NadcasTyp.Unknown;
                            if (vkladaneVDO.Dovod == (string)Application.Current.Resources["DOCH_SC"] && vkladaneVDO.IsCestovanie)
                                nadcasTyp = NadcasTyp.SCSKCesta;
                            else
                                nadcasTyp = NadcasTyp.Flexi;

                            //potrebujem posunut o viac ako je nadcas
                            if (posun > nadcas)
                            {
                                //casovy usek je mensi ako spracovavany cas
                                if (nadcas > vkladaneVDO.Odpracovane)
                                {
                                    //do nadcasu pojde cely usek a cely sa vymaze
                                    nadcasyTentoDen.Add(new(nadcasTyp, vkladaneVDO.Odpracovane));
                                    nadcas -= vkladaneVDO.Odpracovane;
                                    //kedze cely casovy usek vymazem, zmensim posun o jeho dlzku
                                    posun -= vkladaneVDO.Odpracovane;
                                    continue;
                                }
                                //orezeme len nadcas a posuniem
                                nadcasyTentoDen.Add(new(nadcasTyp, nadcas));
                                vkladaneVDO.Odpracovane -= nadcas;
                                nadcas = 0;
                            }
                            //nadcas je viac alebo rovny posunu, tak len orezavam o posun, zvysok orezem na konci (nadcas > posun)
                            else
                            {
                                //casovy usek je mensi ako spracovavany cas
                                if (posun > vkladaneVDO.Odpracovane)
                                {
                                    //do nadcasu pojde cely usek a cely sa vymaze
                                    nadcasyTentoDen.Add(new(nadcasTyp, vkladaneVDO.Odpracovane));
                                    nadcas -= vkladaneVDO.Odpracovane;
                                    //kedze cely casovy usek vymazem, zmensim posun o jeho dlzku
                                    posun -= vkladaneVDO.Odpracovane;
                                    continue;
                                }
                                nadcasyTentoDen.Add(new(nadcasTyp, posun));
                                vkladaneVDO.Odpracovane -= posun;
                                nadcas -= posun;
                            }
                        }
                        //nie je praca pred 8.00
                        else
                        {
                            //!!! nadcas sa oreze na konci
                        }
                    }
                    //nemam nadcas - 8h alebo menej odrobene
                    else
                    {
                        //ak je posun, pridam do vsetkych casov a inak neriesim
                    }

                    if (vkladaneVDO.Odpracovane > 0)
                    {
                        if (posun > 0)
                            vkladaneVDO.Od += TimeSpan.FromHours(posun);

                        tmp.Add(vkladaneVDO);
                    }
                }

                //potom poupravovat vecerne casy
                List<VykazDataObject> tmp2 = new();
                nadcas = tmp.Sum(vd => vd.Odpracovane) - 8;
                double odpracovanyCas = 0;
                double orezanyCas = 0;
                foreach (VykazDataObject vdo in tmp)
                {
                    vkladaneVDO = new(vdo);
                    odpracovanyCas += vkladaneVDO.Odpracovane;

                    if (odpracovanyCas > 8)
                    {
                        //zistim typ nadcasu
                        NadcasTyp nadcasTyp = NadcasTyp.Unknown;
                        if (vkladaneVDO.Dovod == (string)Application.Current.Resources["DOCH_SC"] && vkladaneVDO.IsCestovanie)
                            nadcasTyp = NadcasTyp.SCSKCesta;
                        else
                            nadcasTyp = NadcasTyp.Flexi;

                        double rozdiel = odpracovanyCas - 8 - orezanyCas;
                        if (rozdiel > nadcas)
                        {
                            //sem by som sa nemal nikdy dostat!!!
                            nadcasyTentoDen.Add(new(nadcasTyp, nadcas));
                            nadcas = 0;
                            continue;
                        }
                        else
                        {
                            nadcasyTentoDen.Add(new(nadcasTyp, rozdiel));
                            nadcas -= rozdiel;
                            orezanyCas += rozdiel;
                            vkladaneVDO.Odpracovane -= rozdiel;
                        }
                    }

                    if (vkladaneVDO.Odpracovane > 0)
                        tmp2.Add(vkladaneVDO);
                }

                //potom pospajat
                bool prveSCvdo = true;
                vkladaneVDO = new();
                foreach (VykazDataObject vdo in tmp2)
                {
                    // sk sc -> treba poskladat do jedneho cestu a pracu
                    if (vdo.Dovod == (string)Application.Current.Resources["DOCH_SC"] && vdo.IsSlovensko)
                    {
                        //toto je prvy vyskyt sk sc -> vytvorim nove vkladaneVDO
                        if (prveSCvdo)
                        {
                            prveSCvdo = false;
                            vkladaneVDO = new(vdo);
                        }
                        //toto je dalsi vyskyt sk sc -> len pripocitam cas
                        else
                            vkladaneVDO.Odpracovane += vdo.Odpracovane;
                        continue;
                    }

                    //ulozit predchadzajuce vyskladane sc 
                    if (vkladaneVDO.Odpracovane > 0)
                        ret.Add(vkladaneVDO);

                    //a aj nove nie sc
                    vkladaneVDO = new(vdo);
                    ret.Add(vkladaneVDO);
                    vkladaneVDO = new();
                }
                //ulozit predchadzajuce vyskladane sc -> ked list konci sc, tak sa neulozi
                if (vkladaneVDO.Odpracovane > 0)
                    ret.Add(vkladaneVDO);
            }

            //a nakoniec upravit casy aby zacinali o 8.00 a isli za sebou
            double zaciatokIntervalu = 8;
            foreach (VykazDataObject vdo in ret)
            {
                posun = TimeSpan.FromHours(zaciatokIntervalu).TotalHours - vdo.Od.TotalHours;
                vdo.Od += TimeSpan.FromHours(posun);
                zaciatokIntervalu = vdo.Do.TotalHours;
            }

            //zosumarizovat a ulozit nadcasy
            double nadcasFlexi = 0;
            double nadcasFond = 0;
            double nadcasSCSKCesta = 0;
            double nadcasSCZahranicie = 0;
            foreach (Tuple<NadcasTyp, double> nadcas in nadcasyTentoDen)
                switch (nadcas.Item1)
                {
                    case NadcasTyp.Flexi:
                        nadcasFlexi += nadcas.Item2;
                        break;
                    case NadcasTyp.Neplateny:
                        nadcasFond += nadcas.Item2;
                        break;
                    case NadcasTyp.SCSKCesta:
                        nadcasSCSKCesta += nadcas.Item2;
                        break;
                    case NadcasTyp.SCZahranicie:
                        nadcasSCZahranicie += nadcas.Item2;
                        break;
                    default:
                        Log.Warning($"Zlý typ nadčasu! ({nadcas.Item1.ToDBString()}; {nadcas.Item2:N0}h)");
                        break;
                }
            DateTime datum = inVDOs[0].Datum;
            if (!IsDateInLockInterval(inVDOs.Max(vd => vd.Datum)))
            {
                //od verzie 1.3.2
                //ak pre datum nie je NV, lebo tam sa uz mazalo
                if (!nahradneVolna.Contains(datum))
                    //pre istotu zmazat dany datum, ak by tam boli nejake ine typy nadcasov
                    myPostgreSQL.NadcasRemoveBulk(ShownUser.ID, new() { datum });

                // Options.User bolo nahradene ShownUser.ID
                if (nadcasFlexi > 0)
                    if (!myPostgreSQL.NadcasSet(ShownUser.ID, datum, nadcasFlexi, NadcasTyp.Flexi, 1, "Automatický výpočet"))
                        myPostgreSQL.NadcasUpdate(ShownUser.ID, datum, nadcasFlexi, NadcasTyp.Flexi, 1, "Automatický výpočet");
                if (nadcasFond > 0)
                    if (!myPostgreSQL.NadcasSet(ShownUser.ID, datum, nadcasFond, NadcasTyp.Neplateny, 1, "Automatický výpočet"))
                        myPostgreSQL.NadcasUpdate(ShownUser.ID, datum, nadcasFond, NadcasTyp.Neplateny, 1, "Automatický výpočet");
                if (nadcasSCSKCesta > 0)
                    if (!myPostgreSQL.NadcasSet(ShownUser.ID, datum, nadcasSCSKCesta, NadcasTyp.SCSKCesta, 1, "Automatický výpočet"))
                        myPostgreSQL.NadcasUpdate(ShownUser.ID, datum, nadcasSCSKCesta, NadcasTyp.SCSKCesta, 1, "Automatický výpočet");
                if (nadcasSCZahranicie > 0)
                    if (!myPostgreSQL.NadcasSet(ShownUser.ID, datum, nadcasSCZahranicie, NadcasTyp.SCZahranicie, 1, "Automatický výpočet"))
                        myPostgreSQL.NadcasUpdate(ShownUser.ID, datum, nadcasSCZahranicie, NadcasTyp.SCZahranicie, 1, "Automatický výpočet");
                // Options.User bolo nahradene ShownUser.ID
            }

            //od verzie 1.3.2
            //ak je tam nejaky nadcas, tak nezahrnam do zoznamu na vymazanie
            if (nadcasFlexi + nadcasFond + nadcasSCSKCesta + nadcasSCZahranicie > 0)
                datesToRemove.Remove(datum);

            return ret;
        }
        /// <summary>
        /// Pocita s uz zosumarizovanymi datami vo 'VykazData' a upravuje ich pre vykaz (t.j. rozdeluje pritomnost na dva zaznamy oddelene obedom (30min)) a pocita nadcas
        /// </summary>
        /// <returns>Upraveny vykaz</returns>
        private ObservableCollection<VykazDataObject> UpravVykazData(DateTime dateFrom, DateTime dateTo, List<DateTime> nahradneVolna)
        {
            ObservableCollection<VykazDataObject> noveVykazData = new();
            List<DateTime> dates = VykazData.DistinctBy(vd => vd.Datum).Select(vd => vd.Datum).ToList();
            VykazDataObject vkladaneVDO;
            List<DateTime> holidays = GetHolidays(dates.Min(), dates.Max());

            List<DateTime> datumyBezNadcasu = new();
            for (DateTime d = dateFrom; d <= dateTo; d = d.AddDays(1))
                if (!nahradneVolna.Contains(d))
                    datumyBezNadcasu.Add(d);

            foreach (DateTime date in dates)
            {
                //zamestnanci vikend a sviatky ide vsetko do nadcasu, ostatni maju realnu a zakonnu dochadzku
                //if (CurrentUser.Typ == ZamestnanecTyp.Zamestnanec && date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday || holidays.Contains(date))
                if (ShownUser.Typ == ZamestnanecTyp.Zamestnanec && date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday || holidays.Contains(date))
                {
                    //double nadcas = VykazData.Where(vd => vd.Datum == date).Sum(vd => vd.Odpracovane);
                    ////MessageBox.Show($"{GetFullUserName()} ma v dni {date:d} nadcas {casovyFond:N2}h.");
                    //if (!myPostgreSQL.NadcasSet(Options.User, date, nadcas, NadcasTyp.Flexi.ToString()))
                    //    myPostgreSQL.NadcasUpdate(Options.User, date, nadcas, NadcasTyp.Flexi.ToString());

                    //!!! od verzie 1.2.1
                    if (VykazData.Where(vd => vd.Datum == date).First().IsLock)
                        continue;

                    double nadcasCelkom = VykazData.Where(vd => vd.Datum == date).Sum(vd => vd.Odpracovane);
                    double nadcasSCSKCesta = VykazData.Where(vd => vd.Datum == date && vd.IsCestovanie && vd.IsSlovensko && vd.Dovod == (string)Application.Current.Resources["DOCH_SC"]).Sum(vd => vd.Odpracovane);
                    double nadcasSCZ = VykazData.Where(vd => vd.Datum == date && !vd.IsSlovensko && vd.Dovod == (string)Application.Current.Resources["DOCH_SC"]).Sum(vd => vd.Odpracovane);

                    //od verzie 1.3.2
                    //ak pre datum nie je NV, lebo tam sa uz mazalo
                    if (!nahradneVolna.Contains(date))
                        //pre istotu zmazat dany datum, ak by tam boli nejake ine typy nadcasov
                        myPostgreSQL.NadcasRemoveBulk(ShownUser.ID, new(new DateTime[] { date }));

                    //SC zahranicie
                    if (nadcasSCZ > 0)
                    {
                        // ak je menej ako 4h, tak do fondu
                        if (nadcasSCZ < 4)
                        {
                            // Options.User bolo nahradene ShownUser.ID
                            if (!myPostgreSQL.NadcasSet(ShownUser.ID, date, nadcasSCZ, NadcasTyp.Neplateny, 1, "Automatický výpočet"))
                                myPostgreSQL.NadcasUpdate(ShownUser.ID, date, nadcasSCZ, NadcasTyp.Neplateny, 1, "Automatický výpočet");
                        }
                        // ak je 4h a viac, rata sa 10h
                        else
                        {
                            if (!myPostgreSQL.NadcasSet(ShownUser.ID, date, 10, NadcasTyp.SCZahranicie, 1, "Automatický výpočet"))
                                myPostgreSQL.NadcasUpdate(ShownUser.ID, date, 10, NadcasTyp.SCZahranicie, 1, "Automatický výpočet");
                            // ak viac ako 10h tak do fondu
                            if (nadcasSCZ > 10)
                                if (!myPostgreSQL.NadcasSet(ShownUser.ID, date, nadcasSCZ - 10, NadcasTyp.Neplateny, 1, "Automatický výpočet"))
                                    myPostgreSQL.NadcasUpdate(ShownUser.ID, date, nadcasSCZ - 10, NadcasTyp.Neplateny, 1, "Automatický výpočet");
                        }
                    }
                    //SC SK cesta
                    if (nadcasSCSKCesta > 0)
                    {
                        if (!myPostgreSQL.NadcasSet(ShownUser.ID, date, nadcasSCSKCesta, NadcasTyp.SCSKCesta, 1, "Automatický výpočet"))
                            myPostgreSQL.NadcasUpdate(ShownUser.ID, date, nadcasSCSKCesta, NadcasTyp.SCSKCesta, 1, "Automatický výpočet");
                    }
                    //vsetko ostatne ide do flexi
                    if (nadcasCelkom - nadcasSCSKCesta - nadcasSCZ > 0)
                    {
                        if (!myPostgreSQL.NadcasSet(ShownUser.ID, date, nadcasCelkom - nadcasSCSKCesta - nadcasSCZ, NadcasTyp.Flexi, 1, "Automatický výpočet"))
                            myPostgreSQL.NadcasUpdate(ShownUser.ID, date, nadcasCelkom - nadcasSCSKCesta - nadcasSCZ, NadcasTyp.Flexi, 1, "Automatický výpočet");
                    }
                    // Options.User bolo nahradene ShownUser.ID

                    //tento datum je nadcas, tak vymazat zo zoznamu
                    datumyBezNadcasu.Remove(date);
                    continue;
                }

                List<VykazDataObject> vdos = VykazData.Where(vd => vd.Datum == date).ToList();
                if (vdos.Count == 0)
                    continue;
                //switch (CurrentUser.Typ)
                switch (ShownUser.Typ)
                {
                    case ZamestnanecTyp.Zamestnanec:
                        //List<Tuple<NadcasTyp, double>> MozneRanneNadcasyPreDen;
                        vdos = UpravVykazDataDen(vdos, ref datumyBezNadcasu, nahradneVolna /*, out MozneRanneNadcasyPreDen*/);
                        if (vdos.Count == 0)
                        {
                            MessageBox.Show($"Chybný záznam v dochádzke ({date:dd.MM.yyyy})", constMessageWarningCaption, MessageBoxButton.OK, MessageBoxImage.Warning);
                            continue;
                        }

                        if (vdos.Any(vd => vd.Odpracovane > 8))
                            continue;
                        //viac typov cinnosti na den 
                        if (vdos.Count > 1)
                        {
                            double casovyFond = 0;
                            double casovyFondUlozeny = 0;

                            foreach (VykazDataObject vdo in vdos)
                            {
                                vkladaneVDO = new(vdo);

                                casovyFond = vkladaneVDO.Odpracovane;
                                if (casovyFond + casovyFondUlozeny > 4)
                                {
                                    // pridat obed a dalej zistovat do 8
                                    if (casovyFondUlozeny >= 4)
                                    {
                                        vkladaneVDO.Od += TimeSpan.FromMinutes(30);
                                        if (casovyFond + casovyFondUlozeny > 8)
                                        { //!!! teraz by som sa sem nemal dostat -> UpravVykazDataDen
                                            //double trebaEsteUlozit = 8 - casovyFondUlozeny;

                                            ////MessageBox.Show($"{GetFullUserName()} ma v dni {date:d} nadcas {casovyFond:N2}h.");
                                            //if (!myPostgreSQL.NadcasSet(Options.User, date, casovyFond - trebaEsteUlozit, NadcasTyp.Flexi.ToString()))
                                            //    myPostgreSQL.NadcasUpdate(Options.User, date, casovyFond - trebaEsteUlozit, NadcasTyp.Flexi.ToString());

                                            //vkladaneVDO.Odpracovane = trebaEsteUlozit;
                                        }
                                        noveVykazData.Add(vkladaneVDO);
                                        casovyFondUlozeny += vkladaneVDO.Odpracovane;
                                    }
                                    else
                                    {
                                        if (vkladaneVDO.Dovod == string.Empty || vkladaneVDO.Dovod == (string)Application.Current.Resources["DOCH_SC"])
                                        {
                                            // rozdelit na 4+4
                                            double trebaEsteDoObedaUlozit = 4 - casovyFondUlozeny;
                                            noveVykazData.Add(new(vkladaneVDO) { Odpracovane = trebaEsteDoObedaUlozit });
                                            casovyFondUlozeny += trebaEsteDoObedaUlozit;

                                            vkladaneVDO.Odpracovane -= trebaEsteDoObedaUlozit;
                                            if (vkladaneVDO.Odpracovane > 4)
                                            { //!!! teraz by som sa sem nemal dostat -> UpravVykazDataDen
                                                //casovyFond = vkladaneVDO.Odpracovane - 4;
                                                //vkladaneVDO.Odpracovane = 4;

                                                ////!!! ukladat vsetko ako povodne a az ked bude nadcas tak riesit aky je to nadcas!

                                                ////MessageBox.Show($"{GetFullUserName()} ma v dni {date:d} nadcas {casovyFond:N2}h.");
                                                //if (!myPostgreSQL.NadcasSet(Options.User, date, casovyFond, NadcasTyp.Flexi.ToString()))
                                                //    myPostgreSQL.NadcasUpdate(Options.User, date, casovyFond, NadcasTyp.Flexi.ToString());
                                            }
                                            vkladaneVDO.Od += TimeSpan.FromHours(trebaEsteDoObedaUlozit) + TimeSpan.FromMinutes(30);
                                        }
                                        noveVykazData.Add(vkladaneVDO);
                                        casovyFondUlozeny += vkladaneVDO.Odpracovane;
                                    }
                                }
                                else
                                {
                                    noveVykazData.Add(vkladaneVDO);
                                    casovyFondUlozeny += vkladaneVDO.Odpracovane;
                                }
                            }
                        }
                        //len jeden typ cinnosti na den 
                        else
                        {
                            vkladaneVDO = new(vdos[0]);
                            //pritomnost a sc
                            if (vkladaneVDO.Dovod == string.Empty || vkladaneVDO.Dovod == (string)Application.Current.Resources["DOCH_SC"])
                            {
                                if (vkladaneVDO.Odpracovane >= 4)
                                {
                                    double casovyFond = vkladaneVDO.Odpracovane - 4;
                                    noveVykazData.Add(new(vkladaneVDO) { Odpracovane = 4 });
                                    if (casovyFond > 0)
                                    {
                                        vkladaneVDO.Od += TimeSpan.FromHours(4.5D);

                                        if (casovyFond > 4)
                                        {
                                            vkladaneVDO.Odpracovane = 4;
                                            casovyFond -= 4;
                                            //MessageBox.Show($"{GetFullUserName()} ma v dni {date:d} nadcas {casovyFond:N2}h.");

                                            if (!vkladaneVDO.IsLock)
                                            {
                                                //pritomnost a sk sc praca -> flexi
                                                if (vkladaneVDO.Dovod == string.Empty || vkladaneVDO.Dovod == (string)Application.Current.Resources["DOCH_SC"] && vkladaneVDO.IsSlovensko && !vkladaneVDO.IsCestovanie)
                                                {
                                                    // Options.User bolo nahradene ShownUser.ID
                                                    if (!myPostgreSQL.NadcasSet(ShownUser.ID, date, casovyFond, NadcasTyp.Flexi, 1, "Automatický výpočet"))
                                                        myPostgreSQL.NadcasUpdate(ShownUser.ID, date, casovyFond, NadcasTyp.Flexi, 1, "Automatický výpočet");
                                                }
                                                //sk sc cesta <- aj ked nemyslim, ze niekto bude po slovensku len cestovat viac ako 8h
                                                else if (vkladaneVDO.Dovod == (string)Application.Current.Resources["DOCH_SC"] && vkladaneVDO.IsSlovensko && vkladaneVDO.IsCestovanie)
                                                {
                                                    if (!myPostgreSQL.NadcasSet(ShownUser.ID, date, casovyFond, NadcasTyp.SCSKCesta, 1, "Automatický výpočet"))
                                                        myPostgreSQL.NadcasUpdate(ShownUser.ID, date, casovyFond, NadcasTyp.SCSKCesta, 1, "Automatický výpočet");
                                                }
                                                //zahranicna sc
                                                else if (vkladaneVDO.Dovod == (string)Application.Current.Resources["DOCH_SC"] && !vkladaneVDO.IsSlovensko)
                                                {
                                                    if (!myPostgreSQL.NadcasSet(ShownUser.ID, date, 2, NadcasTyp.SCZahranicie, 1, "Automatický výpočet"))
                                                        myPostgreSQL.NadcasUpdate(ShownUser.ID, date, 2, NadcasTyp.SCZahranicie, 1, "Automatický výpočet");
                                                    //zahranicna sc nad 10h -> do fondu
                                                    if (casovyFond > 2)
                                                    {
                                                        if (!myPostgreSQL.NadcasSet(ShownUser.ID, date, casovyFond - 2, NadcasTyp.Neplateny, 1, "Automatický výpočet"))
                                                            myPostgreSQL.NadcasUpdate(ShownUser.ID, date, casovyFond - 2, NadcasTyp.Neplateny, 1, "Automatický výpočet");
                                                        // Options.User bolo nahradene ShownUser.ID
                                                    }
                                                }

                                                //tento datum je nadcas, tak vymazat zo zoznamu
                                                datumyBezNadcasu.Remove(date);
                                            }
                                        }
                                        else
                                        {
                                            vkladaneVDO.Odpracovane = casovyFond;
                                        }
                                        noveVykazData.Add(vkladaneVDO);
                                    }
                                }
                                //vkladaneVDO.Odpracovane < 4
                                else
                                {
                                    //zahranicna sc < 4h sa nerata, cela do fondu
                                    if (vkladaneVDO.Dovod == (string)Application.Current.Resources["DOCH_SC"] && !vkladaneVDO.IsSlovensko)
                                    {
                                        if (!vkladaneVDO.IsLock)
                                            // Options.User bolo nahradene ShownUser.ID
                                            if (!myPostgreSQL.NadcasSet(ShownUser.ID, date, vkladaneVDO.Odpracovane, NadcasTyp.Neplateny, 1, "Automatický výpočet"))
                                                myPostgreSQL.NadcasUpdate(ShownUser.ID, date, vkladaneVDO.Odpracovane, NadcasTyp.Neplateny, 1, "Automatický výpočet");

                                        //tento datum je nadcas, tak vymazat zo zoznamu
                                        datumyBezNadcasu.Remove(date);
                                    }
                                    //sk sc cesta
                                    else if (vkladaneVDO.Dovod == (string)Application.Current.Resources["DOCH_SC"] && vkladaneVDO.IsSlovensko && vkladaneVDO.IsCestovanie)
                                    {
                                        if (!vkladaneVDO.IsLock)
                                            if (!myPostgreSQL.NadcasSet(ShownUser.ID, date, vkladaneVDO.Odpracovane, NadcasTyp.SCSKCesta, 1, "Automatický výpočet"))
                                                myPostgreSQL.NadcasUpdate(ShownUser.ID, date, vkladaneVDO.Odpracovane, NadcasTyp.SCSKCesta, 1, "Automatický výpočet");
                                        // Options.User bolo nahradene ShownUser.ID

                                        //tento datum je nadcas, tak vymazat zo zoznamu
                                        datumyBezNadcasu.Remove(date);
                                    }
                                    else
                                    {
                                        noveVykazData.Add(vkladaneVDO);
                                    }
                                }
                            }
                            //vsetko okrem pritomnosti a sc => len 8h zaznam
                            else
                            {
                                noveVykazData.Add(vkladaneVDO);
                                if (vkladaneVDO.Odpracovane > 8)
                                {
                                    string txt = $"Činnosť '{vkladaneVDO.Dovod}' nesmie mať viac ako 8h!";
                                    MessageBox.Show(txt, constMessageWarningCaption, MessageBoxButton.OK, MessageBoxImage.Warning);
                                    Log.Warning($"UpravVykazData: {txt} ({vkladaneVDO.Describe()})");
                                }
                            }
                        }
                        break;

                    case ZamestnanecTyp.Brigadnik:
                    case ZamestnanecTyp.Student:
                        noveVykazData = VykazData;
                        break;

                    default:
                        noveVykazData = VykazData;
                        //Log.Warning($"UpravVykazData: Unknown user type '{CurrentUser.Typ}'!");
                        Log.Warning($"UpravVykazData: Unknown user type '{ShownUser.Typ}'!");
                        break;
                }
            }

            //od verzie 1.3.2
            //vymazu sa nadcasy pre datumy, ktore po uprave uz nemaju mat nadcasy - pre pripad zleho zadania 
            if (ShownUser.Typ == ZamestnanecTyp.Zamestnanec)
                myPostgreSQL.NadcasRemoveBulk(ShownUser.ID, datumyBezNadcasu);

            return noveVykazData;
        }
        private void VlozVykazData(VykazDataObject vdo)
        {
            if (vdo.Dovod == (string)Application.Current.Resources["DOCH_PRIT"])
                vdo.Dovod = string.Empty;
            VykazData.Add(vdo);
        }
        private void FillVykazData(DataTable table, out List<DateTime> nahradneVolna)
        {
            nahradneVolna = new();
            try
            {
                VykazData = new();
                VykazDataObject nacitaneVdo;
                VykazDataObject vkladaneVdo = new();
                string FullUserName = GetFullUserName(ShownUser);

                foreach (DataRow dr in table.Rows)
                {
                    //nacitanie vdo z tabulky
                    nacitaneVdo = new()
                    {
                        Meno = FullUserName,
                        Den = $"{((DateTime)dr["StartDate"]).DayOfWeek.ToSK()}",
                        Datum = (DateTime)dr["StartDate"],
                        Od = (TimeSpan)dr["StartTime"],
                        Odpracovane = ((TimeSpan)dr["Odpracovane"]).Hours + ((TimeSpan)dr["Odpracovane"]).Minutes / 60d,
                        Dovod = (string)dr["Alias"],
                        IsCestovanie = dr["Cestovanie"] is DBNull ? false : (bool)dr["Cestovanie"],
                        IsSlovensko = dr["Slovensko"] is DBNull ? true : (bool)dr["Slovensko"],
                        IsLock = (bool)dr["Lock"]
                    };

                    //upravy nacitaneho vdo z tabulky

                    //treba zo ZSC ktora ma (ne)produktivne spravit SC
                    if (nacitaneVdo.Dovod == (string)Application.Current.Resources["DOCH_SC"] &&
                        nacitaneVdo.IsSlovensko == false &&
                        ((string)dr["HourType"] == "Produktívne" || (string)dr["HourType"] == "Neproduktívne"))
                        nacitaneVdo.IsSlovensko = true;

                    //nahradne volno -> z flexi konta
                    if (nacitaneVdo.Dovod == (string)Application.Current.Resources["DOCH_NV"])
                    {
                        //z nv je pritomnost
                        nacitaneVdo.Dovod = (string)Application.Current.Resources["DOCH_PRIT"];
                        //a preto odcitam .Odpracovane z flexi
                        if (!nacitaneVdo.IsLock)
                        {
                            //od verzie 1.3.2
                            //pre istotu zmazat dany datum, ak by tam boli nejake ine typy nadcasov
                            myPostgreSQL.NadcasRemoveBulk(ShownUser.ID, new() { nacitaneVdo.Datum });
                            nahradneVolna.Add(nacitaneVdo.Datum);

                            // Options.User bolo nahradene ShownUser.ID
                            if (!myPostgreSQL.NadcasSet(ShownUser.ID, nacitaneVdo.Datum, -nacitaneVdo.Odpracovane, NadcasTyp.Flexi, 1, "Automatické odpočítanie za NV"))
                                myPostgreSQL.NadcasUpdate(ShownUser.ID, nacitaneVdo.Datum, -nacitaneVdo.Odpracovane, NadcasTyp.Flexi, 1, "Automatické odpočítanie za NV");
                        }
                        // Options.User bolo nahradene ShownUser.ID
                    }

                    //porovnanie s predchadzajucim zaznamom a uprava alebo ulozenie
                    if (vkladaneVdo.Datum == nacitaneVdo.Datum) //(DateTime)dr["StartDate"])
                    {
                        //je rovnaky dovod 
                        if (vkladaneVdo.Dovod == nacitaneVdo.Dovod //(string)dr["Alias"] 
                                                                   //a sucasne
                            && (
                                //je to slovenska sluzobka a dalsia cast rovnakeho cestovania
                                vkladaneVdo.Dovod == (string)Application.Current.Resources["DOCH_SC"] && vkladaneVdo.IsSlovensko == true && nacitaneVdo.IsSlovensko == true && vkladaneVdo.IsCestovanie == nacitaneVdo.IsCestovanie || //(bool)dr["Cestovanie"] ||
                                                                                                                                                                                                                                       //je to zahranicna sluzobka
                                vkladaneVdo.Dovod == (string)Application.Current.Resources["DOCH_SC"] && vkladaneVdo.IsSlovensko == false && nacitaneVdo.IsSlovensko == false ||
                                //je to ine ako sluzobka
                                vkladaneVdo.Dovod != (string)Application.Current.Resources["DOCH_SC"]
                            ))
                            //priratam k predchadzajucemu
                            vkladaneVdo.Odpracovane += nacitaneVdo.Odpracovane; //((TimeSpan)dr["Odpracovane"]).Hours + ((TimeSpan)dr["Odpracovane"]).Minutes / 60d;
                        else
                        {
                            VlozVykazData(vkladaneVdo);

                            //vkladaneVdo = new()
                            //{
                            //    Meno = FullUserName,
                            //    Den = $"{((DateTime)dr["StartDate"]).DayOfWeek.ToSK()}",
                            //    Datum = (DateTime)dr["StartDate"],
                            //    Od = (TimeSpan)dr["StartTime"],
                            //    Odpracovane = ((TimeSpan)dr["Odpracovane"]).Hours + ((TimeSpan)dr["Odpracovane"]).Minutes / 60d,
                            //    Dovod = (string)dr["Alias"],
                            //    IsCestovanie = dr["Cestovanie"] is DBNull ? false : (bool)dr["Cestovanie"],
                            //    IsSlovensko = dr["Slovensko"] is DBNull ? true : (bool)dr["Slovensko"],
                            //    IsLock = (bool)dr["Lock"]
                            //};
                            ////treba zo ZSC ktora ma (ne)produktivne spravit SC
                            //if (vkladaneVdo.Dovod == (string)Application.Current.Resources["DOCH_SC"] &&
                            //    vkladaneVdo.IsSlovensko == false &&
                            //    ((string)dr["HourType"] == "Produktívne" || (string)dr["HourType"] == "Neproduktívne"))
                            //    vkladaneVdo.IsSlovensko = true;
                            vkladaneVdo = new(nacitaneVdo);
                        }
                    }
                    else
                    {
                        //ak je dalsi datum a uz su naplnene data, tak pridaj
                        if (vkladaneVdo.Meno != string.Empty)
                            VlozVykazData(vkladaneVdo);

                        //vkladaneVdo = new()
                        //{
                        //    Meno = FullUserName,
                        //    Den = $"{((DateTime)dr["StartDate"]).DayOfWeek.ToSK()}",
                        //    Datum = (DateTime)dr["StartDate"],
                        //    Od = (TimeSpan)dr["StartTime"],
                        //    Odpracovane = ((TimeSpan)dr["Odpracovane"]).Hours + ((TimeSpan)dr["Odpracovane"]).Minutes / 60d,
                        //    Dovod = (string)dr["Alias"],
                        //    IsCestovanie = dr["Cestovanie"] is DBNull ? false : (bool)dr["Cestovanie"],
                        //    IsSlovensko = dr["Slovensko"] is DBNull ? true : (bool)dr["Slovensko"],
                        //    IsLock = (bool)dr["Lock"]
                        //};
                        ////treba zo ZSC ktora ma (ne)produktivne spravit SC
                        //if (vkladaneVdo.Dovod == (string)Application.Current.Resources["DOCH_SC"] &&
                        //    vkladaneVdo.IsSlovensko == false &&
                        //    ((string)dr["HourType"] == "Produktívne" || (string)dr["HourType"] == "Neproduktívne"))
                        //    vkladaneVdo.IsSlovensko = true;
                        vkladaneVdo = new(nacitaneVdo);
                    }
                }

                if (vkladaneVdo.Meno != string.Empty)
                    VlozVykazData(vkladaneVdo);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "FillVykazData:");
            }
        }

        private void SetVisibility(ZamestnanecTyp typZamestnanca)
        {
            grdZamestnanecPravaStrana.Visibility = Visibility.Hidden;
            grdZamestnanecPrintArea1.Visibility = Visibility.Hidden;
            grdZamestnanecPrintArea2.Visibility = Visibility.Hidden;

            // od verzie 1.2.3 sa SZCO zobrazuje rovnako ako ostatni
            //grdSZCOPravaStrana.Visibility = Visibility.Hidden;

            //switch (typZamestnanca)
            //{
            //    case ZamestnanecTyp.Zamestnanec:
            //    case ZamestnanecTyp.Brigadnik:
            //    case ZamestnanecTyp.Student:
            grdZamestnanecPravaStrana.Visibility = Visibility.Visible;
            grdZamestnanecPrintArea1.Visibility = Visibility.Visible;
            //        break;

            //    case ZamestnanecTyp.SZCO:
            //        grdSZCOPravaStrana.Visibility = Visibility.Visible;
            //        break;

            //    default:
            //        break;
            //}
        }

        private List<Tuple<string, double>> GetNadcasySums(long userID, DateTime datumOd, DateTime datumDo)
        {
            return new()
            {
                new(NadcasTyp.Flexi.ToDBString(), myPostgreSQL.NadcasSumGet(userID, datumOd, datumDo, NadcasTyp.Flexi)),
                new(NadcasTyp.SCSKCesta.ToDBString(), myPostgreSQL.NadcasSumGet(userID, datumOd, datumDo, NadcasTyp.SCSKCesta)),
                new(NadcasTyp.SCZahranicie.ToDBString(), myPostgreSQL.NadcasSumGet(userID, datumOd, datumDo, NadcasTyp.SCZahranicie)),
                new(NadcasTyp.Neplateny.ToDBString(), myPostgreSQL.NadcasSumGet(userID, datumOd, datumDo, NadcasTyp.Neplateny))
            };


        }

        private DateTime GetFirstWorkDayOfMonth(DateTime now)
        {
            DateTime ret = new(now.Year, now.Month, 1);
            List<DateTime> holidays = GetHolidays(ret, ret.AddDays(10));
            for (byte i = 0; i < 10; i++)
            {
                ret = ret.AddDays(i);
                if (ret.DayOfWeek != DayOfWeek.Saturday && ret.DayOfWeek != DayOfWeek.Sunday && !holidays.Contains(ret))
                    break;
            }
            return ret;
        }
        #endregion

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            if (CurrentUser?.ID > 0)
            {
                FillUser(CurrentUser);

                SetVisibility(CurrentUser.Typ);

                if (CurrentUser.IsAdmin && IsReminderTime(out DateTime quarter))
                {
                    ReminderWindow reminder = new(quarter, (quarter - DateTime.Now).Days)
                    {
                        Owner = this,
                        Topmost = true
                    };
                    reminder.ShowDialog();
                    if (reminder.CancelReminder)
                        SaveUserOptions(reminderCancel: DateTime.Now.Date);
                }

                Log.Information("Current user: " + CurrentUser.Describe());
            }

            Log.Debug("Main window loaded.");
        }

        private void Window_Closed(object sender, EventArgs e)
        {
            wndMain.Cursor = Cursors.Wait;

            // od verzie 1.2.3 presunute do tlacitka obnov
            //if (CurrentUser != null && CurrentUser.ID > 1)
            //{
            //    DateTime date = (DateTime)myPostgreSQL.GetDataTable($"SELECT MAX(\"StartDate\") FROM \"{CurrentUser.TableFullName}\"").Rows[0][0];
            //    myPostgreSQL.PoslednyZaznamSet(CurrentUser.ID, date);
            //}

            myPostgreSQL.Dispose();

            //!!!
            //SaveUserOptions();

            Log.Debug("Main window closed.");
            Log.CloseAndFlush();

            wndMain.Cursor = Cursors.Arrow;
        }

        private void btnLoadData_Click(object sender, RoutedEventArgs e)
        {
            wndMain.Cursor = Cursors.Wait;

            // od verzie 1.2.3 sa SZCO zobrazuje rovnako ako ostatni
            //switch (CurrentUser.Typ)
            //{
            //    case ZamestnanecTyp.Zamestnanec:
            //    case ZamestnanecTyp.Brigadnik:
            if (dpDateFrom.SelectedDate != null && dpDateTo.SelectedDate != null && dpDateFrom.SelectedDate.Value <= dpDateTo.SelectedDate.Value)
                LoadDochadzkaData(dpDateFrom.SelectedDate.Value, dpDateTo.SelectedDate.Value);
            else
                dpDateFrom.Focus();
            // od verzie 1.2.3 sa SZCO zobrazuje rovnako ako ostatni
            //        break;

            //    case ZamestnanecTyp.SZCO:
            //        LoadDochadzkaData((int)cboSZCORok.SelectedValue, (int)cboSZCOMesiac.SelectedValue);
            //        break;

            //}

            wndMain.Cursor = Cursors.Arrow;
        }

        private void dgDochadzka_RowEditEnding(object sender, DataGridRowEditEndingEventArgs e)
        {
            if (e.EditAction == DataGridEditAction.Commit)
            {
                DataRowView dataRowView = e.Row.DataContext as DataRowView;
                if (!IsDataRowOK(dataRowView.Row, DataRowType.DBtUser))
                {
                    e.Cancel = true;
                    return;
                }

                if (dataRowView.IsNew)
                    //myPostgreSQL.DB_t_UserAdd(new(dataRowView.Row), CurrentUser.TableFullName);
                    myPostgreSQL.DB_t_UserAdd(new(dataRowView.Row), ShownUser.TableFullName);
                else if (dataRowView.IsEdit)
                    //myPostgreSQL.DB_t_UserUpdate(new(dataRowView.Row), CurrentUser.TableFullName);
                    myPostgreSQL.DB_t_UserUpdate(new(dataRowView.Row), ShownUser.TableFullName);

                if (dataRowView.IsNew || dataRowView.IsEdit)
                    //    dataRowView.Row["WorkTime"] = ((TimeSpan)dataRowView.Row["EndTime"] - (TimeSpan)dataRowView.Row["StartTime"]); //<- pri update fungovalo pri add nie
                    btnLoadData_Click(null, null);
            }
        }

        private void dgDochadzka_CellEditEnding(object sender, DataGridCellEditEndingEventArgs e)
        {
            ////!!! tu validovat zmenu
            //if (e.EditAction == DataGridEditAction.Commit)
            //{
            //    switch (e.Column.Header)
            //    {
            //        case "Typ činnosti":
            //            //NewCinnostTyp = (long)((DataRowView)e.Row.Item).Row["CinnostTypID"];
            //            break;
            //    }
            //}
        }

        private void dgZamestnanci_RowEditEnding(object sender, DataGridRowEditEndingEventArgs e)
        {
            if (e.EditAction == DataGridEditAction.Commit)
            {
                DataRowView dataRowView = e.Row.DataContext as DataRowView;
                if (!IsDataRowOK(dataRowView.Row, DataRowType.DBUser))
                {
                    e.Cancel = true;
                    return;
                }

                DB_User user = new(dataRowView.Row);
                if (dataRowView.IsNew)
                    myPostgreSQL.DB_UserAdd(user);
                else if (dataRowView.IsEdit)
                    myPostgreSQL.DB_UserUpdate(user, PovodneMeno, PovodnePriezvisko);

                if (!myPostgreSQL.NadcasSet(user.ID, new(DateTime.Now.Year, 1, 1), -user.RocnyNadcasVPlate, NadcasTyp.Flexi, 1, "Ročný nadčas v plate"))
                    myPostgreSQL.NadcasUpdate(user.ID, new(DateTime.Now.Year, 1, 1), -user.RocnyNadcasVPlate, NadcasTyp.Flexi, 1, "Ročný nadčas v plate");
            }
        }

        private void dgZamestnanci_PreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Delete && e.OriginalSource is DataGridCell)
            {
                if (MessageBox.Show("Naozaj chcete natrvalo vymazať označené záznamy?", constMessageWarningCaption, MessageBoxButton.YesNo, MessageBoxImage.Exclamation, MessageBoxResult.No) == MessageBoxResult.Yes)
                {
                    foreach (DataRowView drv in ((DataGrid)sender).SelectedItems)
                    {
                        long id = (long)drv["ID"];
                        if (id == CurrentUser.ID)
                        {
                            MessageBox.Show(this, "Nie je mozne zmazat sam seba!", "Upozornenie", MessageBoxButton.OK, MessageBoxImage.Exclamation);
                            e.Handled = true;
                            continue;
                        }
                        myPostgreSQL.DB_UserDelete(id);
                    }
                }
                else
                    e.Handled = true;
            }
        }

        private void dgDochadzka_PreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Delete && e.OriginalSource is DataGridCell)
            {
                if (MessageBox.Show("Naozaj chcete natrvalo vymazať označené záznamy?", constMessageWarningCaption, MessageBoxButton.YesNo, MessageBoxImage.Exclamation, MessageBoxResult.No) == MessageBoxResult.Yes)
                {
                    foreach (DataRowView drv in ((DataGrid)sender).SelectedItems.Cast<object>().Where(o => o != ItemCollection.NewItemPlaceholder))
                    {
                        //if ((bool)(((DataGrid)sender).SelectedItem as DataRowView)["Lock"])
                        if ((bool)(drv["Lock"]))
                        {
                            MessageBox.Show($"Tento záznam je už uzamknutý a nedá sa meniť. \r\n({((DateTime)drv["StartDate"]):dd.MM.yyyy} {drv["StartTime"]}-{drv["EndTime"]})", constMessageWarningCaption, MessageBoxButton.OK, MessageBoxImage.Warning);
                            e.Handled = true;
                        }
                        else
                        {
                            //long id = (long)(((DataGrid)sender).SelectedItem as DataRowView)["ID"];
                            long id = (long)drv["ID"];
                            //myPostgreSQL.DB_t_UserDelete(id, CurrentUser.TableFullName);
                            myPostgreSQL.DB_t_UserDelete(id, ShownUser.TableFullName);
                        }
                    }
                }
                else
                    e.Handled = true;
            }
        }

        private void tcMain_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {

            if (CurrentUser != null && e.AddedItems.Count > 0 && e.AddedItems[0] is TabItem)
            {
                tcMain.IsEnabled = false; //<- odfajcilo moznost pridavat novy zaznam do vsetkych datagridov, koli niekolkonasobnemu vyvolavaniu tejto funkcie - zrejme kazde dieta ked vyvola zmenu tak vyvola aj toto -> vyriesene pridanim LastActualTabItem
                wndMain.Cursor = Cursors.Wait;

                if (LastActualMainTabItem != tiSpravca && e.AddedItems[0] == tiSpravca)
                {
                    dpZamestnanciUzamknutDochadzku.SelectedDate = dpZamestnanciUzamknutDochadzku.SelectedDate is null ? new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddDays(-1) : dpZamestnanciUzamknutDochadzku.SelectedDate;
                    LastActualMainTabItem = tiSpravca;
                }
                if (LastActualMainTabItem != tiZamestnanec && e.AddedItems[0] == tiZamestnanec)
                {
                    //FillUser(CurrentUser); //= myPostgreSQL.DB_UserGet(Options.User));
                    FillUser(ShownUser); //= myPostgreSQL.DB_UserGet(Options.User));
                    LastActualMainTabItem = tiZamestnanec;
                }
                if (LastActualMainTabItem != tiCestak && e.AddedItems[0] == tiCestak)
                {
                    ActualVisiblePrintGridPage = grdCestakPrintArea1;

                    //!!!

                    LastActualMainTabItem = tiCestak;
                }
                if (LastActualAdminTabItem != tiNastavenia && e.AddedItems[0] == tiNastavenia)
                {
                    grdNastaveniaPodpis.Visibility = CurrentUser.Typ == ZamestnanecTyp.SZCO ? Visibility.Hidden : Visibility.Visible;
                    if (CurrentUser.Typ != ZamestnanecTyp.SZCO)
                        imgPodpis.Source = myPostgreSQL.PodpisGet(CurrentUser.ID);

                    LastActualAdminTabItem = tiNastavenia;
                }

                else
                {
                    rbPridatSoZachovanim_Checked(rbPridatSoZachovanim, null);
                    grdShownUser.Visibility = CurrentUser.IsAdmin ? Visibility.Visible : Visibility.Hidden;

                    // od verzie 1.2.3 sa SZCO zobrazuje rovnako ako ostatni
                    //switch (CurrentUser.Typ)
                    //{
                    //    case ZamestnanecTyp.Zamestnanec:
                    //    case ZamestnanecTyp.Brigadnik:
                    //    case ZamestnanecTyp.Student:
                    if (LastActualMainTabItem != tiData && e.AddedItems[0] == tiData)
                    {
                        dpDateFrom.SelectedDate = dpDateFrom.SelectedDate is null ? new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1) : dpDateFrom.SelectedDate;
                        dpDateTo.SelectedDate = dpDateTo.SelectedDate is null ? DateTime.Now : dpDateTo.SelectedDate;
                        //LoadDochadzkaData(dpDateFrom.SelectedDate.Value, dpDateTo.SelectedDate.Value);

                        if (CurrentUser.IsAdmin)
                        {
                            cboShownUser.ItemsSource = myPostgreSQL.GetDataTable("SELECT * FROM \"ZamestnanciFullName\" WHERE \"ID\" > 1 ORDER BY \"Priezvisko\" ASC, \"Meno\" ASC").DefaultView;
                            cboShownUser.SelectedValuePath = "ID";
                            cboShownUser.DisplayMemberPath = "FullName";
                            cboShownUser.SelectedValue = ShownUser.ID;
                        }

                        if (dgDochadzka.Items.Count == 0)
                        {
                            DateTime now = DateTime.Now;
                            if (now.Date == GetFirstWorkDayOfMonth(now).Date)
                                dpDateFrom.SelectedDate = now.AddDays(-now.Day + 1).AddMonths(-1);
                            btnLoadData_Click(null, null);
                        }

                        LastActualMainTabItem = tiData;
                    }

                    if (LastActualMainTabItem != tiVykaz && e.AddedItems[0] == tiVykaz)
                    {
                        ActualVisiblePrintGridPage = grdZamestnanecPrintArea1;

                        //chkZakonnyVykaz.Visibility = CurrentUser.Typ == ZamestnanecTyp.Zamestnanec || CurrentUser.Typ == ZamestnanecTyp.SZCO ? Visibility.Hidden : Visibility.Visible;
                        chkZakonnyVykaz.Visibility = ShownUser.Typ == ZamestnanecTyp.Zamestnanec || ShownUser.Typ == ZamestnanecTyp.SZCO ? Visibility.Hidden : Visibility.Visible;
                        chkZakonnyVykaz.IsChecked = false;
                        cboZakonnyVykaz.Visibility = chkZakonnyVykaz.Visibility;
                        cboZakonnyVykaz.ItemsSource = CasoveIntervaly;
                        if (cboZakonnyVykaz.SelectedItem is null)
                            cboZakonnyVykaz.SelectedItem = "14:00";

                        ProcessVykaz(false);
                        //imgVPodpis.Source = imgPodpis.Source;
                        imgVPodpis.Source = myPostgreSQL.PodpisGet(ShownUser.ID);

                        LastActualMainTabItem = tiVykaz;
                    }
                    if (LastActualMainTabItem != tiWorklist && e.AddedItems[0] == tiWorklist)
                    {
                        ActualVisiblePrintGridPage = grdWorklistPrintArea;
                        int rok = dpDateFrom.SelectedDate.Value.Year;
                        int mesiac = dpDateFrom.SelectedDate.Value.Month;
                        DateTime dateFrom = dpDateFrom.SelectedDate.Value;
                        DateTime dateTo = dpDateTo.SelectedDate.Value;
                        if (IsFullMonth(dateFrom, dateTo))
                        {
                            lblSZCOHeader.Content = $"Výkaz práce za rok {rok}";
                            lblSZCOMesiac.Content = $"Mesiac: \t\t{mesiac}";
                        }
                        else
                        {
                            lblSZCOHeader.Content = $"Výkaz práce za rok " + (dateFrom.Year == dateTo.Year ? $"{dateTo.Year}" : $"{dateFrom.Year}-{dateTo.Year}");
                            lblSZCOMesiac.Content = $"Obdobie: \t{dateFrom:dd.MM.yyyy}-{dateTo:dd.MM.yyyy}";
                        }
                        lblSZCOMeno.Content = $"Pracovník: \t{GetFullUserName(ShownUser)}";

                        List<WorklistObject> worklistData = UpravWorklistData(myPostgreSQL.GetDataTable(
                            $"SELECT " +
                            $"\"Number\", " +
                            $"SUM(\"km\") AS \"KM\", " +
                            $"\"FullName\" AS \"PM\", " +
                            $"\"HourType\".\"ID\" AS \"HourType\", " +
                            //$"EXTRACT(epoch FROM SUM(\"EndTime\" - \"StartTime\"))/3600 as \"OdpracovaneHodiny\" " +
                            $"EXTRACT(EPOCH FROM SUM(CASE WHEN \"EndTime\" = '00:00:00' THEN '24:00:00' - \"StartTime\" ELSE \"EndTime\" - \"StartTime\" END))/3600 AS \"OdpracovaneHodiny\" " +
                            $"FROM " +
                            //$"\"{CurrentUser.TableFullName}\" " +
                            $"\"{ShownUser.TableFullName}\" " +
                            $"LEFT JOIN \"{Application.Current.Resources["TABLE_PROJEKT"]}\" ON \"ProjectID\" = \"{Application.Current.Resources["TABLE_PROJEKT"]}\".\"ID\" " +
                            $"LEFT JOIN \"ZamestnanciFullName\" ON \"Manager\" = \"ZamestnanciFullName\".\"ID\" " +
                            $"LEFT JOIN \"HourType\" ON \"HourTypeID\" = \"HourType\".\"ID\" " +
                            $"WHERE " +
                            $"\"HourType\" IS NOT NULL AND " +
                            $"\"StartDate\" >= TO_DATE('{dpDateFrom.SelectedDate.Value:dd.MM.yyyy}','DD.MM.YYYY') AND \"StartDate\" <= TO_DATE('{dpDateTo.SelectedDate.Value:dd.MM.yyyy}','DD.MM.YYYY') " +
                            //$"AND \"ProjectID\" IS NOT NULL " +
                            $"GROUP BY " +
                            $"\"Number\", \"FullName\", \"HourType\".\"ID\" " +
                            $"ORDER BY " +
                            $"\"Number\" "
                            ));
                        WorklistObject wlo = new(
                            "Celkom",
                            worklistData.Sum(w => w.Produktivne),
                            worklistData.Sum(w => w.Neproduktivne),
                            worklistData.Sum(w => w.NeproduktivneZ),
                            worklistData.Sum(w => w.ProduktivneZ),
                            worklistData.Sum(w => w.Produktivne70),
                            worklistData.Sum(w => w.KM),
                            ""
                            );
                        worklistData.Add(wlo);
                        dgWorklist.ItemsSource = worklistData.ToArray();

                        LastActualMainTabItem = tiWorklist;
                    }
                    if (LastActualMainTabItem != tiNadcas && e.AddedItems[0] == tiNadcas)
                    {
                        ActualVisiblePrintGridPage = grdNadcasPrintArea;

                        dpNadcasDateFrom.SelectedDate = dpNadcasDateFrom.SelectedDate is null ? dpDateFrom.SelectedDate is null ? new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1) : dpDateFrom.SelectedDate : dpNadcasDateFrom.SelectedDate;
                        dpNadcasDateTo.SelectedDate = dpNadcasDateTo.SelectedDate is null ? dpDateTo.SelectedDate is null ? DateTime.Now : dpDateTo.SelectedDate : dpNadcasDateTo.SelectedDate;

                        List<string> nadcasy = myPostgreSQL.GetDataTable("SELECT * FROM \"NadcasyTyp\" ORDER BY \"TypNadcasu\" ASC")
                            .Rows.Cast<DataRow>().Select(r => (string)r[0]).ToList();
                        nadcasy.Insert(0, "<Všetko>");
                        cboNadcasTyp.ItemsSource = nadcasy;
                        cboNadcasTyp.SelectedIndex = 0;

                        btnNadcasObnov_Click(null, null);

                        LastActualMainTabItem = tiNadcas;
                    }
                    // od verzie 1.2.3 sa SZCO zobrazuje rovnako ako ostatni
                    //        break;

                    //    case ZamestnanecTyp.SZCO:
                    //        if (LastActualMainTabItem != tiData && e.AddedItems[0] == tiData)
                    //        {
                    //            if (cboSZCORok.ItemsSource is null)
                    //            {
                    //                List<int> l = new();
                    //                foreach (DataRow dataRow in myPostgreSQL.GetDataTable($"SELECT DISTINCT EXTRACT(YEAR FROM \"StartDate\") as \"Year\" FROM \"{CurrentUser.TableFullName}\" ORDER BY \"Year\"").Rows)
                    //                    l.Add((int)(decimal)dataRow["Year"]);
                    //                int r = DateTime.Now.Year;
                    //                if (!l.Contains(r))
                    //                {
                    //                    l.Add(r);
                    //                    l.Sort();
                    //                }

                    //                cboSZCORok.ItemsSource = l;
                    //                cboSZCORok.SelectedItem = r;
                    //                cboSZCOMesiac.ItemsSource = new int[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 };
                    //                cboSZCOMesiac.SelectedItem = DateTime.Now.Month;

                    //                if (dgDochadzka.Items.Count == 0)
                    //                    btnLoadData_Click(null, null);
                    //            }

                    //            if (CurrentUser.IsAdmin)
                    //            {
                    //                cboShownUser.ItemsSource = myPostgreSQL.GetDataTable("SELECT \"ID\", \"FullName\" FROM \"ZamestnanciFullName\" WHERE \"ID\" > 1 ORDER BY \"Priezvisko\" ASC, \"Meno\" ASC").DefaultView;
                    //                cboShownUser.SelectedValuePath = "ID";
                    //                cboShownUser.DisplayMemberPath = "FullName";
                    //                cboShownUser.SelectedValue = ShownUser.ID;
                    //            }

                    //            LastActualMainTabItem = tiData;
                    //        }
                    //        if (LastActualMainTabItem != tiWorklist && e.AddedItems[0] == tiWorklist)
                    //        {
                    //            ActualVisiblePrintGridPage = grdWorklistPrintArea;
                    //            //lblWLNadcas.Visibility = Visibility.Hidden;
                    //            int rok = int.Parse(cboSZCORok.Text);
                    //            int mesiac = int.Parse(cboSZCOMesiac.Text);
                    //            lblSZCOHeader.Content = $"Výkaz práce za rok {rok}";
                    //            lblSZCOMesiac.Content = $"Mesiac: \t\t{mesiac}";
                    //            lblSZCOMeno.Content = $"Pracovník: \t{GetFullUserName()}";

                    //            List<WorklistObject> worklistData = UpravWorklistData(myPostgreSQL.GetDataTable(
                    //                $"SELECT " +
                    //                $"\"Number\", " +
                    //                $"sum(\"km\") as \"KM\", " +
                    //                $"\"FullName\" as \"PM\", " +
                    //                $"\"HourType\"," +
                    //                $"EXTRACT(epoch FROM sum(\"EndTime\" - \"StartTime\"))/3600 as \"OdpracovaneHodiny\" " +
                    //                $"FROM " +
                    //                $"\"{CurrentUser.TableFullName}\" " +
                    //                $"left join \"{Application.Current.Resources["TABLE_PROJEKT"]}\" on \"ProjectID\" = \"{Application.Current.Resources["TABLE_PROJEKT"]}\".\"ID\" " +
                    //                $"left join \"ZamestnanciFullName\" on \"Manager\" = \"ZamestnanciFullName\".\"ID\" " +
                    //                $"left join \"HourType\" on \"HourTypeID\" = \"HourType\".\"ID\" " +
                    //                $"where " +
                    //                $"\"StartDate\" >= TO_DATE('{(new DateTime(rok, mesiac, 1)):dd.MM.yyyy}','DD.MM.YYYY') AND \"StartDate\" <= TO_DATE('{(new DateTime(rok, mesiac + 1, 1).AddDays(-1)):dd.MM.yyyy}','DD.MM.YYYY') " +
                    //                $"group by " +
                    //                $"\"Number\", \"FullName\", \"HourType\" " +
                    //                $"order by " +
                    //                $"\"Number\""
                    //                ));
                    //            WorklistObject wlo = new(
                    //                "Celkom",
                    //                worklistData.Sum(w => w.Produktivne),
                    //                worklistData.Sum(w => w.Neproduktivne),
                    //                worklistData.Sum(w => w.NeproduktivneZ),
                    //                worklistData.Sum(w => w.ProduktivneOutSKCZ),
                    //                worklistData.Sum(w => w.Produktivne70),
                    //                worklistData.Sum(w => w.KM),
                    //                ""
                    //                );
                    //            worklistData.Add(wlo);
                    //            dgWorklist.ItemsSource = worklistData.ToArray();

                    //            LastActualMainTabItem = tiWorklist;
                    //        }

                    //        break;


                    //    default:
                    //        Log.Warning("tcMain_SelectionChanged: Neznamy typ zamestnanca {Typ}", CurrentUser.Typ);
                    //        //LastActualMainTabItem = null;
                    //        break;
                    //}
                }

                wndMain.Cursor = Cursors.Arrow;
                tcMain.IsEnabled = true;
            }
        }
        private void tcSpravca_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (CurrentUser != null && e.AddedItems.Count > 0 && e.AddedItems[0] is TabItem)
            {
                tcMain.IsEnabled = false; //<- odfajcilo moznost pridavat novy zaznam do vsetkych datagridov, koli niekolkonasobnemu vyvolavaniu tejto funkcie - zrejme kazde dieta ked vyvola zmenu tak vyvola aj toto -> vyriesene pridanim LastActualTabItem
                wndMain.Cursor = Cursors.Wait;

                if (LastActualAdminTabItem != tiZamestnanci && e.AddedItems[0] == tiZamestnanci)
                {
                    btnRefreshZ_Click(btnRefreshZ, null);
                    LastActualAdminTabItem = tiZamestnanci;
                }

                if (LastActualAdminTabItem != tiProjekty && e.AddedItems[0] == tiProjekty)
                {
                    btnRefreshP_Click(btnRefreshP, null);
                    LastActualAdminTabItem = tiProjekty;
                }

                wndMain.Cursor = Cursors.Arrow;
            }
        }

        private void DatePicker_SelectedDateChanged(object sender, SelectionChangedEventArgs e)
        {
            if (e.AddedItems.Count == 0)
            {
                (sender as DatePicker).SelectedDate = (e.RemovedItems[0] as DateTime?);
                e.Handled = true;
            }
            else
            {
                if (chkCelyMesiac.IsChecked == true && (sender as DatePicker).Name == "dpDateFrom")
                {
                    (sender as DatePicker).SelectedDate = new((sender as DatePicker).SelectedDate.Value.Year, (sender as DatePicker).SelectedDate.Value.Month, 1);
                    dpDateTo.SelectedDate = (sender as DatePicker).SelectedDate.Value.AddMonths(1).AddDays(-1);
                }
                if (chkNadcasCelyMesiac.IsChecked == true && (sender as DatePicker).Name == "dpNadcasDateFrom")
                {
                    (sender as DatePicker).SelectedDate = new((sender as DatePicker).SelectedDate.Value.Year, (sender as DatePicker).SelectedDate.Value.Month, 1);
                    dpNadcasDateTo.SelectedDate = (sender as DatePicker).SelectedDate.Value.AddMonths(1).AddDays(-1);
                }
            }
        }

        private void btnPrint_Click(object sender, RoutedEventArgs e)
        {
            wndMain.Cursor = Cursors.Wait;

            try
            {
                var printDialog = new PrintDialog();
                //nastavit tlac na vysku
                printDialog.PrintTicket.PageOrientation = PageOrientation.Portrait;
                printDialog.PrintTicket.PageMediaSize = new PageMediaSize(PageMediaSizeName.ISOA4);
                if (printDialog.ShowDialog() == true)
                {
                    DochadzkaPaginator paginator = null;

                    if (sender == btnNPrint)
                    {
                        paginator = new DochadzkaPaginator(grdNadcasPrintArea);
                        if (paginator != null)
                            printDialog.PrintDocument(paginator, "Dochadzka nadcas");
                    }
                    if (sender == btnVPrint)
                    {
                        Visibility v1 = grdZamestnanecPrintArea1.Visibility;
                        Visibility v2 = grdZamestnanecPrintArea2.Visibility;
                        grdZamestnanecPrintArea2.Visibility = Visibility.Visible;
                        grdZamestnanecPrintArea1.Visibility = Visibility.Visible;

                        paginator = new DochadzkaPaginator(
                            grdZamestnanecPrintArea1,
                            grdZamestnanecPrintArea2
                            );

                        if (paginator != null)
                            printDialog.PrintDocument(paginator, "Dochadzka vykaz");

                        grdZamestnanecPrintArea1.Visibility = v1;
                        grdZamestnanecPrintArea2.Visibility = v2;
                    }
                    if (sender == btnWLPrint)
                    {
                        //nastavit tlac na sirku
                        printDialog.PrintTicket.PageOrientation = PageOrientation.Landscape;

                        //paginator = new DochadzkaPaginator(grdWorklistPrintArea);
                        //if (paginator != null)
                        //{
                        //    printDialog.PrintTicket.PageOrientation = PageOrientation.Landscape;
                        //    printDialog.PrintDocument(paginator, "Dochadzka worklist");
                        //}

                        FrameworkElement el = grdWorklistPrintArea as FrameworkElement;
                        if (el == null)
                            return;

                        ////store original scale
                        //Transform originalScale = el.LayoutTransform;

                        //get selected printer capabilities
                        PrintCapabilities capabilities = printDialog.PrintQueue.GetPrintCapabilities(printDialog.PrintTicket);

                        ////get scale of the print wrt to screen of WPF visual
                        //double scale = Math.Min(capabilities.PageImageableArea.ExtentWidth / el.ActualWidth, capabilities.PageImageableArea.ExtentHeight /
                        //               el.ActualHeight);

                        ////Transform the Visual to scale
                        //el.LayoutTransform = new ScaleTransform(scale, scale);

                        //get the size of the printer page
                        Size sz = new Size(capabilities.PageImageableArea.ExtentWidth, capabilities.PageImageableArea.ExtentHeight);

                        //update the layout of the visual to the printer page size.
                        el.Measure(sz);
                        el.Arrange(new Rect(new Point(capabilities.PageImageableArea.OriginWidth, capabilities.PageImageableArea.OriginHeight), sz));

                        //now print the visual to printer to fit on the one page.
                        printDialog.PrintVisual(grdWorklistPrintArea, "Dochadzka worklist");

                        ////apply the original transform.
                        //el.LayoutTransform = originalScale;

                    }
                    if (sender == btnCPrint)
                    {
                        Visibility v1 = grdCestakPrintArea1.Visibility;
                        Visibility v2 = grdCestakPrintArea2.Visibility;
                        grdCestakPrintArea1.Visibility = Visibility.Visible;
                        grdCestakPrintArea2.Visibility = Visibility.Visible;

                        paginator = new DochadzkaPaginator(
                            grdCestakPrintArea1,
                            grdCestakPrintArea2
                            );

                        if (paginator != null)
                            printDialog.PrintDocument(paginator, "Dochadzka cestak");

                        grdCestakPrintArea1.Visibility = v1;
                        grdCestakPrintArea2.Visibility = v2;
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex, "btnPrint_Click:");
            }

            wndMain.Cursor = Cursors.Arrow;
        }

        private void btnPreview_Click(object sender, RoutedEventArgs e)
        {
            //try
            //{
            //	Window wndPrintPreview = new PrintPreview(grdZamestnanecPrintArea1, grdPrintArea2)
            //	{
            //		Owner = wndMain
            //	};

            //	wndPrintPreview.ShowDialog();
            //}
            //catch (Exception ex)
            //{
            //	Log.Error(ex, "btnPreview_Click:");
            //}
        }

        private void ComboBox_Loaded(object sender, RoutedEventArgs e)
        {
            ComboBox Sender = (ComboBox)sender;
            if (Sender.Name == "cbStartTime" || Sender.Name == "cbEndTime")
            {
                string t;
                switch ((long)((DataRowView)dgDochadzka.SelectedItem).Row["CinnostTypID"])
                {
                    case 2: //PN
                        if (Sender.Name == "cbStartTime")
                        {
                            t = "08:00";
                            Sender.ItemsSource = new ObservableCollection<string> { t };
                            Sender.SelectedItem = t;
                            Sender.Text = t;
                        }
                        if (Sender.Name == "cbEndTime")
                        {
                            t = "16:00";
                            Sender.ItemsSource = new ObservableCollection<string> { t };
                            Sender.SelectedItem = t;
                            Sender.Text = t;
                        }
                        break;

                    case 4: //RD
                        if (Sender.Name == "cbStartTime")
                        {
                            t = "08:00";
                            Sender.ItemsSource = new ObservableCollection<string> { t, "12:00" };
                            Sender.SelectedItem = t;
                            Sender.Text = t;
                        }
                        if (Sender.Name == "cbEndTime")
                        {
                            t = "16:00";
                            Sender.ItemsSource = new ObservableCollection<string> { "12:00", t };
                            Sender.SelectedItem = t;
                            Sender.Text = t;
                        }
                        break;

                    default:
                        Sender.ItemsSource = CasoveIntervaly;
                        break;
                }

                if (Sender.Name == "cbEndTime" && Sender.Text == string.Empty)
                {
                    Sender.SelectedItem = StartTimeValue;
                    StartTimeValue = string.Empty;
                }

                string s = Sender.Text;
                if (s != string.Empty && s.Length > 3)
                {
                    t = s.Substring(0, s.IndexOf(':') + 3);
                    Sender.Text = t;
                    Sender.SelectedItem = t;
                }
            }
            if (Sender.Name == "cbProject")
            {
                Sender.ItemsSource = myPostgreSQL.GetDataTable($"SELECT * FROM \"ActiveProjects\" ORDER BY \"NumberName\"").DefaultView;
                Sender.SelectedValuePath = "ID";
                Sender.DisplayMemberPath = "NumberName";
                string s = Sender.Text;
                if (s != string.Empty)
                    Sender.SelectedItem = Sender.Items.Cast<DataRowView>().FirstOrDefault(i => (string)(i.Row["NumberName"]) == s);
            }
        }

        private void btnNextPageVisible_Click(object sender, RoutedEventArgs e)
        {
            ActualVisiblePrintGridPage.Visibility = Visibility.Hidden;
            if (sender == btnNLeft || sender == btnNRight)
                ActualVisiblePrintGridPage = grdNadcasPrintArea;

            if (sender == btnVLeft || sender == btnVRight)
                if (ActualVisiblePrintGridPage == grdZamestnanecPrintArea1)
                    ActualVisiblePrintGridPage = grdZamestnanecPrintArea2;
                else
                    ActualVisiblePrintGridPage = grdZamestnanecPrintArea1;

            if (sender == btnWLLeft || sender == btnWLRight)
                ActualVisiblePrintGridPage = grdWorklistPrintArea;

            if (sender == btnCLeft || sender == btnCRight)
                if (ActualVisiblePrintGridPage == grdCestakPrintArea1)
                    ActualVisiblePrintGridPage = grdCestakPrintArea2;
                else
                    ActualVisiblePrintGridPage = grdCestakPrintArea1;

            ActualVisiblePrintGridPage.Visibility = Visibility.Visible;
        }

        private void btnRefreshZ_Click(object sender, RoutedEventArgs e)
        {
            wndMain.Cursor = Cursors.Wait;

            foreach (DataRowView dataRowView in dgZamestnanci.Items.OfType<DataRowView>())
            {
                if (dataRowView.Row["ID"] is not DBNull)
                {
                    DB_User? user = myPostgreSQL.DB_UserGet((long)dataRowView.Row["ID"]);
                    if (user != null && user.ID > 1)
                    {
                        DateTime date = (DateTime)myPostgreSQL.GetDataTable($"SELECT MAX(\"StartDate\") FROM \"{user.TableFullName}\"").Rows[0][0];
                        myPostgreSQL.PoslednyZaznamSet(user.ID, date);
                    }
                }
            }

            dgZamestnanci.ItemsSource = myPostgreSQL.GetDataTable(
                   $"SELECT " +
                   $"\"{Application.Current.Resources["TABLE_USER"]}\".*, " +
                   $"SUM(\"Nadcas\") as \"NadcasSum\" " +
                   $"FROM " +
                   $"\"{Application.Current.Resources["TABLE_NADCAS"]}\" " +
                   $"RIGHT JOIN \"{Application.Current.Resources["TABLE_USER"]}\" ON " +
                   $"\"{Application.Current.Resources["TABLE_NADCAS"]}\".\"ZamestnanecID\" = \"{Application.Current.Resources["TABLE_USER"]}\".\"ID\" " +
                   $"AND EXTRACT(YEAR FROM \"Datum\") = {DateTime.Now.Year} " +
                   $"WHERE \"ID\" > 1 " +
                   $"GROUP BY " +
                   $"\"{Application.Current.Resources["TABLE_USER"]}\".\"ID\" " +
                   $"ORDER BY " +
                   $"\"{Application.Current.Resources["TABLE_USER"]}\".\"ID\" "
                   ).DefaultView;
            dgcTypZamestnanca.ItemsSource = myPostgreSQL.GetDataTable("SELECT * FROM \"ZamestnanecTyp\" ORDER BY \"Typ\" ASC").DefaultView;
            dgcTypZamestnanca.SelectedValuePath = "Typ";
            dgcTypZamestnanca.DisplayMemberPath = "Typ";

            wndMain.Cursor = Cursors.Arrow;
        }
        private void btnRefreshP_Click(object sender, RoutedEventArgs e)
        {
            wndMain.Cursor = Cursors.Wait;

            dgProjekty.ItemsSource = myPostgreSQL.GetDataTable(
                   $"SELECT * FROM " +
                   $"\"{Application.Current.Resources["TABLE_PROJEKT"]}\" " +
                   (chkProjektyAktivne.IsChecked == true ? $"WHERE \"AllowAssignWorkingHours\" " : $"") +
                   $"ORDER BY " +
                   $"\"ID\" "
                   ).DefaultView;
            dgcCountry.ItemsSource = myPostgreSQL.GetDataTable("SELECT * FROM \"Countries\" ORDER BY \"CountryName\" ASC").DefaultView;
            dgcCountry.SelectedValuePath = "CountryCode";
            dgcCountry.DisplayMemberPath = "CountryName";
            dgcManager.ItemsSource = myPostgreSQL.GetDataTable($"SELECT * FROM \"ZamestnanciFullName\" ORDER BY \"Priezvisko\" ASC, \"Meno\" ASC").DefaultView;
            dgcManager.SelectedValuePath = "ID";
            dgcManager.DisplayMemberPath = "FullName";

            wndMain.Cursor = Cursors.Arrow;
        }

        private void chkCelyMesiac_CheckChanged(object sender, RoutedEventArgs e)
        {
            if (chkCelyMesiac.IsChecked == true)
            {
                DateTime from = dpDateFrom.SelectedDate.Value;
                dpDateFrom.SelectedDate = new DateTime(from.Year, from.Month, 1);
                from = dpDateFrom.SelectedDate.Value;
                dpDateTo.SelectedDate = from.AddMonths(1).AddDays(-1);
            }
            dpDateTo.IsEnabled = chkCelyMesiac.IsChecked == false;
        }

        private void btnNadcas_Click(object sender, RoutedEventArgs e)
        {
            wndMain.Cursor = Cursors.Wait;

            dgZamestnanci.IsEnabled = false;

            DataRowView dataRowView = dgZamestnanci.SelectedItem as DataRowView;
            //int i = 0;
            //while (!myPostgreSQL.NadcasSet((long)dataRowView.Row.ItemArray[0], DateTime.Now.AddDays(i), -((TimeSpan)dataRowView.Row.ItemArray[9]).TotalHours, CurrentUser.ID, "testovanie")) i--;

            NadcasWindow nadcas = new(this, myPostgreSQL, (long)dataRowView.Row["ID"], CurrentUser.ID, DateTime.Now.AddDays(-DateTime.Now.Day))
            {
                Owner = this,
                Topmost = true
            };
            nadcas.ShowDialog();

            //FillUser(CurrentUser = myPostgreSQL.DB_UserGet(CurrentUser.ID));
            btnRefreshZ_Click(null, null);

            dgZamestnanci.IsEnabled = true;

            wndMain.Cursor = Cursors.Arrow;
        }

        private void dgZamestnanci_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (e.AddedItems.Count > 0)
            {
                btnNadcas.IsEnabled = dgZamestnanci.SelectedItem is not null && dgZamestnanci.SelectedItem != CollectionView.NewItemPlaceholder;// && (dgZamestnanci.SelectedItem as DataRowView).Row["NadcasSum"] is not DBNull && ((System.TimeSpan)(dgZamestnanci.SelectedItem as DataRowView).Row["NadcasSum"]).TotalMinutes > 0;
                btnSpravcaDataCSV.IsEnabled = dgZamestnanci.SelectedItem is not null && dgZamestnanci.SelectedItem != CollectionView.NewItemPlaceholder && (dgZamestnanci.SelectedItem as DataRowView).Row["ID"] is not DBNull && (long)(dgZamestnanci.SelectedItem as DataRowView).Row["ID"] > 1;
                btnZamestnanciUzamknutDochadzku.IsEnabled = dgZamestnanci.SelectedItem is not null && dgZamestnanci.SelectedItem != CollectionView.NewItemPlaceholder && dgZamestnanci.SelectedItems.Count > 0;
                dpZamestnanciUzamknutDochadzku.IsEnabled = btnZamestnanciUzamknutDochadzku.IsEnabled;
                btnGenerujJSON.IsEnabled = btnZamestnanciUzamknutDochadzku.IsEnabled;
            }
        }

        private void dgZamestnanci_BeginningEdit(object sender, DataGridBeginningEditEventArgs e)
        {
            switch (e.Column.Header)
            {
                case "Meno":
                    if ((e.Row.Item as DataRowView).Row.ItemArray[1] is DBNull)
                        PovodneMeno = string.Empty;
                    else
                        PovodneMeno = (string)(e.Row.Item as DataRowView).Row.ItemArray[1];
                    break;

                case "Priezvisko":
                    if ((e.Row.Item as DataRowView).Row.ItemArray[2] is DBNull)
                        PovodnePriezvisko = string.Empty;
                    else
                        PovodnePriezvisko = (string)(e.Row.Item as DataRowView).Row.ItemArray[2];
                    break;

                default:
                    break;
            }
        }

        private void btnSpravcaDataCSV_Click(object sender, RoutedEventArgs e)
        {
            wndMain.Cursor = Cursors.Wait;
            Thread.Sleep(100);

            string meno = (string)(dgZamestnanci.SelectedItem as DataRowView).Row.ItemArray[1];
            string priezvisko = (string)(dgZamestnanci.SelectedItem as DataRowView).Row.ItemArray[2];
            if (MessageBox.Show($"Chcete načítať dáta zo súboru CSV pre '{meno} {priezvisko}'?", constMessageQuestionCaption, MessageBoxButton.YesNo, MessageBoxImage.Question, MessageBoxResult.No) == MessageBoxResult.Yes)
            {
                MessageBoxResult result = MessageBox.Show($"Chcete VYMAZAŤ existujúce dáta pred vložením nových?", constMessageWarningCaption, MessageBoxButton.YesNoCancel, MessageBoxImage.Warning, MessageBoxResult.No);
                if (result == MessageBoxResult.Cancel)
                {
                    wndMain.Cursor = Cursors.Arrow;
                    return;
                }

                bool vymazatStare = result == MessageBoxResult.Yes;

                OpenFileDialog openFileDialog = new()
                {
                    CheckFileExists = true,
                    DefaultExt = ".csv",
                    Filter = "Súbor dát|*.csv|All Files|*.*",
                    Multiselect = false,
                    ShowReadOnly = true
                };

                if (openFileDialog.ShowDialog(this) == true)
                {
                    NacitajCSV(openFileDialog.FileName, meno, priezvisko, vymazatStare, (long)(dgZamestnanci.SelectedItem as DataRowView).Row["ID"], ((string)(dgZamestnanci.SelectedItem as DataRowView).Row["TypZamestnanca"]).FromDBString<ZamestnanecTyp>());
                    MessageBox.Show($"Načítavanie dát zo súboru CSV pre '{meno} {priezvisko}' skončilo.");
                }
            }

            btnRefreshZ_Click(null, null);
            wndMain.Cursor = Cursors.Arrow;
        }

        private void chkProjektyAktivne_CheckChange(object sender, RoutedEventArgs e)
        {
            btnRefreshP_Click(btnRefreshP, null);
        }

        private void dgProjekty_RowEditEnding(object sender, DataGridRowEditEndingEventArgs e)
        {
            if (e.EditAction == DataGridEditAction.Commit)
            {
                DataRowView dataRowView = e.Row.DataContext as DataRowView;
                if (!IsDataRowOK(dataRowView.Row, DataRowType.DBProjekt))
                {
                    e.Cancel = true;
                    return;
                }

                if (dataRowView.IsNew)
                    myPostgreSQL.DB_ProjektAdd(new(dataRowView.Row));
                else if (dataRowView.IsEdit)
                    myPostgreSQL.DB_ProjektUpdate(new(dataRowView.Row));
            }
        }

        private void SetDataSumar()
        {
            Dictionary<KeyValuePair<string, int>, double> zoznam = new Dictionary<KeyValuePair<string, int>, double>();
            string projekt;
            int ht;
            double hodin;

            //nacitanie oznacenych riadkov
            foreach (DataRowView row in dgDochadzka.SelectedItems.OfType<DataRowView>())
            {
                if (row.Row["ProjectID"] is DBNull)
                    continue;
                projekt = row.Row["NumberName"].ToString().Split('/')[0];
                //neviem preco ale sem tam nenacita spravne data, je tam null aj ked nema byt, ale po preskoceni aj tak spocita (o.O)
                if (row.Row["HourTypeID"] is DBNull)
                    continue;

                ht = (int)(long)row.Row["HourTypeID"];
                hodin = ((TimeSpan)row.Row["WorkTime"]).TotalHours;

                //((DataView)dgcHourType.ItemsSource).Table.DefaultView.FindRows((object)1)

                if (zoznam.Any(z => z.Key.Key == projekt && z.Key.Value == ht))
                    zoznam[new KeyValuePair<string, int>(projekt, ht)] += hodin;
                else
                    zoznam.Add(new KeyValuePair<string, int>(projekt, ht), hodin);
            }

            //nacitanie nazvov druhu cinnosti
            List<string> druhCinnosti = new List<string>();
            foreach (DataRowView dataRowView in ((DataGridComboBoxColumn)dgDochadzka.Columns.FirstOrDefault(c => c.Header == dgcHourType.Header))?.ItemsSource)
                druhCinnosti.Add((string)dataRowView.Row["HourType"]);

            //vypis do gridu
            List<KeyValuePair<KeyValuePair<string, int>, double>> zoznamList = zoznam.ToList();
            zoznamList.Sort((l1, l2) => l1.Key.Value.CompareTo(l2.Key.Value));
            zoznamList.Sort((l1, l2) => l1.Key.Key.CompareTo(l2.Key.Key));
            int i = 0;
            grdDataSumar.Children.Clear();
            foreach (KeyValuePair<KeyValuePair<string, int>, double> item in zoznamList)
            {
                grdDataSumar.Children.Add(
                    new Label()
                    {
                        //!!! toto prvy podciarkovnik schova pod prve nasledujuce cislo, netusim preco!
                        Content = $"{item.Key.Key.Replace('_', '-')}:\t{druhCinnosti[item.Key.Value - 1]}:\t{item.Value:N1}h",
                        Margin = new Thickness(0, 10 + i++ * 30, 0, 0),
                        HorizontalAlignment = HorizontalAlignment.Left
                    }
                );
            }
        }

        private void dgDochadzka_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            int selectedItemsCount = dgDochadzka.SelectedItems.OfType<DataRowView>().Count();
            gbKopirovanie.IsEnabled = selectedItemsCount > 0;

            gbDataSumar.Visibility = selectedItemsCount > 1 ? Visibility.Visible : Visibility.Hidden;
            if (selectedItemsCount > 1)
                SetDataSumar();
        }

        private void btnZamestnanciUzamknutDochadzku_Click(object sender, RoutedEventArgs e)
        {
            if (dpZamestnanciUzamknutDochadzku.SelectedDate is null)
            {
                dpZamestnanciUzamknutDochadzku.Focus();
                return;
            }

            //List<DB_User> Users = new(myPostgreSQL.GetDataTable("").Rows.Cast<DataRow>().Select(r => { return new DB_User(r); }));
            //foreach (DB_User user in Users)
            //{
            //	myPostgreSQL.UzamkniDochadzku(dpZamestnanciUzamknutDochadzku.SelectedDate.Value, user.Meno, user.Priezvisko);
            //}
            int count = 0;
            foreach (object drv in dgZamestnanci.SelectedItems)
            {
                string meno, priezvisko;
                long id;
                if (drv is DataRowView && ((DataRowView)drv).Row["ID"] is not DBNull && (long)((DataRowView)drv).Row["ID"] > 1)
                {
                    meno = (string)((DataRowView)drv).Row["Meno"];
                    priezvisko = (string)((DataRowView)drv).Row["Priezvisko"];
                    id = (long)((DataRowView)drv).Row["ID"];
                    if (myPostgreSQL.UzamkniDochadzku(dpZamestnanciUzamknutDochadzku.SelectedDate.Value, meno, priezvisko))
                    {
                        count++;
                        myPostgreSQL.ZamknuteKSet(id, dpZamestnanciUzamknutDochadzku.SelectedDate.Value); //myPostgreSQL.ZamknuteKGet($"t_{meno.RemoveDiacritics()}_{priezvisko.RemoveDiacritics()}"));
                        Log.Information($"Úspešne uzaknutá dochádzka pre '{meno} {priezvisko}' ku dňu {dpZamestnanciUzamknutDochadzku.SelectedDate.Value}.");
                    }
                }
            }

            MessageBox.Show($"Úspešné uzamknutie dochádzky pre {count} z {dgZamestnanci.SelectedItems.Count} užívateľov.");
            btnRefreshZ_Click(null, null);
        }

        private void btnDataKopirovanie_Click(object sender, RoutedEventArgs e)
        {
            List<DB_t_User> AddedRows = new();
            AddedRows.AddRange(dgDochadzka.SelectedItems.Cast<DataRowView>().Select(v => { return new DB_t_User(v.Row); }));

            DateTime ZapisovanyDatum = dpDataKopirovanie.SelectedDate.Value.AddDays(-1);
            DateTime PovodnyDatum = DateTime.MinValue;
            foreach (DB_t_User t_User in AddedRows)
            {
                if (PovodnyDatum != t_User.StartDate)
                {
                    ZapisovanyDatum = ZapisovanyDatum.AddDays(1);
                    PovodnyDatum = t_User.StartDate;
                }

                if (rbPridatSoZachovanim.IsChecked == true)
                    while (ZapisovanyDatum.DayOfWeek != PovodnyDatum.DayOfWeek)
                        ZapisovanyDatum = ZapisovanyDatum.AddDays(1);

                t_User.ChangeStartDate(ZapisovanyDatum);
            }

            //myPostgreSQL.DB_t_UserAdd(AddedRows, CurrentUser.TableFullName, false, 0);
            myPostgreSQL.DB_t_UserAdd(AddedRows, ShownUser.TableFullName, false, 0);

            if (dpDateTo.SelectedDate.Value < ZapisovanyDatum)
                dpDateTo.SelectedDate = ZapisovanyDatum;
            btnLoadData_Click(null, null);
        }

        private void dgProjekty_PreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Delete)
                e.Handled = true;
        }

        private void dgDochadzka_BeginningEdit(object sender, DataGridBeginningEditEventArgs e)
        {
            if (((DataRowView)e.Row.DataContext).Row["Lock"] != DBNull.Value && (bool)((DataRowView)e.Row.DataContext).Row["Lock"])
            {
                MessageBox.Show("Tento záznam je už uzamknutý a nedá sa meniť.", constMessageWarningCaption, MessageBoxButton.OK, MessageBoxImage.Warning);
                e.Cancel = true;
            }
        }

        private void btnNahrajPodpis_Click(object sender, RoutedEventArgs e)
        {
            OpenFileDialog openFileDialog = new()
            {
                CheckFileExists = true,
                Filter = "Obrázok|*.gif;*.jpg;*.jpe*;*.png;*.bmp;*.dib;*.tif;*.wmf;*.ras;*.eps;*.pcx;*.pcd;*.tga|All Files|*.*",
                Multiselect = false,
                Title = "Načítaj obrázok s podpisom"
            };

            if (openFileDialog.ShowDialog() == true)
            {
                using (FileStream fileStream = File.Open(openFileDialog.FileName, FileMode.Open))
                {
                    myPostgreSQL.PodpisSet(new BinaryReader(fileStream).ReadBytes((int)fileStream.Length), CurrentUser.ID);
                }
                imgPodpis.Source = myPostgreSQL.PodpisGet(CurrentUser.ID);
            }

        }

        private void rbPridatBezZachovania_Checked(object sender, RoutedEventArgs e)
        {
            BitmapImage image = new();
            image.BeginInit();
            image.UriSource = new Uri(Path.Combine(AppPath, "img\\bez.zachovania.dna.png"));
            image.EndInit();

            if (imgKopirovaniePriklad != null)
                imgKopirovaniePriklad.Source = image;
        }

        private void rbPridatSoZachovanim_Checked(object sender, RoutedEventArgs e)
        {
            BitmapImage image = new();
            image.BeginInit();
            image.UriSource = new Uri(Path.Combine(AppPath, "img\\so.zachovanim.dna.png"));
            image.EndInit();

            if (imgKopirovaniePriklad != null)
                imgKopirovaniePriklad.Source = image;
        }

        private void btnGenerujJSON_Click(object sender, RoutedEventArgs e)
        {
            if (MessageBox.Show($"Chcete generovat 'dochadzka.json' pre označených ({dgZamestnanci.SelectedItems.Count}) zamestnancov?", constMessageQuestionCaption, MessageBoxButton.YesNo, MessageBoxImage.Question, MessageBoxResult.No) == MessageBoxResult.Yes)
            {
                int i = 0;
                foreach (object drv in dgZamestnanci.SelectedItems)
                {
                    if (drv is DataRowView && (long)((DataRowView)drv).Row["ID"] > 1)
                    {
                        DataRowView dataRowView = (DataRowView)drv;
                        string path = Directory.CreateDirectory(Path.Combine(AppPath, "JSON", $"{dataRowView.Row["Meno"]} {dataRowView.Row["Priezvisko"]}")).FullName;

                        //using (FileStream stream = new FileStream(Path.Combine(path, constOptionsFileName), FileMode.Create))
                        //    JsonSerializer.Serialize(stream, new DochadzkaOptions() { User = (long)dataRowView.Row["ID"] });
                        SaveUserOptions(otherOptions: new() { User = (long)dataRowView.Row["ID"] });
                        i++;
                    }
                }
                MessageBox.Show($"Generovanie dokončné ({i}). \r\n\r\n({Path.Combine(AppPath, "JSON")})", (string)btnGenerujJSON.Content);
                btnRefreshZ_Click(null, null);
            }

        }

        private void SetNadcasSum(List<Tuple<string, double>> nadcasSums)
        {
            NadcasSums = nadcasSums;

            lblNadcasSumarFlexi.Content = $"{nadcasSums[0].Item1}: {nadcasSums[0].Item2:0.##}h";
            lblNadcasSumarSCSKCesta.Content = $"{nadcasSums[1].Item1}: {nadcasSums[1].Item2:0.##}h";
            lblNadcasSumarSCZahranicie.Content = $"{nadcasSums[2].Item1}: {nadcasSums[2].Item2:0.##}h";
            lblNadcasSumarNeplateny.Content = $"{nadcasSums[3].Item1}: {nadcasSums[3].Item2:0.##}h";
        }

        private void btnNadcasObnov_Click(object sender, RoutedEventArgs e)
        {
            wndMain.Cursor = Cursors.Wait;

            dgNadcas.ItemsSource = myPostgreSQL.GetDataTable(
               $"SELECT \"{Application.Current.Resources["TABLE_NADCAS"]}\".*, \"FullName\" FROM \"{Application.Current.Resources["TABLE_NADCAS"]}\" " +
                        $"LEFT JOIN \"ZamestnanciFullName\" ON \"ZamestnanciFullName\".\"ID\" = \"Schvalil\" " +
                        //$"WHERE \"ZamestnanecID\" = {CurrentUser.ID} AND " +
                        $"WHERE \"ZamestnanecID\" = {ShownUser.ID} AND " +
                        $"\"Datum\" >= TO_DATE('{dpNadcasDateFrom.SelectedDate.Value:dd.MM.yyyy}','DD.MM.YYYY') AND \"Datum\" <= TO_DATE('{dpNadcasDateTo.SelectedDate.Value:dd.MM.yyyy}','DD.MM.YYYY') " +
                        (cboNadcasTyp.SelectedIndex == 0 ? "" : $"AND \"Typ\" = '{cboNadcasTyp.SelectedItem}' ") +
                        $"ORDER BY \"Datum\" ASC, \"Typ\" ASC").DefaultView;

            ////List<Tuple<string, double>> nadcasSums = GetNadcasySums(CurrentUser.ID, dpNadcasDateFrom.SelectedDate.Value, dpNadcasDateTo.SelectedDate.Value);
            //List<Tuple<string, double>> nadcasSums = GetNadcasySums(ShownUser.ID, dpNadcasDateFrom.SelectedDate.Value, dpNadcasDateTo.SelectedDate.Value);
            //lblNadcasSumarFlexi.Content = $"{nadcasSums[0].Item1}: {nadcasSums[0].Item2:0.##}h";
            //lblNadcasSumarSCSKCesta.Content = $"{nadcasSums[1].Item1}: {nadcasSums[1].Item2:0.##}h";
            //lblNadcasSumarSCZahranicie.Content = $"{nadcasSums[2].Item1}: {nadcasSums[2].Item2:0.##}h";
            //lblNadcasSumarNeplateny.Content = $"{nadcasSums[3].Item1}: {nadcasSums[3].Item2:0.##}h";
            SetNadcasSum(GetNadcasySums(ShownUser.ID, dpNadcasDateFrom.SelectedDate.Value, dpNadcasDateTo.SelectedDate.Value));

            dgNadcasPrint.ItemsSource = NadcasSums;
            lblNadcasHeader.Content = $"{dpNadcasDateFrom.SelectedDate.Value:dd.MM.yyyy} - {dpNadcasDateTo.SelectedDate.Value:dd.MM.yyyy}";

            DateTime lockDate = myPostgreSQL.ZamknuteKGet(ShownUser.ID);
            tblLock.Text = $"Dochádzka je uzamknutá do {lockDate:dd.MM.yyyy}, pre novšie nadčasy je potrebné vygenerovať výkaz.";
            grdLock.Visibility = (dpNadcasDateFrom.SelectedDate.Value > lockDate || dpNadcasDateTo.SelectedDate.Value > lockDate) ? Visibility.Visible : Visibility.Hidden;

            wndMain.Cursor = Cursors.Arrow;
        }

        private void cboShownUser_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (cboShownUser.SelectedValue != null && ShownUser.ID != (long)cboShownUser.SelectedValue)
            {
                ShownUser = myPostgreSQL.DB_UserGet((long)cboShownUser.SelectedValue);
                btnLoadData_Click(null, null);
            }
        }

        private void chkZakonnyVykaz_Checked(object sender, RoutedEventArgs e)
        {
            ProcessVykaz(true, TimeSpan.Parse((string)cboZakonnyVykaz.SelectedItem));
        }

        private void chkZakonnyVykaz_Unchecked(object sender, RoutedEventArgs e)
        {
            ProcessVykaz(false);
        }

        private void cboZakonnyVykaz_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (chkZakonnyVykaz.IsChecked.Value)
                ProcessVykaz(true, TimeSpan.Parse((string)cboZakonnyVykaz.SelectedItem));
        }

        private void chkNadcasCelyMesiac_CheckChanged(object sender, RoutedEventArgs e)
        {
            if (chkNadcasCelyMesiac.IsChecked == true)
            {
                DateTime from = dpNadcasDateFrom.SelectedDate.Value;
                dpNadcasDateFrom.SelectedDate = new DateTime(from.Year, from.Month, 1);
                from = dpNadcasDateFrom.SelectedDate.Value;
                dpNadcasDateTo.SelectedDate = from.AddMonths(1).AddDays(-1);
            }
            dpNadcasDateTo.IsEnabled = chkNadcasCelyMesiac.IsChecked == false;
        }

        private void btnNadcasTlacit_Click(object sender, RoutedEventArgs e)
        {
            if (((string)btnNadcasTlacit.Content).StartsWith('T'))
            {
                btnNadcasTlacit.Content = "< Späť";
                grdNadcasData.Visibility = Visibility.Hidden;
                grdNadcasPrint.Visibility = Visibility.Visible;
                btnNadcasCSV.IsEnabled = false;
            }
            else
            {
                btnNadcasTlacit.Content = "Tlačiť";
                grdNadcasData.Visibility = Visibility.Visible;
                grdNadcasPrint.Visibility = Visibility.Hidden;
                btnNadcasCSV.IsEnabled = true;
            }
        }

        private void btnDataCSV_Click(object sender, RoutedEventArgs e)
        {
            SaveFileDialog saveFileDialog = new()
            {
                DefaultExt = ".csv",
                Filter = "Súbor dát|*.csv|All Files|*.*",
            };
            if (Options.CSVDirectory != string.Empty)
                saveFileDialog.InitialDirectory = Options.CSVDirectory;

            if (saveFileDialog.ShowDialog(this) == true)
            {
                if (Options.CSVDirectory != saveFileDialog.InitialDirectory)
                {
                    Options.CSVDirectory = saveFileDialog.InitialDirectory;
                    SaveUserOptions();
                }

                using (StreamWriter fs = new StreamWriter(saveFileDialog.FileName, false, Encoding.UTF8))
                {
                    //headers
                    fs.WriteLine($"{string.Join(";", dgDochadzka.Columns.Where(c => c.Visibility == Visibility.Visible).Select(c => c.Header.ToString()).ToList())}");
                    //data
                    List<string> colunNames = dgDochadzka.Columns.Where(c => c.Visibility == Visibility.Visible).Select(c => c.SortMemberPath.ToString().Split('.')[0]).ToList();
                    string[] ret = new string[colunNames.Count];

                    List<string> cinnostTyps = myPostgreSQL.GetDataTable("SELECT \"Alias\" FROM \"CinnostTyp\" ORDER BY \"ID\" ASC")
                        .Rows.Cast<DataRow>().Select(r => (string)r[0]).ToList();
                    List<string> projects = myPostgreSQL.GetDataTable("SELECT \"Number\", \"Name\" FROM \"Projects\" ORDER BY \"ID\" ASC")
                        .Rows.Cast<DataRow>().Select(r => $"{(string)r[0]}/{(string)r[1]}").ToList();
                    List<string> hourTypes = myPostgreSQL.GetDataTable("SELECT \"HourType\" FROM \"HourType\" ORDER BY \"ID\" ASC")
                        .Rows.Cast<DataRow>().Select(r => (string)r[0]).ToList();
                    List<string> hourTypess = myPostgreSQL.GetDataTable("SELECT \"HourType\" FROM \"HourTypes\" ORDER BY \"ID\" ASC")
                        .Rows.Cast<DataRow>().Select(r => (string)r[0]).ToList();

                    foreach (DataRowView drv in dgDochadzka.SelectedItems.OfType<DataRowView>())
                    {
                        for (int i = 0; i < colunNames.Count; i++)
                        {
                            object o = drv[colunNames[i]];
                            if (o is DateTime)
                                ret[i] = $"{((DateTime)o):dd.MM.yyyy}";
                            else if (o is TimeSpan)
                            {
                                if (colunNames[i] == "WorkTime")
                                    ret[i] = ((TimeSpan)o).TotalHours.ToString();
                                else
                                    ret[i] = $"{((TimeSpan)o):hh\\:mm}";
                            }
                            else
                            {
                                switch (colunNames[i])
                                {
                                    case "CinnostTypID":
                                        ret[i] = cinnostTyps[(int)(long)o - 1];
                                        break;
                                    case "ProjectID":
                                        if (o is DBNull)
                                            ret[i] = string.Empty;
                                        else
                                            ret[i] = projects[(int)(long)o - 1];
                                        break;
                                    case "HourTypeID":
                                        if (o is DBNull)
                                            ret[i] = string.Empty;
                                        else
                                            ret[i] = hourTypes[(int)(long)o - 1];
                                        break;
                                    case "HourTypesID":
                                        if (o is DBNull)
                                            ret[i] = string.Empty;
                                        else
                                            ret[i] = hourTypess[(int)(long)o - 1];
                                        break;

                                    default:
                                        ret[i] = o.ToString();
                                        break;
                                }
                            }
                        }
                        fs.WriteLine(string.Join(";", ret));
                    }
                }
                MessageBox.Show($"Uloženie dát do súboru CSV ({saveFileDialog.SafeFileName}) skončilo.");
            }
        }

        private void btnNadcasCSV_Click(object sender, RoutedEventArgs e)
        {
            SaveFileDialog saveFileDialog = new()
            {
                DefaultExt = ".csv",
                Filter = "Súbor dát|*.csv|All Files|*.*",
            };
            if (Options.CSVDirectory != string.Empty)
                saveFileDialog.InitialDirectory = Options.CSVDirectory;

            if (saveFileDialog.ShowDialog(this) == true)
            {
                if (Options.CSVDirectory != saveFileDialog.InitialDirectory)
                {
                    Options.CSVDirectory = saveFileDialog.InitialDirectory;
                    SaveUserOptions();
                }

                using (StreamWriter fs = new StreamWriter(saveFileDialog.FileName, false, Encoding.UTF8))
                {
                    //headers
                    fs.WriteLine($"{string.Join(";", dgNadcas.Columns.Where(c => c.Visibility == Visibility.Visible).Select(c => c.Header.ToString()).ToList())}");
                    //data
                    List<string> colunNames = dgNadcas.Columns.Where(c => c.Visibility == Visibility.Visible).Select(c => c.SortMemberPath.ToString().Split('.')[0]).ToList();
                    string[] ret = new string[colunNames.Count];

                    foreach (DataRowView drv in dgNadcas.Items.OfType<DataRowView>())
                    {
                        for (int i = 0; i < colunNames.Count; i++)
                        {
                            object o = drv[colunNames[i]];
                            if (o is DateTime)
                                ret[i] = $"{((DateTime)o):dd.MM.yyyy}";
                            else if (o is TimeSpan)
                                ret[i] = $"{((TimeSpan)o):hh\\:mm}";
                            else
                                ret[i] = o.ToString();
                        }
                        fs.WriteLine(string.Join(";", ret));
                    }
                }
                MessageBox.Show($"Uloženie dát do súboru CSV ({saveFileDialog.SafeFileName}) skončilo.");
            }
        }

        private void dgWorklist_LostFocus(object sender, RoutedEventArgs e)
        {
            dgWorklist.UnselectAll();
        }

        private void ComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            ComboBox Sender = (ComboBox)sender;
            if (Sender.Name == "cbStartTime")
                StartTimeValue = (string)Sender.SelectedItem;
        }

        private void dgNadcas_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (dgNadcas.SelectedItems.Count > 1)
            {
                double flexi = 0, neplateny = 0, cesta = 0, zahranicie = 0;
                foreach (DataRowView row in dgNadcas.SelectedItems.OfType<DataRowView>())
                {
                    switch (((string)row["Typ"]).FromDBString<NadcasTyp>())
                    {
                        case NadcasTyp.Flexi:
                            flexi += ((TimeSpan)row["Nadcas"]).TotalHours;
                            break;

                        case NadcasTyp.Neplateny:
                            neplateny += ((TimeSpan)row["Nadcas"]).TotalHours;
                            break;

                        case NadcasTyp.SCSKCesta:
                            cesta += ((TimeSpan)row["Nadcas"]).TotalHours;
                            break;

                        case NadcasTyp.SCZahranicie:
                            zahranicie += ((TimeSpan)row["Nadcas"]).TotalHours;
                            break;

                        default:
                            break;
                    }
                }
                lblNadcasSumarFlexi.Content = $"{NadcasTyp.Flexi.ToDBString()}: {flexi:0.##}h";
                lblNadcasSumarSCSKCesta.Content = $"{NadcasTyp.SCSKCesta.ToDBString()}: {cesta:0.##}h";
                lblNadcasSumarSCZahranicie.Content = $"{NadcasTyp.SCZahranicie.ToDBString()}: {zahranicie:0.##}h";
                lblNadcasSumarNeplateny.Content = $"{NadcasTyp.Neplateny.ToDBString()}: {neplateny:0.##}h";

                borNadcasSumar.BorderBrush = new SolidColorBrush(Colors.Blue);
                borNadcasSumar.BorderThickness = new Thickness(3);
            }
            else
            {
                borNadcasSumar.BorderBrush = new SolidColorBrush(Colors.Black);
                borNadcasSumar.BorderThickness = new Thickness(1);
                SetNadcasSum(NadcasSums);
            }
        }
    }
}