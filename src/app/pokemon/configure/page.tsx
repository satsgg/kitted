"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Configure() {
  const [link, setLink] = useState<string>("");
  useEffect(() => {
    const hostname = window.location.origin;
    setLink(hostname);
  }, []);

  return (
    <main className="flex flex-col min-h-screen p-16 bg-stone-800 text-white overflow-y-auto">
      <Link href="/">
        <h1 className="text-3xl">🎥</h1>
      </Link>

      <div className="flex justify-center">
        <div className="flex flex-col w-1/3 gap-y-2">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-5xl font-semibold">🎮️ Pokemon</h1>
            <p>Chat controlled Pokemon emulator!</p>
          </div>

          <h2 className="text-xl font-semibold pt-6">Try it</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p>Pokemon emulator</p>
              <input
                className="focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none"
                type="text"
                readOnly
                autoComplete="off"
                value={`${link}/pokemon`}
              />
              <label className="text-sm italic">
                Add this URL into an{" "}
                <a
                  href="https://obsproject.com/kb/browser-source"
                  className="text-blue-200"
                >
                  OBS browser source.
                </a>
              </label>
            </div>
            <div className="flex flex-col gap-1">
              <p>Pokemon controller dock</p>
              <input
                className="focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none"
                type="text"
                readOnly
                autoComplete="off"
                value={`${link}/pokemon/dock`}
              />
              <label className="text-sm italic">
                {"Add this URL into Docks -> Custom Browser Docks..."}
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <p>Input queue live display</p>
              <input
                className="focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none"
                type="text"
                readOnly
                autoComplete="off"
                value={`${link}/pokemon/queue`}
              />
              <label className="text-sm italic">
                (Optional) Add this URL into an{" "}
                <a
                  href="https://obsproject.com/kb/browser-source"
                  className="text-blue-200"
                >
                  OBS browser source.
                </a>
              </label>
            </div>
          </div>

          <h2 className="text-xl font-semibold pt-4">How it works</h2>
          <p>
            The controller dock provided allows you to input Gameboy inputs,
            save state, load state, and configure the input timer. Press
            &apos;play&apos; in the dock to get started!
          </p>
          <p>
            Viewers interact with the gameboy by posting chat messages
            containing inputs in text form like &apos;up&apos;, &apos;a&apos;,
            or &apos;start&apos;. Zap chat messages are supported too!
          </p>
          <p>
            The input queue prioritizes chat inputs by highest amount of sats.
          </p>
          <p>
            You can optionally display a visual queue containing user profiles,
            inputs, and zap amounts.
          </p>
          <p>
            The Pokemon emulator relies on settings from the Stream Manager.
            Start there first!
          </p>
        </div>
      </div>
    </main>
  );
}
