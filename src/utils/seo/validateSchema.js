/**
 * Validate Schema.org markup
 */
const validateSchema = (schema) => {
  // Validation logic for structured data
  const required = {
    Product: ["name", "image", "description", "offers"],
    CollectionPage: ["name", "description"],
    Organization: ["name", "url", "logo"],
    BreadcrumbList: ["itemListElement"],
    WebPage: ["name", "description"],
  };

  if (!schema || !schema["@context"] || !schema["@type"]) {
    return { valid: false, message: "Missing required @context or @type" };
  }

  const type = schema["@type"];
  if (required[type]) {
    const missing = required[type].filter((prop) => !schema[prop]);
    if (missing.length > 0) {
      return {
        valid: false,
        message: `Missing required properties: ${missing.join(", ")}`,
      };
    }
  }

  return { valid: true };
};

module.exports = { validateSchema };
