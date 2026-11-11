const useColor = (stream: NodeJS.WriteStream): boolean => {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return process.env.FORCE_COLOR !== "0";
  return Boolean(stream.isTTY);
};

const style =
  (open: number, stream: NodeJS.WriteStream) =>
  (value: unknown): string =>
    useColor(stream)
      ? `\u001B[${open}m${String(value)}\u001B[39m`
      : String(value);

export const stdout = {
  yellow: style(33, process.stdout),
  greenBright: style(92, process.stdout),
};

export const stderr = {
  yellow: style(33, process.stderr),
  red: style(31, process.stderr),
};
