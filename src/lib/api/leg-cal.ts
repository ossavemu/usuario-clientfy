interface CalendlyUser {
  botNumber: string;
  calendlyUrlVirtual?: string;
  calendlyUrlInPerson?: string;
  botIP: string;
}
export const calendlyUserTable: CalendlyUser[] = [
  {
    botNumber: '573146858510',
    calendlyUrlVirtual: 'https://calendly.com/osanvem/test',
    calendlyUrlInPerson: 'https://calendly.com/osanvem/new-meeting',
    botIP: '45.230.33.109',
  },
  {
    botNumber: '529987051356',
    calendlyUrlVirtual:
      'https://calendly.com/jmgorange/franquicias-cleanwork-orange',
    calendlyUrlInPerson: undefined,
    botIP: '137.184.40.121',
  },
];
