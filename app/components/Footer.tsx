/**
 * @function Footer
 * @description A footer component for the application.
 * @returns {JSX.Element} The footer component.
 */
export default function Footer() {
  return (
    <footer className="text-gray-500 mt-10 w-full text-center p-4">
      <p className="text-center text-sm">
        Created by Lorenzo © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
