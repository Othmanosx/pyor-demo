export interface LogLine {
  level: 'info' | 'error';
  msg: string;
  [key: string]: string | number | undefined;
}

export type Logger = (line: LogLine) => void;

export const jsonLogger =
  (write: (text: string) => unknown = (text) => process.stdout.write(text)): Logger =>
  (line) => {
    write(`${JSON.stringify({ time: new Date().toISOString(), ...line })}\n`);
  };
