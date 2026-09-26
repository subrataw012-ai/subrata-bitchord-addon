const http = require("http");
const https = require("https");

const PORT = process.env.PORT || 3000;

const MANIFEST = {
  id: "subrata.radioparadise",
  name: "Radio Paradise",
  version: "1.0.0",
  resources: ["search", "stream"]
};

const STATIONS = {
  "main-128": {
    title: "Radio Paradise - Main Mix",
    url: "http://stream-dc1.radioparadise.com/mp3-128",
    format: "mp3",
    quality: "HIGH",
    bitrate: 128000
  },
  "main-192": {
    title: "Radio Paradise - Main Mix 192k",
    url: "http://stream-dc1.radioparadise.com/mp3-192",
    format: "mp3",
    quality: "HIGH",
    bitrate: 192000
  },
  "main-aac-128": {
    title: "Radio Paradise - Main Mix AAC",
    url: "http://stream-dc1.radioparadise.com/aac-128",
    format: "aac",
    quality: "HIGH",
    bitrate: 128000
  },
  "main-aac-320": {
    title: "Radio Paradise - Main Mix AAC 320k",
    url: "http://stream-dc1.radioparadise.com/aac-320",
    format: "aac",
    quality: "HIGH",
    bitrate: 320000
  }
};

function json(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(data));
}

function searchTracks(query) {
  const q = query.toLowerCase().trim();

  return Object.entries(STATIONS)
    .filter(([id, station]) => {
      if (!q) return true;

      return (
        id.toLowerCase().includes(q) ||
        station.title.toLowerCase().includes(q) ||
        "radio paradise".includes(q) ||
        "main mix".includes(q)
      );
    })
    .map(([id, station]) => ({
      id,
      title: station.title,
      artist: "Radio Paradise",
      album: "Internet Radio",
      duration: 0,
      format: station.format,
      audioQuality: station.quality
    }));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Manifest
  if (url.pathname === "/manifest.json") {
    return json(res, MANIFEST);
  }

  // Search
  if (url.pathname === "/search") {
    const query = url.searchParams.get("q") || "";

    return json(res, {
      tracks: searchTracks(query)
    });
  }

  // Stream
  if (url.pathname.startsWith("/stream/")) {
    const id = decodeURIComponent(
      url.pathname.substring("/stream/".length)
    );

    const station = STATIONS[id];

    if (!station) {
      return json(
        res,
        {
          error: "Station not found"
        },
        404
      );
    }

    return json(res, {
      url: station.url,
      format: station.format,
      quality: station.quality,
      codec: station.format,
      container: station.format,
      manifest: "none",
      encrypted: false,
      bitrate: station.bitrate
    });
  }

  return json(
    res,
    {
      error: "Not found"
    },
    404
  );
});

server.listen(PORT, () => {
  console.log(`Radio Paradise BitChord addon running on port ${PORT}`);
});
