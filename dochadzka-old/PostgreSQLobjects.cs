using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using Npgsql;
using Serilog;

namespace dochadzka
{
    #region DB
    public class PostgreSQL : IDisposable
    {
        NpgsqlDataSource DataSource;
        public string DataSourceConnectionString
        {
            get
            {
                return DataSource.ConnectionString;
            }
        }

        public PostgreSQL()
        {
#if DEBUG
            DataSource = new NpgsqlDataSourceBuilder(new(BuildConnectionString(
                "127.0.0.1",
                "5432",
                "postgres",
                "<heslo>",
                "ec"
            ))).Build();

            //DataSource = new NpgsqlDataSourceBuilder(new(BuildConnectionString(
            //    "db.emst.sk",
            //    "5430",
            //    "ec_admin",
            //    "e*ppHIFHCBr@NSwo",
            //    "ec"
            //))).Build();
#else
            DataSource = new NpgsqlDataSourceBuilder(new(BuildConnectionString(
                "212.89.250.77",
                "5430",
                "ec_admin",
                "e*ppHIFHCBr@NSwo",
                "ec"
            ))).Build();
#endif
        }
        public PostgreSQL(string server, string port, string user, string password, string database)
        {
            DataSource = new NpgsqlDataSourceBuilder(BuildConnectionString(server, port, user, password, database)).Build();
        }

        public void Dispose()
        {
            DataSource?.Dispose();
        }

        protected string BuildConnectionString(string server, string port, string user, string password, string database)
        {
            return string.Format("Server={0};Port={1};User Id={2};Password={3};Database={4};", server, port, user, password, database);
        }

        #region Public methods
        public DataTable GetDataTable(string commandText)
        {
            DataTable ret = new DataTable();
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                //po upgrade Npgsql na verziu 8.0.3 prestalo fungovat! 
                //using NpgsqlDataReader reader = new NpgsqlCommand(commandText, connection).ExecuteReader();
                //ret.Load(reader);
                //reader.Close();
                DataSet ds = new DataSet();
                new NpgsqlDataAdapter(new NpgsqlCommand(commandText, connection)).Fill(ds);
                ret = ds.Tables[0];
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.GetDataTable:");
            }

            return ret;
        }

        #region DB_User
        public List<DB_User_FN> DB_User_FNsGet()
        {
            List<DB_User_FN> ret = new();
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"SELECT * FROM \"ZamestnanciFullName\" LEFT JOIN \"ZamestnanecTyp\" ON \"TypZamestnanca\" = \"ZamestnanecTyp\".\"Typ\" WHERE \"ID\">1 ORDER BY \"ID\"";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);

