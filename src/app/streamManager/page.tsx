"use client";
import { useEffect, useState, useRef } from "react";
import OBSWebSocket from "obs-websocket-js";
import PrivkeyForm from "./privkeyForm";
import {
  DEFAULT_EVENT_CONFIG,
  publishLiveEvent,
  publishNowPlaying,
} from "./util";
import Home from "./Home";
import Participants from "./Participants";
import Relays from "./Relays";
import Settings from "./Settings";
import { STREAM_CONFIG_CHANNEL, STREAM_CONFIG_KEY } from "../constants";
import { StreamConfig } from "../types";
import HomeSVG from "@/svgs/home.svg";
import RelaysSVG from "@/svgs/relays.svg";
import ParticipantsSVG from "@/svgs/participants.svg";
import SettingsSVG from "@/svgs/settings.svg";
import OwncastSVG from "@/svgs/owncast.svg";

const loadLocalStorageConfig = (): StreamConfig | null => {
  if (typeof window === "undefined") return null;
  const storeConfig = localStorage.getItem(STREAM_CONFIG_KEY);
  if (!storeConfig) return null;
  let config: StreamConfig = JSON.parse(storeConfig);
  config.p = [];

  return config;
};

// TODO: Hashtags
export default function StreamManager() {
  const [connected, setConnected] = useState(false);
  const [view, setView] = useState<
    "home" | "participants" | "relays" | "owncast" | "settings"
  >("home");
  const [privkey, setPrivkey] = useState<string>("");
  const [pubkey, setPubkey] = useState<string>("");
  // TODO: check if loadLocalStorage is running unnecessarily...
  const [streamConfig, setStreamConfig] = useState<StreamConfig>(
    loadLocalStorageConfig() ?? DEFAULT_EVENT_CONFIG
  );

  useEffect(() => {
    if (streamConfig.pubkey === pubkey) return;
    setStreamConfig((prev) => {
      return {
        ...prev,
        pubkey: pubkey,
      };
    });
  }, [streamConfig.pubkey, pubkey]);

  const obs = useRef(new OBSWebSocket());

  const bc = useRef(new BroadcastChannel(STREAM_CONFIG_CHANNEL));
  const bcNowPlaying = useRef(new BroadcastChannel("eventManager-nowPlaying"));

  useEffect(() => {
    if (!privkey) return;
    console.debug("awaiting wavman message...");
    bc.current.onmessage = (event) => {
      const type = event.data.type;
      const value = event.data.value;
      console.debug("channel message", type, value);
      switch (type) {
        case "wavman":
          // need to remove previous and add new...
          // setParticipants(value.)
          setAndWipeParticipants(value.pubkey);
          const content = JSON.parse(value.content);
          console.debug("content", content);
          bcNowPlaying.current.postMessage(content);
          setStreamConfig((prev) => {
            if (prev.status === "live") {
              publishNowPlaying(
                content.creator,
                content.title,
                content.link,
                privkey,
                prev
              );
            }
            return prev;
          });
          break;
        default:
          console.error("invalid event message");
      }
    };
  }, [privkey]);

  useEffect(() => {
    if (!privkey) return;
    const connect = async () => {
      try {
        console.debug("connecting");
        // await obs.current.connect("ws://192.168.1.244", "password");
        // await obs.current.connect("ws://192.168.1.244");
        // TODO: If using password, prompt user for it...
        await obs.current.connect();
      } catch (error) {
        console.error("error", error);
      }
    };
    connect();

    obs.current.on("ConnectionOpened", () => {
      console.debug("connected!");
      setConnected(true);
    });

    obs.current.on("StreamStateChanged", async (event) => {
      if (event.outputState === "OBS_WEBSOCKET_OUTPUT_STARTED") {
        console.debug("output started", event);
        setStreamConfig((prev) => {
          // publishLiveEvent(privkey, prev, "live");
          return {
            ...prev,
            prevStatus: "ended",
            status: "live",
          };
        });
      }
      if (event.outputState === "OBS_WEBSOCKET_OUTPUT_STOPPED") {
        console.debug("output started", event);
        setStreamConfig((prev) => {
          // publishLiveEvent(privkey, prev, "ended");
          return {
            ...prev,
            prevStatus: "live",
            status: "ended",
          };
        });
      }
    });

    return () => {
      // this breaks connection with react strict mode true
      const disconnect = async () => {
        await obs.current.disconnect();
        setConnected(false);
      };
      disconnect();
    };
  }, [privkey]);

  const setAndWipeParticipants = (participant: string) => {
    setStreamConfig((prev) => {
      const newConfig = {
        ...prev,
        p: [participant],
      };

      return newConfig;
    });
  };

  useEffect(() => {
    if (!privkey) return;
    console.debug("streamConfig", streamConfig);
    localStorage.setItem(STREAM_CONFIG_KEY, JSON.stringify(streamConfig));
    bc.current.postMessage(streamConfig);

    if (streamConfig.status === "live") {
      console.debug("firing live");
      publishLiveEvent(privkey, streamConfig, "live");
    } else if (
      streamConfig.status === "ended" &&
      streamConfig.prevStatus === "live"
    ) {
      console.debug("firing ended");
      publishLiveEvent(privkey, streamConfig, "ended");
    }
  }, [JSON.stringify(streamConfig)]);

  if (!privkey) {
    return (
      <div className="h-screen overflow-auto bg-stone-800 text-white">
        <div className="flex h-full justify-center items-center">
          <div className="flex flex-col gap-y-2">
            <p className="text-center">Enter private key</p>
            <PrivkeyForm setPrivkey={setPrivkey} setPubkey={setPubkey} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-auto bg-stone-800 text-white">
      <div className="flex flex-col h-full">
        {
          {
            home: <Home pubkey={pubkey} streamConfig={streamConfig} />,
            participants: (
              <Participants
                streamConfig={streamConfig}
                setStreamConfig={setStreamConfig}
              />
            ),
            relays: (
              <Relays
                streamConfig={streamConfig}
                setStreamConfig={setStreamConfig}
              />
            ),
            owncast: <div></div>,
            settings: (
              <Settings
                streamConfig={streamConfig}
                setStreamConfig={setStreamConfig}
              />
            ),
          }[view]
        }
        <div className="flex justify-center gap-4 mt-auto py-2">
          <button
            className="bg-gray-600 p-1 rounded hover:bg-gray-500"
            onClick={() => setView("home")}
          >
            <HomeSVG height={20} width={20} strokeWidth={1.5} alt="settings" />
          </button>

          <button
            className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
            onClick={() => setView("participants")}
          >
            <ParticipantsSVG
              height={20}
              width={20}
              strokeWidth={1.5}
              alt="settings"
            />
          </button>

          <button
            className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
            onClick={() => setView("relays")}
          >
            <RelaysSVG height={20} width={20} alt="relays" />
          </button>

          <button
            className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
            onClick={() => setView("owncast")}
          >
            <OwncastSVG height={20} width={20} alt="owncast" />
          </button>

          <button
            className="bg-gray-600 p-1 rounded hover:cursor-pointer hover:bg-gray-500"
            onClick={() => setView("settings")}
          >
            <SettingsSVG
              height={20}
              width={20}
              strokeWidth={1.5}
              alt="settings"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
