import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const requiredVariables = {
  clientId: "CLIENT_ID",
  tenantId: "TENANT_ID",
  dataverseUrl: "DATAVERSE_URL"
};

const config = Object.fromEntries(
  Object.entries(requiredVariables).map(([propertyName, variableName]) => {
    const value = String(process.env[variableName] || "").trim();
    if (!value) {
      throw new Error(`Missing required environment variable: ${variableName}`);
    }

    return [propertyName, value];
  })
);

config.dataverseUrl = `${config.dataverseUrl.replace(/\/+$/, "")}/`;

const outputPath = fileURLToPath(new URL("../web/config.js", import.meta.url));
const output = `window.APP_CONFIG = ${JSON.stringify(config, null, 2)};\n`;

writeFileSync(outputPath, output, "utf8");
console.log("Generated web/config.js");
