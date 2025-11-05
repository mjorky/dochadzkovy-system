import { normalizeForTableName, constructTableName } from './normalize-table-name';

describe('normalizeForTableName', () => {
  describe('Slovak lowercase characters', () => {
    it('should normalize á to a', () => {
      expect(normalizeForTableName('Šmotlák')).toBe('Smotlak');
    });

    it('should normalize š to s', () => {
      expect(normalizeForTableName('Štefan')).toBe('Stefan');
    });

    it('should normalize č to c', () => {
      expect(normalizeForTableName('Krnáč')).toBe('Krnac');
    });

    it('should normalize ž to z', () => {
      expect(normalizeForTableName('Jožef')).toBe('Jozef');
    });

    it('should normalize ň to n', () => {
      expect(normalizeForTableName('Ostrihoň')).toBe('Ostrihon');
    });

    it('should normalize ľ to l', () => {
      expect(normalizeForTableName('Ľubomír')).toBe('Lubomir');
    });

    it('should normalize ť to t', () => {
      expect(normalizeForTableName('Maťko')).toBe('Matko');
    });

    it('should normalize ď to d', () => {
      expect(normalizeForTableName('Ďurko')).toBe('Durko');
    });

    it('should normalize é to e', () => {
      expect(normalizeForTableName('René')).toBe('Rene');
    });

    it('should normalize í to i', () => {
      expect(normalizeForTableName('Marián')).toBe('Marian');
    });

    it('should normalize ó to o', () => {
      expect(normalizeForTableName('Tóth')).toBe('Toth');
    });

    it('should normalize ô to o', () => {
      expect(normalizeForTableName('Ôskar')).toBe('Oskar');
    });

    it('should normalize ú to u', () => {
      expect(normalizeForTableName('Gúst')).toBe('Gust');
    });

    it('should normalize ý to y', () => {
      expect(normalizeForTableName('Výborný')).toBe('Vyborny');
    });

    it('should normalize ä to a', () => {
      expect(normalizeForTableName('Mäkký')).toBe('Makky');
    });
  });

  describe('Slovak uppercase characters', () => {
    it('should normalize Š to S', () => {
      expect(normalizeForTableName('ŠTEFAN')).toBe('STEFAN');
    });

    it('should normalize Č to C', () => {
      expect(normalizeForTableName('ČECH')).toBe('CECH');
    });

    it('should normalize Ž to Z', () => {
      expect(normalizeForTableName('ŽABA')).toBe('ZABA');
    });

    it('should normalize Á to A', () => {
      expect(normalizeForTableName('ÁRPÁD')).toBe('ARPAD');
    });

    it('should normalize É to E', () => {
      expect(normalizeForTableName('ÉRIC')).toBe('ERIC');
    });

    it('should normalize Í to I', () => {
      expect(normalizeForTableName('ÍRSKO')).toBe('IRSKO');
    });

    it('should normalize Ó to O', () => {
      expect(normalizeForTableName('ÓLIVER')).toBe('OLIVER');
    });

    it('should normalize Ú to U', () => {
      expect(normalizeForTableName('ÚRAD')).toBe('URAD');
    });

    it('should normalize Ý to Y', () => {
      expect(normalizeForTableName('ÝLIAN')).toBe('YLIAN');
    });
  });

  describe('Real employee names from database', () => {
    it('should normalize Milan Šmotlák correctly', () => {
      expect(normalizeForTableName('Milan')).toBe('Milan');
      expect(normalizeForTableName('Šmotlák')).toBe('Smotlak');
    });

    it('should normalize Martin Ostrihoň correctly', () => {
      expect(normalizeForTableName('Martin')).toBe('Martin');
      expect(normalizeForTableName('Ostrihoň')).toBe('Ostrihon');
    });

    it('should normalize Martin Krnáč correctly', () => {
      expect(normalizeForTableName('Martin')).toBe('Martin');
      expect(normalizeForTableName('Krnáč')).toBe('Krnac');
    });

    it('should normalize Jaroslav Soboň correctly', () => {
      expect(normalizeForTableName('Jaroslav')).toBe('Jaroslav');
      expect(normalizeForTableName('Soboň')).toBe('Sobon');
    });
  });

  describe('Names without special characters', () => {
    it('should leave ASCII names unchanged', () => {
      expect(normalizeForTableName('Peter')).toBe('Peter');
      expect(normalizeForTableName('Smith')).toBe('Smith');
      expect(normalizeForTableName('Admin')).toBe('Admin');
    });
  });

  describe('German umlauts', () => {
    it('should normalize ü to u', () => {
      expect(normalizeForTableName('Müller')).toBe('Muller');
    });

    it('should normalize ö to o', () => {
      expect(normalizeForTableName('Schön')).toBe('Schon');
    });

    it('should normalize Ü to U', () => {
      expect(normalizeForTableName('ÜBER')).toBe('UBER');
    });

    it('should normalize Ö to O', () => {
      expect(normalizeForTableName('ÖSTERREICH')).toBe('OSTERREICH');
    });
  });

  describe('Mixed special and regular characters', () => {
    it('should normalize Slovak and German characters together', () => {
      expect(normalizeForTableName('Jožef Müller')).toBe('Jozef Muller');
    });

    it('should preserve spaces and hyphens', () => {
      expect(normalizeForTableName('Anna-Mária')).toBe('Anna-Maria');
    });
  });
});

describe('constructTableName', () => {
  it('should construct table name with t_ prefix', () => {
    expect(constructTableName('Milan', 'Smotlak')).toBe('t_Milan_Smotlak');
  });

  it('should normalize special characters in first name', () => {
    expect(constructTableName('Ľubomír', 'Smith')).toBe('t_Lubomir_Smith');
  });

  it('should normalize special characters in last name', () => {
    expect(constructTableName('Milan', 'Šmotlák')).toBe('t_Milan_Smotlak');
  });

  it('should normalize special characters in both names', () => {
    expect(constructTableName('Jožef', 'Krnáč')).toBe('t_Jozef_Krnac');
  });

  describe('Real employee table names from database', () => {
    it('should match t_Milan_Smotlak', () => {
      expect(constructTableName('Milan', 'Šmotlák')).toBe('t_Milan_Smotlak');
    });

    it('should match t_Martin_Ostrihon', () => {
      expect(constructTableName('Martin', 'Ostrihoň')).toBe('t_Martin_Ostrihon');
    });

    it('should match t_Martin_Krnac', () => {
      expect(constructTableName('Martin', 'Krnáč')).toBe('t_Martin_Krnac');
    });

    it('should match t_Jaroslav_Sobon', () => {
      expect(constructTableName('Jaroslav', 'Soboň')).toBe('t_Jaroslav_Sobon');
    });

    it('should match t_Anna_Lovasova', () => {
      expect(constructTableName('Anna', 'Lóvásová')).toBe('t_Anna_Lovasova');
    });

    it('should match t_David_Smotlak', () => {
      expect(constructTableName('Dávid', 'Šmotlák')).toBe('t_David_Smotlak');
    });

    it('should match t_Dominik_Kollar', () => {
      expect(constructTableName('Dominik', 'Kollár')).toBe('t_Dominik_Kollar');
    });

    it('should match t_Krnac_Martin', () => {
      expect(constructTableName('Krnáč', 'Martin')).toBe('t_Krnac_Martin');
    });
  });

  describe('Names without special characters', () => {
    it('should handle ASCII names', () => {
      expect(constructTableName('Peter', 'Smith')).toBe('t_Peter_Smith');
      expect(constructTableName('Admin', 'Admin')).toBe('t_Admin_Admin');
    });
  });
});
