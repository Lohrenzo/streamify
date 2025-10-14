interface ButtonProps {
  onClick?: () => void | undefined;
  title: string;
  type?: "button" | "submit" | "reset" | undefined;
  disabled?: boolean;
}

function Button({ onClick, title, type, disabled }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="disabled:cursor-not-allowed cursor-pointer disabled:opacity-50 font-bold text-sm duration-150 ease-in-out hover:bg-blue-500/70 bg-blue-400/70 p-2 rounded-md"
    >
      {title}
    </button>
  );
}

export default Button;
