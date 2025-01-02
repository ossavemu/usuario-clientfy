import { countries as availableCountries } from '@/constants/countries';

const generateFlag = (code: string) => {
  switch (code) {
    case 'AR':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="2" fill="#74acdf" />
          <rect width="3" height="1" y="0.5" fill="#fff" />
        </svg>
      );
    case 'BO':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="0.67" fill="#ed1c24" />
          <rect width="3" height="0.67" y="0.67" fill="#f7d117" />
          <rect width="3" height="0.67" y="1.33" fill="#007934" />
        </svg>
      );
    case 'BR':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 4 3"
        >
          <rect width="4" height="3" fill="#009c3b" />
          <path d="M2,0.5 L3.5,1.5 L2,2.5 L0.5,1.5 Z" fill="#ffdf00" />
          <circle cx="2" cy="1.5" r="0.7" fill="#002776" />
        </svg>
      );
    case 'CL':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="2" fill="#fff" />
          <rect width="1" height="1" fill="#0039a6" />
          <rect width="3" height="1" y="1" fill="#d52b1e" />
          <path d="M0.5,0.5 L0.5,0.5 L0.25,0.25 L0.75,0.25 Z" fill="#fff" />
        </svg>
      );
    case 'CO':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 5 3"
        >
          <rect width="5" height="3" fill="#FCD116" />
          <rect width="5" height="2" y="1" fill="#003893" />
          <rect width="5" height="1" y="2" fill="#CE1126" />
        </svg>
      );
    case 'CR':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="2" fill="#002b7f" />
          <rect width="3" height="1.2" y="0.4" fill="#fff" />
          <rect width="3" height="0.4" y="0.8" fill="#ce1126" />
        </svg>
      );
    case 'DO':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="2" fill="#002d62" />
          <rect width="1.5" height="1" fill="#fff" />
          <rect width="1.5" height="1" x="1.5" y="1" fill="#ce1126" />
          <path d="M1.2,0.7 h0.6 v0.6 h-0.6 z" fill="#ce1126" />
          <path d="M1.5,1 h-0.6 v-0.6 h0.6 z" fill="#002d62" />
        </svg>
      );
    case 'EC':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="1" fill="#ffd100" />
          <rect width="3" height="0.5" y="1" fill="#0033a0" />
          <rect width="3" height="0.5" y="1.5" fill="#ce1126" />
          <circle cx="1.5" cy="1" r="0.3" fill="#ffd100" />
        </svg>
      );
    case 'SV':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="2" fill="#0073cf" />
          <rect width="3" height="1" y="0.5" fill="#fff" />
        </svg>
      );
    case 'GT':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="2" fill="#4997d0" />
          <rect width="1" height="2" x="1" fill="#fff" />
        </svg>
      );
    case 'HN':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="2" fill="#0073cf" />
          <rect width="3" height="1" y="0.5" fill="#fff" />
        </svg>
      );
    case 'MX':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="1" height="2" fill="#006847" />
          <rect width="1" height="2" x="1" fill="#fff" />
          <rect width="1" height="2" x="2" fill="#ce1126" />
        </svg>
      );
    case 'PA':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="1.5" height="1" fill="#005aa7" />
          <rect width="1.5" height="1" x="1.5" fill="#fff" />
          <rect width="1.5" height="1" y="1" fill="#fff" />
          <rect width="1.5" height="1" x="1.5" y="1" fill="#d52b1e" />
        </svg>
      );
    case 'PY':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="0.67" fill="#d52b1e" />
          <rect width="3" height="0.67" y="0.67" fill="#fff" />
          <rect width="3" height="0.67" y="1.33" fill="#0039a6" />
          <circle cx="1.5" cy="1" r="0.3" fill="#ffda44" />
          <g transform="translate(1.5,1) scale(0.15)">
            <path
              d="M0,-2 L0.6,0.8 L-1,0.3 L1,0.3 L-0.6,0.8 Z"
              fill="#33691e"
            />
          </g>
        </svg>
      );
    case 'PE':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="1" height="2" fill="#d52b1e" />
          <rect width="1" height="2" x="1" fill="#fff" />
          <rect width="1" height="2" x="2" fill="#d52b1e" />
        </svg>
      );
    case 'UY':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="2" fill="#fff" />
          <rect width="3" height="0.22" y="0.22" fill="#0038a8" />
          <rect width="3" height="0.22" y="0.66" fill="#0038a8" />
          <rect width="3" height="0.22" y="1.1" fill="#0038a8" />
          <rect width="3" height="0.22" y="1.54" fill="#0038a8" />
          <rect width="1.5" height="1.1" fill="#0038a8" />
          <circle
            cx="0.75"
            cy="0.55"
            r="0.25"
            fill="#fcd116"
            stroke="#000"
            strokeWidth="0.02"
          />
        </svg>
      );
    case 'VE':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 3 2"
        >
          <rect width="3" height="0.67" fill="#ffcc00" />
          <rect width="3" height="0.67" y="0.67" fill="#0033a8" />
          <rect width="3" height="0.67" y="1.33" fill="#ce1126" />
          <g fill="#fff">
            <circle cx="1.5" cy="1" r="0.08" />
            <circle cx="1.2" cy="1" r="0.08" />
            <circle cx="1.8" cy="1" r="0.08" />
            <circle cx="0.9" cy="1" r="0.08" />
            <circle cx="2.1" cy="1" r="0.08" />
          </g>
        </svg>
      );
    case 'US':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="15"
          viewBox="0 0 190 100"
        >
          <rect width="190" height="100" fill="#bf0a30" />
          <rect width="190" height="76.9" fill="#fff" />
          <rect width="190" height="53.8" fill="#bf0a30" />
          <rect width="190" height="30.8" fill="#fff" />
          <rect width="190" height="7.7" fill="#bf0a30" />
          <rect width="80" height="53.8" fill="#002868" />
        </svg>
      );
    default:
      return null;
  }
};

export const countries = availableCountries.map((country) => ({
  ...country,
  flag: generateFlag(country.code),
}));
