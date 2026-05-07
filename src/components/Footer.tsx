export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-14 border-t border-black bg-white px-4 pb-10 pt-8 text-neutral-700">
      <div className="page-wrap flex flex-col items-center justify-end gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          &copy; {year} Delta Pay. Solana USDC chekout pages for any business.
        </p>
      </div>
    </footer>
  );
}
