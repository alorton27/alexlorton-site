import type { Metadata } from "next";
import "./globals.css";

// Import the Providers component you created
import Providers from "@/components/Providers";

// Import the Nav component (we made this in step 7)
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Alex Lorton",
  description: "Personal site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* SessionProvider wrapper */}
        <Providers>
          {/* Navigation bar */}
          <Nav />
          {/* Page content */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
