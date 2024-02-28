const fs = require("fs");
const slug = require("slugs");

const fieldGeoData = JSON.parse(
  fs.readFileSync(__dirname + "/geodata.json", "utf-8")
);

const output = "./data/output.json";

// Create a new array to store extracted fields
const extractedData = [];

// Loop over the JSON data
fieldGeoData.forEach((entry) => {
  const siteSlug = slug(entry.properties.name);
  const coords = entry.geometry.coordinates;

  const extractedEntry = {
    name: entry.properties.name,
    slug: siteSlug,
    location: {
      coordinates: coords,
      region: entry.properties.region,
      type: "Point",
    },
    author: "65a7c443371c0b6cb421fdc2",
    // Add more fields as needed
  };
  extractedData.push(extractedEntry);
});

// Convert the extracted data to JSON format
const jsonString = JSON.stringify(extractedData, null, 2);

// Write the JSON data to a new file
fs.writeFileSync(output, jsonString);

console.log("Extraction complete. Data saved to output.json");
