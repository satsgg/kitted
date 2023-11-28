import { useZodForm } from "@/utils/useZodForm";
import { relayInit } from "nostr-tools";
import { useEffect, useState } from "react";
import { z } from "zod";
import Button from "./Button";

export function Relay({
  relayUrl,
  relays,
  setRelays,
}: {
  relayUrl: string;
  relays: string[];
  setRelays: Function;
}) {
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const connect = async () => {
      const relay = relayInit(relayUrl);
      await relay.connect();
      setConnected(true);
    };

    connect();
  }, [relayUrl]);

  return (
    <div className="flex gap-x-2">
      <span className="rounded border border-gray-500 p-1 w-full">
        {connected ? "✅" : "❌"} {relayUrl}
      </span>
      <button onClick={() => setRelays(relays.filter((r) => r !== relayUrl))}>
        🗑️
      </button>
    </div>
  );
}

// TODO: dark and light style for obs / frontend
export function AddRelayForm({
  relays,
  setRelays,
}: {
  relays: string[];
  setRelays: Function;
}) {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isValid },
  } = useZodForm({
    mode: "onChange",
    schema: z.object({ newRelay: z.string().startsWith("wss://") }),
    defaultValues: {
      newRelay: "",
    },
  });

  const onSubmit = (data: { newRelay: string }) => {
    const relay = data.newRelay.trim();
    if (relays.includes(relay)) {
      setError("newRelay", { type: "unique", message: "Relay already exists" });
      return;
    }

    setRelays([...relays, relay]);
    setValue("newRelay", "");
  };

  return (
    <div>
      <div className="flex items-center gap-x-2">
        <form
          className="grow"
          spellCheck={false}
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            // className={`${
            //   errors.newRelay && "focus:border-red-500"
            // } focus:shadow-outline w-full min-w-[20ch] resize-none appearance-none rounded border border-gray-500 py-2 px-3 leading-tight shadow focus:border-primary focus:outline-none`}

            className={`${errors.newRelay && "focus:border-red-500"}
              focus:shadow-outline h-8 w-full resize-none appearance-none rounded border border-gray-500 bg-gray-600 py-2 px-3 leading-tight text-white shadow placeholder:italic focus:border-primary focus:bg-slate-900 focus:outline-none
            `}
            type="text"
            placeholder="wss://relay.current.fyi"
            autoComplete="off"
            {...register("newRelay")}
          />
        </form>
        <Button disabled={!isValid} onClick={handleSubmit(onSubmit)}>
          Add
        </Button>
      </div>
      {errors.newRelay && <p className="text-sm">{errors.newRelay.message}</p>}
    </div>
  );
}
