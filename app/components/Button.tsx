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
      className="app-button disabled:cursor-not-allowed cursor-pointer text-sm px-4 py-2"
    >
      {title}
    </button>
  );
}

export default Button;
