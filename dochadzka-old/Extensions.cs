using Npgsql.Replication.PgOutput.Messages;
using Serilog;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading;
using System.Windows.Controls;
using System.Windows.Data;

namespace dochadzka
{
    public class TimeSpanConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value is TimeSpan)
            {
                if ((TimeSpan)value < TimeSpan.Zero)
                    return ((TimeSpan)value).TotalHoursAndMinutes(); //ToString("hh\\:mm");
                else
                    return " " + ((TimeSpan)value).TotalHoursAndMinutes(); //ToString("hh\\:mm");
            }
            return value.ToString();
        }
        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
    public static class Extensions
    {
        #region EnumExtensions
        /// <summary>
        /// Gets the Slovak name for the day of the week.
        /// </summary>
        /// <param name="dayOfWeek">The day of week</param>
        /// <returns>Slovak name of the day</returns>
        public static string ToSK(this DayOfWeek dayOfWeek)
        {
            switch (dayOfWeek)
            {
                case DayOfWeek.Sunday:
                    return "Nedeľa";
                case DayOfWeek.Monday:
                    return "Pondelok";
                case DayOfWeek.Tuesday:
                    return "Utorok";
                case DayOfWeek.Wednesday:
                    return "Streda";
                case DayOfWeek.Thursday:
                    return "Štvrtok";
                case DayOfWeek.Friday:
                    return "Piatok";
                case DayOfWeek.Saturday:
                    return "Sobota";

                default:
                    return string.Empty;
            }
        }

        /// <summary>
        /// Gets DB string for enum.
        /// </summary>
        /// <param name="nadcasTyp">enum type</param>
        /// <returns>DB string</returns>
        public static string ToDBString(this NadcasTyp nadcasTyp)
        {
            switch (nadcasTyp)
            {
                case NadcasTyp.Flexi:
                    return "Flexi";
                case NadcasTyp.SCSKCesta:
                    return "SC SK Cesta";
                case NadcasTyp.SCZahranicie:
                    return "SC Zahraničie";
                case NadcasTyp.Neplateny:
                    return "Neplatený nadčas";

                default:
                    return nadcasTyp.ToString();
            }
        }
        /// <summary>
        /// Gets DB string for enum.
        /// </summary>
        /// <param name="nadcasTyp">enum type</param>
        /// <returns>DB string</returns>
        public static string ToDBString(this ZamestnanecTyp zamestnanecTyp)
        {
            switch (zamestnanecTyp)
            {
                case ZamestnanecTyp.Zamestnanec:
                    return "Zamestnanec";
                case ZamestnanecTyp.SZCO:
                    return "SZČO";
                case ZamestnanecTyp.Brigadnik:
                    return "Brigádnik";
                case ZamestnanecTyp.Student:
                    return "Študent";

                default:
                    return zamestnanecTyp.ToString();
            }
        }
        /// <summary>
        /// Gets enum from DB string.
        /// </summary>
        /// <typeparam name="T">Type of enum.</typeparam>
        /// <param name="enumString"></param>
        /// <returns></returns>
        public static T FromDBString<T>(this string enumString) where T : struct
        {
            if (typeof(T) == typeof(NadcasTyp))
                switch (enumString)
                {
                    case "Flexi":
                        return Enum.Parse<T>("Flexi");
                    case "SC SK Cesta":
                        return Enum.Parse<T>("SCSKCesta");
                    case "SC Zahraničie":
                        return Enum.Parse<T>("SCZahranicie");
                    case "Neplatený nadčas":
                        return Enum.Parse<T>("Neplateny");

                    default:
                        return default(T);
                }
            else if (typeof(T) == typeof(ZamestnanecTyp))
                switch (enumString)
                {
                    case "Zamestnanec":
                        return Enum.Parse<T>("Zamestnanec");
                    case "SZČO":
                        return Enum.Parse<T>("SZCO");
                    case "Brigádnik":
                        return Enum.Parse<T>("Brigadnik");
                    case "Študent":
                        return Enum.Parse<T>("Student");

                    default:
                        return default(T);
                }
            else
                return default(T);
        }
        #endregion

        /// <summary>
        /// Gets the quarter of the given date
        /// </summary>
        /// <param name="dateTime">DateTime instance</param>
        /// <returns>An integer representing the quarter</returns>
        public static int Quarter(this DateTime dateTime)
        {
            return (dateTime.Month - 1) / 3 + 1;
        }

        /// <summary>
        /// Compute time span in hours and minutes
        /// </summary>
        /// <param name="timeSpan">Time span to compute</param>
        /// <returns>Timespan in [h]:mm format</returns>
        public static string TotalHoursAndMinutes(this TimeSpan timeSpan)
        {
            return $"{Math.Truncate(timeSpan.TotalHours):00}:{Math.Abs(timeSpan.Minutes):00}";
        }

        /// <summary>
        /// Removes diacritics from text
        /// </summary>
        /// <param name="text">Slovak text</param>
        /// <returns>Text without diacritics</returns>
        public static string RemoveDiacritics(this string text)
        {
            string ret = string.Empty;

            string diacritics = "áäčďéíĺľňóôřšťúůýžÁÄČĎÉÍĹĽŇÓÔŘŠŤÚŮÝŽ";
            string nondiacritics = "aacdeillnoorstuuyzAACDEILLNOORSTUUYZ";

            foreach (char ch in text)
            {
                if (diacritics.Contains(ch))
                    ret += nondiacritics[diacritics.IndexOf(ch)];
                else
                    ret += ch;
            }

            return ret;
        }

        /// <summary> Get working days between two dates (Excluding a list of dates - Holidays) </summary>
        /// <param name="current">Current date time</param>
        /// <param name="finishDateExclusive">Finish date time exclusive</param>
        /// <param name="excludedDates">List of dates to exclude (Holidays)</param>
        public static int GetWorkingDays(this DateTime current, DateTime finishDateExclusive, List<DateTime> excludedDates) //HashSet<DateTime> excludedDates
        {
            Func<int, bool> isWorkingDay = days =>
            {
                var currentDate = current.AddDays(days);
                var isNonWorkingDay =
                    currentDate.DayOfWeek == DayOfWeek.Saturday ||
                    currentDate.DayOfWeek == DayOfWeek.Sunday ||
                    excludedDates.Exists(excludedDate => excludedDate.Date.Equals(currentDate.Date));
                return !isNonWorkingDay;
            };

            return Enumerable.Range(0, (finishDateExclusive - current).Days).Count(isWorkingDay);
        }

        //public static DataRowCollection Where(this DataRowCollection dataRowCollection, Predicate<DataRow> match) // 
        //{
        //	DataRow[] dataRows = new DataRow[dataRowCollection.Count];
        //	dataRowCollection.CopyTo(dataRows, 0);
        //	List<DataRow> drs = new();
        //	drs.AddRange(dataRows);

        //	foreach (DataRow dr in dataRowCollection)
        //	{
        //		if (!match(dr))
        //		{
        //			drs.Remove(dr);
        //		}
        //	}

        //	return drs.CopyToDataTable().Rows;
        //}
    }
}