                cmd.Prepare();

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                    ret.Add(new(reader));
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.GetDB_User:");
            }
            return ret;
        }
        public DB_User? DB_UserGet(long id)
        {
            DB_User? user = null;
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"SELECT * FROM \"{Application.Current.Resources["TABLE_USER"]}\" LEFT JOIN \"ZamestnanecTyp\" ON \"TypZamestnanca\" = \"ZamestnanecTyp\".\"Typ\" WHERE \"ID\" = @id";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("id", id);

                cmd.Prepare();

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                    user = new(reader);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.GetDB_User:");
            }
            return user;
        }
        public bool DB_UserAdd(DB_User user)
        {
            try
            {
                //using NpgsqlConnection connection = DataSource.OpenConnection();
                //string commandText = $"INSERT INTO \"{Application.Current.Resources["TABLE_USER"]}\" " +
                //	$"(\"Meno\", \"Priezvisko\", \"TitulPred\", \"TitulZa\", \"Dovolenka\", \"IsAdmin\") " +
                //	$"VALUES (@meno, @priezvisko, @titulpred, @titulza, @dovolenka, @isadmin)";

                //using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                //cmd.Parameters.AddWithValue("meno", user.Meno);
                //cmd.Parameters.AddWithValue("priezvisko", user.Priezvisko);
                //cmd.Parameters.AddWithValue("titulpred", user.TitulPred);
                //cmd.Parameters.AddWithValue("titulza", user.TitulZa);
                //cmd.Parameters.AddWithValue("dovolenka", user.Dovolenka);
                //cmd.Parameters.AddWithValue("isadmin", user.IsAdmin);

                //cmd.Prepare();

                //return cmd.ExecuteNonQuery() > -1;

                using NpgsqlConnection connection = DataSource.OpenConnection();

                //vytvorit davku
                NpgsqlBatch batch = new NpgsqlBatch(connection);

                //vytvorit usera
                NpgsqlBatchCommand batchCommand = new(
                    $"INSERT INTO \"{Application.Current.Resources["TABLE_USER"]}\" " +
                    $"(\"Meno\", \"Priezvisko\", \"TitulPred\", \"TitulZa\", \"Dovolenka\", \"IsAdmin\", \"TypZamestnanca\", \"RocnyNadcasVPlate\") " +
                    $"VALUES (@meno, @priezvisko, @titulpred, @titulza, @dovolenka, @isadmin, @typzamestnanca, @rocnynadcasvplate)");

                batchCommand.Parameters.AddWithValue("meno", user.Meno);
                batchCommand.Parameters.AddWithValue("priezvisko", user.Priezvisko);
                batchCommand.Parameters.AddWithValue("titulpred", user.TitulPred == "" ? DBNull.Value : user.TitulPred);
                batchCommand.Parameters.AddWithValue("titulza", user.TitulZa == "" ? DBNull.Value : user.TitulZa);
                batchCommand.Parameters.AddWithValue("dovolenka", user.Dovolenka);
                batchCommand.Parameters.AddWithValue("isadmin", user.IsAdmin);
                batchCommand.Parameters.AddWithValue("typzamestnanca", user.Typ.ToDBString());
                batchCommand.Parameters.AddWithValue("rocnynadcasvplate", user.RocnyNadcasVPlate == 0 ? DBNull.Value : user.RocnyNadcasVPlate);

                batch.BatchCommands.Add(batchCommand);

                //vytvorit novu t_ tabulku pre usera
                batchCommand = new(
                    $"CREATE TABLE IF NOT EXISTS \"{user.TableFullName}\" " +
                    $"( " +
                    $"\"ID\" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ), " +
                    $"\"CinnostTypID\" bigint NOT NULL, " +
                    $"\"StartDate\" date NOT NULL, " +
                    $"\"ProjectID\" bigint, " +
                    $"\"HourTypeID\" bigint, " +
                    $"\"HourTypesID\" bigint, " +
                    $"\"StartTime\" time without time zone NOT NULL, " +
                    $"\"EndTime\" time without time zone NOT NULL, " +
                    $"\"Description\" text COLLATE pg_catalog.\"default\", " +
                    $"km integer DEFAULT 0, " +
                    $"\"Lock\" boolean NOT NULL DEFAULT false, " +
                    $"\"DlhodobaSC\" boolean NOT NULL DEFAULT false, " + //v1.2.0
                    $"CONSTRAINT \"{user.TableFullName}_pkey\" PRIMARY KEY (\"ID\"), " +
                    $"CONSTRAINT \"{user.TableFullName}_CinnostTypID_fkey\" FOREIGN KEY (\"CinnostTypID\") " +
                    $"    REFERENCES \"CinnostTyp\" (\"ID\") MATCH SIMPLE " +
                    $"    ON UPDATE NO ACTION " +
                    $"    ON DELETE NO ACTION " +
                    $"    NOT VALID, " +
                    $"CONSTRAINT \"{user.TableFullName}_HourTypeID_fkey\" FOREIGN KEY (\"HourTypeID\") " +
                    $"    REFERENCES \"HourType\" (\"ID\") MATCH SIMPLE " +
                    $"    ON UPDATE NO ACTION " +
                    $"    ON DELETE NO ACTION " +
                    $"    NOT VALID, " +
                    $"CONSTRAINT \"{user.TableFullName}_HourTypesID_fkey\" FOREIGN KEY (\"HourTypesID\") " +
                    $"    REFERENCES \"HourTypes\" (\"ID\") MATCH SIMPLE " +
                    $"    ON UPDATE NO ACTION " +
                    $"    ON DELETE NO ACTION " +
                    $"    NOT VALID, " +
                    $"CONSTRAINT \"{user.TableFullName}_ProjectID_fkey\" FOREIGN KEY (\"ProjectID\") " +
                    $"    REFERENCES \"{Application.Current.Resources["TABLE_PROJEKT"]}\" (\"ID\") MATCH SIMPLE " +
                    $"    ON UPDATE NO ACTION " +
                    $"    ON DELETE NO ACTION " +
                    $"    NOT VALID " +
                    $") "
                    //+
                    //$"TABLESPACE pg_default; " +
                    //$"ALTER TABLE IF EXISTS \"t_{user.Meno.RemoveDiacritics()}_{user.Priezvisko.RemoveDiacritics()}\" " +
                    //$"    OWNER to postgres;"
                    );
                batch.BatchCommands.Add(batchCommand);

                //batch.Prepare();

                bool ret = batch.ExecuteNonQuery() > -1;
                Log.Information($"User {user.Meno} {user.Priezvisko} {(ret ? "" : "un")}successfully added.");

                //znova vygenerovat view AllTData, lebo sa zmenila t_ tabulka
                new NpgsqlCommand(GenerateCreateViewAllTData(), connection).ExecuteNonQuery();
                Log.Information("View AllTData successfully recreated.");

                return ret;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.DB_UserAdd:");
                return false;
            }
        }
        public bool DB_UserUpdate(DB_User user, string povodneMeno, string povodnePriezvisko)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();

                NpgsqlBatch batch = new NpgsqlBatch(connection);
                NpgsqlBatchCommand batchCommand = new(
                    $"UPDATE \"{Application.Current.Resources["TABLE_USER"]}\" SET " +
                    $"\"Meno\" = @meno, " +
                    $"\"Priezvisko\" = @priezvisko, " +
                    $"\"TitulPred\" = @titulpred, " +
                    $"\"TitulZa\" = @titulza, " +
                    $"\"Dovolenka\" = @dovolenka, " +
                    $"\"IsAdmin\" = @isadmin, " +
                    $"\"TypZamestnanca\" = @typzamestnanca, " +
                    $"\"RocnyNadcasVPlate\" = @rocnynadcasvplate " +
                    $"WHERE \"ID\" = @id");

                batchCommand.Parameters.AddWithValue("id", user.ID);
                batchCommand.Parameters.AddWithValue("meno", user.Meno);
                batchCommand.Parameters.AddWithValue("priezvisko", user.Priezvisko);
                batchCommand.Parameters.AddWithValue("titulpred", user.TitulPred == "" ? DBNull.Value : user.TitulPred);
                batchCommand.Parameters.AddWithValue("titulza", user.TitulZa == "" ? DBNull.Value : user.TitulZa);
                batchCommand.Parameters.AddWithValue("dovolenka", user.Dovolenka);
                batchCommand.Parameters.AddWithValue("isadmin", user.IsAdmin);
                batchCommand.Parameters.AddWithValue("typzamestnanca", user.Typ.ToDBString());
                batchCommand.Parameters.AddWithValue("rocnynadcasvplate", user.RocnyNadcasVPlate == 0 ? DBNull.Value : user.RocnyNadcasVPlate);

                batch.BatchCommands.Add(batchCommand);

                if (povodneMeno is null || povodneMeno == string.Empty)
                    povodneMeno = user.Meno;
                if (povodnePriezvisko is null || povodnePriezvisko == string.Empty)
                    povodnePriezvisko = user.Priezvisko;

                if (user.Meno != povodneMeno || user.Priezvisko != povodnePriezvisko)
                {
                    batchCommand = new(
                        $"ALTER TABLE \"t_{povodneMeno.RemoveDiacritics()}_{povodnePriezvisko.RemoveDiacritics()}\" RENAME TO \"{user.TableFullName}\""
                        );
                    batch.BatchCommands.Add(batchCommand);
                }

                //batch.Prepare();
                bool ret = batch.ExecuteNonQuery() > -1;
                Log.Information($"User {user.Meno} {user.Priezvisko} {(ret ? "" : "un")}successfully updated.");

                //znova vygenerovat view AllTData, lebo sa zmenila t_ tabulka
                new NpgsqlCommand(GenerateCreateViewAllTData(), connection).ExecuteNonQuery();
                Log.Information("View AllTData successfully recreated.");

                return ret;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.DB_UserUpdate:");
                return false;
            }
        }
        public bool DB_UserDelete(long id)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"DELETE FROM \"{Application.Current.Resources["TABLE_USER"]}\" WHERE \"ID\" = @id";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("id", id);

                cmd.Prepare();

                return cmd.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.DB_UserDelete:");
                return false;
            }
        }
        #endregion
        #region DB_t_User
        public DB_t_User? DB_t_UserGet(long id, string tableFullName)
        {
            DB_t_User? t_user = null;
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"SELECT * FROM \"{tableFullName}\" WHERE \"ID\" = @id";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("id", id);

                cmd.Prepare();

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                    t_user = new(reader);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.DB_t_UserGet:");
            }
            return t_user;
        }
        public bool DB_t_UserAdd(IEnumerable<DB_t_User?> t_users, string tableFullName, bool vymazatDataPredPridanim, long userID)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();

                NpgsqlBatch batch = new NpgsqlBatch(connection);
                NpgsqlBatchCommand batchCommand;
                if (vymazatDataPredPridanim)
                {
                    batchCommand = new(
                        $"TRUNCATE \"{tableFullName}\" RESTART IDENTITY"
                        );
                    batch.BatchCommands.Add(batchCommand);

                    batchCommand = new(
                        $"DELETE FROM \"{Application.Current.Resources["TABLE_NADCAS"]}\" WHERE \"ZamestnanecID\" = @zid"
                        );
                    batchCommand.Parameters.AddWithValue("@zid", userID);
                    batch.BatchCommands.Add(batchCommand);
                }

                foreach (DB_t_User? t_user in t_users)
                {
                    if (t_user is null)
                        continue;

                    batchCommand = new($"INSERT INTO \"{tableFullName}\" " +
                        $"(\"CinnostTypID\", \"StartDate\", \"ProjectID\", \"HourTypeID\", \"HourTypesID\", \"StartTime\", \"EndTime\", \"Description\", \"km\", \"DlhodobaSC\") " +
                        $"VALUES (@cinnosttyp, @startdate, @project, @hourtype, @hourtypes, @starttime, @endtime, @description, @km, @dlhodobasc)");

                    batchCommand.Parameters.AddWithValue("cinnosttyp", t_user.CinnostTypID);
                    batchCommand.Parameters.AddWithValue("startdate", t_user.StartDate.Date);
                    batchCommand.Parameters.AddWithValue("project", t_user.ProjectID == 0 ? DBNull.Value : t_user.ProjectID);
                    batchCommand.Parameters.AddWithValue("hourtype", t_user.HourTypeID == 0 ? DBNull.Value : t_user.HourTypeID);
                    batchCommand.Parameters.AddWithValue("hourtypes", t_user.HourTypesID == 0 ? DBNull.Value : t_user.HourTypesID);
                    batchCommand.Parameters.AddWithValue("starttime", t_user.StartTime);
                    batchCommand.Parameters.AddWithValue("endtime", t_user.EndTime);
                    batchCommand.Parameters.AddWithValue("description", t_user.Description);
                    batchCommand.Parameters.AddWithValue("km", t_user.KM);
                    batchCommand.Parameters.AddWithValue("dlhodobasc", t_user.DlhodobaSC);

                    batch.BatchCommands.Add(batchCommand);
                }

                //batch.Prepare();

                return batch.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.DB_t_UserAdd:");
                return false;
            }
        }
        public bool DB_t_UserAdd(DB_t_User t_user, string tableFullName)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"INSERT INTO \"{tableFullName}\" " +
                    $"(\"CinnostTypID\", \"StartDate\", \"ProjectID\", \"HourTypeID\", \"HourTypesID\", \"StartTime\", \"EndTime\", \"Description\", \"km\", \"DlhodobaSC\") " +
                    $"VALUES (@cinnosttyp, @startdate, @project, @hourtype, @hourtypes, @starttime, @endtime, @description, @km, @dlhodobasc)";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("cinnosttyp", t_user.CinnostTypID);
                cmd.Parameters.AddWithValue("startdate", t_user.StartDate.Date);
                cmd.Parameters.AddWithValue("project", t_user.ProjectID == 0 ? DBNull.Value : t_user.ProjectID);
                cmd.Parameters.AddWithValue("hourtype", t_user.HourTypeID == 0 ? DBNull.Value : t_user.HourTypeID);
                cmd.Parameters.AddWithValue("hourtypes", t_user.HourTypesID == 0 ? DBNull.Value : t_user.HourTypesID);
                cmd.Parameters.AddWithValue("starttime", t_user.StartTime);
                cmd.Parameters.AddWithValue("endtime", t_user.EndTime);
                cmd.Parameters.AddWithValue("description", t_user.Description);
                cmd.Parameters.AddWithValue("km", t_user.KM);
                cmd.Parameters.AddWithValue("dlhodobasc", t_user.DlhodobaSC);

                cmd.Prepare();

                //toto eliminuje problem s identity pri pridavani
                bool ret = false;
                int count = 0;
                while (!ret)
                {
                    try
                    {
                        ret = cmd.ExecuteNonQuery() > -1;
                        Log.Debug($"DB_t_UserAdd: Added on {++count}. attempt. \r\n{t_user.Describe()}");
                    }
                    catch (Exception ex)
                    {
                        //uz tam je pk
                        if (ex is PostgresException && (ex as PostgresException).SqlState == "23505")
                            continue;
                        //vsetko ostatne 
                        else
                        {
                            Log.Error(ex, "PostgreSQL.DB_t_UserAdd:");
                            break;
                        }
                    }
                }
                return ret;//cmd.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.DB_t_UserAdd:");
                return false;
            }
        }
        public bool DB_t_UserUpdate(DB_t_User t_user, string tableFullName)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText =
                    $"UPDATE \"{tableFullName}\" SET " +
                    $"\"CinnostTypID\" = @cinnosttyp, " +
                    $"\"StartDate\" = @startdate, " +
                    $"\"ProjectID\" = @project, " +
                    $"\"HourTypeID\" = @hourtype, " +
                    $"\"HourTypesID\" = @hourtypes, " +
                    $"\"StartTime\" = @starttime, " +
                    $"\"EndTime\" = @endtime, " +
                    $"\"Description\" = @description, " +
                    $"\"km\" = @km, " +
                    $"\"DlhodobaSC\" = @dlhodobasc " +
                    $"WHERE \"ID\" = @id";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("id", t_user.ID);
                cmd.Parameters.AddWithValue("cinnosttyp", t_user.CinnostTypID);
                cmd.Parameters.AddWithValue("startdate", t_user.StartDate.Date);
                cmd.Parameters.AddWithValue("project", t_user.ProjectID == 0 ? DBNull.Value : t_user.ProjectID);
                cmd.Parameters.AddWithValue("hourtype", t_user.HourTypeID == 0 ? DBNull.Value : t_user.HourTypeID);
                cmd.Parameters.AddWithValue("hourtypes", t_user.HourTypesID == 0 ? DBNull.Value : t_user.HourTypesID);
                cmd.Parameters.AddWithValue("starttime", t_user.StartTime);
                cmd.Parameters.AddWithValue("endtime", t_user.EndTime);
                cmd.Parameters.AddWithValue("description", t_user.Description);
                cmd.Parameters.AddWithValue("km", t_user.KM);
                cmd.Parameters.AddWithValue("dlhodobasc", t_user.DlhodobaSC);

                cmd.Prepare();

                return cmd.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.DB_t_UserUpdate:");
                return false;
            }
        }
        public bool DB_t_UserDelete(long id, string tableFullName)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"DELETE FROM \"{tableFullName}\" WHERE \"ID\" = @id";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("id", id);

                cmd.Prepare();

                return cmd.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.DB_t_UserDelete:");
                return false;
            }
        }
        #endregion
        #region DB_Projekt
        public bool DB_ProjektAdd(DB_Projekt projekt)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"INSERT INTO \"{Application.Current.Resources["TABLE_PROJEKT"]}\" " +
                    $"(\"Name\", \"Number\", \"Description\", \"AllowAssignWorkingHours\", \"CountryCode\", \"Manager\") " +
                    $"VALUES (@name, @number, @description, @allow, @countrycode, @manager)";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("name", projekt.Name);
                cmd.Parameters.AddWithValue("number", projekt.Number);
                cmd.Parameters.AddWithValue("description", projekt.Description);
                cmd.Parameters.AddWithValue("allow", projekt.AllowAssignWorkingHours);
                cmd.Parameters.AddWithValue("countrycode", projekt.CountryCode);
                cmd.Parameters.AddWithValue("manager", projekt.ManagerID);

                cmd.Prepare();

                //toto eliminuje problem s identity pri pridavani
                bool ret = false;
                int count = 0;
                while (!ret)
                {
                    try
                    {
                        ret = cmd.ExecuteNonQuery() > -1;
                        Log.Debug($"DB_ProjektAdd: Added on {++count}. attempt. \r\n{projekt.Describe()}");
                    }
                    catch (Exception ex)
                    {
                        //uz tam je pk
                        if (ex is PostgresException && (ex as PostgresException).SqlState == "23505")
                            continue;
                        //vsetko ostatne 
                        else
                        {
                            Log.Error(ex, "PostgreSQL.DB_ProjektAdd:");
                            break;
                        }
                    }
                }
                return ret;//cmd.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.DB_ProjektAdd:");
                return false;
            }
        }
        public bool DB_ProjektUpdate(DB_Projekt projekt)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText =
                    $"UPDATE \"{Application.Current.Resources["TABLE_PROJEKT"]}\" SET " +
                    $"\"Name\" = @name, " +
                    $"\"Number\" = @number, " +
                    $"\"Description\" = @description, " +
                    $"\"AllowAssignWorkingHours\" = @allow, " +
                    $"\"CountryCode\" = @countrycode, " +
                    $"\"Manager\" = @manager " +
                    $"WHERE \"ID\" = @id";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("id", projekt.ID);
                cmd.Parameters.AddWithValue("name", projekt.Name);
                cmd.Parameters.AddWithValue("number", projekt.Number);
                cmd.Parameters.AddWithValue("description", projekt.Description);
                cmd.Parameters.AddWithValue("allow", projekt.AllowAssignWorkingHours);
                cmd.Parameters.AddWithValue("countrycode", projekt.CountryCode);
                cmd.Parameters.AddWithValue("manager", projekt.ManagerID);

                cmd.Prepare();

                return cmd.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.DB_ProjektUpdate:");
                return false;
            }
        }
        #endregion
        #region Nadcas
        /// <summary>
        /// Vrati nadcas
        /// </summary>
        /// <param name="userID">ID zamestnanca</param>
        /// <param name="datumOd">Datum od vratane</param>
        /// <param name="datumDo">Datum do vratane</param>
        /// <returns>true ak ulozi, inak false</returns>
        public double NadcasGet(long userID, DateTime datumOd, DateTime datumDo, bool celkovyNadcas = false)
        {
            try
            {
                double ret = 0;
                double nadcas;
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"SELECT * FROM \"{Application.Current.Resources["TABLE_NADCAS"]}\" WHERE \"ZamestnanecID\" = @id AND \"Datum\" >= @datumod AND \"Datum\" <= @datumdo AND \"Typ\" = @typ";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("id", userID);
                cmd.Parameters.AddWithValue("datumod", datumOd.Date);
                cmd.Parameters.AddWithValue("datumdo", datumDo.Date);
                cmd.Parameters.AddWithValue("typ", NadcasTyp.Flexi.ToDBString());

                cmd.Prepare();

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    nadcas = ((TimeSpan)reader["Nadcas"]).TotalHours;
                    if (celkovyNadcas || nadcas > 0)
                        ret += nadcas;
                }

                return ret;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.NadcasGet:");
                return 0;
            }
        }
        /// <summary>
        /// Vrati sumar nadcasu za zvolene obdobie a typ.
        /// </summary>
        /// <param name="userID">ID uzivatela</param>
        /// <param name="datumOd">Datum od</param>
        /// <param name="datumDo">Datum do</param>
        /// <param name="nadcasTyp">Typ nadcasu</param>
        /// <returns>Sumar nadcasu v hodinach</returns>
        public double NadcasSumGet(long userID, DateTime datumOd, DateTime datumDo, NadcasTyp nadcasTyp)
        {
            try
            {
                double ret = 0;
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText =
                    $"SELECT SUM(\"Nadcas\") AS \"NadcasSum\" FROM \"Nadcasy\" WHERE \"ZamestnanecID\" = @id AND \"Datum\" >= @datumod AND \"Datum\" <= @datumdo AND \"Typ\" = @nadcastyp GROUP BY \"Typ\"";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("id", userID);
                cmd.Parameters.AddWithValue("datumod", datumOd.Date);
                cmd.Parameters.AddWithValue("datumdo", datumDo.Date);
                cmd.Parameters.AddWithValue("nadcastyp", nadcasTyp.ToDBString());

                cmd.Prepare();

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                    if (reader["NadcasSum"] is not DBNull)
                        ret = ((TimeSpan)reader["NadcasSum"]).TotalHours;

                return ret;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.NadcasSumGet:");
                return 0;
            }
        }
        /// <summary>
        /// Ulozi nadcas
        /// </summary>
        /// <param name="userID">ID zamestnanca</param>
        /// <param name="datum">Datum nadcasu</param>
        /// <param name="nadcas">Nadcas v hodinach</param>
        /// <param name="typ">Typ nadcasu</param>
        /// <param name="schvalilID">ID schvalujuceho</param>
        /// <param name="poznamka">poznamka k schvaleniu</param>
        /// <returns>true ak ulozi, inak false</returns>
        public bool NadcasSet(long userID, DateTime datum, double nadcas, NadcasTyp typ, long schvalilID = 0, string poznamka = "", bool odpocet = false)
        {
            try
            {
                if (nadcas == 0)
                {
                    return false;
                }
                else
                {
                    using NpgsqlConnection connection = DataSource.OpenConnection();
                    string commandText = $"INSERT INTO \"{Application.Current.Resources["TABLE_NADCAS"]}\" (\"ZamestnanecID\", \"Datum\", \"Nadcas\", \"Schvalil\", \"Poznamka\", \"Typ\", \"Odpocet\") VALUES (@id, @datum, @nadcas, @schvalil, @poznamka, @typ, @odpocet)";

                    using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                    cmd.Parameters.AddWithValue("id", userID);
                    cmd.Parameters.AddWithValue("datum", datum.Date);
                    cmd.Parameters.AddWithValue("nadcas", TimeSpan.FromHours(nadcas));
                    cmd.Parameters.AddWithValue("schvalil", schvalilID == 0 ? DBNull.Value : schvalilID);
                    cmd.Parameters.AddWithValue("poznamka", poznamka == string.Empty ? DBNull.Value : poznamka);
                    cmd.Parameters.AddWithValue("typ", typ.ToDBString());
                    cmd.Parameters.AddWithValue("odpocet", odpocet);

                    cmd.Prepare();

                    return cmd.ExecuteNonQuery() > -1;
                }

            }
            catch (Exception ex)
            {
                //!!! toto este premysliet, lebo ked nulujem nadcas, tak zapisujem -sumar nadcasov a ak je v ten den nadcas, tak bude zaporny nadcas!
                if (ex is PostgresException && (ex as PostgresException).SqlState == "23505") //uz tam je pk treba update
                {
                    //Log.Debug($"Nadcas uz existuje: {userID}, {datum:dd.MM.yyyy}");
                    return false;
                }
                else
                {
                    Log.Error(ex, "PostgreSQL.NadcasSet:");
                    return false;
                }
            }
        }
        /// <summary>
        /// Upravi uz existujuci nadcas
        /// </summary>
        /// <param name="userID">ID zamestnanca</param>
        /// <param name="datum">Datum nadcasu</param>
        /// <param name="nadcas">Nadcas v hodinach</param>
        /// <param name="typ">Typ nadcasu</param>
        /// <param name="schvalilID">ID schvalujuceho</param>
        /// <param name="poznamka">Poznamka k schvaleniu</param>
        /// <returns>true ak ulozi, inak false</returns>
        public bool NadcasUpdate(long userID, DateTime datum, double nadcas, NadcasTyp typ, long schvalilID = 0, string poznamka = "", bool odpocet = false)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText =
                    nadcas == 0
                    ? $"DELETE FROM \"{Application.Current.Resources["TABLE_NADCAS"]}\" WHERE \"ZamestnanecID\" = @id AND \"Datum\" = @datum AND \"Typ\" = @typ AND \"Odpocet\" = @odpocet"
                    : $"UPDATE \"{Application.Current.Resources["TABLE_NADCAS"]}\" SET \"Nadcas\" = @nadcas, \"Schvalil\" = @schvalil, \"Poznamka\" = @poznamka WHERE \"ZamestnanecID\" = @id AND \"Datum\" = @datum AND \"Typ\" = @typ AND \"Odpocet\" = @odpocet";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("id", userID);
                cmd.Parameters.AddWithValue("datum", datum.Date);
                cmd.Parameters.AddWithValue("nadcas", TimeSpan.FromHours(nadcas));
                cmd.Parameters.AddWithValue("schvalil", schvalilID == 0 ? DBNull.Value : schvalilID);
                cmd.Parameters.AddWithValue("poznamka", poznamka == string.Empty ? DBNull.Value : poznamka);
                cmd.Parameters.AddWithValue("typ", typ.ToDBString());
                cmd.Parameters.AddWithValue("odpocet", odpocet);

                cmd.Prepare();

                return cmd.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.NadcasUpdate:");
                return false;
            }
        }
        public bool NadcasRemoveBulk(long userID, List<DateTime> dates)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"DELETE FROM \"{Application.Current.Resources["TABLE_NADCAS"]}\" WHERE \"ZamestnanecID\" = @id AND \"Datum\" = @datum AND \"Schvalil\" = 1 AND \"Odpocet\" = false";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.Add("id", NpgsqlTypes.NpgsqlDbType.Bigint);
                cmd.Parameters.Add("datum", NpgsqlTypes.NpgsqlDbType.Date);

                foreach (DateTime date in dates)
                {
                    cmd.Parameters["id"].Value = userID;
                    cmd.Parameters["datum"].Value = date.Date;

                    cmd.ExecuteNonQuery();
                }

                return true;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.NadcasRemoveBulk:");
                return false;
            }

        }
        #endregion

        public double ZostatokGet(DB_User user, string typCinnosti, int rok)
        {
            try
            {
                double ret = 0;
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText =
                    $"SELECT " +
                    $"SUM(\"Cas\") AS \"CasLekar\" " +
                    $"FROM " +
                    $"( " +
                    $"SELECT " +
                    $"\"StartDate\", " +
                    $"CASE WHEN \"EndTime\" = '00:00:00' THEN '24:00:00' - \"StartTime\" ELSE \"EndTime\" - \"StartTime\" END AS \"Cas\" " +
                    $"FROM " +
                    $"\"{user.TableFullName}\" " +
                    $"LEFT JOIN \"CinnostTyp\" " +
                    $"ON \"{user.TableFullName}\".\"CinnostTypID\" = \"CinnostTyp\".\"ID\" " +
                    $"WHERE " +
                    $"\"CinnostTyp\".\"Typ\" = @typcinnosti " +
                    $"AND extract(year from \"StartDate\") = @rok " +
                    $") as t";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("typcinnosti", typCinnosti);
                cmd.Parameters.AddWithValue("rok", rok);

                cmd.Prepare();

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                    if (reader["CasLekar"] is not DBNull)
                        ret = ((TimeSpan)reader["CasLekar"]).TotalHours;

                return ret;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.LekarGet:");
                return 0;
            }
        }

        public bool UzamkniDochadzku(DateTime kDatumu, string meno, string priezvisko)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"UPDATE \"t_{meno.RemoveDiacritics()}_{priezvisko.RemoveDiacritics()}\" SET \"Lock\" = true WHERE \"StartDate\" <= @datum";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("datum", kDatumu.Date);

                cmd.Prepare();

                return cmd.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.UzamkniDochadzku:");
                return false;
            }
        }

        public BitmapImage PodpisGet(long id)
        {
            try
            {
                //Image ret = new Image();
                BitmapImage ret = new BitmapImage();

                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"SELECT \"Podpis\" FROM \"{Application.Current.Resources["TABLE_USER"]}\" WHERE \"ID\" = @id";
                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("id", id);
                cmd.Prepare();

                byte[] podpisImageByte = new byte[0];

                using NpgsqlDataReader rdr = cmd.ExecuteReader();
                if (rdr.Read())
                {
                    if (rdr[0] is not DBNull)
                        podpisImageByte = (byte[])rdr[0];
                }

                if (podpisImageByte.Length > 0)
                {
                    //var bi = new BitmapImage();
                    using (MemoryStream ms = new MemoryStream(podpisImageByte))
                    {
                        ret.BeginInit();
                        ret.CreateOptions = BitmapCreateOptions.None;
                        ret.CacheOption = BitmapCacheOption.OnLoad;
                        ret.StreamSource = ms;
                        ret.EndInit();
                    }
                    //ret.Source = bi;
                }

                return ret;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.PodpisGet:");
                return new BitmapImage();
            }
        }
        public bool PodpisSet(byte[] podpis, long id)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"UPDATE \"{Application.Current.Resources["TABLE_USER"]}\" SET \"Podpis\" = @podpis WHERE \"ID\" = @id";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("podpis", NpgsqlTypes.NpgsqlDbType.Bytea, podpis);
                cmd.Parameters.AddWithValue("id", id);

                //cmd.Prepare();

                return cmd.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.PodpisSet:");
                return false;
            }
        }
        public bool PoslednyZaznamSet(long id, DateTime date)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"UPDATE \"{Application.Current.Resources["TABLE_USER"]}\" SET \"PoslednyZaznam\" = @poslednyzaznam WHERE \"ID\" = @id";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("poslednyzaznam", date.Date);
                cmd.Parameters.AddWithValue("id", id);

                //cmd.Prepare();

                return cmd.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.PoslednyZaznamSet:");
                return false;
            }
        }

        public bool ZamknuteKSet(long id, DateTime date)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"UPDATE \"{Application.Current.Resources["TABLE_USER"]}\" SET \"ZamknuteK\" = @zamknutek WHERE \"ID\" = @id";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                cmd.Parameters.AddWithValue("zamknutek", date == DateTime.MinValue ? DBNull.Value : date.Date);
                cmd.Parameters.AddWithValue("id", id);

                //cmd.Prepare();

                return cmd.ExecuteNonQuery() > -1;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.ZamknuteKSet:");
                return false;
            }
        }
        public DateTime ZamknuteKGet(long id)
        {
            try
            {
                using NpgsqlConnection connection = DataSource.OpenConnection();
                string commandText = $"SELECT \"ZamknuteK\" FROM \"{Application.Current.Resources["TABLE_USER"]}\" WHERE \"ID\" = @id";

                using NpgsqlCommand cmd = new NpgsqlCommand(commandText, connection);
                {
                    cmd.Parameters.AddWithValue("id", id);
                    cmd.Prepare();

                    using NpgsqlDataReader rdr = cmd.ExecuteReader();
                    if (rdr.Read())
                    {
                        if (rdr[0] is not DBNull)
                            return (DateTime)rdr[0];
                    }
                }

                return DateTime.MinValue;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "PostgreSQL.ZamknuteKSet:");
                return DateTime.MinValue;
            }
        }

        private string GenerateCreateViewAllTData()
        {
            string ret = "CREATE OR REPLACE VIEW \"AllTData\" AS SELECT " +
                "\"Person\", " +
                "ttables.\"StartDate\", " +
                "\"Projects\".\"Number\" AS \"ProjectID\", " +
                "\"HourType\".\"HourType\", " +
                //"EXTRACT(epoch FROM (ttables.\"EndTime\" - ttables.\"StartTime\"))/3600 AS \"Hours\", " +
                "CASE WHEN (ttables.\"EndTime\" < ttables.\"StartTime\") THEN EXTRACT(epoch FROM ttables.\"EndTime\" - ttables.\"StartTime\") / 3600 + 24 ELSE EXTRACT(epoch FROM ttables.\"EndTime\" - ttables.\"StartTime\") / 3600 END AS \"Hours\"," +
                "\"HourTypes\".\"HourType\" AS \"HourTypeID\", " +
                "ttables.\"Description\", " +
                "ttables.\"km\" AS \"KM\", " +
                "EXTRACT(MONTH FROM ttables.\"StartDate\") AS \"Month\", " +
                "EXTRACT(YEAR FROM ttables.\"StartDate\") AS \"Year\", " +
                "EXTRACT(WEEK FROM ttables.\"StartDate\") AS \"Week\" " +
                "FROM ( ";

            List<DB_User_FN> users = DB_User_FNsGet();

            bool first = true;
            foreach (DB_User_FN user in users)
            {
                if (first)
                {
                    first = false;
                    ret += $"SELECT '{user.FullName}' AS \"Person\", * FROM \"{user.TableFullName}\" ";
                }
                else
                    ret += $"UNION ALL SELECT '{user.FullName}' AS \"Person\", * FROM \"{user.TableFullName}\" ";
            }

            ret += ") as ttables " +
                "LEFT JOIN \"CinnostTyp\" ON \"CinnostTyp\".\"ID\" = \"CinnostTypID\" " +
                "LEFT JOIN \"Projects\" ON \"Projects\".\"ID\" = \"ProjectID\" " +
                "LEFT JOIN \"HourType\" ON \"HourType\".\"ID\" = \"HourTypeID\" " +
                "LEFT JOIN \"HourTypes\" ON \"HourTypes\".\"ID\" = \"HourTypesID\" " +
                "WHERE \"CinnostTyp\".\"ID\" = 1 OR \"CinnostTyp\".\"ID\" = 6; ";

            return ret;
        }
        #endregion
    }
    #endregion

    #region DB objects
    public abstract class DBObject
    {
        public readonly long ID;

        public DBObject(long id)
        {
            ID = id;
        }

        public abstract string Describe();
    }

    public class DB_User_FN : DB_User
    {
        public readonly string FullName;
        public DB_User_FN(NpgsqlDataReader reader)
            : base(reader)
        {
            FullName = ((string)reader["FullName"]).Trim();
        }

    }
    public class DB_User : DBObject
    {
        public readonly string Meno;
        public readonly string Priezvisko;
        public readonly string TitulPred;
        public readonly string TitulZa;
        public readonly float Dovolenka;
        public readonly bool IsAdmin;
        public readonly ZamestnanecTyp Typ;
        public readonly int RocnyNadcasVPlate;
        public string TableFullName
        {
            get
            {
                return $"t_{Meno.RemoveDiacritics()}_{Priezvisko.RemoveDiacritics()}";
            }
        }
        public readonly int FondPracovnehoCasu;

        public DB_User(long iD, string meno, string priezvisko, string titulPred, string titulZa, int dovolenka, bool isAdmin, ZamestnanecTyp typ, int fondPracovnehoCasu, int rocnyNadcasVPlate)
            : base(iD)
        {
            Meno = meno;
            Priezvisko = priezvisko;
            TitulPred = titulPred;
            TitulZa = titulZa;
            Dovolenka = dovolenka;
            IsAdmin = isAdmin;
            Typ = typ;
            FondPracovnehoCasu = fondPracovnehoCasu;
            RocnyNadcasVPlate = rocnyNadcasVPlate;
        }

        public DB_User(DataRow dataRow)
            : base(dataRow["ID"] is DBNull ? 0 : (long)dataRow["ID"])
        {
            Meno = ((string)dataRow["Meno"]).Trim();
            Priezvisko = ((string)dataRow["Priezvisko"]).Trim();
            TitulPred = dataRow["TitulPred"] is DBNull ? string.Empty : ((string)dataRow["TitulPred"]).Trim();
            TitulZa = dataRow["TitulZa"] is DBNull ? string.Empty : ((string)dataRow["TitulZa"]).Trim();
            Dovolenka = dataRow["Dovolenka"] is DBNull ? 0 : (float)dataRow["Dovolenka"];
            IsAdmin = dataRow["IsAdmin"] is DBNull ? false : (bool)dataRow["IsAdmin"];
            Typ = ((string)dataRow["TypZamestnanca"]).Trim().FromDBString<ZamestnanecTyp>();
            RocnyNadcasVPlate = dataRow["RocnyNadcasVPlate"] is DBNull ? 0 : (int)dataRow["RocnyNadcasVPlate"];
        }
        public DB_User(NpgsqlDataReader reader)
            : base((long)reader["ID"])
        {
            Meno = ((string)reader["Meno"]).Trim();
            Priezvisko = ((string)reader["Priezvisko"]).Trim();
            TitulPred = reader["TitulPred"] is DBNull ? string.Empty : ((string)reader["TitulPred"]).Trim();
            TitulZa = reader["TitulZa"] is DBNull ? string.Empty : ((string)reader["TitulZa"]).Trim();
            Dovolenka = (float)reader["Dovolenka"];
            IsAdmin = (bool)reader["IsAdmin"];
            Typ = ((string)reader["TypZamestnanca"]).Trim().FromDBString<ZamestnanecTyp>();
            RocnyNadcasVPlate = reader["RocnyNadcasVPlate"] is DBNull ? 0 : (int)reader["RocnyNadcasVPlate"];
            FondPracovnehoCasu = (int)reader["FondPracovnehoCasu"];
        }

        public override string Describe()
        {
            return $"U:{TitulPred} {Meno} {Priezvisko} {(TitulZa != string.Empty ? ", " : "")}{TitulZa}; D:{Dovolenka}; A:{IsAdmin}";
        }
    }

    public class DB_t_User : DBObject
    {
        public readonly long CinnostTypID;
        public DateTime StartDate { get; private set; }
        public readonly TimeSpan StartTime;
        public readonly TimeSpan EndTime;
        public readonly long ProjectID;
        public readonly long HourTypeID;
        public readonly long HourTypesID;
        public readonly string Description;
        public readonly int KM;
        public readonly bool DlhodobaSC;

        public DB_t_User(long iD, long cinnostTypID, DateTime startDate, TimeSpan startTime, TimeSpan endTime, long projectID = 0, long hourTypeID = 0, long hourTypesID = 0, string description = "", int kM = 0, bool dlhodobaSC = false)
        : base(iD)
        {
            CinnostTypID = cinnostTypID;
            StartDate = startDate;
            ProjectID = projectID;
            HourTypeID = hourTypeID;
            HourTypesID = hourTypesID;
            StartTime = startTime;
            EndTime = endTime;
            Description = description;
            KM = kM;
            DlhodobaSC = dlhodobaSC;
        }
        public DB_t_User(DataRow dataRow)
            : base(dataRow["ID"] is DBNull ? 0 : (long)dataRow["ID"])
        {
            CinnostTypID = (long)dataRow["CinnostTypID"];
            StartDate = (DateTime)dataRow["StartDate"];
            ProjectID = dataRow["ProjectID"] is DBNull ? 0 : (long)dataRow["ProjectID"];
            HourTypeID = dataRow["HourTypeID"] is DBNull ? 0 : (long)dataRow["HourTypeID"];
            HourTypesID = dataRow["HourTypesID"] is DBNull ? 0 : (long)dataRow["HourTypesID"];
            StartTime = (TimeSpan)dataRow["StartTime"];
            EndTime = (TimeSpan)dataRow["EndTime"];
            Description = dataRow["Description"] is DBNull ? string.Empty : ((string)dataRow["Description"]).Trim();
            KM = dataRow["km"] is DBNull ? 0 : (int)dataRow["km"];
            DlhodobaSC = dataRow["DlhodobaSC"] is DBNull ? false : (bool)dataRow["DlhodobaSC"];
        }
        public DB_t_User(NpgsqlDataReader reader)
            : base((long)reader["ID"])
        {
            CinnostTypID = (long)reader["CinnostTypID"];
            StartDate = (DateTime)reader["StartDate"];
            ProjectID = reader["ProjectID"] is DBNull ? 0 : (long)reader["ProjectID"];
            HourTypeID = reader["HourTypeID"] is DBNull ? 0 : (long)reader["HourTypeID"];
            HourTypesID = reader["HourTypesID"] is DBNull ? 0 : (long)reader["HourTypesID"];
            StartTime = (TimeSpan)reader["StartTime"];
            EndTime = (TimeSpan)reader["EndTime"];
            Description = reader["Description"] is DBNull ? string.Empty : ((string)reader["Description"]).Trim();
            KM = reader["km"] is DBNull ? 0 : (int)reader["km"];
            DlhodobaSC = (bool)reader["DlhodobaSC"];
        }

        public override string Describe()
        {
            return $"CT:{CinnostTypID}; SD:{StartDate}; P:{ProjectID}; HT:{HourTypeID}; HTs:{HourTypesID}; S:{StartTime}; E:{EndTime}; KM:{KM}; DSC:{DlhodobaSC}; D:{Description}";
        }

        public void ChangeStartDate(DateTime startDate)
        {
            StartDate = startDate;
        }
    }

    public class DB_Projekt : DBObject
    {
        public readonly string Name;
        public readonly string Number;
        public readonly string Description;
        public readonly bool AllowAssignWorkingHours;
        public readonly string CountryCode;
        public readonly long ManagerID;

        public DB_Projekt(long id, string name, string number, string description, bool allowAssignWorkingHours, string countryCode, long managerID)
            : base(id)
        {
            Name = name;
            Number = number;
            Description = description;
            AllowAssignWorkingHours = allowAssignWorkingHours;
            CountryCode = countryCode;
            ManagerID = managerID;
        }
        public DB_Projekt(DataRow dataRow)
            : base(dataRow["ID"] is DBNull ? 0 : (long)dataRow["ID"])
        {
            Name = (string)dataRow["Name"];
            Number = (string)dataRow["Number"];
            Description = (string)dataRow["Description"];
            AllowAssignWorkingHours = (bool)dataRow["AllowAssignWorkingHours"];
            CountryCode = (string)dataRow["CountryCode"];
            ManagerID = (long)dataRow["Manager"];
        }

        public override string Describe()
        {
            return $"Na:{Name}; No:{Number}; A:{AllowAssignWorkingHours}; C:{CountryCode}; M:{ManagerID}; D:{Description}";
        }
    }

    public class DBNadcas : DBObject
    {
        public readonly long ZamestnanecID;
        public readonly DateTime Datum;
        public readonly TimeSpan Nadcas;
        public readonly long? Schvalil;
        public readonly string? Poznamka;
        public readonly string Typ;
        public readonly bool Slovensko;

        public DBNadcas(long id, long zamestnanecID, DateTime datum, TimeSpan nadcas, long? schvalil, string? poznamka, string typ, bool slovensko)
            : base(id)
        {
            ZamestnanecID = zamestnanecID;
            Datum = datum;
            Nadcas = nadcas;
            Schvalil = schvalil;
            Poznamka = poznamka;
            Typ = typ;
            Slovensko = slovensko;
        }

        public DBNadcas(DataRow dataRow)
            : base(dataRow["ID"] is DBNull ? 0 : (long)dataRow["ID"])
        {
            ZamestnanecID = (long)dataRow["ZamestnanecID"];
            Datum = (DateTime)dataRow["Datum"];
            Nadcas = (TimeSpan)dataRow["Nadcas"];
            Schvalil = (long?)dataRow["Schvalil"];
            Poznamka = (string?)dataRow["Poznamka"];
            Typ = (string)dataRow["Typ"];
            Slovensko = (bool)dataRow["Slovensko"];
        }

        public override string Describe()
        {
            return $"Z:{ZamestnanecID}; D:{Datum}; N:{Nadcas}; S:{(Schvalil is null ? "{null}" : Schvalil)}; P:{(Poznamka is null ? "{null}" : Poznamka)}; T:{Typ}; Sl:{Slovensko}";
        }
    }
    #endregion
}
