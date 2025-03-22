import { NextResponse } from "next/server";
import { readFileSync, statSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const filePath = join(process.cwd(), "lib", "zk-wormhole-host");
    const fileBuffer = readFileSync(filePath);
    const stats = statSync(filePath);

    const response = new NextResponse(fileBuffer);

    // Set headers for executable file
    response.headers.set(
      "Content-Disposition",
      "attachment; filename=zk-wormhole-host"
    );
    response.headers.set("Content-Type", "application/octet-stream");
    response.headers.set("Content-Length", stats.size.toString());
    response.headers.set("Content-Transfer-Encoding", "binary");

    return response;
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
