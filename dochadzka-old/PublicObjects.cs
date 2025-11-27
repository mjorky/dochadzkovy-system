using System;
using System.Data;
using System.Linq;
using System.Printing;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;

namespace dochadzka
{
    public enum DataRowType : byte
    {
        Unknown = 0,
        DBUser = 1,
        DBtUser = 2,
        DBProjekt = 3,
        DBNadcas = 4
    }

    public enum NadcasTyp : byte
    {
        Unknown = 0,
        Flexi,
        Neplateny,
        SCSKCesta,
        SCZahranicie
    }

    public enum ZamestnanecTyp : byte
    {
        Unknown = 0,
        Zamestnanec,
        SZCO,
        Brigadnik,
        Student
    }

    //public class DB_t_UserValidationRule : ValidationRule
    //{
    //    public override ValidationResult Validate(object value,
    //        System.Globalization.CultureInfo cultureInfo)
    //    {
    //        DB_t_User t_User = new DB_t_User(((value as BindingGroup).Items[0] as DataRowView).Row);
    //        if (t_User.StartTime > t_User.EndTime)
    //        {
    //            return new ValidationResult(false,
    //                "StartTime musí byt skôr ako EndTime.");
    //        }
    //        else
    //        {
    //            return ValidationResult.ValidResult;
    //        }
    //    }
    //}
    public class DochadzkaPaginator : DocumentPaginator
    {
        Size pageSize;
        Visual pageVisual1;
        Visual pageVisual2;
        Visual pageVisual3;
        Visual pageVisual4;

        public override bool IsPageCountValid => true;

        public override int PageCount
        {
            get
            {
                if (pageVisual2 != null)
                {
                    if (pageVisual3 != null)
                    {
                        if (pageVisual4 != null)
                            return 4;
                        return 3;
                    }
                    return 2;
                }
                return 1;
            }
        }

        public DochadzkaPaginator(Visual visual1, Visual visual2 = null, Visual visual3 = null, Visual visual4 = null)
        {
            pageVisual1 = visual1;
            pageVisual2 = visual2;
            pageVisual3 = visual3;
            pageVisual4 = visual4;
        }

        public override Size PageSize { get => pageSize; set => pageSize = value; }
        public void SetPageSize(PageMediaSizeName sizeName)
        {
            switch (sizeName)
            {
                case PageMediaSizeName.ISOA4Rotated:
                    pageSize = new(297, 210);
                    break;
                case PageMediaSizeName.ISOA4:
                default:
                    pageSize = new(210, 297);
                    break;
            }
        }
        public override IDocumentPaginatorSource Source => null;

        public override DocumentPage GetPage(int pageNumber)
        {
            DocumentPage page;

            switch (pageNumber)
            {
                case 0:
                    page = new(pageVisual1);
                    break;
                case 1:
                    page = new(pageVisual2);
                    break;

                case 2:
                    page = new(pageVisual3);
                    break;

                case 3:
                    page = new(pageVisual4);
                    break;

                default:
                    page = DocumentPage.Missing;
                    break;
            }

            return page;
        }
    }

    public class VykazDataObject
    {
        public string Meno { get; set; }
        public string Den { get; set; }
        public DateTime Datum { get; set; }
        public TimeSpan Od { get; set; }
        public TimeSpan Do
        {
            get
            {
                return Od.Add(TimeSpan.FromHours(Odpracovane));
            }
        }
        public double Odpracovane { get; set; }
        public string Dovod { get; set; }
        public bool IsCestovanie { get; set; }
        public bool IsSlovensko { get; set; }
        public bool IsLock { get; set; }

        public VykazDataObject()
        {
            Meno = string.Empty;
        }

        public VykazDataObject(VykazDataObject vykaz)
        {
            Meno = vykaz.Meno;
            Den = vykaz.Den;
            Datum = vykaz.Datum;
            Od = vykaz.Od;
            Odpracovane = vykaz.Odpracovane;
            Dovod = vykaz.Dovod;
            IsCestovanie = vykaz.IsCestovanie;
            IsSlovensko = vykaz.IsSlovensko;
            IsLock = vykaz.IsLock;
        }

        public string Describe()
        {
            return $"M:{Meno}, De:{Den}, Da:{Datum}, Od:{Od}, Do:{Do}, O:{Odpracovane:N1}, D:{Dovod};";
        }
    }
    public class SumarHodinObject
    {
        public string Popis { get; }
        public double Hodnota { get; }

        public SumarHodinObject(string popis, double hodnota)
        {
            Popis = popis;
            Hodnota = hodnota;
        }

    }
    public class VikendySviatkyObject
    {
        public DateTime Datum { get; set; }

        public string Den
        {
            get
            {
                return Datum.DayOfWeek.ToString();
            }
        }
        public double Hodnota { get; set; }

        public VikendySviatkyObject(DateTime datum, double hodnota)
        {
            Datum = datum;
            Hodnota = hodnota;
        }
    }

    public class WorklistObject
    {
        public string CisloZakazky { get; set; }
        public decimal Produktivne { get; set; } = 0;
        public decimal Neproduktivne { get; set; } = 0;
        public decimal NeproduktivneZ { get; set; } = 0;
        public decimal ProduktivneZ { get; set; } = 0;
        public decimal Produktivne70 { get; set; } = 0;
        public long KM { get; set; }
        public string PM { get; set; }

        public WorklistObject(string cisloZakazky, decimal produktivne, decimal neproduktivne, decimal neproduktivneZ, decimal produktivneZ, decimal produktivne70, long kM, string pM)
        {
            CisloZakazky = cisloZakazky;
            Produktivne = produktivne;
            Neproduktivne = neproduktivne;
            NeproduktivneZ = neproduktivneZ;
            ProduktivneZ = produktivneZ;
            Produktivne70 = produktivne70;
            KM = kM;
            PM = pM;
        }

        public WorklistObject(DataRow row)
        {
            CisloZakazky = row["Number"] is DBNull ? "" : (string)row["Number"];
            switch ((long)row["HourType"])
            {
                case 1: //"Produktívne":
                    Produktivne = (decimal)row["OdpracovaneHodiny"];
                    break;
                case 2: //"ProduktívneZ":
                    ProduktivneZ = (decimal)row["OdpracovaneHodiny"];
                    break;
                case 3: //"Produktívne70":
                    Produktivne70 = (decimal)row["OdpracovaneHodiny"];
                    break;
                case 5: //"NeproduktívneZ":
                    NeproduktivneZ = (decimal)row["OdpracovaneHodiny"];
                    break;
                case 4: //"Neproduktívne":
                default:
                    Neproduktivne += (decimal)row["OdpracovaneHodiny"];
                    break;
            }
            KM = (long)row["KM"];
            PM = row["PM"] is DBNull ? "" : ((string)row["PM"]).Trim();
        }
    }

    //public class NadcasObject
    //{
    //	public long ZamestnanecID { get; set; }
    //	public DateTime Datum { get; set; }
    //	public TimeSpan Nadcas { get; set; }
    //	public long? Schvalil { get; set; }
    //	public string? Poznamka { get; set; }
    //	public string Typ { get; set; }
    //	public bool Slovensko { get; set; }

    //	public NadcasObject(long zamestnanecID, DateTime datum, TimeSpan nadcas, long? schvalil, string? poznamka, string typ, bool slovensko)
    //	{
    //		ZamestnanecID = zamestnanecID;
    //		Datum = datum;
    //		Nadcas = nadcas;
    //		Schvalil = schvalil;
    //		Poznamka = poznamka;
    //		Typ = typ;
    //		Slovensko = slovensko;
    //	}
    //}
}
