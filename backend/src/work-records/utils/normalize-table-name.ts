/**
 * Normalize special characters in employee names for table name construction.
 *
 * Database table names use ASCII-only characters, but employee names in the
 * Zamestnanci table may contain Slovak diacritics (š, č, ž, á, etc.).
 *
 * This function removes diacritics and converts special characters to their
 * ASCII equivalents to match the actual table naming convention.
 *
 * @param name - Employee name (Meno or Priezvisko) with potential special characters
 * @returns Normalized name without diacritics
 *
 * @example
 * normalizeForTableName('Šmotlák') // Returns 'Smotlak'
 * normalizeForTableName('Ostrihoň') // Returns 'Ostrihon'
 * normalizeForTableName('Krnáč') // Returns 'Krnac'
 */
export function normalizeForTableName(name: string): string {
  // Map Slovak/Czech/German special characters to their ASCII equivalents
  const charMap: Record<string, string> = {
    // Lowercase
    á: 'a',
    ä: 'a',
    č: 'c',
    ď: 'd',
    é: 'e',
    ě: 'e',
    í: 'i',
    ľ: 'l',
    ĺ: 'l',
    ň: 'n',
    ó: 'o',
    ô: 'o',
    ŕ: 'r',
    š: 's',
    ť: 't',
    ú: 'u',
    ů: 'u',
    ü: 'u',
    ý: 'y',
    ž: 'z',
    ö: 'o',
    // Uppercase
    Á: 'A',
    Ä: 'A',
    Č: 'C',
    Ď: 'D',
    É: 'E',
    Ě: 'E',
    Í: 'I',
    Ľ: 'L',
    Ĺ: 'L',
    Ň: 'N',
    Ó: 'O',
    Ô: 'O',
    Ŕ: 'R',
    Š: 'S',
    Ť: 'T',
    Ú: 'U',
    Ů: 'U',
    Ü: 'U',
    Ý: 'Y',
    Ž: 'Z',
    Ö: 'O',
  };

  // Replace each special character with its ASCII equivalent
  return name.replace(
    /[áäčďéěíľĺňóôŕšťúůüýžöÁÄČĎÉĚÍĽĹŇÓÔŔŠŤÚŮÜÝŽÖ]/g,
    (char) => {
      return charMap[char] || char;
    },
  );
}

/**
 * Construct employee work records table name from employee data.
 *
 * @param firstName - Employee first name (Meno)
 * @param lastName - Employee last name (Priezvisko)
 * @returns Normalized table name in format: t_{FirstName}_{LastName}
 *
 * @example
 * constructTableName('Milan', 'Šmotlák') // Returns 't_Milan_Smotlak'
 * constructTableName('Martin', 'Ostrihoň') // Returns 't_Martin_Ostrihon'
 */
export function constructTableName(
  firstName: string,
  lastName: string,
): string {
  const normalizedFirstName = normalizeForTableName(firstName);
  const normalizedLastName = normalizeForTableName(lastName);
  return `t_${normalizedFirstName}_${normalizedLastName}`;
}
