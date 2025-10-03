type Classe = '6e' | '5e' | '4e' | '3e' | '2nde' | '1ere' | 'Tle';
type Serie = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
type SousSerie = 'A1' | 'A2' | 'F1' | 'F2' | 'F3' | 'F4' | 'G1' | 'G2' | 'G3';

export interface ClasseSerie {
  classe: Classe;
  serie?: Serie;
  sousSerie?: SousSerie;
}

/**
 * Parse une chaîne "Tle G2" ou "2nde F3" en objet ClasseSerie
 */
export function parseClasseSerie(input: string): ClasseSerie | null {
  const regex = /^(\w+)\s+([A-G])(\d?)$/i;
  const match = input.match(regex);
  if (!match) return null;

  const [, classeRaw, serieRaw, sousSerieDigit] = match;

  const normalize = (val: string): Classe | null => {
    const lower = val.toLowerCase();
    const mapping: Record<string, Classe> = {
      '6e': '6e',
      '5e': '5e',
      '4e': '4e',
      '3e': '3e',
      '2nde': '2nde',
      '1ere': '1ere',
      'tle': 'Tle',
    };
    return mapping[lower] ?? null;
  };

  const classe = normalize(classeRaw);
  const serie = serieRaw.toUpperCase() as Serie;
  const sousSerie = sousSerieDigit ? (serie + sousSerieDigit) as SousSerie : undefined;

  if (!classe || !serie) return null;

  return { classe, serie, sousSerie };
}

/**
 * Génère le parcours de remédiation complet
 */
export function genererParcoursRemediation(
  classeFinaleStr: string,
  defaultSerie: Serie = 'G'
): ClasseSerie[] | null {
  const ordreClasses: Classe[] = ['6e', '5e', '4e', '3e', '2nde', '1ere', 'Tle'];
  const finale = parseClasseSerie(classeFinaleStr);
  if (!finale) return null;

  const idxFinale = ordreClasses.indexOf(finale.classe);
  if (idxFinale === -1) return null;

  const parcours: ClasseSerie[] = [];

  // Cycle collège
  for (let i = 0; i <= ordreClasses.indexOf('3e'); i++) {
    parcours.push({
      classe: ordreClasses[i],
      serie: defaultSerie,
    });
  }

  // Cycle lycée
  for (let i = ordreClasses.indexOf('2nde'); i <= idxFinale; i++) {
    parcours.push({
      classe: ordreClasses[i],
      serie: finale.serie,
      sousSerie: finale.sousSerie,
    });
  }

  return parcours;
}
