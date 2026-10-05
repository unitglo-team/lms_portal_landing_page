// Ambient type declarations for IDE TypeScript engine
declare module 'react' {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P) => any;
  export function useState<T>(initial: T | (() => T)): [T, (val: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useRef<T>(initial?: T): { current: T };
  const React: any;
  export default React;
}

declare module 'react-router-dom' {
  export function useNavigate(): (path: string, options?: any) => void;
  export function useParams<T = any>(): T;
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Navigate: any;
}

declare module 'lucide-react' {
  export const ShieldCheck: any;
  export const BookOpen: any;
  export const Bot: any;
  export const BarChart3: any;
  export const Lock: any;
  export const ArrowRight: any;
  export const CheckCircle2: any;
  export const Download: any;
  export const Wifi: any;
  export const WifiOff: any;
  export const Building: any;
  export const GraduationCap: any;
  export const Users: any;
  export const Compass: any;
  export const AlertCircle: any;
  export const Trash2: any;
  export const RefreshCw: any;
  [key: string]: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
