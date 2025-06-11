export const Right_Turn = ({ turn }: { turn: number }) => {
  return (
    <div
      className="flex flex-col items-center justify-centerbg-gray-100 absolute right-0 top-0 h-full w-1/12 bg-blue-300"
      hidden={turn !== 1}
    />
  );
};

export const Left_Turn = ({ turn }: { turn: number }) => {
  return (
    <div
      className="flex flex-col items-center justify-centerbg-gray-100 absolute left-0 top-0 h-full w-1/12 bg-red-300"
      hidden={turn !== -1}
    />
  );
};
