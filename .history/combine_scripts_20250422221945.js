const fs = require('fs');
const path = require('path');
const glob = require('glob');

// --- Configuration ---
const outputFile = 'combined_frontend_backend_src.js'; // New descriptive name
// ** Define the specific source folders to search within **
const sourceFoldersToInclude = [
    'frontend/src', // Relative path from project root
    'backend/src'   // Relative path from project root
];
const filePattern = '**/*.js'; // Find all .js files recursively within the folders
// ---------------------

const projectRoot = '.'; // Assumes script is run from the project root
const absoluteOutputFile = path.resolve(projectRoot, outputFile);

console.log(`Starting script...`);
console.log(`Output file will be: ${absoluteOutputFile}`);
console.log(`Targeting .js files within: ${sourceFoldersToInclude.join(' and ')}`);

let allFoundFiles = []; // Array to hold all files found across specified folders

try {
    // --- Find Files in Each Target Folder ---
    console.log("\nSearching for files synchronously in target folders...");

    sourceFoldersToInclude.forEach(relativeSourceFolder => {
        const absoluteSourceFolder = path.resolve(projectRoot, relativeSourceFolder); // Get absolute path for glob

        // Check if the source folder actually exists
        if (!fs.existsSync(absoluteSourceFolder)) {
            console.warn(`  -> WARNING: Source folder "${relativeSourceFolder}" (${absoluteSourceFolder}) does not exist. Skipping.`);
            return; // Move to the next folder in the list
        }

        console.log(`  -> Searching within: ${absoluteSourceFolder}`);

        const globOptions = {
            cwd: absoluteSourceFolder, // Set the 'current working directory' for glob to this specific folder
            nodir: true,              // We only want files
            absolute: true,           // Return absolute paths for consistency
            // No 'ignore' needed here, as we are directly targeting the desired folders
        };

        try {
            const filesInThisFolder = glob.sync(filePattern, globOptions);
            console.log(`     Found ${filesInThisFolder.length} .js files in "${relativeSourceFolder}".`);
            allFoundFiles = allFoundFiles.concat(filesInThisFolder); // Add the found files to our main list
        } catch (globErr) {
             console.error(`  -> ERROR searching in "${relativeSourceFolder}":`, globErr);
             // Decide if you want to stop or continue if one folder fails
             // process.exit(1); // Uncomment to stop on error
        }
    });

    console.log(`\n...Search complete. Found ${allFoundFiles.length} total .js files across all target folders.`);

} catch (err) {
    // This catch block might be less likely to be hit now, errors handled per-folder
    console.error('An unexpected error occurred during the search process:', err);
    process.exit(1);
}

// --- Filter Out Output File (Unlikely but safe) ---
// It's good practice to ensure the script doesn't accidentally read its own output
console.log("Filtering out the output file just in case...");
const filesToProcess = allFoundFiles.filter(absoluteFilePath => {
     // Case-insensitive compare for safety
    return absoluteFilePath.toLowerCase() !== absoluteOutputFile.toLowerCase();
});
const skippedCount = allFoundFiles.length - filesToProcess.length;
if (skippedCount > 0) {
     console.log(`...Filtering complete. ${skippedCount} file(s) excluded (output file).`);
} else {
     console.log(`...Filtering complete. Output file was not found in the sources.`);
}


// --- Check if Files Found After Filtering ---
if (filesToProcess.length === 0) {
    console.log("No .js files found in the specified src directories (after filtering). Nothing to combine.");
    process.exit(0);
}

console.log(`Processing ${filesToProcess.length} .js files found in target directories.`);

// --- Create Output Stream ---
let writeStream;
try {
    writeStream = fs.createWriteStream(absoluteOutputFile, { encoding: 'utf8' });
    console.log(`Opened output file for writing: ${absoluteOutputFile}`);
} catch (writeErr) {
     console.error(`Error creating output file stream (${outputFile}):`, writeErr);
     process.exit(1);
}
writeStream.on('error', (writeErr) => { /* ... error handling ... */ process.exit(1); });
writeStream.on('finish', () => {
     console.log(`\nSuccessfully combined ${filesToProcess.length} files into ${outputFile}`);
     console.log(`Output file location: ${absoluteOutputFile}`);
});


// --- Process Each File ---
console.log("\nProcessing files:");
try {
    // Sort files alphabetically by path for consistent order (optional but nice)
    filesToProcess.sort();

    filesToProcess.forEach((absoluteFilePath, index) => {
        console.log(`  [${index + 1}/${filesToProcess.length}] Adding: ${absoluteFilePath}`);
        try {
            const header = `\n\n// ============================================================================\n// --- File Start: ${absoluteFilePath} ---\n// ============================================================================\n\n`;
            writeStream.write(header);
            const data = fs.readFileSync(absoluteFilePath, 'utf8'); // Read the file content
            writeStream.write(data);                              // Write content to output
            const footer = `\n\n// --- File End: ${path.basename(absoluteFilePath)} ---\n`;
            writeStream.write(footer);
        } catch (readErr) {
            console.error(`\n  --> ERROR reading file: ${absoluteFilePath}`);
            console.error(`  --> ${readErr.message}`);
            console.error(`  --> Skipping this file and continuing...`);
        }
    });

    // --- Close the Stream ---
    console.log("\nFinishing writing to output file...");
    writeStream.end(); // Signal that no more data will be written

} catch (processingErr) {
    console.error("\nAn unexpected error occurred during file processing:", processingErr);
    if (writeStream && !writeStream.closed) { writeStream.end(); }
    process.exit(1);
}