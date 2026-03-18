import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "WagNote",
  description: "Simple daily tracking for dog owners",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div style={{ paddingTop: "0.5rem" }}>{children}</div>
      </body>
    </html>
  );
}
