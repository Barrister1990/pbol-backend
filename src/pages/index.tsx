import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Image src="/next.svg" alt="Next.js Logo" width={150} height={30} />
      <h1 className="text-3xl font-bold mt-4">Welcome!</h1>
      <p className="text-lg text-gray-600 mt-2">{message}</p>
      <a
        className="mt-6 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        href="https://nextjs.org/docs"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn More
      </a>
    </div>
  );
}
