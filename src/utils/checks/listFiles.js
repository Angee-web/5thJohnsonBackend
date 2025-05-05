const fs = require("fs");
const path = require("path");

/**
 * List all files in a directory recursively
 * @param {string} dir Directory to scan
 * @param {Array} fileList Array to store results
 * @param {Object} options Configuration options
 * @returns {Array} List of files
 */
function listFilesRecursively(dir, fileList = [], options = {}) {
  const {
    excludeDirs = ["node_modules", ".git", ".vscode", "coverage"],
    maxDepth = 10,
    currentDepth = 0,
  } = options;

  // Stop at max depth
  if (currentDepth >= maxDepth) return fileList;

  try {
    // Get all files and directories
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);

      try {
        const stat = fs.statSync(fullPath);

        // If it's a directory
        if (stat.isDirectory()) {
          // Skip excluded directories
          if (excludeDirs.includes(item)) return;

          // Add directory with trailing slash
          fileList.push(`${fullPath}${path.sep}`);

          // Recursively scan directory
          listFilesRecursively(fullPath, fileList, {
            ...options,
            currentDepth: currentDepth + 1,
          });
        }
        // If it's a file
        else {
          fileList.push(fullPath);
        }
      } catch (err) {
        console.error(`Error accessing ${fullPath}: ${err.message}`);
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}: ${err.message}`);
  }

  return fileList;
}

/**
 * Group files by directory and format output
 * @param {Array} files List of file paths
 * @returns {Object} Files grouped by directory
 */
function groupFilesByDirectory(files) {
  const result = {};
  const rootDir = process.cwd();

  files.forEach((file) => {
    // Get relative path
    const relativePath = path.relative(rootDir, file);

    // Get directory path
    const isDirectory = file.endsWith(path.sep);
    const dirPath = isDirectory
      ? path.dirname(relativePath)
      : path.dirname(relativePath);

    // Initialize directory array if needed
    if (!result[dirPath]) {
      result[dirPath] = [];
    }

    // Only add files, not directories
    if (!isDirectory) {
      result[dirPath].push(path.basename(file));
    }
  });

  return result;
}

/**
 * List files in project with organized output
 */
function listProjectFiles() {
  const rootDir = process.cwd();
  console.log(`\n📂 Project: ${path.basename(rootDir)}\n`);

  // Get all files
  const allFiles = listFilesRecursively(rootDir);
  const grouped = groupFilesByDirectory(allFiles);

  // Sort directories
  const sortedDirs = Object.keys(grouped).sort((a, b) => {
    // Root first, then by path length
    if (a === ".") return -1;
    if (b === ".") return 1;
    return (
      a.split(path.sep).length - b.split(path.sep).length || a.localeCompare(b)
    );
  });

  // Count stats
  const totalFiles = allFiles.filter((f) => !f.endsWith(path.sep)).length;
  const totalDirs = Object.keys(grouped).length;

  // Print each directory
  sortedDirs.forEach((dir) => {
    const files = grouped[dir].sort();
    if (files.length === 0) return;

    // Print directory name
    const displayDir = dir === "." ? "/" : dir;
    console.log(`\n📁 ${displayDir}`);

    // Print files
    files.forEach((file) => {
      // Detect file type for icon
      let icon = "📄";
      if (file.endsWith(".js")) icon = "📜";
      if (file.endsWith(".json")) icon = "🔧";
      if (file.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) icon = "🖼️";
      if (file.match(/\.(md|txt)$/i)) icon = "📝";
      if (file.match(/\.(css|scss|less)$/i)) icon = "🎨";
      if (file.match(/\.(html|ejs|pug)$/i)) icon = "🌐";

      console.log(`  ${icon} ${file}`);
    });
  });

  // Print summary
  console.log(
    `\n📊 Summary: ${totalFiles} files in ${totalDirs} directories\n`
  );
}

// Run if called directly
if (require.main === module) {
  listProjectFiles();
}

module.exports = { listProjectFiles, listFilesRecursively };
