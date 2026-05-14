import "dotenv/config";

function getTransport(): "stdio" | "http" {
  const idx = process.argv.indexOf("--transport");
  if (idx === -1 || idx >= process.argv.length - 1) {
    return "stdio";
  }
  const value = process.argv[idx + 1];
  return value === "http" ? "http" : "stdio";
}

async function main() {
  const mode = getTransport();
  if (mode === "http") {
    const PORT = process.env.PORT || 3000;
    const HOST = "0.0.0.0";
    const { runHttpServer } = await import("./server-http.js");
    await runHttpServer({ port: PORT, host: HOST });
  } else {
    const { runStdioServer } = await import("./server-stdio.js");
    await runStdioServer();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
