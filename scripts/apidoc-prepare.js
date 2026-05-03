#!/usr/bin/env node

const { existsSync, statSync } = require('node:fs');
const { resolve } = require('node:path');

/**
 * ฟังก์ชันแปลง byte เป็นข้อความขนาดไฟล์ที่อ่านง่าย
 */
function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * ฟังก์ชันตรวจว่าไฟล์ OpenAPI พร้อม upload เข้า apidoc.io หรือไม่
 */
function assertArtifact(path) {
  if (!existsSync(path)) {
    throw new Error(`${path} not found. Run npm run openapi:generate first.`);
  }

  return statSync(path).size;
}

/**
 * ฟังก์ชันแสดงขั้นตอน upload เข้า apidoc.io จากไฟล์ OpenAPI ที่ generate แล้ว
 */
function printApidocInstructions() {
  const yamlPath = resolve('openapi.yaml');
  const jsonPath = resolve('openapi.json');
  const yamlSize = assertArtifact(yamlPath);
  const jsonSize = assertArtifact(jsonPath);
  const projectId = process.env.APIDOC_PROJECT_ID ?? '<your-project-id>';
  const projectUrl = process.env.APIDOC_PROJECT_URL ?? `https://${projectId}.apidoc.io`;

  process.stdout.write('\nApiDoc.io artifacts are ready.\n\n');
  process.stdout.write(`YAML: ${yamlPath} (${formatBytes(yamlSize)})\n`);
  process.stdout.write(`JSON: ${jsonPath} (${formatBytes(jsonSize)})\n\n`);
  process.stdout.write('Manual publish steps:\n');
  process.stdout.write('1. Open https://apidoc.io/add/\n');
  process.stdout.write('2. Fill Project Name, Project ID, and Description\n');
  process.stdout.write('3. Select Specification Format: OpenAPI (Swagger)\n');
  process.stdout.write('4. Upload openapi.yaml\n');
  process.stdout.write('5. Create or update the project documentation\n\n');
  process.stdout.write(`Expected docs URL: ${projectUrl}\n\n`);
  process.stdout.write(
    'Note: apidoc.io upload support is confirmed from the Create Project page. A public auto-sync API was not found yet.\n',
  );
}

try {
  printApidocInstructions();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown apidoc.io preparation error';

  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
