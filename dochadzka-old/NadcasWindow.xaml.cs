using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Printing;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace dochadzka
{
    /// <summary>
    /// Interaction logic for NadcasWindow.xaml
    /// </summary>
    public partial class NadcasWindow : Window
    {
        const string constDefaultWindowTitle = "Úprava nadčasu";

        MainWindow Owner;
        PostgreSQL myPostgreSQL;
        double Nadcas;
        double Hodiny;
        long UserID;
        long SchvalilUserID;
        NadcasTyp SelectedNadcasTyp;

        bool Init;
        bool DataLoad;

        public NadcasWindow(MainWindow owner, PostgreSQL postgreSQL, long userID, long schvalilUserID, DateTime quarter)
        {
            Init = true;
            InitializeComponent();
            Init = false;

            Owner = owner;
            myPostgreSQL = postgreSQL;
            UserID = userID;
            SchvalilUserID = schvalilUserID;

            dpUpravaNadcasuDatum.SelectedDate = quarter;
        }

        private void btnOdpocitaj_Click(object sender, RoutedEventArgs e)
        {
            double nadcas;
            try
            {
                nadcas = double.Parse(txtOdpocitaj.Text);
                if (rbOdpocitaj.IsChecked.Value)
                    nadcas = 0 - nadcas;
            }
            catch
            {
                txtOdpocitaj.Focus();
                return;
            }

            //od verzie 1.4.0
            ////od verzie 1.3.2
            //int i = 0;
            //DateTime date;
            //long schvalilID = 0;
            ////while (!myPostgreSQL.NadcasSet(UserID, DateTime.Now.AddDays(i), nadcas, SelectedNadcasTyp, SchvalilUserID, txtPoznamka.Text.Trim())) i--;
            //while (true)
            //{
            //    date = DateTime.Now.AddDays(i);
            //    if (!myPostgreSQL.NadcasSet(UserID, date, nadcas, SelectedNadcasTyp, SchvalilUserID, txtPoznamka.Text.Trim(), true))
            //    {
            //        DataTable nadcasyTable = myPostgreSQL.GetDataTable($"SELECT \"Schvalil\", \"Nadcas\" FROM \"Nadcasy\" WHERE \"ZamestnanecID\" = {UserID} AND \"Datum\" = TO_DATE('{date:dd.MM.yyyy}','DD.MM.YYYY') AND \"Typ\" = '{SelectedNadcasTyp.ToDBString()}'");
            //        schvalilID = (long)nadcasyTable.Rows[0][0];
            //        if (schvalilID == 1)
            //            i--;
            //        else
            //        {
            //            nadcas += ((TimeSpan)nadcasyTable.Rows[0][1]).TotalHours;
            //            if (!myPostgreSQL.NadcasUpdate(UserID, date, nadcas, SelectedNadcasTyp, SchvalilUserID, txtPoznamka.Text.Trim()))
            //                MessageBox.Show($"Chyba pri zapisovaní nadčasu (užívateľ: {UserID}, dátum: {date:dd.MM.yyyy}, poznámka: '{txtPoznamka.Text.Trim()}')", "CHYBA", MessageBoxButton.OK, MessageBoxImage.Error);
            //            break;
            //        }
            //    }
            //    else
            //        break;
            //}

            DateTime date = dpUpravaNadcasuDatum.SelectedDate.Value;
            DataView ulozenyNadcas = myPostgreSQL.GetDataTable($"SELECT * FROM \"Nadcasy\" WHERE \"ZamestnanecID\" = {UserID} AND \"Datum\" = TO_DATE('{dpUpravaNadcasuDatum.SelectedDate.Value:dd.MM.yyyy}','DD.MM.YYYY') AND \"Typ\" = '{SelectedNadcasTyp}' AND \"Odpocet\" = true").DefaultView;

            if (ulozenyNadcas.Count == 0)
                myPostgreSQL.NadcasSet(UserID, date, nadcas, SelectedNadcasTyp, SchvalilUserID, txtPoznamka.Text.Trim(), true);
            else
            {
                string oldSchvalil = "";
                long oldSchvalilID = (long)ulozenyNadcas[0]["Schvalil"];
                if (SchvalilUserID != oldSchvalilID)
                    oldSchvalil = $" ({Owner.GetFullUserName(oldSchvalilID)}) ";
                myPostgreSQL.NadcasUpdate(
                    UserID,
                    date,
                    nadcas + ((TimeSpan)ulozenyNadcas[0]["Nadcas"]).TotalHours,
                    SelectedNadcasTyp,
                    SchvalilUserID,
                    (string)ulozenyNadcas[0]["Poznamka"] + oldSchvalil + "\n" + txtPoznamka.Text.Trim(),
                    true);
            }

            //Close();
            NacitajNadcas();
        }

        private void NacitajNadcas()
        {
            DateTime start = new(DateTime.Now.Year, 1, 1);
            DateTime end = DateTime.Now;
            List<Tuple<string, double>> NadcasSumare = new()
            {
                new(NadcasTyp.Flexi.ToDBString(), myPostgreSQL.NadcasSumGet(UserID, start, end, NadcasTyp.Flexi)),
                new(NadcasTyp.SCSKCesta.ToDBString(), myPostgreSQL.NadcasSumGet(UserID, start, end, NadcasTyp.SCSKCesta)),
                new(NadcasTyp.SCZahranicie.ToDBString(), myPostgreSQL.NadcasSumGet(UserID, start, end, NadcasTyp.SCZahranicie)),
                new(NadcasTyp.Neplateny.ToDBString(), myPostgreSQL.NadcasSumGet(UserID, start, end, NadcasTyp.Neplateny))
            };

            DataLoad = true;
            dgrNadcasy.ItemsSource = NadcasSumare;
            DataLoad = false;
            dgrNadcasy.SelectedIndex = 0;
            dgrNadcasy.Focus();
        }

        private void wndNadcas_Loaded(object sender, RoutedEventArgs e)
        {
            //cboNadcasTyp.ItemsSource = myPostgreSQL.GetDataTable("SELECT * FROM \"NadcasyTyp\" ORDER BY \"TypNadcasu\" ASC").DefaultView;
            //cboNadcasTyp.DisplayMemberPath = "TypNadcasu";
            //cboNadcasTyp.SelectedValuePath = "TypNadcasu";
            //cboNadcasTyp.SelectedIndex = 0;

            NacitajNadcas();
        }

        private void txtOdpocitaj_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (Init)
                return;

            try
            {
                double nadcas = double.Parse(txtOdpocitaj.Text);
                double vysledok = rbOdpocitaj.IsChecked.Value ? Nadcas - nadcas : Nadcas + nadcas;
                lblZostatokNadcasu.Content = $"Zostatok nadčasu po {(rbOdpocitaj.IsChecked == true ? "odpočítaní" : "pripočítaní")}: {(vysledok):0.##}h";
            }
            catch
            {
                txtOdpocitaj.Focus();
            }
        }

        private void RadioButton_Checked(object sender, RoutedEventArgs e)
        {
            if (Init)
                return;
            lblUpravaNadcasu.Content = ((RadioButton)sender).Content + ":";
            btnOdpocitaj.Content = ((RadioButton)sender).Content;
            txtOdpocitaj_TextChanged(null, null);
        }

        private void dgrNadcasy_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (DataLoad)
                return;
            SelectedNadcasTyp = ((Tuple<string, double>)dgrNadcasy.SelectedItem).Item1.FromDBString<NadcasTyp>();
            Nadcas = myPostgreSQL.NadcasSumGet(UserID, new(DateTime.Now.Year, 1, 1), DateTime.Now, SelectedNadcasTyp);

            rbPripocitaj.IsChecked = Nadcas <= 0;
            rbOdpocitaj.IsChecked = Nadcas > 0;
            txtOdpocitaj.Text = $"{Math.Abs(Nadcas):0.##}";
            txtPoznamka.Text = $"Upravené {DateTime.Now:dd.MM.yyyy}";
        }
    }
}
