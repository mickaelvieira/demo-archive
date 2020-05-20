/**
 * Download the source file and write it into the destination
 */
async function download(source: string, destination: string): Promise<void> {
  // We use browser fetch API
  const response = await fetch(source);
  const blob = await response.blob();

  // We convert the blob into a typed array
  // so we can use it to write the data into the file
  const buf = await blob.arrayBuffer();
  const data = new Uint8Array(buf);

  // We then create a new file and write into it
  const file = await Deno.create(destination);
  await Deno.writeAll(file, data);

  // We can finally close the file
  Deno.close(file.rid);
}

/**
 * Unzip the file
 */
async function unzip(filepath: string): Promise<void> {
  // We execute the command
  // The function returns details about the spawned process
  const process = Deno.run({
    cmd: ["unzip", filepath],
    stdout: "piped",
    stderr: "piped",
  });

  // We can access the status of the process
  const { success, code } = await process.status();

  if (!success) {
    // We retrieve the error
    const raw = await process.stderrOutput();
    const str = new TextDecoder().decode(raw);
    throw new Error(`$Command failed: code ${code}, message: ${str}`);
  } else {
    // Similarly to access the command output
    const raw = await process.output();
    const str = new TextDecoder().decode(raw);
    console.log(str);
  }
}

(async function () {
  const filename = "archive.zip";
  const url =
    "https://raw.githubusercontent.com/mickaelvieira/deno-download-unzip-file/master/archive.zip";

  try {
    await download(url, filename);
    await unzip(filename);

    // Move into the newly unarchived directory
    Deno.chdir("./archive");

    // Do something with the archive's content

  } catch (e) {
    console.error(e);
    Deno.exit(1);
  }
}());
