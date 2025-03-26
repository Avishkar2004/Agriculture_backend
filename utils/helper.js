export const timeInMs = ({ days = 0, hours = 0, minutes = 0, seconds = 0 }) => {
  return (
    days * 24 * 60 * 60 * 1000 +
    hours * 60 * 60 * 1000 +
    minutes * 60 * 1000 +
    seconds * 1000
  );
};
