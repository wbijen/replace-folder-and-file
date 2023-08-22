#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs-extra';

async function replaceInFile(filePath: string, stringToFind: string, stringToReplace: string) {
  const fileContent = await fs.readFile(filePath, 'utf8');
  const updatedContent = fileContent.replace(new RegExp(stringToFind, 'g'), stringToReplace);
  await fs.writeFile(filePath, updatedContent, 'utf8');
}

async function replaceInFilename(filePath: string, stringToFind: string, stringToReplace: string) {
  if (filePath.includes(stringToFind)) {
    const newFilePath = filePath.replace(stringToFind, stringToReplace);
    await fs.move(filePath, newFilePath);
    return newFilePath;
  }
  return filePath;
}

async function processPath(dirPath: string, stringToFind: string, stringToReplace: string) {
  const entries = await fs.readdir(dirPath);

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry);
    const stats = await fs.stat(entryPath);

    if (stats.isDirectory()) {
      await processPath(entryPath, stringToFind, stringToReplace);
    } else if (stats.isFile()) {
      await replaceInFile(entryPath, stringToFind, stringToReplace);
      await replaceInFilename(entryPath, stringToFind, stringToReplace);
    }
  }

  await replaceInFilename(dirPath, stringToFind, stringToReplace);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length !== 3) {
    console.log('Usage: program <path> <stringToFind> <stringToReplace>');
    process.exit(1);
  }

  const [dirPath, stringToFind, stringToReplace] = args;

  if (!await fs.pathExists(dirPath)) {
    console.error(`Path "${dirPath}" does not exist.`);
    process.exit(1);
  }

  try {
    await processPath(dirPath, stringToFind, stringToReplace);
    console.log('Replacement operation completed successfully.');
  } catch (error) {
    console.error(`An error occurred: ${error}`);
    process.exit(1);
  }
}

main();
